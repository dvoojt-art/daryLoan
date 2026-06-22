'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  UserPlus, 
  Download,
  Filter,
  Edit,
  Trash2,
  TrendingUp,
  Wallet,
  Coins,
  Loader2,
  FileText,
  FileBox,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminMembersManagement() {
  const [search, setSearch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    shares: '',
    contributions: '',
  });

  const [editingMember, setEditingMember] = useState<any>(null);
  const [memberToDelete, setMemberToDelete] = useState<any>(null);

  const { toast } = useToast();
  const firestore = useFirestore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const membersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', '==', 'member'));
  }, [firestore]);

  const { data: members, loading } = useCollection<any>(membersQuery);

  const handleEditClick = (member: any) => {
    setEditingMember({
      ...member,
      shares: member.shares?.toString() || '0',
      contributions: member.totalContributions?.toString() || '0'
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateMember = () => {
    if (!editingMember || !firestore) return;

    const memberRef = doc(firestore, 'users', editingMember.id);
    const updateData = {
      name: editingMember.name,
      email: editingMember.email,
      shares: parseFloat(editingMember.shares) || 0,
      totalContributions: parseFloat(editingMember.contributions) || 0,
    };

    updateDoc(memberRef, updateData)
      .then(() => {
        setIsEditDialogOpen(false);
        setEditingMember(null);
        toast({
          title: "Profile Updated",
          description: `Successfully updated records for ${editingMember.name}.`,
        });
      })
      .catch(async (e) => {
        const error = new FirestorePermissionError({
          path: memberRef.path,
          operation: 'update',
          requestResourceData: updateData
        });
        errorEmitter.emit('permission-error', error);
      });
  };

  const handleDeleteClick = (member: any) => {
    setMemberToDelete(member);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!memberToDelete || !firestore) return;
    const memberRef = doc(firestore, 'users', memberToDelete.id);
    
    deleteDoc(memberRef)
      .then(() => {
        setIsDeleteDialogOpen(false);
        setMemberToDelete(null);
        toast({
          title: "Member Removed",
          description: `${memberToDelete.name} has been removed from the database.`,
          variant: "destructive",
        });
      })
      .catch(async (e) => {
        const error = new FirestorePermissionError({
          path: memberRef.path,
          operation: 'delete'
        });
        errorEmitter.emit('permission-error', error);
      });
  };

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email || !firestore) {
      toast({
        title: "Validation Error",
        description: "Please provide both name and email.",
        variant: "destructive"
      });
      return;
    }

    const memberData = {
      name: newMember.name,
      email: newMember.email,
      role: 'member',
      totalContributions: parseFloat(newMember.contributions) || 0,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
      shares: parseFloat(newMember.shares) || 0,
      profit: 0,
    };

    const usersCollection = collection(firestore, 'users');

    addDoc(usersCollection, memberData)
      .then(() => {
        setIsAddDialogOpen(false);
        setNewMember({ name: '', email: '', shares: '', contributions: '' });
        toast({
          title: "Member Added",
          description: `Successfully onboarded ${newMember.name}.`,
        });
      })
      .catch(async (e) => {
        const error = new FirestorePermissionError({
          path: usersCollection.path,
          operation: 'create',
          requestResourceData: memberData
        });
        errorEmitter.emit('permission-error', error);
      });
  };

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    return members.filter((m: any) => 
      m.name?.toLowerCase().includes(search.toLowerCase()) || 
      m.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [members, search]);

  const totals = useMemo(() => {
    return filteredMembers.reduce((acc: any, m: any) => ({
      shares: acc.shares + (m.shares || 0),
      contributions: acc.contributions + (m.totalContributions || 0),
      profit: acc.profit + (m.profit || 0),
    }), { shares: 0, contributions: 0, profit: 0 });
  }, [filteredMembers]);

  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF('landscape');
    doc.setFontSize(18);
    doc.text('Member Insight Hub - Community Directory', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    const tableData = filteredMembers.map((member: any) => [
      member.name || 'Anonymous',
      member.email,
      member.status || 'pending',
      (member.id || '').substring(0, 8).toUpperCase(),
      (member.shares || 0).toLocaleString(),
      `P${(member.totalContributions || 0).toLocaleString()}`,
      `P${(member.profit || 0).toLocaleString()}`,
    ]);

    autoTable(doc, {
      head: [['Name', 'Email', 'Status', 'Member ID', 'Shares', 'Contributions', 'Profits']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [1, 6, 66] },
    });

    doc.save('DaryLoan-Member-Directory.pdf');
    toast({ title: "PDF Export Complete", description: "The member directory report is ready." });
  };

  const handleExportDOCX = async () => {
    const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType } = await import('docx');
    const { saveAs } = await import('file-saver');

    const tableRows = filteredMembers.map((member: any) => 
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: member.name || 'Anonymous', size: 18 })] }),
          new TableCell({ children: [new Paragraph({ text: member.email, size: 18 })] }),
          new TableCell({ children: [new Paragraph({ text: member.status || 'pending', size: 18 })] }),
          new TableCell({ children: [new Paragraph({ text: (member.shares || 0).toLocaleString(), size: 18 })] }),
          new TableCell({ children: [new Paragraph({ text: `P${(member.totalContributions || 0).toLocaleString()}`, size: 18 })] }),
          new TableCell({ children: [new Paragraph({ text: `P${(member.profit || 0).toLocaleString()}`, size: 18 })] }),
        ]
      })
    );

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "Community Member Directory",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Report Generated: ${new Date().toLocaleDateString()}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Name", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Email", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Status", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Shares", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Contributions", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Profits", bold: true })] }),
                ],
              }),
              ...tableRows,
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "DaryLoan-Member-Directory.docx");
    toast({ title: "Word Export Complete", description: "The member directory report is ready." });
  };

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-800 tracking-tight">Member Insight Hub</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">Manage your centralized community member database</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10">
                <Download className="mr-2 h-4 w-4" /> Export <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer">
                <FileText className="h-4 w-4 text-red-500" /> Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportDOCX} className="gap-2 cursor-pointer">
                <FileBox className="h-4 w-4 text-blue-500" /> Export as Word (.docx)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary h-10 shadow-md">
                <UserPlus className="mr-2 h-4 w-4" /> Add New Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Register New Member</DialogTitle>
                <DialogDescription>
                  Enter the details for the new community member.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Maria Clara"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="maria@example.com"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="shares">Shares</Label>
                    <Input 
                      id="shares" 
                      type="number"
                      placeholder="0"
                      value={newMember.shares}
                      onChange={(e) => setNewMember({ ...newMember, shares: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contributions">Contributions</Label>
                    <Input 
                      id="contributions" 
                      type="number"
                      placeholder="0"
                      value={newMember.contributions}
                      onChange={(e) => setNewMember({ ...newMember, contributions: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddMember}>Add Member</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-50 bg-white">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employee name or email..."
                className="pl-10 h-10 border-slate-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
              <Filter className="h-4 w-4" /> Advanced Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[250px] font-bold text-slate-800 text-[11px] uppercase tracking-wider py-4 pl-6">Member Profile</TableHead>
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Member ID</TableHead>
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider text-right">Shares</TableHead>
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider text-right">Contributions</TableHead>
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider text-right">Profits</TableHead>
                <TableHead className="text-right font-bold text-slate-800 text-[11px] uppercase tracking-wider pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading members...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredMembers.length > 0 ? filteredMembers.map((member: any) => (
                <TableRow key={member.id} className="group hover:bg-slate-50/50 transition-colors border-b last:border-0">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-slate-100">
                        <AvatarImage src={`https://picsum.photos/seed/${member.id}/100/100`} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {(member.name || '??').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{member.name || 'Anonymous'}</span>
                        <span className="text-[10px] text-muted-foreground truncate">{member.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "capitalize text-[10px] font-bold px-3 py-0.5",
                        member.status === 'active' 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      )}
                    >
                      {member.status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[10px] tracking-tighter uppercase border-slate-200 text-slate-500">
                      {(member.id || 'new').substring(0, 8).toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-slate-700">
                    {(member.shares || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    ₱{(member.totalContributions || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    ₱{(member.profit || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-slate-400 hover:text-primary"
                        onClick={() => handleEditClick(member)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-slate-400 hover:text-destructive"
                        onClick={() => handleDeleteClick(member)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">
                    No matching members found in the database.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter className="bg-slate-50 font-bold border-t-2">
              <TableRow>
                <TableCell colSpan={3} className="pl-6 py-4 text-slate-800">AGGREGATE TOTALS</TableCell>
                <TableCell className="text-right text-slate-800">{totals.shares.toLocaleString()}</TableCell>
                <TableCell className="text-right text-primary">₱{totals.contributions.toLocaleString()}</TableCell>
                <TableCell className="text-right text-green-600">₱{totals.profit.toLocaleString()}</TableCell>
                <TableCell className="pr-6"></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
      
      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Member Profile</DialogTitle>
            <DialogDescription>
              Modify the profile and financial details for this member.
            </DialogDescription>
          </DialogHeader>
          {editingMember && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input 
                  id="edit-name" 
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input 
                  id="edit-email" 
                  type="email"
                  value={editingMember.email}
                  onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-shares">Shares</Label>
                  <Input 
                    id="edit-shares" 
                    type="number"
                    value={editingMember.shares}
                    onChange={(e) => setEditingMember({ ...editingMember, shares: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-contributions">Contributions</Label>
                  <Input 
                    id="edit-contributions" 
                    type="number"
                    value={editingMember.contributions}
                    onChange={(e) => setEditingMember({ ...editingMember, contributions: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateMember}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {memberToDelete?.name} from the community database. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div className="p-4 bg-white border rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Community Shares</p>
            <p className="text-2xl font-bold text-slate-800">{totals.shares.toLocaleString()}</p>
          </div>
          <Coins className="h-8 w-8 text-primary/20" />
        </div>
        <div className="p-4 bg-white border rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Member Savings</p>
            <p className="text-2xl font-bold text-primary">₱{totals.contributions.toLocaleString()}</p>
          </div>
          <Wallet className="h-8 w-8 text-primary/20" />
        </div>
        <div className="p-4 bg-white border rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Profit Distributed</p>
            <p className="text-2xl font-bold text-green-600">₱{totals.profit.toLocaleString()}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-600/20" />
        </div>
      </div>
    </div>
  );
}

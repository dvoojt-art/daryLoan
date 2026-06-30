'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Download, Filter, CheckCircle2, Clock, TrendingUp, ChevronDown, Edit, Trash2, Plus, MessageSquareText, AlertCircle, Loader2, FileText, FileBox, Calendar as CalendarIcon, Users, User, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, doc, updateDoc, deleteDoc, addDoc, orderBy } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { format } from 'date-fns';
import { TextRun } from "docx";

export default function AdminLedgerPage() {
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const firestore = useFirestore();

  // Form State
  const [formState, setFormState] = useState({
    memberId: '',
    comakerId: '',
    loanerName: '',
    amount: '',
    purpose: '',
    termMonths: '1',
    adminNote: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real-time data
  const loansQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'loans'),
    );
  }, [firestore]);

  const membersQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: rawLoans, loading: loansLoading } = useCollection<any>(loansQuery);
  const { data: members } = useCollection<any>(membersQuery);

  const calculateInterest = (amount: number, term: number) => {
    if (term === 0.25) return amount * 0.05;
    return amount * (0.10 * term);
  };

  const calculateTotal = (amount: number, term: number, m1: string, m2: string, m3: string) => {
    const interest = calculateInterest(amount, term);
    const baseTotal = amount + interest;
    let penalties = 0;
    if (m1 === 'late') penalties += baseTotal * 0.10;
    if (m2 === 'late') penalties += baseTotal * 0.10;
    if (m3 === 'late') penalties += baseTotal * 0.10;
    return baseTotal + penalties;
  };

  const processedLedger = useMemo(() => {
    if (!rawLoans) return [];
    return rawLoans.map(loan => {
      const member = members?.find(m => m.id === loan.memberId);
       const comaker = members?.find(m => m.id === loan.comakerId);
      const m1 = loan.month1 || 'pending';
      const m2 = loan.month2 || 'pending';
      const m3 = loan.month3 || 'pending';
      const term = loan.termMonths || 1;
      const amount = loan.amount || 0;
      
      const interest = calculateInterest(amount, term);
      const total = calculateTotal(amount, term, m1, m2, m3);

      return {
        ...loan,
        memberName: member?.name || member?.email || (loan.memberId ? `Member ${loan.memberId.substring(0, 5)}` : 'Unknown'),
        comakerName: comaker?.name || comaker?.email || null,
        interest,
        total,
        month1: m1,
        month2: m2,
        month3: m3,
      };
    });
  }, [rawLoans, members]);

  const handleStatusChange = (loanId: string, monthKey: string, newStatus: string) => {
    if (!firestore) return;
    const loanRef = doc(firestore, 'loans', loanId);
    updateDoc(loanRef, { [monthKey]: newStatus }).catch(async (e) => {
      const error = new FirestorePermissionError({ path: loanRef.path, operation: 'update' });
      errorEmitter.emit('permission-error', error);
    });
    
    if (newStatus === 'late') {
      toast({ title: "Penalty Applied", description: "A 10% late penalty has been added to the total." });
    }
  };

  const handleDateUpdate = (loanId: string, monthDateKey: string, newDate: string) => {
    if (!firestore) return;
    const loanRef = doc(firestore, 'loans', loanId);
    updateDoc(loanRef, { [monthDateKey]: newDate }).catch(async (e) => {
      const error = new FirestorePermissionError({ path: loanRef.path, operation: 'update' });
      errorEmitter.emit('permission-error', error);
    });
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!firestore || !deletingId) return;
    const loanRef = doc(firestore, 'loans', deletingId);
    deleteDoc(loanRef).then(() => {
      toast({ title: "Record Deleted", variant: "destructive" });
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    });
  };

  const handleSaveRecord = () => {
    if (!firestore || !formState.memberId || !formState.amount) return;
    
    const amountNum = parseFloat(formState.amount);
    const termNum = parseFloat(formState.termMonths);
    const data = {
      memberId: formState.memberId,
      comakerId: formState.comakerId === 'none' ? null : (formState.comakerId || null),
      loanerName: formState.loanerName,
      amount: amountNum,
      purpose: formState.purpose,
      termMonths: termNum,
      adminNote: formState.adminNote,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'approved',
      month1: 'pending',
      month2: 'pending',
      month3: 'pending',
    };

    if (editingId) {
      updateDoc(doc(firestore, 'loans', editingId), data).then(() => {
        setIsEditDialogOpen(false);
        setEditingId(null);
        toast({ title: "Ledger Entry Updated" });
      });
    } else {
      addDoc(collection(firestore, 'loans'), data).then(() => {
        setIsAddDialogOpen(false);
        setFormState({ memberId: '', comakerId: '', loanerName: '', amount: '', purpose: '', termMonths: '1', adminNote: '' });
        toast({ title: "New Ledger Entry Added" });
      });
    }
  };

  const filteredLedger = processedLedger.filter(tx => 
    tx.memberName.toLowerCase().includes(search.toLowerCase()) ||
    (tx.loanerName && tx.loanerName.toLowerCase().includes(search.toLowerCase())) ||
    (tx.comakerName && tx.comakerName.toLowerCase().includes(search.toLowerCase())) ||
    tx.purpose.toLowerCase().includes(search.toLowerCase())
  );

  const totals = useMemo(() => {
    return filteredLedger.reduce((acc, curr) => ({
      amount: acc.amount + curr.amount,
      interest: acc.interest + curr.interest,
      total: acc.total + curr.total,
    }), { amount: 0, interest: 0, total: 0 });
  }, [filteredLedger]);

  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF('landscape');
    doc.setFontSize(18);
    doc.text('Master Financial Ledger', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    const tableData = filteredLedger.map(tx => [
      tx.memberName,
      tx.purpose,
      `P${tx.amount.toLocaleString()}`,
      `P${tx.interest.toLocaleString()}`,
      `P${tx.total.toLocaleString()}`,
      `${tx.month1} ${tx.month1Date ? `(${tx.month1Date})` : ''}`,
      `${tx.month2} ${tx.month2Date ? `(${tx.month2Date})` : ''}`,
      `${tx.month3} ${tx.month3Date ? `(${tx.month3Date})` : ''}`,
    ]);

    autoTable(doc, {
      head: [['Member', 'Purpose', 'Principal', 'Interest', 'Total', 'Month 1', 'Month 2', 'Month 3']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [1, 6, 66] }, // DaryLoan Navy
    });

    doc.save('DaryLoan-Master-Ledger.pdf');
    toast({ title: "PDF Export Complete", description: "Your ledger report is ready." });
  };

  const handleExportDOCX = async () => {
    const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType } = await import('docx');
    const { saveAs } = await import('file-saver');

    const tableRows = filteredLedger.map(tx => 
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: tx.memberName, size: 18 })] }),
          new TableCell({ children: [new Paragraph({ text: `P${tx.amount.toLocaleString()}`, size: 18 })] }),
          new TableCell({ children: [new Paragraph({ text: `P${tx.interest.toLocaleString()}`, size: 18 })] }),
          new TableCell({ children: [new Paragraph({ text: `P${tx.total.toLocaleString()}`, size: 18 })] }),
          new TableCell({ children: [new Paragraph({ text: tx.month1, size: 18 })] }),
          new TableCell({ children: [new Paragraph({ text: tx.month2, size: 18 })] }),
          new TableCell({ children: [new Paragraph({ text: tx.month3, size: 18 })] }),
        ]
      })
    );

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "Master Financial Ledger",
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
                  new TableCell({ children: [new Paragraph({ text: "Member", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Principal", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Interest", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Total", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "M1", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "M2", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "M3", bold: true })] }),
                ],
              }),
              ...tableRows,
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "DaryLoan-Master-Ledger.docx");
    toast({ title: "Word Export Complete", description: "Your ledger report is ready." });
  };

  const StatusSelect = ({ id, monthKey, currentStatus }: { id: string, monthKey: string, currentStatus: string }) => (
    <Select value={currentStatus} onValueChange={(v) => handleStatusChange(id, monthKey, v)}>
      <SelectTrigger className="h-7 w-24 mx-auto border-none shadow-none focus:ring-0">
        <div className="flex justify-center w-full">
          <Badge variant="outline" className={cn(
            "text-[9px] font-bold uppercase",
            currentStatus === 'paid' ? "bg-green-50 text-green-700 border-green-200" :
            currentStatus === 'late' ? "bg-red-50 text-red-700 border-red-200" : "bg-slate-50 text-slate-400"
          )}>{currentStatus}</Badge>
        </div>
      </SelectTrigger>
      <SelectContent>
        {['paid', 'late', 'pending'].map(s => (
          <SelectItem key={s} value={s} className="capitalize text-xs font-bold">{s}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const DateSelect = ({ id, monthDateKey, currentDate }: { id: string, monthDateKey: string, currentDate: string }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-6 w-24 mx-auto text-[10px] text-center border-none bg-slate-50 shadow-none font-bold px-1 flex items-center justify-center",
            !currentDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-1 h-3 w-3" />
          {currentDate ? format(new Date(currentDate), "MMM dd, yyyy") : "Pick Date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <Calendar
          mode="single"
          selected={currentDate ? new Date(currentDate) : undefined}
          onSelect={(date) => {
            if (date) {
              handleDateUpdate(id, monthDateKey, date.toISOString().split('T')[0]);
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-800">Master Financial Ledger</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">Real-time oversight of community capital flows</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10">
                <Download className="mr-2 h-4 w-4" /> Export <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer">
                <FileText className="h-4 w-4 text-red-500" /> Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportDOCX} className="gap-2 cursor-pointer">
                <FileBox className="h-4 w-4 text-blue-500" /> Export as Word (.docx)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="bg-primary h-10" onClick={() => setIsAddDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Record</Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="pb-3 border-b">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Filter by name or purpose..." className="pl-10 h-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loansLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-bold text-[12px] uppercase py-4 pl-6">Member / Account</TableHead>
                  <TableHead className="font-bold text-[12px] uppercase">Principal</TableHead>
                  <TableHead className="font-bold text-[12px] uppercase">Interest</TableHead>
                  <TableHead className="font-bold text-[12px] uppercase">Total Payable</TableHead>
                  <TableHead className="font-bold text-[12px] uppercase text-center">Month 1</TableHead>
                  <TableHead className="font-bold text-[12px] uppercase text-center">Month 2</TableHead>
                  <TableHead className="font-bold text-[12px] uppercase text-center">Month 3</TableHead>
                  <TableHead className="font-bold text-[12px] uppercase text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLedger.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="pl-6 py-4">
                      <div className="flex flex-col">
                            <span className="text-[15px] text-muted-foreground flex items-center gap-1 font-bold">
                              <User className="h-4 w-4" /> Member: {tx.memberName}
                            </span>
                         <div className="flex flex-col gap-0.5 mt-0.5">
                          {tx.comakerName && (
                            <span className="text-[15px] text-muted-foreground flex items-center gap-1 font-bold">
                              <Users className="h-4 w-4" /> Co-Maker: {tx.comakerName}
                            </span>
                          )}
                          {tx.loanerName && tx.loanerName !== tx.memberName && (
                            <span className="text-[15px] text-primary font-medium flex items-center gap-1">
                              <User className="h-4 w-4" /> For: {tx.loanerName}
                            </span>
                          )}
                            <span className="text-[12px] text-muted-foreground flex items-center gap-1 font-bold">
                              <Tag className="h-3 w-3" />Purpose: {tx.purpose}
                            </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-red-600 text-sm">
                      ₱{tx.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-bold text-red-600 text-sm">
                      ₱{tx.interest.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 text-sm">
                      ₱{tx.total.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <StatusSelect id={tx.id} monthKey="month1" currentStatus={tx.month1} />
                        <DateSelect id={tx.id} monthDateKey="month1Date" currentDate={tx.month1Date} />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <StatusSelect id={tx.id} monthKey="month2" currentStatus={tx.month2} />
                        <DateSelect id={tx.id} monthDateKey="month2Date" currentDate={tx.month2Date} />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <StatusSelect id={tx.id} monthKey="month3" currentStatus={tx.month3} />
                        <DateSelect id={tx.id} monthDateKey="month3Date" currentDate={tx.month3Date} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingId(tx.id); setFormState({ ...tx, amount: tx.amount.toString(), termMonths: tx.termMonths.toString() }); setIsEditDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(tx.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter className="bg-slate-50/50 font-bold border-t-2 text-lg">
                <TableRow>
                  <TableCell colSpan={1} className="pl-6 py-4">OVERALL TOTALS</TableCell>
                  <TableCell>₱{totals.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-primary">₱{totals.interest.toLocaleString()}</TableCell>
                  <TableCell className="text-slate-900">₱{totals.total.toLocaleString()}</TableCell>
                  <TableCell colSpan={4} />
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Shared Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(v) => { if (!v) { setIsAddDialogOpen(false); setIsEditDialogOpen(false); setEditingId(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Ledger Entry' : 'Add Ledger Entry'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Select Member / Co-Maker</Label>
              <Select value={formState.memberId} onValueChange={(v) => setFormState({ ...formState, memberId: v })}>
                <SelectTrigger><SelectValue placeholder="Choose a member" /></SelectTrigger>
                <SelectContent>
                  {members?.filter(m => m.role === 'member').map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             
            <Input placeholder="Loaner Name" value={formState.loanerName} onChange={(e) => setFormState({ ...formState, loanerName: e.target.value })} />
            <Input placeholder="Amount (₱)" type="number" value={formState.amount} onChange={(e) => setFormState({ ...formState, amount: e.target.value })} />
            <Input placeholder="Purpose" value={formState.purpose} onChange={(e) => setFormState({ ...formState, purpose: e.target.value })} />
            <Select value={formState.termMonths} onValueChange={(v) => setFormState({ ...formState, termMonths: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0.25">7 Days</SelectItem>
                <SelectItem value="1">1 Month</SelectItem>
                <SelectItem value="2">2 Months</SelectItem>
                <SelectItem value="3">3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveRecord}>Save Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently remove this ledger record from the database. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setIsDeleteDialogOpen(false); setDeletingId(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

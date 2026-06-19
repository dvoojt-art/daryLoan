'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Download,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  TrendingUp,
  ChevronDown,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { MOCK_MEMBERS, MOCK_LOANS } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AdminLedgerPage() {
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form State for new record
  const [newRecord, setNewRecord] = useState({
    memberId: '',
    amount: '',
    purpose: '',
    termMonths: '3',
  });

  // Initial data setup
  const initialLedgerData = useMemo(() => {
    return MOCK_LOANS.map(loan => {
      const member = MOCK_MEMBERS.find(m => m.id === loan.memberId);
      const interest = loan.amount * 0.10; // 10% interest rule
      const total = loan.amount + (interest * loan.termMonths);
      
      return {
        ...loan,
        memberName: member?.name || 'Unknown',
        memberEmail: member?.email || '',
        interest,
        total,
        month1: loan.status === 'approved' || loan.status === 'repaid' ? 'paid' : 'pending',
        month2: loan.status === 'repaid' ? 'paid' : loan.status === 'overdue' ? 'late' : 'pending',
        month3: loan.status === 'repaid' ? 'paid' : 'pending',
      };
    }).sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  }, []);

  const [ledgerData, setLedgerData] = useState(initialLedgerData);

  const handleStatusChange = (id: string, month: 'month1' | 'month2' | 'month3', newStatus: string) => {
    setLedgerData(prev => prev.map(item => item.id === id ? { ...item, [month]: newStatus } : item));
  };

  const handleAddRecord = () => {
    if (!newRecord.memberId || !newRecord.amount || !newRecord.purpose) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const member = MOCK_MEMBERS.find(m => m.id === newRecord.memberId);
    const amountNum = parseFloat(newRecord.amount);
    const termNum = parseInt(newRecord.termMonths);
    const interest = amountNum * 0.10;
    const total = amountNum + (interest * termNum);

    const newEntry = {
      id: `l-new-${Date.now()}`,
      memberId: newRecord.memberId,
      amount: amountNum,
      status: 'approved' as const,
      requestDate: new Date().toISOString().split('T')[0],
      interestRate: 0.10,
      termMonths: termNum,
      purpose: newRecord.purpose,
      memberName: member?.name || 'Unknown',
      memberEmail: member?.email || '',
      interest,
      total,
      month1: 'pending',
      month2: 'pending',
      month3: 'pending',
    };

    setLedgerData(prev => [newEntry, ...prev]);
    setIsAddDialogOpen(false);
    setNewRecord({ memberId: '', amount: '', purpose: '', termMonths: '3' });
    
    toast({
      title: "Record Added",
      description: `Successfully added financial record for ${member?.name}.`,
    });
  };

  const filteredLedger = ledgerData.filter(tx => 
    tx.memberName.toLowerCase().includes(search.toLowerCase()) ||
    tx.purpose.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] font-bold">PAID</Badge>;
      case 'late': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] font-bold">LATE</Badge>;
      default: return <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 text-[10px] font-bold">PENDING</Badge>;
    }
  };

  const StatusDropdown = ({ id, month, currentStatus }: { id: string, month: 'month1' | 'month2' | 'month3', currentStatus: string }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none group flex items-center justify-center gap-1 mx-auto hover:opacity-80 transition-opacity">
          {getStatusBadge(currentStatus)}
          <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-slate-600" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="min-w-[100px]">
        <DropdownMenuItem onClick={() => handleStatusChange(id, month, 'paid')}>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs font-bold">PAID</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange(id, month, 'late')}>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-xs font-bold">LATE</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange(id, month, 'pending')}>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="text-xs font-bold">PENDING</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-800 tracking-tight">Master Financial Insight Hub</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">Manage and audit centralized community capital flows</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="h-10">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary h-10">
                <Plus className="mr-2 h-4 w-4" /> Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Financial Record</DialogTitle>
                <DialogDescription>
                  Manually enter a new loan record into the master ledger.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="member">Select Member</Label>
                  <Select onValueChange={(val) => setNewRecord({ ...newRecord, memberId: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a member" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_MEMBERS.filter(m => m.role === 'member').map(member => (
                        <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Principal Amount (₱)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="5000"
                    value={newRecord.amount}
                    onChange={(e) => setNewRecord({ ...newRecord, amount: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Input 
                    id="purpose" 
                    placeholder="e.g. Business expansion"
                    value={newRecord.purpose}
                    onChange={(e) => setNewRecord({ ...newRecord, purpose: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="term">Term (Months)</Label>
                  <Select 
                    defaultValue="3"
                    onValueChange={(val) => setNewRecord({ ...newRecord, termMonths: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="3 Months" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Month</SelectItem>
                      <SelectItem value="2">2 Months</SelectItem>
                      <SelectItem value="3">3 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddRecord}>Save Record</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by member name or reference..."
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
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider py-4">Member Account</TableHead>
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Date Released</TableHead>
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Principal</TableHead>
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">10% Int.</TableHead>
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Total Payable</TableHead>
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider text-center">1st Month</TableHead>
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider text-center">2nd Month</TableHead>
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider text-center">3rd Month</TableHead>
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLedger.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-slate-50 transition-colors border-b">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-200">
                        <AvatarImage src={`https://picsum.photos/seed/${tx.memberId}/100/100`} />
                        <AvatarFallback>{tx.memberName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{tx.memberName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{tx.purpose}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-600">
                    {tx.requestDate}
                  </TableCell>
                  <TableCell className="font-bold text-slate-800">
                    ₱{tx.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-primary font-semibold text-xs">
                    ₱{tx.interest.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-bold text-primary">
                    ₱{tx.total.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusDropdown id={tx.id} month="month1" currentStatus={tx.month1} />
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusDropdown id={tx.id} month="month2" currentStatus={tx.month2} />
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusDropdown id={tx.id} month="month3" currentStatus={tx.month3} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-primary">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredLedger.length === 0 && (
            <div className="text-center py-20 bg-slate-50/50">
              <p className="text-slate-500 font-medium italic">No financial records matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-primary rounded-xl text-white flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-white/70">Total Collected</p>
            <p className="text-2xl font-bold">₱450,000</p>
          </div>
          <CheckCircle2 className="h-8 w-8 text-white/30" />
        </div>
        <div className="p-4 bg-accent rounded-xl text-white flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-white/70">Interest Gained</p>
            <p className="text-2xl font-bold">₱45,000</p>
          </div>
          <TrendingUp className="h-8 w-8 text-white/30" />
        </div>
        <div className="p-4 bg-slate-800 rounded-xl text-white flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-white/70">Total Outstanding</p>
            <p className="text-2xl font-bold">₱120,500</p>
          </div>
          <Clock className="h-8 w-8 text-white/30" />
        </div>
      </div>
    </div>
  );
}

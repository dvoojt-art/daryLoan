'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  Plus, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  MessageSquareText,
  History,
  Loader2,
  Wallet,
  Coins,
  CheckCircle2,
  CalendarDays,
  User,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, where, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { format, addMonths, isAfter, parseISO } from 'date-fns';

export default function MemberDashboard() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  const [editingLoan, setEditingLoan] = useState<any | null>(null);
  const [editPurpose, setEditPurpose] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editLoanerName, setEditLoanerName] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real-time Queries
  const profileRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, loading: profileLoading } = useDoc<any>(profileRef);

  const loansQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'loans'),
      where('memberId', '==', user.uid),
      orderBy('requestDate', 'desc')
    );
  }, [firestore, user]);

  const { data: loans, loading: loansLoading } = useCollection<any>(loansQuery);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return format(date, "MMM dd, yyyy");
    } catch (e) {
      return dateStr || '';
    }
  };

  const activeLoan = useMemo(() => {
    if (!loans) return null;
    // Find the most recent approved or overdue loan
    return loans.find(l => l.status === 'approved' || l.status === 'overdue');
  }, [loans]);

  // Aggregate stats across all loans
  const financialSummary = useMemo(() => {
    if (!loans) return { totalBalance: 0, activeCount: 0 };
    
    return loans.reduce((acc, l) => {
      if (l.status === 'approved' || l.status === 'overdue') {
        const amount = l.amount || 0;
        const term = l.termMonths || 1;
        const rate = term === 0.25 ? 0.05 : 0.10 * term;
        const principalPlusInterest = amount + (amount * rate);
        
        let penalties = 0;
        if (l.month1 === 'late') penalties += principalPlusInterest * 0.10;
        if (l.month2 === 'late') penalties += principalPlusInterest * 0.10;
        if (l.month3 === 'late') penalties += principalPlusInterest * 0.10;

        const totalPayable = principalPlusInterest + penalties;
        const monthlyAmount = principalPlusInterest / (term < 1 ? 1 : Math.ceil(term));
        
        let paidAmount = 0;
        if (l.month1 === 'paid') paidAmount += monthlyAmount;
        if (l.month2 === 'paid') paidAmount += monthlyAmount;
        if (l.month3 === 'paid') paidAmount += monthlyAmount;

        acc.totalBalance += Math.max(0, totalPayable - paidAmount);
        acc.activeCount++;
      }
      return acc;
    }, { totalBalance: 0, activeCount: 0 });
  }, [loans]);

  const loanMetrics = useMemo(() => {
    if (!activeLoan) return null;

    const amount = activeLoan.amount || 0;
    const term = activeLoan.termMonths || 1;
    const rate = term === 0.25 ? 0.05 : 0.10 * term;
    const principalPlusInterest = amount + (amount * rate);
    
    let penalties = 0;
    if (activeLoan.month1 === 'late') penalties += principalPlusInterest * 0.10;
    if (activeLoan.month2 === 'late') penalties += principalPlusInterest * 0.10;
    if (activeLoan.month3 === 'late') penalties += principalPlusInterest * 0.10;

    const totalPayable = principalPlusInterest + penalties;
    const monthlyAmount = principalPlusInterest / (term < 1 ? 1 : Math.ceil(term));
    
    let paidAmount = 0;
    let paidMonths = 0;
    const totalMonths = term < 1 ? 1 : Math.ceil(term);

    if (activeLoan.month1 === 'paid') { paidAmount += monthlyAmount; paidMonths++; }
    if (activeLoan.month2 === 'paid') { paidAmount += monthlyAmount; paidMonths++; }
    if (activeLoan.month3 === 'paid') { paidAmount += monthlyAmount; paidMonths++; }

    const remainingBalance = Math.max(0, totalPayable - paidAmount);
    const progressPercent = Math.min(100, (paidMonths / totalMonths) * 100);

    let nextDueDate = activeLoan.dueDate ? parseISO(activeLoan.dueDate) : null;
    if (nextDueDate) {
      if (activeLoan.month1 === 'paid') nextDueDate = addMonths(nextDueDate, 1);
      if (activeLoan.month2 === 'paid') nextDueDate = addMonths(nextDueDate, 1);
    }

    return {
      totalPayable,
      paidAmount,
      remainingBalance,
      progressPercent,
      nextDueDate: nextDueDate ? format(nextDueDate, "MMM dd, yyyy") : 'TBD',
      totalMonths,
      paidMonths
    };
  }, [activeLoan]);

  const handleDeleteLoan = (loanId: string) => {
    if (!firestore) return;
    const loanRef = doc(firestore, 'loans', loanId);
    deleteDoc(loanRef).catch(async (e) => {
      const error = new FirestorePermissionError({ path: loanRef.path, operation: 'delete' });
      errorEmitter.emit('permission-error', error);
    });
    toast({ title: "Application Removed", variant: "destructive" });
  };

  const handleEditLoan = (loan: any) => {
    setEditingLoan(loan);
    setEditPurpose(loan.purpose);
    setEditAmount(loan.amount.toString());
    setEditLoanerName(loan.loanerName || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdateLoan = () => {
    if (!editingLoan || !firestore) return;
    const amountNum = parseFloat(editAmount);
    const loanRef = doc(firestore, 'loans', editingLoan.id);
    const updateData = { purpose: editPurpose, amount: amountNum, loanerName: editLoanerName };
    updateDoc(loanRef, updateData).catch(async (e) => {
      const error = new FirestorePermissionError({ path: loanRef.path, operation: 'update', requestResourceData: updateData });
      errorEmitter.emit('permission-error', error);
    });
    setIsEditDialogOpen(false);
    toast({ title: "Request Updated" });
  };

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold text-slate-900 tracking-tight">Personal Credit Hub</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <User className="h-4 w-4" /> Welcome back, <span className="font-bold text-slate-800">{profile?.name || user?.email || 'Member'}</span>
          </p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-accent/20">
          <Link href="/dashboard/member/request">
            <Plus className="mr-2 h-5 w-5" /> Apply for New Loan
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {[
          { label: 'Total Balance Due', value: `₱${financialSummary.totalBalance.toLocaleString()}`, icon: CreditCard, color: 'text-primary', sub: `${financialSummary.activeCount} active obligations` },
          { label: 'Community Shares', value: (profile?.shares || 0).toLocaleString(), icon: Coins, color: 'text-accent', sub: 'Your community stake' },
          { label: 'Distributed Profit', value: `₱${(profile?.profit || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', sub: 'Dividends earned' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <div className={cn("text-3xl font-bold", stat.color)}>
                  {profileLoading ? <Loader2 className="h-6 w-6 animate-spin opacity-20" /> : stat.value}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">{stat.sub}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl">
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-3 border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-slate-900 text-white pb-8">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-headline">My Active Loans</CardTitle>
                <CardDescription className="text-slate-400">Tracking repayment progress and installments</CardDescription>
              </div>
              {activeLoan && (
                <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-4 py-1">
                  ID: {activeLoan.id.substring(0, 8).toUpperCase()}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loansLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Syncing Credit Records...</p>
              </div>
            ) : activeLoan ? (
              <div className="p-8 space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Repayment Progress</p>
                      <div className="flex items-end justify-between mb-2">
                        <span className="text-3xl font-bold text-slate-800">{loanMetrics?.progressPercent.toFixed(0)}%</span>
                        <span className="text-xs font-bold text-slate-500">{loanMetrics?.paidMonths} of {loanMetrics?.totalMonths} Months Paid</span>
                      </div>
                      <Progress value={loanMetrics?.progressPercent} className="h-2" />
                    </div>
                    
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Next Due Date</span>
                        <CalendarDays className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xl font-bold text-slate-800">{loanMetrics?.nextDueDate}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-[9px] font-bold text-primary/70 uppercase mb-1">Principal</p>
                        <p className="text-lg font-bold">₱{activeLoan.amount.toLocaleString()}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                        <p className="text-[9px] font-bold text-accent/70 uppercase mb-1">Total Due</p>
                        <p className="text-lg font-bold">₱{loanMetrics?.totalPayable.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Installment Status</p>
                        <div className="flex gap-2">
                            {['month1', 'month2', 'month3'].slice(0, loanMetrics?.totalMonths).map((m, i) => (
                                <div key={m} className="flex-1 p-3 rounded-lg border bg-white flex flex-col items-center gap-2">
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">M{i+1}</span>
                                    <div className={cn(
                                        "h-2 w-full rounded-full",
                                        activeLoan[m] === 'paid' ? "bg-green-500" :
                                        activeLoan[m] === 'late' ? "bg-red-500" : "bg-slate-200"
                                    )} />
                                    <span className="text-[8px] font-bold uppercase">{activeLoan[m] || 'pending'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <History className="h-4 w-4 text-primary" /> Payment Ledger
                    </h3>
                    <div className="rounded-xl border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="text-[10px] uppercase font-bold">Schedule</TableHead>
                                    <TableHead className="text-[10px] uppercase font-bold">Status</TableHead>
                                    <TableHead className="text-[10px] uppercase font-bold">Recorded On</TableHead>
                                    <TableHead className="text-[10px] uppercase font-bold text-right">Verification</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[
                                    { id: 1, key: 'month1', dateKey: 'month1Date' },
                                    { id: 2, key: 'month2', dateKey: 'month2Date' },
                                    { id: 3, key: 'month3', dateKey: 'month3Date' }
                                ].slice(0, loanMetrics?.totalMonths).map((m) => (
                                    <TableRow key={m.id}>
                                        <TableCell className="text-xs font-bold">Installment {m.id}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn(
                                                "text-[8px] uppercase",
                                                activeLoan[m.key] === 'paid' ? "bg-green-50 text-green-700" :
                                                activeLoan[m.key] === 'late' ? "bg-red-50 text-red-700" : "text-slate-400"
                                            )}>{activeLoan[m.key] || 'pending'}</Badge>
                                        </TableCell>
                                        <TableCell className="text-[10px] text-muted-foreground">{activeLoan[m.dateKey] ? formatDate(activeLoan[m.dateKey]) : '—'}</TableCell>
                                        <TableCell className="text-right">
                                            {activeLoan[m.key] === 'late' ? <AlertCircle className="h-3 w-3 text-red-500 ml-auto" /> : <CheckCircle2 className={cn("h-3 w-3 ml-auto", activeLoan[m.key] === 'paid' ? "text-green-500" : "text-slate-200")} />}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                <div className="bg-slate-100 p-6 rounded-full mb-6">
                  <CreditCard className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">No Active Loans</h3>
                <p className="text-muted-foreground text-sm max-w-[280px] mt-2 mb-6">
                  Your credit account is currently clear. You have no pending repayments at this time.
                </p>
                <Button asChild variant="outline" className="gap-2">
                  <Link href="/dashboard/member/request">Request Credit Line <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Admin Notifications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               {loans?.filter(l => l.adminNote).length === 0 ? (
                 <div className="p-8 text-center">
                   <p className="text-[10px] text-muted-foreground italic uppercase tracking-widest">No recent messages from admin</p>
                 </div>
               ) : (
                 <div className="divide-y">
                   {loans?.filter(l => l.adminNote).slice(0, 3).map((l: any) => (
                     <div key={l.id} className="p-4 hover:bg-slate-50 transition-colors flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <MessageSquareText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="text-[10px] font-bold text-slate-800 uppercase tracking-tight">Re: {l.purpose}</p>
                            <span className="text-[8px] text-muted-foreground font-mono">{formatDate(l.requestDate)}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">"{l.adminNote}"</p>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-[#010642] text-white">
            <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-70">Community Standing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-xs">Savings Goal Progress</span>
                    <span className="text-xs font-bold text-accent">75%</span>
                </div>
                <Progress value={75} className="h-1 bg-white/10" />
                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                    Your consistent contributions strengthen the community pool and increase your personal borrowing power.
                </p>
                <Button variant="ghost" className="w-full text-xs text-accent hover:text-white hover:bg-white/5 border border-accent/20 h-9" asChild>
                    <Link href="/dashboard/member/lenders">View Verified Members <ChevronRight className="h-3 w-3 ml-1" /></Link>
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-800">Historical Audit Ledger</CardTitle>
            <CardDescription>Comprehensive record of all applications and their outcomes</CardDescription>
          </div>
          <History className="h-5 w-5 text-slate-400" />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="pl-6 font-bold text-[10px] uppercase">Purpose / Beneficiary</TableHead>
                <TableHead className="font-bold text-[10px] uppercase">Principal</TableHead>
                <TableHead className="font-bold text-[10px] uppercase">Status</TableHead>
                <TableHead className="font-bold text-[10px] uppercase">Applied On</TableHead>
                <TableHead className="text-right pr-6 font-bold text-[10px] uppercase">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans && loans.length > 0 ? loans.map((l) => (
                <TableRow key={l.id} className="group hover:bg-slate-50 transition-colors">
                  <TableCell className="pl-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-xs">{l.purpose}</span>
                      <span className="text-[9px] text-muted-foreground uppercase mt-0.5 flex items-center gap-1">
                        <User className="h-2 w-2" /> {l.loanerName || 'Self'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-slate-700 text-xs">₱{l.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "capitalize text-[9px] font-bold px-3 py-0.5",
                      l.status === 'approved' ? "bg-green-50 text-green-700 border-green-200" : 
                      l.status === 'pending' ? "bg-yellow-50 text-yellow-700 border-yellow-200" : 
                      l.status === 'overdue' ? "bg-red-50 text-red-700 border-red-200" : "bg-slate-100 text-slate-500"
                    )}>
                      {l.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{formatDate(l.requestDate)}</TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1">
                      {l.status === 'pending' && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-primary" onClick={() => handleEditLoan(l)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-destructive" onClick={() => handleDeleteLoan(l.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic text-xs">
                    No historical records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-headline font-bold">Modify Pending Request</DialogTitle>
            <DialogDescription>Adjust details while the application is still under review.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-loaner-name" className="text-xs uppercase font-bold text-muted-foreground">Beneficiary Name</Label>
              <Input id="edit-loaner-name" value={editLoanerName} onChange={(e) => setEditLoanerName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-amount" className="text-xs uppercase font-bold text-muted-foreground">Requested Principal (₱)</Label>
              <Input id="edit-amount" type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-purpose" className="text-xs uppercase font-bold text-muted-foreground">Detailed Purpose</Label>
              <Input id="edit-purpose" value={editPurpose} onChange={(e) => setEditPurpose(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateLoan} className="bg-primary">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

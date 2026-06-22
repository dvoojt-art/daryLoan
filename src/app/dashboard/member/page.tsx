
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
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
  CheckCircle2
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

  // Real-time User Profile Query
  const profileRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, loading: profileLoading } = useDoc<any>(profileRef);

  // Real-time Loans Query
  const loansQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'loans'),
      where('memberId', '==', user.uid),
      orderBy('requestDate', 'desc')
    );
  }, [firestore, user]);

  const { data: loans, loading: loansLoading } = useCollection<any>(loansQuery);

  // Real-time Contributions Query for Chart
  const contributionsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'contributions'),
      where('memberId', '==', user.uid),
      orderBy('date', 'asc')
    );
  }, [firestore, user]);

  const { data: liveContributions, loading: contributionsLoading } = useCollection<any>(contributionsQuery);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  const handleDeleteLoan = (loanId: string) => {
    if (!firestore) return;
    const loanRef = doc(firestore, 'loans', loanId);
    
    deleteDoc(loanRef).catch(async (e) => {
      const error = new FirestorePermissionError({
        path: loanRef.path,
        operation: 'delete'
      });
      errorEmitter.emit('permission-error', error);
    });

    toast({
      title: "Request Removed",
      description: "Your loan request has been successfully deleted.",
      variant: "destructive",
    });
  };

  const handleEditLoan = (loan: any) => {
    if (loan.status !== 'pending') {
      toast({
        title: "Cannot Edit",
        description: "Only pending requests can be modified.",
        variant: "destructive"
      });
      return;
    }
    setEditingLoan(loan);
    setEditPurpose(loan.purpose);
    setEditAmount(loan.amount.toString());
    setEditLoanerName(loan.loanerName || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdateLoan = () => {
    if (!editingLoan || !firestore) return;
    const amountNum = parseFloat(editAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const loanRef = doc(firestore, 'loans', editingLoan.id);
    const updateData = {
      purpose: editPurpose,
      amount: amountNum,
      loanerName: editLoanerName
    };

    updateDoc(loanRef, updateData).catch(async (e) => {
      const error = new FirestorePermissionError({
        path: loanRef.path,
        operation: 'update',
        requestResourceData: updateData
      });
      errorEmitter.emit('permission-error', error);
    });

    setIsEditDialogOpen(false);
    toast({ title: "Request Updated" });
  };

  if (!mounted) return null;

  const contributions = liveContributions || [];
  const totalContributed = profile?.totalContributions || contributions.reduce((acc, c) => acc + c.amount, 0);
  
  const activeLoan = loans?.find(l => l.status === 'approved' || l.status === 'overdue');
  const overdueLoan = loans?.find(l => l.status === 'overdue');
  const recentlyDecisioned = loans?.find(l => (l.status === 'approved' || l.status === 'rejected') && l.adminNote);

  const chartData = contributions.map(c => ({
    date: c.date,
    amount: c.amount,
  }));

  const StatusBadge = ({ status }: { status?: string }) => {
    if (!status || status === 'pending') return <Badge variant="outline" className="text-[8px] bg-slate-50 text-slate-400 border-slate-100">UNPAID</Badge>;
    if (status === 'paid') return <Badge variant="outline" className="text-[8px] bg-green-50 text-green-700 border-green-200">PAID</Badge>;
    if (status === 'late') return <Badge variant="outline" className="text-[8px] bg-red-50 text-red-700 border-red-200">LATE</Badge>;
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-800">Member Portal</h1>
          <p className="text-muted-foreground">Manage your savings and loan applications.</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 text-white font-bold shadow-sm">
          <Link href="/dashboard/member/request">
            <Plus className="mr-2 h-4 w-4" /> Request Loan
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">My Community Shares</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-bold text-slate-800">
              {profileLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (profile?.shares || 0).toLocaleString()}
            </div>
            <Coins className="h-8 w-8 text-accent/20" />
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Profit Distributed</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-bold text-green-600">
              ₱{profileLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (profile?.profit || 0).toLocaleString()}
            </div>
            <TrendingUp className="h-8 w-8 text-green-600/20" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Savings</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-bold text-primary">
              ₱{profileLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (profile?.totalContributions || 0).toLocaleString()}
            </div>
            <Wallet className="h-8 w-8 text-primary/20" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {overdueLoan && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive animate-pulse">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-bold uppercase text-xs">Urgent Notice</AlertTitle>
            <AlertDescription className="text-sm">
              Your loan of ₱{overdueLoan.amount.toLocaleString()} is overdue. Please settle immediately.
            </AlertDescription>
          </Alert>
        )}
        
        {recentlyDecisioned && (
          <Alert className={cn(
            "border-2",
            recentlyDecisioned.status === 'approved' ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
          )}>
            <MessageSquareText className="h-5 w-5" />
            <AlertTitle className="font-bold flex items-center gap-2">
              Admin Decision: {recentlyDecisioned.status.toUpperCase()}
            </AlertTitle>
            <AlertDescription className="text-sm space-y-2">
              <p>Note from Admin: <span className="font-bold italic">"{recentlyDecisioned.adminNote}"</span></p>
              {recentlyDecisioned.dueDate && recentlyDecisioned.status === 'approved' && (
                <p className="text-[10px] uppercase font-bold">Release/Payment Schedule: {formatDate(recentlyDecisioned.dueDate)}</p>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Contribution History</CardTitle>
            </div>
            <History className="h-5 w-5 text-primary/50" />
          </CardHeader>
          <CardContent>
            {contributionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : contributions.length > 0 ? (
              <div className="h-[200px] w-full mt-4">
                <ChartContainer config={{ amount: { label: "Contribution", color: "hsl(var(--primary))" } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₱${v}`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="amount" stroke="var(--color-amount)" strokeWidth={3} dot={{ r: 4, fill: "var(--color-amount)" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground italic text-sm">
                No monthly contribution data records found.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Loan Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            {loansLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : activeLoan ? (
              <div className="space-y-6">
                <div>
                  <div className="text-3xl font-headline font-bold text-slate-800">₱{activeLoan.amount.toLocaleString()}</div>
                  <Badge className={cn(
                    "hover:bg-opacity-80 border-none mt-1 uppercase text-[10px]",
                    activeLoan.status === 'overdue' ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  )}>Status: {activeLoan.status}</Badge>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-muted-foreground uppercase text-[9px]">Repayment Ledger</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 flex flex-col items-center gap-1 bg-slate-50 p-2 rounded">
                      <span className="text-[8px] font-bold text-slate-400">M1</span>
                      <StatusBadge status={activeLoan.month1} />
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1 bg-slate-50 p-2 rounded">
                      <span className="text-[8px] font-bold text-slate-400">M2</span>
                      <StatusBadge status={activeLoan.month2} />
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1 bg-slate-50 p-2 rounded">
                      <span className="text-[8px] font-bold text-slate-400">M3</span>
                      <StatusBadge status={activeLoan.month3} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t text-xs">
                  <div>
                    <p className="uppercase font-bold text-muted-foreground text-[9px]">Due Date</p>
                    <p className="font-semibold">{formatDate(activeLoan.dueDate) || 'Pending Review'}</p>
                  </div>
                  <div className="text-right">
                    <p className="uppercase font-bold text-muted-foreground text-[9px]">Term</p>
                    <p className="font-semibold">{activeLoan.termMonths === 0.25 ? '7 Days' : `${activeLoan.termMonths} Months`}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <CheckCircle2 className="h-8 w-8 text-green-500/20 mx-auto" />
                <p className="text-xs text-muted-foreground">No active debts. Your account is clear.</p>
                <Button asChild size="sm" variant="outline" className="w-full"><Link href="/dashboard/member/request">Request Credit</Link></Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Loan Request History</CardTitle>
          <CardDescription>Track the lifecycle of your community credit requests.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loansLoading ? (
            <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-bold text-[10px] uppercase">Loaner / Purpose</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase">Principal</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase">Status</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-center">Ledger M1</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-center">Ledger M2</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-center">Ledger M3</TableHead>
                  <TableHead className="text-right font-bold text-[10px] uppercase pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans && loans.length > 0 ? loans.map((l) => (
                  <TableRow key={l.id} className="group transition-colors border-b">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-xs">{l.loanerName || 'Self'}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{l.purpose}</span>
                        {l.adminNote && (
                          <div className="mt-1 flex items-start gap-1 bg-primary/5 p-1 rounded border border-primary/10 max-w-[200px]">
                            <MessageSquareText className="h-2 w-2 text-primary mt-0.5 shrink-0" />
                            <span className="text-[9px] text-primary italic font-medium leading-tight">Note: {l.adminNote}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-slate-700 text-xs">₱{l.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "capitalize text-[9px] font-bold",
                        l.status === 'approved' ? "bg-green-50 text-green-700" : 
                        l.status === 'pending' ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"
                      )}>
                        {l.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center"><StatusBadge status={l.month1} /></TableCell>
                    <TableCell className="text-center"><StatusBadge status={l.month2} /></TableCell>
                    <TableCell className="text-center"><StatusBadge status={l.month3} /></TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        {l.status === 'pending' && (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-primary" onClick={() => handleEditLoan(l)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-destructive" onClick={() => handleDeleteLoan(l.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow key="no-loans-row">
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground italic text-xs">No loan records found in your portal.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Loan Request</DialogTitle>
            <DialogDescription>Modify your pending application details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-loaner-name">Loaner Name</Label>
              <Input id="edit-loaner-name" value={editLoanerName} onChange={(e) => setEditLoanerName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-amount">Principal Amount (₱)</Label>
              <Input id="edit-amount" type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-purpose">Purpose</Label>
              <Input id="edit-purpose" value={editPurpose} onChange={(e) => setEditPurpose(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateLoan}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

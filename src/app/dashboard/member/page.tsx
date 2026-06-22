
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  CheckCircle2,
  CalendarDays,
  User
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
import { format } from 'date-fns';

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
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return format(date, "MMM dd, yyyy");
    } catch (e) {
      return dateStr || '';
    }
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
  const chartData = contributions.map(c => ({
    date: c.date,
    amount: c.amount,
  }));

  const activeLoan = loans?.find(l => l.status === 'approved' || l.status === 'overdue');
  const overdueLoan = loans?.find(l => l.status === 'overdue');
  const recentlyDecisioned = loans?.find(l => (l.status === 'approved' || l.status === 'rejected') && (l.adminNote || l.status === 'approved'));

  const StatusBadge = ({ status, date }: { status?: string, date?: string }) => {
    if (!status || status === 'pending') return (
      <div className="flex flex-col items-center">
        <Badge variant="outline" className="text-[8px] bg-slate-50 text-slate-400 border-slate-100 uppercase">Unpaid</Badge>
        {date && <span className="text-[7px] text-muted-foreground mt-0.5">{formatDate(date)}</span>}
      </div>
    );
    if (status === 'paid') return (
      <div className="flex flex-col items-center">
        <Badge variant="outline" className="text-[8px] bg-green-50 text-green-700 border-green-200 uppercase">Paid</Badge>
        {date && <span className="text-[7px] text-green-600 mt-0.5 font-medium">{formatDate(date)}</span>}
      </div>
    );
    if (status === 'late') return (
      <div className="flex flex-col items-center">
        <Badge variant="outline" className="text-[8px] bg-red-50 text-red-700 border-red-200 uppercase">Late</Badge>
        {date && <span className="text-[7px] text-red-600 mt-0.5 font-medium">{formatDate(date)}</span>}
      </div>
    );
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-800">Member Portal</h1>
          <p className="text-muted-foreground">Manage your savings and tracking community credit.</p>
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
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive shadow-md">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-bold uppercase text-xs">Urgent: Overdue Payment Notice</AlertTitle>
            <AlertDescription className="text-sm">
              Your loan of ₱{overdueLoan.amount.toLocaleString()} is currently past its due date. Please coordinate with the community admin immediately.
            </AlertDescription>
          </Alert>
        )}
        
        {recentlyDecisioned && (
          <Alert className={cn(
            "border-2 shadow-sm",
            recentlyDecisioned.status === 'approved' ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
          )}>
            <div className="flex gap-4">
              <div className="p-2 bg-white rounded-full h-fit shadow-sm">
                {recentlyDecisioned.status === 'approved' ? <CheckCircle2 className="h-6 w-6 text-green-600" /> : <AlertCircle className="h-6 w-6 text-red-600" />}
              </div>
              <div className="space-y-1 flex-1">
                <AlertTitle className="font-bold text-lg">
                  Loan Request {recentlyDecisioned.status.toUpperCase()}
                </AlertTitle>
                <AlertDescription className="text-sm space-y-2">
                  <p>Request for: <span className="font-bold">₱{recentlyDecisioned.amount.toLocaleString()}</span></p>
                  {recentlyDecisioned.adminNote ? (
                    <div className="bg-white/50 p-3 rounded-lg border border-black/5 italic">
                      " {recentlyDecisioned.adminNote} "
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No additional notes provided by the administrator.</p>
                  )}
                  {recentlyDecisioned.dueDate && recentlyDecisioned.status === 'approved' && (
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase pt-1">
                      <CalendarDays className="h-4 w-4" />
                      Scheduled Release / First Payment: {formatDate(recentlyDecisioned.dueDate)}
                    </div>
                  )}
                </AlertDescription>
              </div>
            </div>
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
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Loan Overview</CardTitle>
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
                    "hover:bg-opacity-80 border-none mt-1 uppercase text-[10px] font-bold",
                    activeLoan.status === 'overdue' ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  )}>Current Status: {activeLoan.status}</Badge>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-muted-foreground uppercase text-[9px] tracking-widest">Master Ledger Sync</span>
                    <Badge variant="outline" className="text-[8px] font-mono border-slate-100">REAL-TIME</Badge>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 flex flex-col items-center gap-1 bg-slate-50 p-2 rounded border border-slate-100/50">
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Month 1</span>
                      <StatusBadge status={activeLoan.month1} date={activeLoan.month1Date} />
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1 bg-slate-50 p-2 rounded border border-slate-100/50">
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Month 2</span>
                      <StatusBadge status={activeLoan.month2} date={activeLoan.month2Date} />
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1 bg-slate-50 p-2 rounded border border-slate-100/50">
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Month 3</span>
                      <StatusBadge status={activeLoan.month3} date={activeLoan.month3Date} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t text-xs">
                  <div className="space-y-1">
                    <p className="uppercase font-bold text-muted-foreground text-[9px] tracking-wider">Release Date</p>
                    <p className="font-bold text-slate-700">{formatDate(activeLoan.dueDate) || 'Pending'}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="uppercase font-bold text-muted-foreground text-[9px] tracking-wider">Repayment Term</p>
                    <p className="font-bold text-slate-700">{activeLoan.termMonths === 0.25 ? '7 Days' : `${activeLoan.termMonths} Months`}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <CheckCircle2 className="h-10 w-10 text-green-500/20 mx-auto" />
                <p className="text-xs text-muted-foreground max-w-[180px] mx-auto leading-relaxed">Your credit account is currently clear. No active loans detected.</p>
                <Button asChild size="sm" variant="outline" className="w-full border-slate-200 hover:bg-slate-50"><Link href="/dashboard/member/request">Request New Loan</Link></Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b pb-4">
          <CardTitle className="text-lg font-bold text-slate-800">Community Loan Ledger</CardTitle>
          <CardDescription>Track the live status of your requests and admin collection notes.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loansLoading ? (
            <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary/40" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider pl-6">Purpose / Beneficiary</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider">Principal</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider">Application Status</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider text-center">M1</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider text-center">M2</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider text-center">M3</TableHead>
                  <TableHead className="text-right font-bold text-[10px] uppercase tracking-wider pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans && loans.length > 0 ? loans.map((l) => (
                  <TableRow key={l.id} className="group transition-colors border-b last:border-0">
                    <TableCell className="pl-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-800 text-xs">{l.purpose}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-medium">
                          <User className="h-2 w-2" /> For: {l.loanerName || 'Self'}
                        </span>
                        {l.adminNote && (
                          <div className="mt-2 flex items-start gap-2 bg-primary/5 p-2 rounded-md border border-primary/10 max-w-[240px]">
                            <MessageSquareText className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                            <span className="text-[9px] text-primary italic font-semibold leading-relaxed">Admin: {l.adminNote}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-slate-700 text-xs">₱{l.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "capitalize text-[9px] font-bold px-3",
                        l.status === 'approved' ? "bg-green-50 text-green-700 border-green-200" : 
                        l.status === 'pending' ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-red-50 text-red-700 border-red-200"
                      )}>
                        {l.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center"><StatusBadge status={l.month1} date={l.month1Date} /></TableCell>
                    <TableCell className="text-center"><StatusBadge status={l.month2} date={l.month2Date} /></TableCell>
                    <TableCell className="text-center"><StatusBadge status={l.month3} date={l.month3Date} /></TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        {l.status === 'pending' && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-primary transition-colors" onClick={() => handleEditLoan(l)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-destructive transition-colors" onClick={() => handleDeleteLoan(l.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16 text-muted-foreground italic text-xs bg-slate-50/20">
                      No loan applications detected in your history.
                    </TableCell>
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
            <DialogTitle className="text-xl font-headline font-bold">Modify Pending Application</DialogTitle>
            <DialogDescription>Your request can only be edited while it is still in the 'Pending' status.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-loaner-name" className="text-xs uppercase font-bold text-muted-foreground">Actual Loaner / Beneficiary</Label>
              <Input id="edit-loaner-name" value={editLoanerName} onChange={(e) => setEditLoanerName(e.target.value)} className="font-medium" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-amount" className="text-xs uppercase font-bold text-muted-foreground">Requested Principal (₱)</Label>
              <Input id="edit-amount" type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="font-bold text-primary" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-purpose" className="text-xs uppercase font-bold text-muted-foreground">Loan Purpose / Details</Label>
              <Input id="edit-purpose" value={editPurpose} onChange={(e) => setEditPurpose(e.target.value)} className="font-medium" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="font-semibold">Cancel</Button>
            <Button onClick={handleUpdateLoan} className="bg-primary text-white font-bold">Update Application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

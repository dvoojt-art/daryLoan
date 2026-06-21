
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
  Loader2
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
import { MOCK_CONTRIBUTIONS } from '@/lib/mock-data';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection } from '@/firebase';
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

  // For the prototype, we still use mock contributions as they represent historical growth
  const myContributions = MOCK_CONTRIBUTIONS.filter(c => c.memberId === 'm1');
  const totalContributed = myContributions.reduce((acc, c) => acc + c.amount, 0);
  
  const activeLoan = loans?.find(l => l.status === 'approved');
  const overdueLoan = loans?.find(l => l.status === 'overdue');
  const recentlyDecisioned = loans?.find(l => (l.status === 'approved' || l.status === 'rejected') && l.adminNote);

  const chartData = myContributions.map(c => ({
    date: c.date,
    amount: c.amount,
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Contribution Growth</CardTitle>
              <div className="text-3xl font-headline font-bold text-primary">₱{totalContributed.toLocaleString()}</div>
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Loan</CardTitle>
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
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none mt-1 uppercase">Status: {activeLoan.status}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium"><span>Repayment</span><span>40%</span></div>
                  <Progress value={40} className="h-2 bg-slate-100" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t text-xs">
                  <div>
                    <p className="uppercase font-bold text-muted-foreground text-[9px]">Due Date</p>
                    <p className="font-semibold">{formatDate(activeLoan.dueDate) || 'Pending'}</p>
                  </div>
                  <div className="text-right">
                    <p className="uppercase font-bold text-muted-foreground text-[9px]">Term Remaining</p>
                    <p className="font-semibold">{activeLoan.termMonths} Mo</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground">No active loans. Need support?</p>
                <Button asChild size="sm" variant="outline" className="w-full"><Link href="/dashboard/member/request">Request Now</Link></Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Request History</CardTitle>
            <CardDescription>Real-time status and admin release notes.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loansLoading ? (
              <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-bold">Loaner / Purpose</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="text-right font-bold">Principal</TableHead>
                    <TableHead className="text-right font-bold">Actions</TableHead>
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
                            <div className="mt-1 flex items-start gap-1 bg-primary/5 p-1 rounded border border-primary/10">
                              <MessageSquareText className="h-2 w-2 text-primary mt-0.5 shrink-0" />
                              <span className="text-[9px] text-primary italic font-medium leading-tight">Note: {l.adminNote}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "capitalize text-[9px] font-bold",
                          l.status === 'approved' ? "bg-green-50 text-green-700" : 
                          l.status === 'pending' ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"
                        )}>
                          {l.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{formatDate(l.requestDate)}</TableCell>
                      <TableCell className="text-right font-bold text-slate-700 text-xs">₱{l.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
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
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic text-xs">No loan records found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Contributions</CardTitle>
              <CardDescription>Your savings activity log.</CardDescription>
            </div>
            <History className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Ref ID</TableHead>
                  <TableHead className="text-right font-bold">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myContributions.slice(0, 5).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-xs">{formatDate(c.date)}</TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground uppercase">DARY-{c.id}</TableCell>
                    <TableCell className="text-right font-bold text-primary text-xs">₱{c.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

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

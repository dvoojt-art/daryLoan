
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Calendar, 
  ArrowRight, 
  Info,
  History,
  TrendingUp,
  AlertCircle,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  FileJson,
  Plus,
  AlertTriangle,
  Edit,
  Trash2
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
import { MOCK_LOANS, MOCK_CONTRIBUTIONS, Loan } from '@/lib/mock-data';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function MemberDashboard() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [loans, setLoans] = useState<Loan[]>([]);
  const memberId = 'm1';

  // Edit State
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [editPurpose, setEditPurpose] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    refreshLoans();
  }, []);

  const refreshLoans = () => {
    const localLoans = JSON.parse(localStorage.getItem('daryloan_user_loans') || '[]');
    const myMockLoans = MOCK_LOANS.filter(l => l.memberId === memberId);
    setLoans([...localLoans, ...myMockLoans].sort((a, b) => 
      new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
    ));
  };

  const handleDeleteLoan = (loanId: string) => {
    // 1. Check if it's a mock loan (can't delete from constant file, but can hide in session)
    const isMock = MOCK_LOANS.some(l => l.id === loanId);
    
    // 2. Remove from local storage if it exists there
    const localLoans = JSON.parse(localStorage.getItem('daryloan_user_loans') || '[]');
    const filteredLocal = localLoans.filter((l: Loan) => l.id !== loanId);
    localStorage.setItem('daryloan_user_loans', JSON.stringify(filteredLocal));

    // 3. Update local state
    setLoans(prev => prev.filter(l => l.id !== loanId));

    toast({
      title: "Request Removed",
      description: isMock ? "Demo record hidden for this session." : "Your loan request has been successfully deleted.",
      variant: "destructive",
    });
  };

  const handleEditLoan = (loan: Loan) => {
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
    setIsEditDialogOpen(true);
  };

  const handleUpdateLoan = () => {
    if (!editingLoan) return;

    const amountNum = parseFloat(editAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number.",
        variant: "destructive"
      });
      return;
    }

    // Update state
    const updatedLoans = loans.map(l => {
      if (l.id === editingLoan.id) {
        return { ...l, purpose: editPurpose, amount: amountNum };
      }
      return l;
    });

    // Update local storage if applicable
    const localLoans = JSON.parse(localStorage.getItem('daryloan_user_loans') || '[]');
    const isLocal = localLoans.some((l: Loan) => l.id === editingLoan.id);
    
    if (isLocal) {
      const updatedLocal = localLoans.map((l: Loan) => {
        if (l.id === editingLoan.id) {
          return { ...l, purpose: editPurpose, amount: amountNum };
        }
        return l;
      });
      localStorage.setItem('daryloan_user_loans', JSON.stringify(updatedLocal));
    }

    setLoans(updatedLoans);
    setIsEditDialogOpen(false);
    toast({
      title: "Request Updated",
      description: `Application for "${editPurpose}" updated to ₱${amountNum.toLocaleString()}.`,
    });
  };

  if (!mounted) return null;

  const myContributions = MOCK_CONTRIBUTIONS.filter(c => c.memberId === memberId);
  const totalContributed = myContributions.reduce((acc, c) => acc + c.amount, 0);
  
  const activeLoan = loans.find(l => l.status === 'approved');
  const overdueLoan = loans.find(l => l.status === 'overdue');

  const chartData = myContributions.map(c => ({
    date: c.date,
    amount: c.amount,
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleExport = (format: string) => {
    toast({
      title: "Statement Ready",
      description: `Your contribution statement has been generated in ${format} format.`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-800">Member Portal</h1>
          <p className="text-muted-foreground">Manage your savings and loan applications.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-accent hover:bg-accent/90 text-white font-bold shadow-sm">
            <Link href="/dashboard/member/request">
              <Plus className="mr-2 h-4 w-4" /> Request Loan
            </Link>
          </Button>
        </div>
      </div>

      {/* Member Alerts & Notifications */}
      <div className="grid gap-4 md:grid-cols-2">
        {overdueLoan ? (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive animate-pulse">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-bold">URGENT: Overdue Payment Detected</AlertTitle>
            <AlertDescription className="text-sm">
              Your loan of ₱{overdueLoan.amount.toLocaleString()} for "{overdueLoan.purpose}" is past its due date. Please settle this immediately to avoid penalties.
            </AlertDescription>
          </Alert>
        ) : null}
        
        {activeLoan && activeLoan.dueDate && (
          <Alert className="bg-primary/5 border-primary/20 text-primary">
            <Clock className="h-5 w-5" />
            <AlertTitle className="font-bold">Upcoming Due Date Notification</AlertTitle>
            <AlertDescription className="text-sm">
              Your next payment for the ₱{activeLoan.amount.toLocaleString()} loan is due on <span className="font-bold underline">{activeLoan.dueDate}</span>.
            </AlertDescription>
          </Alert>
        )}

        {!overdueLoan && !activeLoan && (
          <Alert className="bg-green-50 border-green-200 text-green-700">
            <Info className="h-5 w-5" />
            <AlertTitle className="font-bold">Account in Good Standing</AlertTitle>
            <AlertDescription className="text-sm">
              You have no outstanding or overdue loans. Your contribution consistency is excellent!
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Contributions & Growth Chart */}
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
              <ChartContainer
                config={{
                  amount: {
                    label: "Contribution",
                    color: "hsl(var(--primary))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888888" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `₱${value}`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="var(--color-amount)" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: "var(--color-amount)" }} 
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Active Loan Details */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Loan Summary</CardTitle>
            <CreditCard className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            {activeLoan ? (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <div className="text-3xl font-headline font-bold text-slate-800">₱{activeLoan.amount.toLocaleString()}</div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Active</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Principal amount approved</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Repayment Progress</span>
                    <span>40%</span>
                  </div>
                  <Progress value={40} className="h-2 bg-slate-100" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Next Due</p>
                    <p className="text-sm font-semibold">{activeLoan.dueDate || 'N/A'}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Remaining</p>
                    <p className="text-sm font-semibold">8 Months</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="bg-muted p-4 rounded-full">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-700">No Active Loans</p>
                  <p className="text-xs text-muted-foreground">Need financial support? Apply today.</p>
                </div>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href="/dashboard/member/request">Start Application</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contribution Ledger with Export */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Contribution Ledger</CardTitle>
              <CardDescription>Comprehensive savings statement.</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <Download className="h-4 w-4" /> Download Statement
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('Excel')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" /> Export to Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('PDF')}>
                  <FileText className="mr-2 h-4 w-4 text-red-600" /> Export to PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('CSV')}>
                  <FileJson className="mr-2 h-4 w-4 text-blue-600" /> Export to CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-bold">Transaction Date</TableHead>
                  <TableHead className="font-bold">Reference ID</TableHead>
                  <TableHead className="text-right font-bold">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myContributions.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.date}</TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground tracking-tighter uppercase">DARY-{c.id}</TableCell>
                    <TableCell className="text-right font-bold text-primary">₱{c.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Loan History Table */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Loan Request History</CardTitle>
              <CardDescription>Track status of past and current requests.</CardDescription>
            </div>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-bold">Purpose</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Principal</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.purpose}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "capitalize",
                          l.status === 'approved' && "bg-green-50 text-green-700 border-green-200",
                          l.status === 'pending' && "bg-yellow-50 text-yellow-700 border-yellow-200",
                          l.status === 'rejected' && "bg-red-50 text-red-700 border-red-200",
                          l.status === 'overdue' && "bg-destructive/10 text-destructive border-destructive/20"
                        )}
                      >
                        {l.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-700">₱{l.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-slate-400 hover:text-primary"
                          onClick={() => handleEditLoan(l)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-slate-400 hover:text-destructive"
                          onClick={() => handleDeleteLoan(l.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {loans.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground italic">
                      No loan history found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Loan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Loan Request</DialogTitle>
            <DialogDescription>
              Modify your pending application details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-amount">Principal Amount (₱)</Label>
              <Input 
                id="edit-amount" 
                type="number" 
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-purpose">Purpose</Label>
              <Input 
                id="edit-purpose" 
                value={editPurpose}
                onChange={(e) => setEditPurpose(e.target.value)}
              />
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


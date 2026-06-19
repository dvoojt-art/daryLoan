
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Users, 
  HandCoins, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  UserPlus,
  Download,
  ArrowRight,
  ShieldCheck,
  Zap,
  History,
  CheckCircle2,
  User
} from 'lucide-react';
import { MOCK_LOANS, MOCK_MEMBERS, Loan } from '@/lib/mock-data';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [allLoans, setAllLoans] = useState<Loan[]>([]);

  useEffect(() => {
    setMounted(true);
    const localLoans = JSON.parse(localStorage.getItem('daryloan_user_loans') || '[]');
    setAllLoans([...localLoans, ...MOCK_LOANS]);
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

  if (!mounted) return null;

  const pendingLoans = allLoans.filter(l => l.status === 'pending');
  const overdueLoans = allLoans.filter(l => l.status === 'overdue');
  const newApplications = MOCK_MEMBERS.filter(m => m.status === 'pending');
  const totalDisbursed = allLoans.filter(l => l.status === 'approved' || l.status === 'overdue' || l.status === 'repaid').reduce((acc, l) => acc + l.amount, 0);
  
  // Sort loans by date to show most recent activity
  const recentActivity = [...allLoans].sort((a, b) => 
    new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
  ).slice(0, 5);

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-800 tracking-tight">Admin Command Center</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">Mission Control for Community Financial Operations</p>
        </div>
        
        <Button className="bg-primary shadow-lg h-11 px-6">
          <Download className="mr-2 h-4 w-4" /> Generate Master Report
        </Button>
      </div>

      {/* Admin Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        {overdueLoans.length > 0 && (
          <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-destructive shadow-sm">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-bold">Overdue Risk Warning</AlertTitle>
            <AlertDescription className="text-xs">
              There are {overdueLoans.length} loans currently past due. Immediate follow-up recommended to preserve equity pool.
            </AlertDescription>
          </Alert>
        )}
        {newApplications.length > 0 && (
          <Alert className="bg-accent/5 border-accent/20 text-accent shadow-sm">
            <UserPlus className="h-5 w-5" />
            <AlertTitle className="font-bold">Pending Registrations</AlertTitle>
            <AlertDescription className="text-xs">
              {newApplications.length} potential members are awaiting background checks and portal access.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Active Pool</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{MOCK_MEMBERS.filter(m => m.status === 'active').length}</div>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">Verified community lenders</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Capital Disbursed</CardTitle>
            <HandCoins className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">₱{totalDisbursed.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">Total principal in circulation</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Interest Gained</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">₱{(totalDisbursed * 0.1).toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">Calculated 10% monthly yield</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-800 text-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Review Queue</CardTitle>
            <Zap className="h-4 w-4 text-accent animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingLoans.length}</div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Awaiting AI risk assessment</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Quick Links / Insights */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Quick Operational Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/dashboard/admin/loans" className="block group">
              <Card className="border-none shadow-sm group-hover:bg-primary transition-colors h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold group-hover:text-white">Loan Approvals</CardTitle>
                  <CardDescription className="text-xs group-hover:text-white/70">Action {pendingLoans.length} pending requests.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-end">
                  <ArrowRight className="h-4 w-4 group-hover:text-white transform group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/admin/ledger" className="block group">
              <Card className="border-none shadow-sm group-hover:bg-accent transition-colors h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold group-hover:text-white">Master Ledger</CardTitle>
                  <CardDescription className="text-xs group-hover:text-white/70">Audit full financial history.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-end">
                  <ArrowRight className="h-4 w-4 group-hover:text-white transform group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* System Health / Summary */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Financial Health Snapshot</CardTitle>
            <CardDescription className="text-xs">Aggregate data from the Master Ledger.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Equity Utilization</span>
                <span className="font-bold text-slate-800">72%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[72%] transition-all" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Repayment Rate (Global)</span>
                <span className="font-bold text-slate-800">94.5%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[94.5%] transition-all" />
              </div>
            </div>

            <div className="pt-4 border-t grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Portfolio Risk</p>
                <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200">LOW</Badge>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Liquidity Status</p>
                <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-200">HEALTHY</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Recent Financial Activity</CardTitle>
              <CardDescription className="text-xs">Live stream of community transactions and updates.</CardDescription>
            </div>
            <History className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {recentActivity.map((loan) => {
              const member = MOCK_MEMBERS.find(m => m.id === loan.memberId);
              const loanerName = loan.loanerName || member?.name || 'Unknown';
              return (
                <div key={loan.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className={cn(
                    "mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border",
                    loan.status === 'approved' ? "bg-green-50 text-green-600 border-green-100" : 
                    loan.status === 'overdue' ? "bg-red-50 text-red-600 border-red-100" : 
                    loan.status === 'rejected' ? "bg-slate-50 text-slate-400 border-slate-100" :
                    "bg-yellow-50 text-yellow-600 border-yellow-100"
                  )}>
                    {loan.status === 'approved' ? <CheckCircle2 className="h-4 w-4" /> : 
                     loan.status === 'overdue' ? <AlertTriangle className="h-4 w-4" /> : 
                     loan.status === 'rejected' ? <ShieldCheck className="h-4 w-4" /> :
                     <Clock className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-slate-800">
                        {loanerName} 
                        <span className="font-normal text-muted-foreground ml-1">
                          {loan.status === 'pending' ? 'submitted a request for' : 
                           loan.status === 'approved' ? 'loan agreement finalized for' : 
                           loan.status === 'overdue' ? 'loan marked as overdue for' : 
                           loan.status === 'rejected' ? 'loan request denied for' : 'repaid'}
                        </span>
                      </p>
                      <span className="text-[10px] text-muted-foreground font-medium">{formatDate(loan.requestDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-primary">₱{loan.amount.toLocaleString()}</p>
                      <Badge variant="secondary" className="text-[9px] uppercase tracking-tighter h-4 px-2 font-bold">
                        {loan.purpose}
                      </Badge>
                      {loan.loanerName && member && loan.loanerName !== member.name && (
                        <Badge variant="outline" className="text-[9px] uppercase h-4 px-2 border-slate-200">
                          Account: {member.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-6 text-xs text-primary hover:bg-primary/5 font-bold" asChild>
            <Link href="/dashboard/admin/ledger">
              View Full Master Audit Trail <ArrowRight className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

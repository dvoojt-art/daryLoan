'use client';

import { useState, useEffect, useMemo } from 'react';
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
  MessageSquareText,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const firestore = useFirestore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real-time stats data
  const loansQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'loans');
  }, [firestore]);

  const membersQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const recentActivityQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'loans'), orderBy('requestDate', 'desc'), limit(5));
  }, [firestore]);

  const { data: allLoans, loading: loansLoading } = useCollection<any>(loansQuery);
  const { data: allMembers, loading: membersLoading } = useCollection<any>(membersQuery);
  const { data: recentActivity } = useCollection<any>(recentActivityQuery);

  const stats = useMemo(() => {
    const loans = allLoans || [];
    const members = allMembers || [];

    const pending = loans.filter(l => l.status === 'pending');
    const overdue = loans.filter(l => l.status === 'overdue');
    const activeMembers = members.filter(m => m.status === 'active' && m.role === 'member');
    const pendingMembers = members.filter(m => m.status === 'pending' && m.role === 'member');
    
    const totalDisbursed = loans
      .filter(l => ['approved', 'repaid', 'overdue'].includes(l.status))
      .reduce((acc, l) => acc + (l.amount || 0), 0);
    
    const estimatedInterest = loans
      .filter(l => ['approved', 'repaid', 'overdue'].includes(l.status))
      .reduce((acc, l) => {
        const rate = l.termMonths === 0.25 ? 0.05 : (0.10 * (l.termMonths || 1));
        return acc + (l.amount * rate);
      }, 0);

    return {
      pendingCount: pending.length,
      overdueCount: overdue.length,
      activeMembersCount: activeMembers.length,
      pendingMembersCount: pendingMembers.length,
      totalDisbursed,
      estimatedInterest,
    };
  }, [allLoans, allMembers]);

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

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-800 tracking-tight">Admin Command Center</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">Mission Control for Community Financial Operations</p>
        </div>
        <Button className="bg-primary shadow-lg h-11 px-6"><Download className="mr-2 h-4 w-4" /> Export Master Report</Button>
      </div>

      {/* Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        {stats.overdueCount > 0 && (
          <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 shadow-sm">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-bold">Overdue Risk Warning</AlertTitle>
            <AlertDescription className="text-xs">There are {stats.overdueCount} loans past due. Follow-up required.</AlertDescription>
          </Alert>
        )}
        {stats.pendingMembersCount > 0 && (
          <Alert className="bg-accent/5 border-accent/20 text-accent shadow-sm">
            <UserPlus className="h-5 w-5" />
            <AlertTitle className="font-bold">Pending Registrations</AlertTitle>
            <AlertDescription className="text-xs">{stats.pendingMembersCount} members awaiting verification.</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active Members', value: stats.activeMembersCount, sub: 'Verified lenders', icon: Users, color: 'text-primary' },
          { label: 'Capital Disbursed', value: `₱${stats.totalDisbursed.toLocaleString()}`, sub: 'Principal in circulation', icon: HandCoins, color: 'text-accent' },
          { label: 'Estimated Yield', value: `₱${stats.estimatedInterest.toLocaleString()}`, sub: 'Calculated 10% monthly', icon: TrendingUp, color: 'text-green-500' },
          { label: 'Review Queue', value: stats.pendingCount, sub: 'Awaiting AI assessment', icon: Zap, color: 'text-accent', bg: 'bg-slate-800 text-white' },
        ].map((s, idx) => (
          <Card key={idx} className={cn("border-none shadow-sm transition-shadow", s.bg)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-70">{s.label}</CardTitle>
              <s.icon className={cn("h-4 w-4", s.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
              <p className="text-[10px] opacity-70 font-medium mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Operational Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/dashboard/admin/loans" className="block group">
              <Card className="border-none shadow-sm group-hover:bg-primary transition-colors">
                <CardHeader><CardTitle className="text-sm font-bold group-hover:text-white">Loan Approvals</CardTitle></CardHeader>
                <CardContent className="flex justify-end"><ArrowRight className="h-4 w-4 group-hover:text-white" /></CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/admin/ledger" className="block group">
              <Card className="border-none shadow-sm group-hover:bg-accent transition-colors">
                <CardHeader><CardTitle className="text-sm font-bold group-hover:text-white">Master Ledger</CardTitle></CardHeader>
                <CardContent className="flex justify-end"><ArrowRight className="h-4 w-4 group-hover:text-white" /></CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader><CardTitle className="text-lg font-bold">Recent Financial Activity</CardTitle></CardHeader>
          <CardContent>
            {recentActivity?.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground italic text-sm">No recent activity detected.</p>
            ) : (
              <div className="space-y-4">
                {recentActivity?.map((loan: any) => (
                  <div key={loan.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
                      loan.status === 'approved' ? "bg-green-50 text-green-600" : 
                      loan.status === 'pending' ? "bg-yellow-50 text-yellow-600" : "bg-slate-50"
                    )}>
                      {loan.status === 'approved' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{loan.loanerName || 'Unknown'} - ₱{loan.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{loan.purpose} • {formatDate(loan.requestDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="ghost" size="sm" className="w-full mt-4 font-bold" asChild>
              <Link href="/dashboard/admin/ledger">View Full Audit Trail <ArrowRight className="ml-2 h-3 w-3" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

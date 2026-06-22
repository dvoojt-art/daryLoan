
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Wallet, 
  LayoutDashboard, 
  Users, 
  HandCoins, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  AlertCircle,
  Clock,
  UserCheck,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser, useAuth, useFirestore, useCollection } from '@/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, orderBy } from 'firebase/firestore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const pathname = usePathname();
  const router = useRouter();
  
  // Robust role detection based on path
  const isAdmin = pathname.startsWith('/dashboard/admin');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real-time Data Fetching for Notifications
  // Admin gets all loans and users, members get only their own loans
  const loansQuery = useMemo(() => {
    if (!firestore || !user) return null;
    if (isAdmin) return collection(firestore, 'loans');
    return query(collection(firestore, 'loans'), where('memberId', '==', user.uid));
  }, [firestore, user, isAdmin]);

  const usersQuery = useMemo(() => {
    if (!firestore || !isAdmin) return null;
    return collection(firestore, 'users');
  }, [firestore, isAdmin]);

  const { data: loansData } = useCollection<any>(loansQuery);
  const { data: usersData } = useCollection<any>(usersQuery);

  const loans = loansData || [];
  const users = usersData || [];

  // Simple auth protection
  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push('/login');
    }
  }, [user, loading, mounted, router]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  const adminNotifications = useMemo(() => {
    if (!isAdmin) return [];
    
    const pendingLoans = loans.filter(l => l.status === 'pending');
    const overdueLoans = loans.filter(l => l.status === 'overdue');
    const pendingMembers = users.filter(m => m.status === 'pending');

    return [
      ...pendingLoans.map(l => ({ 
        id: `adm-pl-${l.id}`, 
        title: 'New Loan Request', 
        description: `₱${l.amount.toLocaleString()} requested by ${l.loanerName || 'Member'} for ${l.purpose}`, 
        icon: HandCoins, 
        href: '/dashboard/admin/loans',
        category: 'approval'
      })),
      ...overdueLoans.map(l => ({ 
        id: `adm-ol-${l.id}`, 
        title: 'Overdue Loan Alert', 
        description: `${l.loanerName || 'Member'} is past due on a ₱${l.amount.toLocaleString()} loan`, 
        icon: AlertTriangle, 
        href: '/dashboard/admin/ledger',
        category: 'due'
      })),
      ...pendingMembers.map(m => ({ 
        id: `adm-pm-${m.id}`, 
        title: 'Pending Registration', 
        description: `${m.name || m.email} joined and needs account verification`, 
        icon: UserCheck, 
        href: '/dashboard/admin/members',
        category: 'approval'
      })),
    ];
  }, [loans, users, isAdmin]);

  const memberNotifications = useMemo(() => {
    if (isAdmin) return [];
    
    const myOverdue = loans.filter(l => l.status === 'overdue');
    const myApproved = loans.filter(l => l.status === 'approved');
    const myRejected = loans.filter(l => l.status === 'rejected');
    const myLate = loans.filter(l => l.month1 === 'late' || l.month2 === 'late' || l.month3 === 'late');

    return [
      ...myOverdue.map(l => ({ 
        id: `mem-ov-${l.id}`, 
        title: 'Action Required: Overdue', 
        description: `Your loan for ${l.purpose} is currently past its due date.`, 
        icon: AlertTriangle, 
        href: '/dashboard/member',
        category: 'due'
      })),
      ...myApproved.map(l => ({ 
        id: `mem-ap-${l.id}`, 
        title: 'Good News: Loan Approved!', 
        description: `Your request for ₱${l.amount.toLocaleString()} has been approved.`, 
        icon: CheckCircle2, 
        href: '/dashboard/member',
        category: 'status'
      })),
      ...myRejected.map(l => ({ 
        id: `mem-rj-${l.id}`, 
        title: 'Loan Update: Rejected', 
        description: `Your request for ${l.purpose} was not approved by administration.`, 
        icon: X, 
        href: '/dashboard/member',
        category: 'status'
      })),
      ...myLate.map(l => ({
        id: `mem-lt-${l.id}`,
        title: 'Late Payment Penalty',
        description: `A late payment status was recorded for your loan. A 10% penalty may apply.`,
        icon: AlertCircle,
        href: '/dashboard/member',
        category: 'penalty'
      }))
    ];
  }, [loans, isAdmin]);

  const allNotifications = isAdmin ? adminNotifications : memberNotifications;
  const activeNotifications = allNotifications.filter(n => !dismissedIds.has(n.id));
  const notificationCount = activeNotifications.length;

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissedIds(prev => new Set(prev).add(id));
  };

  const handleClearAll = () => {
    setDismissedIds(new Set(allNotifications.map(n => n.id)));
  };

  const navItems = isAdmin 
    ? [
        { name: 'Overview', icon: LayoutDashboard, href: '/dashboard/admin' },
        { name: 'Members', icon: Users, href: '/dashboard/admin/members' },
        { name: 'Loan Approvals', icon: HandCoins, href: '/dashboard/admin/loans' },
        { name: 'Ledger', icon: FileText, href: '/dashboard/admin/ledger' },
      ]
    : [
        { name: 'My Portal', icon: LayoutDashboard, href: '/dashboard/member' },
        { name: 'Community Lenders', icon: Users, href: '/dashboard/member/lenders' },
        { name: 'Request Loan', icon: HandCoins, href: '/dashboard/member/request' },
      ];

  if (!mounted || loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#010642]">
        <Loader2 className="h-8 w-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#010642] border-r border-white/10 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-white/10 bg-[#010642]">
            <Link href="/" className="flex items-center gap-2">
              <Wallet className="h-6 w-6 text-accent" />
              <div className="flex flex-col -space-y-1">
                <span className="font-headline text-xl">
                  <span className="font-bold text-white">Dary</span>
                  <span className="text-accent font-medium">Loan</span>
                </span>
                <span className="text-[10px] text-slate-300 font-medium leading-none">Problema mo'y may solusyon!</span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto bg-[#010642]">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                    isActive 
                      ? "bg-accent text-white shadow-lg shadow-accent/20" 
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10 space-y-4 bg-[#010642]">
            <div className="flex items-center gap-3 px-3">
              <Avatar className="h-9 w-9 border border-white/10">
                <AvatarImage src={`https://picsum.photos/seed/${user.uid}/100/100`} />
                <AvatarFallback>{user.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate text-white">{user.email}</p>
                <p className="text-xs text-slate-400 truncate">{isAdmin ? 'Admin Portal' : 'Member Portal'}</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5" onClick={handleLogout}>
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-[#010642] border-b border-white/10">
          <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/5" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="ml-auto flex items-center gap-4">
            {mounted && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/5 relative">
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                      <span className="absolute top-2 right-2 h-4 w-4 bg-destructive text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#010642]">
                        {notificationCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 shadow-2xl border-white/10" align="end">
                  <div className="p-4 border-b bg-slate-50/50">
                    <h3 className="font-bold text-sm">Real-time Notifications</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                      {notificationCount} {notificationCount === 1 ? 'Update' : 'Updates'} Requiring Attention
                    </p>
                  </div>
                  <ScrollArea className="h-[350px]">
                    {activeNotifications.length > 0 ? (
                      <div className="flex flex-col">
                        {activeNotifications.map((n) => (
                          <div key={n.id} className="relative group/notify">
                            <Link 
                              href={n.href}
                              className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors border-b last:border-0 pr-10"
                            >
                              <div className={cn(
                                "mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
                                n.category === 'due' || n.category === 'penalty'
                                  ? "bg-red-50 text-red-600 border-red-100" 
                                  : "bg-blue-50 text-blue-600 border-blue-100"
                              )}>
                                <n.icon className="h-4 w-4" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-bold leading-none">{n.title}</p>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">{n.description}</p>
                                <div className="pt-1">
                                  <span className={cn(
                                    "text-[9px] uppercase font-bold px-1.5 py-0.5 rounded",
                                    n.category === 'due' || n.category === 'penalty' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                  )}>
                                    {n.category}
                                  </span>
                                </div>
                              </div>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-4 h-6 w-6 opacity-0 group-hover/notify:opacity-100 transition-opacity hover:bg-slate-200"
                              onClick={(e) => handleDismiss(n.id, e)}
                            >
                              <X className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="bg-slate-100 p-3 rounded-full mb-3">
                          <Bell className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">No new alerts</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tight">Everything is up to date</p>
                      </div>
                    )}
                  </ScrollArea>
                  {activeNotifications.length > 0 && (
                    <div className="p-2 bg-slate-50/50 border-t flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-1 text-[11px] font-bold text-slate-500 hover:bg-slate-100"
                        onClick={handleClearAll}
                      >
                        Clear All
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-1 text-[11px] font-bold text-primary hover:bg-primary/5"
                        asChild
                      >
                        <Link href={isAdmin ? "/dashboard/admin/ledger" : "/dashboard/member"}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            )}
            
            <div className="h-8 w-px bg-white/10 mx-2" />
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-accent uppercase tracking-wider">{isAdmin ? 'Admin Account' : 'Member Account'}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}

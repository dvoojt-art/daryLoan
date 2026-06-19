'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MOCK_LOANS, MOCK_MEMBERS } from '@/lib/mock-data';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname.includes('/admin');

  // Notification logic
  const pendingLoans = MOCK_LOANS.filter(l => l.status === 'pending');
  const overdueLoans = MOCK_LOANS.filter(l => l.status === 'overdue');
  const pendingMembers = MOCK_MEMBERS.filter(m => m.status === 'pending');

  const myMemberId = 'm1';
  const myOverdue = MOCK_LOANS.filter(l => l.memberId === myMemberId && l.status === 'overdue');
  const myApproved = MOCK_LOANS.filter(l => l.memberId === myMemberId && l.status === 'approved');

  const adminNotifications = [
    ...pendingLoans.map(l => ({ 
      id: `pl-${l.id}`, 
      title: 'Approval Required', 
      description: `Request for ₱${l.amount.toLocaleString()} from ${MOCK_MEMBERS.find(m => m.id === l.memberId)?.name}`, 
      icon: HandCoins, 
      href: '/dashboard/admin/loans',
      category: 'approval'
    })),
    ...overdueLoans.map(l => ({ 
      id: `ol-${l.id}`, 
      title: 'Payment Overdue', 
      description: `₱${l.amount.toLocaleString()} loan from ${MOCK_MEMBERS.find(m => m.id === l.memberId)?.name} is past due`, 
      icon: AlertCircle, 
      href: '/dashboard/admin/ledger',
      category: 'due'
    })),
    ...pendingMembers.map(m => ({ 
      id: `pm-${m.id}`, 
      title: 'New Member Application', 
      description: `${m.name} is awaiting background verification`, 
      icon: UserCheck, 
      href: '/dashboard/admin/members',
      category: 'approval'
    })),
  ];

  const memberNotifications = [
    ...myOverdue.map(l => ({ 
      id: `mol-${l.id}`, 
      title: 'Urgent: Overdue Payment', 
      description: `Your loan for "${l.purpose}" is past its due date.`, 
      icon: AlertCircle, 
      href: '/dashboard/member',
      category: 'due'
    })),
    ...myApproved.map(l => ({ 
      id: `map-${l.id}`, 
      title: 'Loan Agreement Ready', 
      description: `Your ₱${l.amount.toLocaleString()} loan has been approved. Check your portal for details.`, 
      icon: Clock, 
      href: '/dashboard/member',
      category: 'approval'
    })),
  ];

  const notifications = isAdmin ? adminNotifications : memberNotifications;
  const notificationCount = notifications.length;

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

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
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
                <AvatarImage src={`https://picsum.photos/seed/${isAdmin ? 'admin' : 'member'}/100/100`} />
                <AvatarFallback>{isAdmin ? 'AD' : 'ME'}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate text-white">{isAdmin ? 'Admin Portal' : 'Member Portal'}</p>
                <p className="text-xs text-slate-400 truncate">{isAdmin ? 'Full Access' : 'View and Request Only'}</p>
              </div>
            </div>
            <Button asChild variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5">
              <Link href="/login">
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b lg:bg-transparent lg:border-none">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="ml-auto flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground relative">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute top-2 right-2 h-4 w-4 bg-destructive text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                      {notificationCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b bg-slate-50/50">
                  <h3 className="font-bold text-sm">Notifications</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                    {notificationCount} {notificationCount === 1 ? 'Alert' : 'Alerts'} Requiring Action
                  </p>
                </div>
                <ScrollArea className="h-[350px]">
                  {notifications.length > 0 ? (
                    <div className="flex flex-col">
                      {notifications.map((n) => (
                        <Link 
                          key={n.id} 
                          href={n.href}
                          className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors border-b last:border-0"
                        >
                          <div className={cn(
                            "mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
                            n.category === 'due' 
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
                                n.category === 'due' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                              )}>
                                {n.category}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                      <div className="bg-slate-100 p-3 rounded-full mb-3">
                        <Bell className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-500">No new notifications</p>
                    </div>
                  )}
                </ScrollArea>
                {notifications.length > 0 && (
                  <div className="p-2 bg-slate-50/50 border-t">
                    <Button variant="ghost" size="sm" className="w-full text-[11px] font-bold text-primary hover:bg-primary/5">
                      Mark All as Read
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
            
            <div className="h-8 w-px bg-border mx-2" />
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">{isAdmin ? 'Admin Session' : 'Member Session'}</p>
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
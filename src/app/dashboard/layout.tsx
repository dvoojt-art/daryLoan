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
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname.includes('/admin');

  const navItems = isAdmin 
    ? [
        { name: 'Overview', icon: LayoutDashboard, href: '/dashboard/admin' },
        { name: 'Members', icon: Users, href: '/dashboard/admin/members' },
        { name: 'Loan Approvals', icon: HandCoins, href: '/dashboard/admin/loans' },
        { name: 'Ledger', icon: FileText, href: '/dashboard/admin/ledger' },
      ]
    : [
        { name: 'My Portal', icon: LayoutDashboard, href: '/dashboard/member' },
        { name: 'Request Loan', icon: HandCoins, href: '/dashboard/member/request' },
        { name: 'Settings', icon: Settings, href: '/dashboard/member/settings' },
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
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b">
            <Link href="/" className="flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" />
              <div className="flex flex-col -space-y-1">
                <span className="font-headline text-xl">
                  <span className="font-bold text-slate-800">Dary</span>
                  <span className="text-yellow-600 font-medium">Loan</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-medium leading-none">Problema mo'y may solusyon!</span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                    isActive 
                      ? "bg-primary text-white" 
                      : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t space-y-4">
            <div className="flex items-center gap-3 px-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={`https://picsum.photos/seed/${isAdmin ? 'admin' : 'member'}/100/100`} />
                <AvatarFallback>{isAdmin ? 'AD' : 'ME'}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{isAdmin ? 'Admin Portal' : 'Member Portal'}</p>
                <p className="text-xs text-muted-foreground truncate">{isAdmin ? 'Full Access' : 'View and Request Only'}</p>
              </div>
            </div>
            <Button asChild variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive">
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
            <Button variant="ghost" size="icon" className="text-muted-foreground relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-accent rounded-full border-2 border-white" />
            </Button>
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

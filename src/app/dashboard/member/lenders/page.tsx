'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Filter, Loader2, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function LendersDirectoryPage() {
  const [search, setSearch] = useState('');
  const firestore = useFirestore();

  // Fetch all users and filter client-side for immediate real-time synchronization
  // This avoids index delays when new members are added in the Admin Portal
  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: allUsers, loading } = useCollection<any>(usersQuery);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  // Filter for members and apply search input on the client side
  const filteredMembers = useMemo(() => {
    if (!allUsers) return [];
    
    return allUsers
      .filter(m => m.role === 'member')
      .filter(m => 
        (m.name?.toLowerCase().includes(search.toLowerCase()) || 
         m.email?.toLowerCase().includes(search.toLowerCase()))
      )
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [allUsers, search]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-800">Community Directory</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">Verified Participants of the Community Loan Pool</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
            {loading ? 'Syncing...' : `${filteredMembers.length} Active Members`}
          </span>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="pb-3 border-b bg-white">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lenders by name or email..."
                className="pl-10 h-10 border-slate-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tight bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
              <Filter className="h-3 w-3" />
              <span>Real-time Sync Active</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="w-[80px] pl-6 py-4 font-bold text-slate-800 text-[10px] uppercase tracking-widest">Member</TableHead>
                  <TableHead className="font-bold text-slate-800 text-[10px] uppercase tracking-widest">Name / Account</TableHead>
                  <TableHead className="hidden md:table-cell font-bold text-slate-800 text-[10px] uppercase tracking-widest">Email Address</TableHead>
                  <TableHead className="hidden sm:table-cell font-bold text-slate-800 text-[10px] uppercase tracking-widest">Join Date</TableHead>
                  <TableHead className="hidden sm:table-cell font-bold text-slate-800 text-[10px] uppercase tracking-widest text-right">Shares</TableHead>
                  <TableHead className="text-right pr-6 font-bold text-slate-800 text-[10px] uppercase tracking-widest">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                        <p className="text-xs font-bold uppercase tracking-widest">Syncing community database...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredMembers.length > 0 ? (
                  filteredMembers.map((lender) => (
                    <TableRow key={lender.id} className="group hover:bg-primary/5 transition-colors border-b last:border-0">
                      <TableCell className="pl-6 py-4">
                        <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
                          <AvatarImage src={`https://picsum.photos/seed/${lender.id}/100/100`} />
                          <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                            {(lender.name || lender.email || '??').substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-bold text-slate-800 text-sm">{lender.name || 'Anonymous'}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-xs font-medium">{lender.email}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-[10px] font-bold uppercase">{formatDate(lender.joinDate)}</TableCell>
                      <TableCell className="hidden sm:table-cell text-right font-bold text-slate-700">
                        {(lender.shares || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "capitalize text-[9px] font-bold px-3 py-0.5",
                            lender.status === 'active' 
                              ? "bg-green-50 text-green-700 border-green-200" 
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          )}
                        >
                          {lender.status || 'pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center text-muted-foreground italic text-xs bg-slate-50/20">
                      No members found matching your current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="p-5 bg-[#010642] rounded-2xl text-white flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-2.5 rounded-xl">
            <Coins className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-0.5">Community Standard</p>
            <p className="text-sm font-medium">All listed members are verified participants of the sinking fund.</p>
          </div>
        </div>
        <div className="hidden lg:flex flex-col items-end gap-1">
          <Badge variant="outline" className="border-accent/30 text-accent font-mono text-[9px] uppercase">
            Shield-Verified Database
          </Badge>
          <span className="text-[9px] text-slate-400 font-medium">Last Sync: Just now</span>
        </div>
      </div>
    </div>
  );
}

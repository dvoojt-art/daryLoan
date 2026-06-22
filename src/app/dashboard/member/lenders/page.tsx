'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Filter, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export default function LendersDirectoryPage() {
  const [search, setSearch] = useState('');
  const firestore = useFirestore();

  // Real-time Users Query for Members
  const membersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'users'),
      where('role', '==', 'member')
    );
  }, [firestore]);

  const { data: members, loading } = useCollection<any>(membersQuery);

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

  // Filter members based on search input
  const filteredMembers = useMemo(() => {
    if (!members) return [];
    return members.filter(m => 
      (m.name?.toLowerCase().includes(search.toLowerCase()) || 
       m.email?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [members, search]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-800">Community Directory</h1>
          <p className="text-muted-foreground">View all members participating in the community loan pool.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/10">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            {loading ? '...' : (members?.length || 0)} Total Participants
          </span>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="pb-3 border-b">
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
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
              <Filter className="h-3 w-3" />
              <span>Showing {filteredMembers.length} results</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="w-[80px] pl-6 py-4 font-bold text-slate-800 text-[11px] uppercase tracking-wider">Member</TableHead>
                  <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Name</TableHead>
                  <TableHead className="hidden md:table-cell font-bold text-slate-800 text-[11px] uppercase tracking-wider">Email</TableHead>
                  <TableHead className="hidden sm:table-cell font-bold text-slate-800 text-[11px] uppercase tracking-wider">Joined</TableHead>
                  <TableHead className="text-right pr-6 font-bold text-slate-800 text-[11px] uppercase tracking-wider">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground italic">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Syncing directory...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredMembers.length > 0 ? (
                  filteredMembers.map((lender, idx) => (
                    <TableRow key={lender.id || idx} className="group hover:bg-primary/5 transition-colors border-b last:border-0">
                      <TableCell className="pl-6 py-4">
                        <Avatar className="h-9 w-9 border border-slate-100 shadow-sm">
                          <AvatarImage src={`https://picsum.photos/seed/${lender.id || idx}/100/100`} />
                          <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                            {(lender.name || lender.email || '??').substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-bold text-slate-700">{lender.name || 'Anonymous'}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{lender.email}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">{formatDate(lender.joinDate)}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "capitalize text-[10px] font-bold px-3 py-0.5",
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
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                      No members found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="p-4 bg-slate-800 rounded-2xl text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-2 rounded-xl">
            <Users className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Community Engagement</p>
            <p className="text-sm font-medium">All members are background checked and verified.</p>
          </div>
        </div>
        <Badge variant="outline" className="border-white/20 text-white font-mono text-[10px] uppercase hidden sm:flex">
          Shield-Verified Community
        </Badge>
      </div>
    </div>
  );
}

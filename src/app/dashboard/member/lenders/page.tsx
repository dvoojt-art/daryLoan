
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Filter } from 'lucide-react';
import { MOCK_MEMBERS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export default function LendersDirectoryPage() {
  const [search, setSearch] = useState('');

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

  // Filter members (lenders) excluding admins for this view
  const lenders = MOCK_MEMBERS.filter(m => 
    m.role === 'member' && 
    (m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-800">Community Directory</h1>
          <p className="text-muted-foreground">View all members participating in the community loan pool.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            {MOCK_MEMBERS.filter(m => m.role === 'member').length} Total Participants
          </span>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lenders by name or email..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Filter className="h-3 w-3" />
              <span>Showing {lenders.length} results</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-100">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="w-[80px]">Member</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lenders.length > 0 ? (
                  lenders.map((lender) => (
                    <TableRow key={lender.id} className="group hover:bg-primary/5 transition-colors">
                      <TableCell>
                        <Avatar className="h-8 w-8 border border-slate-200">
                          <AvatarImage src={`https://picsum.photos/seed/${lender.id}/100/100`} />
                          <AvatarFallback>{lender.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-700">{lender.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{lender.email}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">{formatDate(lender.joinDate)}</TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "capitalize text-[10px]",
                            lender.status === 'active' ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          )}
                        >
                          {lender.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No lenders found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

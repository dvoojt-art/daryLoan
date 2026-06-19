'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  UserPlus, 
  Download,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { MOCK_MEMBERS, Member } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export default function AdminMembersManagement() {
  const [members] = useState<Member[]>(MOCK_MEMBERS.filter(m => m.role === 'member'));
  const [search, setSearch] = useState('');

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-800">Member Insight Hub</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">Manage your centralized community member database</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-10">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button className="bg-primary h-10 shadow-md">
            <UserPlus className="mr-2 h-4 w-4" /> Add New Member
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-50 bg-white">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employee name or email..."
                className="pl-10 h-10 border-slate-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
              <Filter className="h-4 w-4" /> Advanced Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[300px] font-bold text-slate-800 text-[11px] uppercase tracking-wider py-4">Full Name</TableHead>
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Email Address</TableHead>
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Member ID</TableHead>
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Join Date</TableHead>
                <TableHead className="text-right font-bold text-slate-800 text-[11px] uppercase tracking-wider pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id} className="group hover:bg-slate-50/50 transition-colors border-b last:border-0">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3 pl-2">
                      <Avatar className="h-10 w-10 border-2 border-slate-100">
                        <AvatarImage src={`https://picsum.photos/seed/${member.id}/100/100`} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {member.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-bold text-slate-800">{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">{member.email}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[10px] tracking-tighter uppercase border-slate-200 text-slate-500">
                      ID-{member.id.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "capitalize text-[10px] font-bold px-3 py-0.5",
                        member.status === 'active' 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      )}
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-slate-500">{member.joinDate}</span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-primary">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredMembers.length === 0 && (
            <div className="text-center py-20 bg-slate-50/50">
              <p className="text-slate-500 font-medium italic">No matching members found in the database.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

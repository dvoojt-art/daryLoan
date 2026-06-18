
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
  Save, 
  TrendingUp, 
  PieChart, 
  Users, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import { MOCK_MEMBERS, Member } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AdminMembersManagement() {
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS.filter(m => m.role === 'member'));
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const handleUpdateMember = (id: string, field: 'shares' | 'profit', value: string) => {
    const numValue = parseFloat(value) || 0;
    setMembers(prev => prev.map(m => m.id === id ? { ...m, [field]: numValue } : m));
  };

  const saveChanges = (id: string) => {
    const member = members.find(m => m.id === id);
    toast({
      title: "Member Data Updated",
      description: `Successfully updated ${member?.name}'s shares and profit records.`,
    });
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-800">Member Equity Ledger</h1>
          <p className="text-muted-foreground">Manage shares, profits, and equity distribution for community participants.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-primary/5 px-4 py-2 rounded-lg border border-primary/10 flex items-center gap-3">
            <PieChart className="h-5 w-5 text-primary" />
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Shares Pool</p>
              <p className="text-lg font-bold text-primary">₱{members.reduce((acc, m) => acc + m.shares, 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-accent/5 px-4 py-2 rounded-lg border border-accent/10 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-accent" />
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Profit Distributed</p>
              <p className="text-lg font-bold text-accent">₱{members.reduce((acc, m) => acc + m.profit, 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-slate-50">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members by name or email..."
                className="pl-10 h-10 border-slate-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-slate-50 px-3 py-1.5 rounded-full">
              <Users className="h-3 w-3" />
              <span>{filteredMembers.length} Active Participants</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[300px] font-bold">Member Profile</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold">Total Contributions</TableHead>
                <TableHead className="font-bold">Allocated Shares (₱)</TableHead>
                <TableHead className="font-bold">Allocated Profit (₱)</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id} className="group hover:bg-primary/5 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-200">
                        <AvatarImage src={`https://picsum.photos/seed/${member.id}/100/100`} />
                        <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{member.name}</span>
                        <span className="text-xs text-muted-foreground">{member.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "capitalize text-[10px] font-bold",
                        member.status === 'active' ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      )}
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-slate-700">₱{member.totalContributions.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="relative max-w-[120px]">
                      <span className="absolute left-2 top-2.5 text-xs text-muted-foreground">₱</span>
                      <Input 
                        type="number"
                        className="pl-5 h-9 bg-transparent focus:bg-white border-transparent hover:border-slate-200 transition-all font-semibold"
                        value={member.shares}
                        onChange={(e) => handleUpdateMember(member.id, 'shares', e.target.value)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="relative max-w-[120px]">
                      <span className="absolute left-2 top-2.5 text-xs text-muted-foreground">₱</span>
                      <Input 
                        type="number"
                        className="pl-5 h-9 bg-transparent focus:bg-white border-transparent hover:border-slate-200 transition-all font-semibold"
                        value={member.profit}
                        onChange={(e) => handleUpdateMember(member.id, 'profit', e.target.value)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      onClick={() => saveChanges(member.id)}
                      variant="ghost" 
                      size="sm"
                      className="text-primary hover:text-primary hover:bg-primary/10 h-9"
                    >
                      <Save className="h-4 w-4 mr-2" /> Save
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredMembers.length === 0 && (
            <div className="text-center py-20 bg-slate-50/50">
              <Users className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No members found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <p className="text-xs text-primary font-medium">
          Note: Any updates to shares and profit are recorded in the audit trail. Members will be notified of changes to their equity balances.
        </p>
      </div>
    </div>
  );
}

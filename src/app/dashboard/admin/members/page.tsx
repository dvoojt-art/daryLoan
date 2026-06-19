
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  UserPlus, 
  Download,
  Filter,
  Edit,
  Trash2,
  TrendingUp,
  Wallet,
  Coins
} from 'lucide-react';
import { MOCK_MEMBERS, Member } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AdminMembersManagement() {
  const [members] = useState<Member[]>(MOCK_MEMBERS.filter(m => m.role === 'member'));
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const handleEdit = (member: Member) => {
    toast({
      title: "Edit Member Profile",
      description: `Accessing secure records for ${member.name}.`,
    });
  };

  const handleDelete = (member: Member) => {
    toast({
      title: "System Alert: Delete Action",
      description: `You are about to remove ${member.name} from the active database.`,
      variant: "destructive",
    });
  };

  const handleAddMember = () => {
    toast({
      title: "Onboarding Portal",
      description: "Redirecting to new member registration and vetting module.",
    });
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate totals for the footer
  const totals = useMemo(() => {
    return filteredMembers.reduce((acc, m) => ({
      shares: acc.shares + m.shares,
      contributions: acc.contributions + m.totalContributions,
      profit: acc.profit + m.profit,
    }), { shares: 0, contributions: 0, profit: 0 });
  }, [filteredMembers]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-800 tracking-tight">Member Insight Hub</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">Manage your centralized community member database</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-10">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button className="bg-primary h-10 shadow-md" onClick={handleAddMember}>
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
                <TableHead className="w-[250px] font-bold text-slate-800 text-[11px] uppercase tracking-wider py-4 pl-6">Member Profile</TableHead>
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Member ID</TableHead>
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider text-right">Shares</TableHead>
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider text-right">Contributions</TableHead>
                <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-wider text-right">Profits</TableHead>
                <TableHead className="text-right font-bold text-slate-800 text-[11px] uppercase tracking-wider pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id} className="group hover:bg-slate-50/50 transition-colors border-b last:border-0">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-slate-100">
                        <AvatarImage src={`https://picsum.photos/seed/${member.id}/100/100`} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {member.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{member.name}</span>
                        <span className="text-[10px] text-muted-foreground truncate">{member.email}</span>
                      </div>
                    </div>
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
                    <Badge variant="outline" className="font-mono text-[10px] tracking-tighter uppercase border-slate-200 text-slate-500">
                      {member.id.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-slate-700">
                    ₱{member.shares.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    ₱{member.totalContributions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    ₱{member.profit.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-slate-400 hover:text-primary"
                        onClick={() => handleEdit(member)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-slate-400 hover:text-destructive"
                        onClick={() => handleDelete(member)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="bg-slate-50 font-bold border-t-2">
              <TableRow>
                <TableCell colSpan={3} className="pl-6 py-4 text-slate-800">AGGREGATE TOTALS</TableCell>
                <TableCell className="text-right text-slate-800">₱{totals.shares.toLocaleString()}</TableCell>
                <TableCell className="text-right text-primary">₱{totals.contributions.toLocaleString()}</TableCell>
                <TableCell className="text-right text-green-600">₱{totals.profit.toLocaleString()}</TableCell>
                <TableCell className="pr-6"></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
          {filteredMembers.length === 0 && (
            <div className="text-center py-20 bg-slate-50/50">
              <p className="text-slate-500 font-medium italic">No matching members found in the database.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div className="p-4 bg-white border rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Community Shares</p>
            <p className="text-2xl font-bold text-slate-800">₱{totals.shares.toLocaleString()}</p>
          </div>
          <Coins className="h-8 w-8 text-primary/20" />
        </div>
        <div className="p-4 bg-white border rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Member Savings</p>
            <p className="text-2xl font-bold text-primary">₱{totals.contributions.toLocaleString()}</p>
          </div>
          <Wallet className="h-8 w-8 text-primary/20" />
        </div>
        <div className="p-4 bg-white border rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Profit Distributed</p>
            <p className="text-2xl font-bold text-green-600">₱{totals.profit.toLocaleString()}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-600/20" />
        </div>
      </div>
    </div>
  );
}

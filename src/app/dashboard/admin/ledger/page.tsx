'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  FileSpreadsheet, 
  FileText, 
  FileJson, 
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Wallet
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { MOCK_CONTRIBUTIONS, MOCK_MEMBERS, MOCK_LOANS } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AdminLedgerPage() {
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const getMemberName = (id: string) => MOCK_MEMBERS.find(m => m.id === id)?.name || 'Unknown';

  // Combine contributions and mock some payments for a "full" ledger experience
  const transactions = [
    ...MOCK_CONTRIBUTIONS.map(c => ({
      id: c.id,
      date: c.date,
      memberId: c.memberId,
      amount: c.amount,
      type: 'contribution' as const,
      status: 'completed' as const,
    })),
    // Simulate some loan repayments
    { id: 'p1', date: '2024-03-05', memberId: 'm1', amount: 500, type: 'repayment' as const, status: 'completed' as const },
    { id: 'p2', date: '2024-03-10', memberId: 'm2', amount: 1200, type: 'repayment' as const, status: 'completed' as const },
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredTransactions = transactions.filter(t => 
    getMemberName(t.memberId).toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase())
  );

  const totalEquity = MOCK_CONTRIBUTIONS.reduce((acc, c) => acc + c.amount, 0);
  const totalReleased = MOCK_LOANS.filter(l => l.status === 'approved' || l.status === 'overdue').reduce((acc, l) => acc + l.amount, 0);

  const handleExport = (format: string) => {
    toast({
      title: "Export Generating",
      description: `The master ledger is being exported to ${format}. Your download will start shortly.`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-800">Master Financial Ledger</h1>
          <p className="text-muted-foreground">Historical audit trail of all contributions and loan activities.</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-primary">
              <Download className="mr-2 h-4 w-4" /> Export Ledger
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Choose Format</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport('Excel')}>
              <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" /> Excel Format (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('PDF')}>
              <FileText className="mr-2 h-4 w-4 text-red-600" /> PDF Document (.pdf)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('CSV')}>
              <FileJson className="mr-2 h-4 w-4 text-blue-600" /> CSV Data (.csv)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider">Total Equity Pool</CardDescription>
            <CardTitle className="text-2xl font-bold text-primary">₱{totalEquity.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-green-600 font-medium">
              <ArrowUpRight className="h-3 w-3 mr-1" /> 12% increase this month
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider">Capital Outflow</CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-700">₱{totalReleased.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              Total disbursed to members
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Available Liquidity</CardDescription>
            <CardTitle className="text-2xl font-bold">₱{(totalEquity - (totalReleased * 0.7)).toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-slate-400">
              <Wallet className="h-3 w-3 mr-1" /> Estimated current cash on hand
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-50 bg-slate-50/30">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions, members, or types..."
                className="pl-10 h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" /> Advanced Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="font-bold">Date</TableHead>
                <TableHead className="font-bold">Transaction ID</TableHead>
                <TableHead className="font-bold">Member</TableHead>
                <TableHead className="font-bold">Type</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {tx.date}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] uppercase text-muted-foreground">
                    TXN-{tx.id.padStart(6, '0')}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700">
                    {getMemberName(tx.memberId)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {tx.type === 'contribution' ? (
                        <ArrowUpRight className="h-3 w-3 text-green-500" />
                      ) : (
                        <ArrowDownLeft className="h-3 w-3 text-blue-500" />
                      )}
                      <span className="capitalize text-xs font-medium">{tx.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 text-[10px] font-bold">
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-bold",
                    tx.type === 'contribution' ? "text-primary" : "text-slate-800"
                  )}>
                    ₱{tx.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredTransactions.length === 0 && (
            <div className="text-center py-20 bg-slate-50/50">
              <p className="text-slate-500 font-medium italic">No ledger entries match your current search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

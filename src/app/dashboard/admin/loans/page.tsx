
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Check, 
  X, 
  Eye, 
  Clock, 
  Search,
  ArrowUpDown,
  Filter,
  BrainCircuit,
  Calendar
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MOCK_LOANS, MOCK_MEMBERS, Loan } from '@/lib/mock-data';
import { LoanRiskAssessment } from '@/components/LoanRiskAssessment';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AdminLoanApprovals() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    const localLoans = JSON.parse(localStorage.getItem('daryloan_user_loans') || '[]');
    const pendingMockLoans = MOCK_LOANS.filter(l => l.status === 'pending');
    // In a real app, we'd fetch from a DB. For this prototype, we merge mock and local storage.
    setLoans([...localLoans, ...pendingMockLoans]);
  }, []);

  const getMember = (id: string) => MOCK_MEMBERS.find(m => m.id === id);

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    const loan = loans.find(l => l.id === id);
    const member = getMember(loan?.memberId || '');
    
    // Update local state
    setLoans(prev => prev.filter(l => l.id !== id));
    if (selectedLoanId === id) setSelectedLoanId(null);

    // Update localStorage if it was a user-created loan
    const localLoans = JSON.parse(localStorage.getItem('daryloan_user_loans') || '[]');
    const updatedLocal = localLoans.map((l: Loan) => {
      if (l.id === id) return { ...l, status: action };
      return l;
    }).filter((l: Loan) => l.status === 'pending'); // Keep only pending in the approval queue
    localStorage.setItem('daryloan_user_loans', JSON.stringify(updatedLocal));

    toast({
      title: `Loan ${action === 'approved' ? 'Approved' : 'Rejected'}`,
      description: `${member?.name}'s request for ₱${loan?.amount.toLocaleString()} has been processed.`,
      variant: action === 'rejected' ? 'destructive' : 'default',
    });
  };

  const filteredLoans = loans.filter(l => {
    const member = getMember(l.memberId);
    return member?.name.toLowerCase().includes(search.toLowerCase()) || 
           l.purpose.toLowerCase().includes(search.toLowerCase());
  });

  const selectedLoan = loans.find(l => l.id === selectedLoanId);
  const selectedMember = selectedLoan ? getMember(selectedLoan.memberId) : null;

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-800">Loan Approval Queue</h1>
          <p className="text-muted-foreground">Review incoming credit requests and perform AI-assisted risk analysis.</p>
        </div>
        <div className="bg-primary/5 px-4 py-2 rounded-lg border border-primary/10 flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Pending Requests</p>
            <p className="text-lg font-bold text-primary">{loans.length}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main List */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by member name or purpose..."
                  className="pl-10 h-10 border-slate-200"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" /> Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-bold">Member Request</TableHead>
                  <TableHead className="font-bold">Principal</TableHead>
                  <TableHead className="font-bold hidden md:table-cell">Request Date</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.map((loan) => {
                  const member = getMember(loan.memberId);
                  const isSelected = selectedLoanId === loan.id;
                  
                  return (
                    <TableRow 
                      key={loan.id} 
                      className={cn(
                        "group transition-colors cursor-pointer",
                        isSelected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-slate-50"
                      )}
                      onClick={() => setSelectedLoanId(loan.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-slate-200">
                            <AvatarImage src={`https://picsum.photos/seed/${loan.memberId}/100/100`} />
                            <AvatarFallback>{member?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{member?.name}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">{loan.purpose}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-slate-700">₱{loan.amount.toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                          <Calendar className="h-3 w-3" />
                          {loan.requestDate}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleAction(loan.id, 'approved')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-destructive border-destructive/20 hover:bg-destructive/5"
                            onClick={() => handleAction(loan.id, 'rejected')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredLoans.length === 0 && (
              <div className="text-center py-20 bg-slate-50/50">
                <div className="bg-slate-100 p-4 rounded-full inline-block mb-4">
                  <Check className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">All caught up! No pending loan requests.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Panel */}
        <div className="space-y-6">
          {selectedLoanId && selectedLoan ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-800 text-white pb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">Request Summary</CardTitle>
                      <CardDescription className="text-slate-400">Reviewing details for {selectedMember?.name}</CardDescription>
                    </div>
                    <Badge className="bg-primary text-white border-none">Pending Review</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Principal Amount</p>
                      <p className="text-xl font-bold text-slate-800">₱{selectedLoan.amount.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Repayment Term</p>
                      <p className="text-xl font-bold text-slate-800">{selectedLoan.termMonths} Months</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Loan Purpose</p>
                    <p className="text-sm text-slate-700 italic">"{selectedLoan.purpose}"</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Member Financial Snapshot</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Total Contributions:</span>
                      <span className="font-bold">₱{selectedMember?.totalContributions.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Current Shares:</span>
                      <span className="font-bold">₱{selectedMember?.shares.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <LoanRiskAssessment 
                memberId={selectedLoan.memberId}
                requestedAmount={selectedLoan.amount}
                contributionHistory={[
                  { date: '2023-12-01', amount: 1000 },
                  { date: '2024-01-01', amount: 1000 },
                  { date: '2024-02-01', amount: 1000 },
                ]}
              />

              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700 h-11"
                  onClick={() => handleAction(selectedLoanId, 'approved')}
                >
                  <Check className="mr-2 h-4 w-4" /> Approve Loan
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-destructive/20 text-destructive hover:bg-destructive/5 h-11"
                  onClick={() => handleAction(selectedLoanId, 'rejected')}
                >
                  <X className="mr-2 h-4 w-4" /> Reject
                </Button>
              </div>
            </div>
          ) : (
            <Card className="border-dashed flex items-center justify-center p-12 h-[400px] bg-muted/20">
              <div className="text-center space-y-4">
                <div className="bg-muted p-4 rounded-full inline-block">
                  <BrainCircuit className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-700">Detailed Review Panel</p>
                  <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">Select a request from the list to see member financials and AI risk scoring.</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

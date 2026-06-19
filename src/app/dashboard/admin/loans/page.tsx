'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Check, 
  X, 
  Clock, 
  Search,
  Filter,
  BrainCircuit,
  Calendar,
  User,
  MessageSquareQuote
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
  const [adminNote, setAdminNote] = useState('');
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    const localLoans = JSON.parse(localStorage.getItem('daryloan_user_loans') || '[]');
    const pendingLocalLoans = localLoans.filter((l: Loan) => l.status === 'pending');
    const pendingMockLoans = MOCK_LOANS.filter(l => l.status === 'pending');
    setLoans([...pendingLocalLoans, ...pendingMockLoans]);
  }, []);

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

  const getMember = (id: string) => MOCK_MEMBERS.find(m => m.id === id);

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    const loan = loans.find(l => l.id === id);
    const member = getMember(loan?.memberId || '');
    const loanerName = loan?.loanerName || member?.name || 'Unknown';
    
    // Update local UI state
    setLoans(prev => prev.filter(l => l.id !== id));
    if (selectedLoanId === id) setSelectedLoanId(null);

    // Update persistence
    const localLoans: Loan[] = JSON.parse(localStorage.getItem('daryloan_user_loans') || '[]');
    const isMock = !localLoans.some(l => l.id === id);

    if (!isMock) {
      const updatedLocal = localLoans.map((l: Loan) => {
        if (l.id === id) {
          const dueDate = action === 'approved' 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
            : undefined;
          return { ...l, status: action, dueDate, adminNote };
        }
        return l;
      });
      localStorage.setItem('daryloan_user_loans', JSON.stringify(updatedLocal));
    } else {
      // For mock loans, we just simulate the persistence for this session
      const mockUpdate: Loan = { 
        ...loan!, 
        status: action, 
        adminNote,
        dueDate: action === 'approved' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined
      };
      localStorage.setItem('daryloan_user_loans', JSON.stringify([mockUpdate, ...localLoans]));
    }

    toast({
      title: `Loan ${action === 'approved' ? 'Approved' : 'Rejected'}`,
      description: `${loanerName}'s request for ₱${loan?.amount.toLocaleString()} has been processed with your note.`,
      variant: action === 'rejected' ? 'destructive' : 'default',
    });
    setAdminNote('');
  };

  const filteredLoans = loans.filter(l => {
    const member = getMember(l.memberId);
    return (member?.name.toLowerCase().includes(search.toLowerCase()) || 
           (l.loanerName && l.loanerName.toLowerCase().includes(search.toLowerCase())) ||
           l.purpose.toLowerCase().includes(search.toLowerCase()));
  });

  const selectedLoan = loans.find(l => l.id === selectedLoanId);
  const selectedMember = selectedLoan ? getMember(selectedLoan.memberId) : null;
  const selectedLoanerName = selectedLoan?.loanerName || selectedMember?.name || 'Unknown';

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
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or purpose..."
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
                  <TableHead className="font-bold">Loaner / Member Account</TableHead>
                  <TableHead className="font-bold">Principal</TableHead>
                  <TableHead className="font-bold hidden md:table-cell">Request Date</TableHead>
                  <TableHead className="text-right font-bold">Quick Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.map((loan) => {
                  const member = getMember(loan.memberId);
                  const loanerName = loan.loanerName || member?.name || 'Unknown';
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
                            <AvatarFallback>{loanerName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{loanerName}</span>
                            <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                              <User className="h-2 w-2" /> Member: {member?.name}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-slate-700">₱{loan.amount.toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                          <Calendar className="h-3 w-3" />
                          {formatDate(loan.requestDate)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">
                          Review Request
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredLoans.length === 0 && (
              <div className="text-center py-20 bg-slate-50/50">
                <Check className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 font-medium">All caught up! No pending requests.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {selectedLoanId && selectedLoan ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-800 text-white pb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">Request Summary</CardTitle>
                      <CardDescription className="text-slate-400">Reviewing details for {selectedLoanerName}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Principal</p>
                      <p className="text-xl font-bold text-slate-800">₱{selectedLoan.amount.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Term</p>
                      <p className="text-xl font-bold text-slate-800">{selectedLoan.termMonths} Mo</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Loan Purpose</p>
                    <p className="text-sm text-slate-700 italic">"{selectedLoan.purpose}"</p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="admin-note" className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-2">
                      <MessageSquareQuote className="h-3 w-3" /> Add Note to Member
                    </Label>
                    <Textarea 
                      id="admin-note"
                      placeholder="e.g., Release funds on Friday morning. Please visit the office."
                      className="text-xs resize-none"
                      rows={3}
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                    />
                    <p className="text-[9px] text-muted-foreground italic">* This note will be visible to the member upon decision.</p>
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
                  <Check className="mr-2 h-4 w-4" /> Approve
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
                <BrainCircuit className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground max-w-[180px] mx-auto">Select a request from the list to see member financials and add release notes.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
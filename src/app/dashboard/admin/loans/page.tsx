'use client';

import { useState, useEffect, useMemo } from 'react';
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
  MessageSquareQuote,
  Loader2,
  AlertCircle,
  Users
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, doc, updateDoc, orderBy } from 'firebase/firestore';
import { LoanRiskAssessment } from '@/components/LoanRiskAssessment';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminLoanApprovals() {
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch only pending loans for the approval queue
  const loansQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'loans'),
      where('status', '==', 'pending')
    );
  }, [firestore]);

  // Fetch all users to correctly display member and comaker names
  const membersQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: rawLoans, loading: loansLoading } = useCollection<any>(loansQuery);
  const { data: members, loading: membersLoading } = useCollection<any>(membersQuery);

  const selectedLoan = useMemo(() => rawLoans?.find(l => l.id === selectedLoanId), [rawLoans, selectedLoanId]);

  // Fetch contributions for the selected member to feed the GenAI tool
  const contributionsQuery = useMemo(() => {
    if (!firestore || !selectedLoan?.memberId) return null;
    return query(
      collection(firestore, 'contributions'),
      where('memberId', '==', selectedLoan.memberId)
    );
  }, [firestore, selectedLoan?.memberId]);

  const { data: selectedMemberContributions } = useCollection<any>(contributionsQuery);

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

  const getMember = (id: string) => members?.find(m => m.id === id);

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    if (!firestore) return;
    
    const loan = rawLoans?.find(l => l.id === id);
    const member = getMember(loan?.memberId || '');
    const loanerName = loan?.loanerName || member?.name || 'Unknown Member';
    
    const loanRef = doc(firestore, 'loans', id);
    const dueDate = action === 'approved' 
      ? new Date().toISOString().split('T')[0] // Set initial release date to today
      : null;

    const updateData = { 
      status: action, 
      dueDate: dueDate, 
      adminNote: adminNote 
    };

    updateDoc(loanRef, updateData)
      .then(() => {
        toast({
          title: `Loan ${action === 'approved' ? 'Approved' : 'Rejected'}`,
          description: `${loanerName}'s request for ₱${loan?.amount.toLocaleString()} has been processed.`,
          variant: action === 'rejected' ? 'destructive' : 'default',
        });
        setAdminNote('');
        if (selectedLoanId === id) setSelectedLoanId(null);
      })
      .catch(async (e) => {
        const error = new FirestorePermissionError({
          path: loanRef.path,
          operation: 'update',
          requestResourceData: updateData
        });
        errorEmitter.emit('permission-error', error);
      });
  };

  const filteredLoans = useMemo(() => {
    if (!rawLoans) return [];
    
    const searchLower = search.toLowerCase().trim();
    
    return rawLoans
      .filter(l => {
        if (!searchLower) return true;
        
        const member = getMember(l.memberId);
        const memberName = (member?.name || '').toLowerCase();
        const loanerName = (l.loanerName || '').toLowerCase();
        const purpose = (l.purpose || '').toLowerCase();
        
        return memberName.includes(searchLower) || 
               loanerName.includes(searchLower) || 
               purpose.includes(searchLower);
      })
      .sort((a, b) => (b.requestDate || '').localeCompare(a.requestDate || ''));
  }, [rawLoans, members, search]);

  const selectedMember = selectedLoan ? getMember(selectedLoan.memberId) : null;
  const selectedComaker = selectedLoan?.comakerId ? getMember(selectedLoan.comakerId) : null;
  const selectedLoanerName = selectedLoan?.loanerName || selectedMember?.name || 'Unknown Member';

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
            <p className="text-lg font-bold text-primary">{rawLoans?.length || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b bg-white">
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
            {loansLoading || membersLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>Syncing approval queue...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-bold py-4 pl-6 uppercase text-[10px] tracking-widest">Loaner / Account</TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">Principal</TableHead>
                    <TableHead className="font-bold hidden md:table-cell uppercase text-[10px] tracking-widest">Request Date</TableHead>
                    <TableHead className="text-right font-bold pr-6 uppercase text-[10px] tracking-widest">Quick Review</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.map((loan) => {
                    const member = getMember(loan.memberId);
                    const comaker = loan.comakerId ? getMember(loan.comakerId) : null;
                    const loanerName = loan.loanerName || member?.name || 'Unknown Member';
                    const isSelected = selectedLoanId === loan.id;
                    
                    return (
                      <TableRow 
                        key={loan.id} 
                        className={cn(
                          "group transition-colors cursor-pointer border-b last:border-0",
                          isSelected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-slate-50"
                        )}
                        onClick={() => setSelectedLoanId(loan.id)}
                      >
                        <TableCell className="pl-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
                              <AvatarImage src={`https://picsum.photos/seed/${loan.memberId}/100/100`} />
                              <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{loanerName.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-sm">{loanerName}</span>
                              <div className="flex flex-col gap-0.5 mt-0.5">
                                <span className="text-[9px] text-muted-foreground uppercase flex items-center gap-1">
                                  <User className="h-2 w-2" /> Member: {member?.name || 'Loading...'}
                                </span>
                                {comaker && (
                                  <span className="text-[9px] text-primary/70 font-bold uppercase flex items-center gap-1">
                                    <Users className="h-2 w-2" /> Co-Maker: {comaker.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-slate-700">₱{loan.amount.toLocaleString()}</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-medium">
                            <Calendar className="h-3 w-3" />
                            {formatDate(loan.requestDate)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button variant="ghost" size="sm" className="text-[10px] font-bold text-primary uppercase h-8 hover:bg-primary hover:text-white transition-colors">
                            {isSelected ? 'Reviewing' : 'Open Request'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
            {!loansLoading && filteredLoans.length === 0 && (
              <div className="text-center py-20 bg-slate-50/50">
                <div className="bg-white p-4 rounded-full w-fit mx-auto shadow-sm border border-slate-100 mb-4">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-slate-800 font-bold">Queue Empty</p>
                <p className="text-slate-500 text-xs">All caught up! No pending requests at the moment.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {selectedLoanId && selectedLoan ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <Card className="border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-[#010642] text-white pb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-headline">Request Summary</CardTitle>
                      <CardDescription className="text-slate-400 text-xs">Reviewing details for {selectedLoanerName}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Principal</p>
                      <p className="text-2xl font-bold text-slate-800">₱{selectedLoan.amount.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Term</p>
                      <p className="text-2xl font-bold text-slate-800">
                        {selectedLoan.termMonths === 0.25 ? '7 Days' : `${selectedLoan.termMonths} Mo`}
                      </p>
                    </div>
                  </div>

                  {selectedComaker && (
                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-2">
                      <p className="text-[10px] uppercase font-bold text-primary/70 flex items-center gap-1 tracking-widest">
                        <Users className="h-3 w-3" /> Verified Co-Maker
                      </p>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{selectedComaker.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Shares: {selectedComaker.shares?.toLocaleString() || 0} • Savings: ₱{selectedComaker.totalContributions?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Loan Purpose</p>
                    <p className="text-sm text-slate-700 italic leading-relaxed">"{selectedLoan.purpose}"</p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="admin-note" className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-2 tracking-widest">
                      <MessageSquareQuote className="h-3 w-3" /> Add Note to Member
                    </Label>
                    <Textarea 
                      id="admin-note"
                      placeholder="e.g., Funds ready for release. Please message the admin asap."
                      className="text-xs resize-none bg-slate-50/50"
                      rows={3}
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <LoanRiskAssessment 
                memberId={selectedLoan.memberId}
                requestedAmount={selectedLoan.amount}
                contributionHistory={selectedMemberContributions || []}
              />

              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700 h-12 shadow-lg shadow-green-200"
                  onClick={() => handleAction(selectedLoanId, 'approved')}
                >
                  <Check className="mr-2 h-4 w-4" /> Approve
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-destructive/20 text-destructive hover:bg-destructive/5 h-12"
                  onClick={() => handleAction(selectedLoanId, 'rejected')}
                >
                  <X className="mr-2 h-4 w-4" /> Reject
                </Button>
              </div>
            </div>
          ) : (
            <Card className="border-dashed border-2 flex items-center justify-center p-12 h-[450px] bg-slate-50/30">
              <div className="text-center space-y-4">
                <div className="bg-white p-6 rounded-full w-fit mx-auto shadow-sm border border-slate-100">
                  <BrainCircuit className="h-10 w-10 text-primary/40" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Select a Request</p>
                  <p className="text-[10px] text-muted-foreground max-w-[200px] mx-auto mt-1 uppercase tracking-tight font-medium">Click a row to analyze member financials, verify co-maker details, and perform AI assessment.</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

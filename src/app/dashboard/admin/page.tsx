
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  HandCoins, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  Check, 
  X,
  Eye
} from 'lucide-react';
import { MOCK_LOANS, MOCK_MEMBERS } from '@/lib/mock-data';
import { LoanRiskAssessment } from '@/components/LoanRiskAssessment';
import { useState } from 'react';

export default function AdminDashboard() {
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  const pendingLoans = MOCK_LOANS.filter(l => l.status === 'pending');
  const totalDisbursed = MOCK_LOANS.filter(l => l.status === 'approved').reduce((acc, l) => acc + l.amount, 0);
  const totalOutstanding = totalDisbursed * 0.85; // Mock logic

  const getMemberName = (id: string) => MOCK_MEMBERS.find(m => m.id === id)?.name || 'Unknown';

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Admin Command Center</h1>
          <p className="text-muted-foreground">Financial overview and operational controls.</p>
        </div>
        <Button className="bg-primary">
          Generate Report <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_MEMBERS.length}</div>
            <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
            <HandCoins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalDisbursed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all approved loans</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balances</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Estimated current collection pool</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-primary text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-white/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLoans.length}</div>
            <p className="text-xs text-white/70">Awaiting your approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Queue */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Approval Workflow</CardTitle>
            <CardDescription>Review and action pending loan applications.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingLoans.map((loan) => (
                  <TableRow key={loan.id} className={selectedLoanId === loan.id ? 'bg-primary/5' : ''}>
                    <TableCell className="font-medium">{getMemberName(loan.memberId)}</TableCell>
                    <TableCell>${loan.amount.toLocaleString()}</TableCell>
                    <TableCell>{loan.requestDate}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        onClick={() => setSelectedLoanId(loan.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-green-600 border-green-200 hover:bg-green-50">
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-destructive border-destructive/20 hover:bg-destructive/5">
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Selected Loan Assessment */}
        <div className="space-y-6">
          {selectedLoanId ? (
            <LoanRiskAssessment 
              memberId={pendingLoans.find(l => l.id === selectedLoanId)?.memberId || ''}
              requestedAmount={pendingLoans.find(l => l.id === selectedLoanId)?.amount || 0}
              contributionHistory={[
                { date: '2023-12-01', amount: 1000 },
                { date: '2024-01-01', amount: 1000 },
                { date: '2024-02-01', amount: 500 },
              ]}
            />
          ) : (
            <Card className="border-dashed flex items-center justify-center p-12 h-full bg-muted/20">
              <div className="text-center space-y-2">
                <div className="bg-muted p-3 rounded-full inline-block">
                  <Eye className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Select a loan from the queue <br/> to view AI risk analysis.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

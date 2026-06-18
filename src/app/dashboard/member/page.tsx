
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  CreditCard, 
  Calendar, 
  ArrowRight, 
  Info,
  History,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { MOCK_LOANS, MOCK_CONTRIBUTIONS } from '@/lib/mock-data';
import Link from 'next/link';

export default function MemberDashboard() {
  const memberId = 'm1';
  const myLoans = MOCK_LOANS.filter(l => l.memberId === memberId);
  const myContributions = MOCK_CONTRIBUTIONS.filter(c => c.memberId === memberId);
  const totalContributed = myContributions.reduce((acc, c) => acc + c.amount, 0);
  
  const activeLoan = myLoans.find(l => l.status === 'approved');

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Welcome, John</h1>
          <p className="text-muted-foreground">Monitor your contributions and loan status.</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90">
          <Link href="/dashboard/member/request">Apply for Loan <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Contributions */}
        <Card className="border-none shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="h-24 w-24 text-primary" />
          </div>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Contributions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-headline font-bold text-primary">${totalContributed.toLocaleString()}</div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>Member Since 2023</span>
                <span>Active Member</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Active Loan Status */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Loan</CardTitle>
            <CreditCard className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            {activeLoan ? (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="text-3xl font-headline font-bold">${activeLoan.amount.toLocaleString()}</div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">On Track</Badge>
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Next Payment</span>
                    <span className="font-semibold">Apr 15, 2024</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Term Remaining</span>
                    <span className="font-semibold">8 / 12 Months</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                <div className="bg-muted p-3 rounded-full">
                  <Info className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No active loans currently.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications/Insights */}
        <Card className="border-none shadow-sm bg-accent text-white">
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-white/80">Growth Insight</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">
              Based on your contribution consistency, you are eligible for an increased credit limit of up to <b>$10,000</b>.
            </p>
            <Button variant="secondary" size="sm" className="w-full text-accent font-bold">
              Check Eligibility
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Contributions */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Contribution Ledger</CardTitle>
              <CardDescription>Your monthly savings history.</CardDescription>
            </div>
            <History className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myContributions.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.date}</TableCell>
                    <TableCell className="text-xs font-code">TXN-{c.id.toUpperCase()}</TableCell>
                    <TableCell className="text-right font-semibold">${c.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Loan Requests History */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Loan History</CardTitle>
              <CardDescription>Requests and repayment status.</CardDescription>
            </div>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Principal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myLoans.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.purpose}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          l.status === 'approved' && "bg-green-50 text-green-700 border-green-200",
                          l.status === 'pending' && "bg-yellow-50 text-yellow-700 border-yellow-200",
                          l.status === 'rejected' && "bg-red-50 text-red-700 border-red-200"
                        )}
                      >
                        {l.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">${l.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

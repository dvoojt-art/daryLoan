
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Users,
  Tag, 
  HandCoins, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  UserPlus,
  Download,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Loader2,
  ChevronDown,
  FileText,
  FileBox,
  Wallet,
  Coins,
  History
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { TextRun } from 'docx';

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real-time stats data
  const loansQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'loans');
  }, [firestore]);

  const membersQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const recentActivityQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'loans'),
    );
  }, [firestore]);

  const { data: allLoans, loading: loansLoading } = useCollection<any>(loansQuery);
  const { data: allMembers, loading: membersLoading } = useCollection<any>(membersQuery);
  const { data: recentActivity } = useCollection<any>(recentActivityQuery);

  const stats = useMemo(() => {
    const loans = allLoans || [];
    const members = allMembers || [];

    const pending = loans.filter(l => l.status === 'pending');
    const overdue = loans.filter(l => l.status === 'overdue');
    const activeMembers = members.filter(m => m.status === 'active' && m.role === 'member');
    const pendingMembers = members.filter(m => m.status === 'pending' && m.role === 'member');
    
    const totalCapital = members.reduce((acc, m) => acc + (m.totalContributions || 0), 0);
    
    const totalDisbursed = loans
      .filter(l => ['approved', 'repaid', 'overdue'].includes(l.status))
      .reduce((acc, l) => acc + (l.amount || 0), 0);
    
    const estimatedInterest = loans
      .filter(l => ['approved', 'repaid', 'overdue'].includes(l.status))
      .reduce((acc, l) => {
        const rate = l.termMonths === 0.25 ? 0.05 : (0.10 * (l.termMonths || 1));
        return acc + (l.amount * rate);
      }, 0);

    return {
      pendingCount: pending.length,
      overdueCount: overdue.length,
      activeMembersCount: activeMembers.length,
      pendingMembersCount: pendingMembers.length,
      totalCapital,
      totalDisbursed,
      estimatedInterest,
    };
  }, [allLoans, allMembers]);

       const recentActivityWithNames = useMemo(() => {
    if (!recentActivity || !allMembers) return [];
    return recentActivity.map((loan) => {
      const member = allMembers.find((m: any) => m.id === loan.memberId);
      
      // Calculate financial details
      const amount = loan.amount || 0;
      const term = loan.termMonths || 1;
      const rate = term === 0.25 ? 0.05 : 0.10 * term;
      const interest = amount * rate;
      const principalPlusInterest = amount + interest;

      let penalties = 0;
      if (loan.month1 === 'late') penalties += principalPlusInterest * 0.10;
      if (loan.month2 === 'late') penalties += principalPlusInterest * 0.10;
      if (loan.month3 === 'late') penalties += principalPlusInterest * 0.10;

      return {
        ...loan,
        resolvedName: loan.loanerName || member?.name || member?.email || `Member ${loan.memberId.substring(0, 5)}`,
        principal: amount,
        interest,
        totalPayable: principalPlusInterest + penalties,
      };
    });
  }, [recentActivity, allMembers]);

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

  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(1, 6, 66); // DaryLoan Navy
    doc.text('DaryLoan Executive Summary', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Report Period: FY ${new Date().getFullYear()}`, 14, 33);

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('1. Operational Metrics', 14, 45);

    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value', 'Status']],
      body: [
        ['Total Capital Pool', `P${stats.totalCapital.toLocaleString()}`, 'Available'],
        ['Active Members', stats.activeMembersCount.toString(), 'Verified'],
        ['Capital Disbursed', `P${stats.totalDisbursed.toLocaleString()}`, 'Circulating'],
        ['Estimated Profit', `P${stats.estimatedInterest.toLocaleString()}`, 'Projected'],
        ['Review Queue', stats.pendingCount.toString(), 'Pending AI'],
        ['Overdue Accounts', stats.overdueCount.toString(), stats.overdueCount > 0 ? 'High Risk' : 'Healthy'],
      ],
      headStyles: { fillColor: [1, 6, 66] },
    });

     if (recentActivityWithNames && recentActivityWithNames.length > 0) {
      doc.text('2. Recent Financial Activity', 14, (doc as any).lastAutoTable.finalY + 15);
      
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Date', 'Member/Loaner', 'Amount', 'Status', 'Purpose']],
        body: recentActivityWithNames.map((loan: any) => [
          formatDate(loan.requestDate),
          loan.resolvedName,
          `P${loan.amount.toLocaleString()}`,
          loan.status.toUpperCase(),
          loan.purpose,
        ]),
        headStyles: { fillColor: [1, 6, 66] },
      });
    }

    doc.save('DaryLoan-Master-Report.pdf');
    toast({ title: "Master Report Generated", description: "PDF has been downloaded." });
  };

  const handleExportDOCX = async () => {
    const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType, TextRun } = await import('docx');
    const { saveAs } = await import('file-saver');

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "DaryLoan Executive Master Report",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Generated: ${new Date().toLocaleString()}`, italics: true }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({ text: "Operational Metrics Summary", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Metric", bold: true })], shading: { fill: "F2F2F2" } }),
                  new TableCell({ children: [new Paragraph({ text: "Value", bold: true })], shading: { fill: "F2F2F2" } }),
                ],
              }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("Total Community Capital")] }), new TableCell({ children: [new Paragraph(`P${stats.totalCapital.toLocaleString()}`)] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("Active Members")] }), new TableCell({ children: [new Paragraph(stats.activeMembersCount.toString())] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("Capital Disbursed")] }), new TableCell({ children: [new Paragraph(`P${stats.totalDisbursed.toLocaleString()}`)] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("Estimated Profit")] }), new TableCell({ children: [new Paragraph(`P${stats.estimatedInterest.toLocaleString()}`)] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("Review Queue")] }), new TableCell({ children: [new Paragraph(stats.pendingCount.toString())] })] }),
            ],
          }),
          new Paragraph({ text: "Recent Activity Log", heading: HeadingLevel.HEADING_2, spacing: { before: 600, after: 200 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Date", bold: true })], shading: { fill: "F2F2F2" } }),
                  new TableCell({ children: [new Paragraph({ text: "Loaner", bold: true })], shading: { fill: "F2F2F2" } }),
                  new TableCell({ children: [new Paragraph({ text: "Amount", bold: true })], shading: { fill: "F2F2F2" } }),
                  new TableCell({ children: [new Paragraph({ text: "Status", bold: true })], shading: { fill: "F2F2F2" } }),
                ],
              }),
               ...(recentActivityWithNames || []).map((loan: any) => new TableRow({
               children: [
                  new TableCell({ children: [new Paragraph(formatDate(loan.requestDate))] }),
                  new TableCell({ children: [new Paragraph(loan.resolvedName)] }),
                  new TableCell({ children: [new Paragraph(`P${loan.amount.toLocaleString()}`)] }),
                  new TableCell({ children: [new Paragraph(loan.status.toUpperCase())] }),
                ]
              }))
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "DaryLoan-Master-Report.docx");
    toast({ title: "Master Report Generated", description: "DOCX has been downloaded." });
  };

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-800 tracking-tight">Admin Command Center</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">Mission Control for Community Financial Operations</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-primary shadow-lg h-11 px-6 gap-2 text-white">
              <Download className="h-4 w-4" /> Export Master Report <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer">
              <FileText className="h-4 w-4 text-red-500" /> Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportDOCX} className="gap-2 cursor-pointer">
              <FileBox className="h-4 w-4 text-blue-500" /> Export as Word
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        {stats.overdueCount > 0 && (
          <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 shadow-sm">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-bold">Overdue Risk Warning</AlertTitle>
            <AlertDescription className="text-xs">There are {stats.overdueCount} loans past due. Follow-up required.</AlertDescription>
          </Alert>
        )}
        {stats.pendingMembersCount > 0 && (
          <Alert className="bg-accent/5 border-accent/20 text-accent shadow-sm">
            <UserPlus className="h-5 w-5" />
            <AlertTitle className="font-bold">Pending Registrations</AlertTitle>
            <AlertDescription className="text-xs">{stats.pendingMembersCount} members awaiting verification.</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Total Capital', value: `₱${stats.totalCapital.toLocaleString()}`, sub: 'Member savings', icon: Wallet, color: 'text-primary' },
          { label: 'Active Members', value: stats.activeMembersCount, sub: 'Verified lenders', icon: Users, color: 'text-primary' },
          { label: 'Capital Disbursed', value: `₱${stats.totalDisbursed.toLocaleString()}`, sub: 'Principal in circulation', icon: HandCoins, color: 'text-accent' },
          { label: 'Estimated Profit', value: `₱${stats.estimatedInterest.toLocaleString()}`, sub: 'Calculated 10% monthly', icon: TrendingUp, color: 'text-green-500' },
          { label: 'Review Queue', value: stats.pendingCount, sub: 'Awaiting assessment', icon: Zap, color: 'text-accent', bg: 'bg-slate-800 text-white' },
        ].map((s, idx) => (
          <Card key={idx} className={cn("border-none shadow-sm transition-all hover:shadow-md", s.bg)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[12px] font-bold uppercase tracking-widest opacity-70">{s.label}</CardTitle>
              <s.icon className={cn("h-4 w-4", s.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loansLoading || membersLoading ? <Loader2 className="h-6 w-6 animate-spin opacity-20" /> : s.value}
              </div>
              <p className="text-[12px] opacity-70 font-medium mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Operational Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/dashboard/admin/loans" className="block group">
              <Card className="border-none shadow-sm group-hover:bg-primary transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-md font-bold group-hover:text-white">Loan Approvals</CardTitle>
                    <Badge variant="outline" className="group-hover:border-white group-hover:text-white">{stats.pendingCount}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-end"><ArrowRight className="h-4 w-4 group-hover:text-white" /></CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/admin/ledger" className="block group">
              <Card className="border-none shadow-sm group-hover:bg-accent transition-colors">
                <CardHeader><CardTitle className="text-md font-bold group-hover:text-white">Master Ledger</CardTitle></CardHeader>
                <CardContent className="flex justify-end"><ArrowRight className="h-4 w-4 group-hover:text-white" /></CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Recent Member Activity</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loansLoading ? (
              <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
            ) : recentActivityWithNames?.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground italic text-sm">No recent activity detected.</p>
            ) : (
              <div className="space-y-4">
                {recentActivityWithNames?.map((loan: any) => (
                  <div key={loan.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0 group transition-colors hover:bg-slate-50 p-2 rounded-lg">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border transition-all",
                      loan.status === 'approved' ? "bg-green-50 text-green-600 border-green-100" : 
                      loan.status === 'pending' ? "bg-yellow-50 text-yellow-600 border-yellow-100 animate-pulse" : 
                      loan.status === 'overdue' ? "bg-red-50 text-red-600 border-red-100" : "bg-slate-50 border-slate-100"
                    )}>
                      {loan.status === 'approved' ? <CheckCircle2 className="h-4 w-4" /> : 
                       loan.status === 'pending' ? <Clock className="h-4 w-4" /> : 
                       loan.status === 'overdue' ? <AlertTriangle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-md font-bold text-slate-800">{loan.resolvedName}</p>
                        <Badge variant="outline" className="text-[10px] h-4 uppercase">{loan.status}</Badge>
                      </div>
                      <p className="text-[12px] text-muted-foreground uppercase tracking-tight font-medium">&#128197; {formatDate(loan.requestDate)} | &#127991;&#65039; {loan.purpose}</p>
                      <div className="text-xs font-mono text-slate-600 mt-2 flex gap-4">
                        <span>Principal: <span className="font-bold">₱{loan.principal.toLocaleString()}</span></span>|
                        <span>Interest: <span className="font-bold">₱{loan.interest.toLocaleString()}</span></span>|
                        <span>Total Payable: <span className="font-bold">₱{loan.totalPayable.toLocaleString()}</span></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="ghost" size="sm" className="w-full mt-4 font-bold text-primary" asChild>
              <Link href="/dashboard/admin/ledger">View Full Audit Trail <ArrowRight className="ml-2 h-3 w-3" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

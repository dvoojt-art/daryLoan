
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, BrainCircuit, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { assessLoanRisk, type AdminLoanRiskAssessmentOutput } from '@/ai/flows/admin-loan-risk-assessment';

interface LoanRiskAssessmentProps {
  memberId: string;
  requestedAmount: number;
  contributionHistory: { date: string; amount: number }[];
}

export function LoanRiskAssessment({ memberId, requestedAmount, contributionHistory }: LoanRiskAssessmentProps) {
  const [assessment, setAssessment] = useState<AdminLoanRiskAssessmentOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAssess = async () => {
    setLoading(true);
    try {
      const result = await assessLoanRisk({
        memberId,
        requestedAmount,
        contributionHistory,
      });
      setAssessment(result);
    } catch (error) {
      console.error('Failed to assess risk:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <ShieldCheck className="text-green-500" />;
      case 'medium': return <HelpCircle className="text-yellow-500" />;
      case 'high': return <AlertTriangle className="text-orange-500" />;
      case 'very high': return <AlertTriangle className="text-red-500" />;
      default: return <BrainCircuit />;
    }
  };

  const getBadgeVariant = (level: string) => {
    switch (level) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      case 'very high': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Risk Assessment</CardTitle>
          </div>
          <Button onClick={handleAssess} disabled={loading} size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Run Assessment'}
          </Button>
        </div>
        <CardDescription>Generative analysis of member contribution patterns.</CardDescription>
      </CardHeader>
      {assessment && (
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Risk Level:</span>
            <Badge variant={getBadgeVariant(assessment.riskLevel)} className="uppercase">
              {getRiskIcon(assessment.riskLevel)}
              <span className="ml-1">{assessment.riskLevel}</span>
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {assessment.summary}
          </p>
        </CardContent>
      )}
    </Card>
  );
}

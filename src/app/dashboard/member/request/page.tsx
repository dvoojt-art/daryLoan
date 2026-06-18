
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ExcelFormulaInput } from '@/components/ExcelFormulaInput';
import { ShieldCheck, ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

export default function LoanRequestPage() {
  const [amount, setAmount] = useState(5000);
  const [term, setTerm] = useState(12);
  const interestRate = 0.05; // 5% fixed interest for demonstration

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Application Submitted",
      description: "Your loan request is now pending admin review.",
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/member"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Portal</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-headline font-bold">New Loan Application</h1>
        <p className="text-muted-foreground">Fill out the details below to request financial assistance.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form Section */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Loan Details</CardTitle>
              <CardDescription>Adjust the sliders to see auto-calculated monthly payments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Requested Amount ($)</Label>
                  <span className="text-lg font-headline font-bold text-primary">${amount.toLocaleString()}</span>
                </div>
                <Slider 
                  value={[amount]} 
                  onValueChange={(v) => setAmount(v[0])} 
                  min={500} 
                  max={20000} 
                  step={500} 
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Min: $500</span>
                  <span>Max: $20,000</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Repayment Term (Months)</Label>
                  <span className="text-lg font-headline font-bold text-primary">{term} Months</span>
                </div>
                <Slider 
                  value={[term]} 
                  onValueChange={(v) => setTerm(v[0])} 
                  min={6} 
                  max={36} 
                  step={6} 
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Min: 6 Months</span>
                  <span>Max: 36 Months</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Loan</Label>
                <Textarea 
                  id="purpose" 
                  placeholder="e.g., Home renovation, education fees, emergency medical expense..." 
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 border-t pt-6">
              <Button type="button" variant="ghost">Cancel</Button>
              <Button type="submit" className="bg-primary">Submit Application</Button>
            </CardFooter>
          </form>
        </Card>

        {/* Calculation Preview Section */}
        <div className="space-y-6">
          <ExcelFormulaInput 
            label="Est. Monthly Amortization"
            amount={amount}
            rate={interestRate}
            term={term}
          />

          <Card className="bg-primary/5 border-primary/10">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm">Pre-Approval Shield</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your current contribution consistency is high. Approval probability is estimated at <b>85%</b> based on system historical data.
              </p>
            </CardContent>
          </Card>

          <div className="p-4 bg-accent/5 rounded-lg border border-accent/10 flex gap-3">
            <Info className="h-5 w-5 text-accent shrink-0" />
            <p className="text-xs text-muted-foreground">
              Final interest rates may vary slightly after admin review and risk assessment analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

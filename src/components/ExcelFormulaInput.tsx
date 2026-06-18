'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, FunctionSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExcelFormulaInputProps {
  label: string;
  amount: number;
  rate: number;
  term: number;
  className?: string;
  onChange?: (value: number) => void;
}

export function ExcelFormulaInput({ label, amount, rate, term, className, onChange }: ExcelFormulaInputProps) {
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [interestOnly, setInterestOnly] = useState<number>(0);

  useEffect(() => {
    // PMT Formula: (rate * (1 + rate)^term) / ((1 + rate)^term - 1) * amount
    const monthlyRate = rate / 12;
    let pmt = 0;
    if (monthlyRate === 0) {
      pmt = amount / term;
    } else {
      pmt = (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1) * amount;
    }
    
    setMonthlyPayment(parseFloat(pmt.toFixed(2)));
    setInterestOnly(parseFloat((amount * rate).toFixed(2)));
    
    if (onChange) onChange(pmt);
  }, [amount, rate, term, onChange]);

  return (
    <div className={cn("space-y-4 p-4 border rounded-xl bg-slate-50 shadow-sm border-slate-200", className)}>
      <div className="flex items-center gap-2 mb-1">
        <FunctionSquare className="h-5 w-5 text-primary" />
        <Label className="text-sm font-bold text-slate-700 uppercase tracking-tight">{label}</Label>
      </div>

      <div className="space-y-3">
        {/* PMT Calculation */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Amortization Formula</span>
            <span className="text-[10px] font-code bg-primary/10 text-primary px-1.5 py-0.5 rounded">FX-ENGINE v1.0</span>
          </div>
          <div className="bg-white border rounded-md p-2 font-code text-xs text-slate-600 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <span className="text-blue-600 font-bold">=PMT</span>
            <span>({rate * 100}%/12, {term}, -{amount.toLocaleString()})</span>
          </div>
          <Input 
            readOnly 
            value={`₱${monthlyPayment.toLocaleString()}`}
            className="font-headline font-bold text-xl text-primary bg-white h-12 border-slate-200"
          />
        </div>

        {/* Simple Interest Formula Demonstration */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Annual Interest Logic</span>
          <div className="bg-white border rounded-md p-2 font-code text-xs text-slate-600 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <span className="text-green-600 font-bold">=IF</span>
            <span>(LoanAmount*InterestRate, "Valid", "Error")</span>
          </div>
          <div className="flex justify-between items-center text-sm px-1">
            <span className="text-muted-foreground italic text-xs">Annual Interest:</span>
            <span className="font-bold text-slate-700">₱{interestOnly.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-medium">
        <Calculator className="h-3 w-3" />
        <span>RECALCULATING ON INPUT CHANGE...</span>
      </div>
    </div>
  );
}

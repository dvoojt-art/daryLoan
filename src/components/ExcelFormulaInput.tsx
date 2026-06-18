
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';

interface ExcelFormulaInputProps {
  label: string;
  amount: number;
  rate: number;
  term: number;
  onChange?: (value: number) => void;
}

export function ExcelFormulaInput({ label, amount, rate, term, onChange }: ExcelFormulaInputProps) {
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);

  useEffect(() => {
    // PMT Formula: (rate * (1 + rate)^term) / ((1 + rate)^term - 1) * amount
    const monthlyRate = rate / 12;
    if (monthlyRate === 0) {
      setMonthlyPayment(amount / term);
      return;
    }
    const pmt = (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1) * amount;
    setMonthlyPayment(parseFloat(pmt.toFixed(2)));
    if (onChange) onChange(pmt);
  }, [amount, rate, term, onChange]);

  return (
    <div className="space-y-2 p-4 border rounded-md bg-muted/30">
      <div className="flex items-center gap-2 mb-2">
        <Calculator className="h-4 w-4 text-accent" />
        <Label className="text-sm font-semibold text-accent">{label}</Label>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-code bg-secondary p-1 rounded">
          =PMT({rate * 100}%, {term}, {amount})
        </span>
      </div>
      <div className="mt-2">
        <Input 
          readOnly 
          value={`$${monthlyPayment.toLocaleString()} / month`}
          className="font-code text-lg text-primary bg-white"
        />
      </div>
      <p className="text-[10px] text-muted-foreground italic">Auto-calculated using standard amortization logic.</p>
    </div>
  );
}

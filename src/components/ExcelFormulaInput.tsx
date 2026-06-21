'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, FunctionSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExcelFormulaInputProps {
  label: string;
  amount: number;
  rate: number; // This represents the base monthly rate (e.g., 0.10)
  term: number;
  className?: string;
  onChange?: (value: number) => void;
}

export function ExcelFormulaInput({ label, amount, rate, term, className, onChange }: ExcelFormulaInputProps) {
  const [totalPayable, setTotalPayable] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);

  useEffect(() => {
    // Logic: 
    // 7 days (0.25 term) = 5% flat interest
    // 1 month or more = 10% interest per month (rate * term)
    
    let interest = 0;
    if (term === 0.25) {
      interest = amount * 0.05; // 5% for the 7-day period
    } else {
      interest = amount * (rate * term); // 10% per month for longer terms
    }
    
    const total = amount + interest;

    setTotalPayable(parseFloat(total.toFixed(2)));
    setTotalInterest(parseFloat(interest.toFixed(2)));
    
    if (onChange) onChange(total);
  }, [amount, rate, term, onChange]);

  const formatTermDisplay = (t: number) => {
    if (t === 0.25) return "7 days";
    return `${t} month${t > 1 ? 's' : ''}`;
  };

  return (
    <div className={cn("space-y-4 p-4 border rounded-xl bg-slate-50 shadow-sm border-slate-200", className)}>
      <div className="flex items-center gap-2 mb-1">
        <FunctionSquare className="h-5 w-5 text-primary" />
        <Label className="text-sm font-bold text-slate-700 uppercase tracking-tight">{label}</Label>
      </div>

      <div className="space-y-3">
        {/* Interest Formula Display */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Community Interest Rule</span>
            <span className="text-[10px] font-code bg-primary/10 text-primary px-1.5 py-0.5 rounded">FX-ENGINE v1.2</span>
          </div>
          <div className="bg-white border rounded-md p-2 font-code text-xs text-slate-600 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <span className="text-blue-600 font-bold">=AMOUNT</span>
            {term === 0.25 ? (
              <span> * 5% (7-Day Term)</span>
            ) : (
              <span> * ({(rate * 100).toFixed(0)}% * {formatTermDisplay(term)})</span>
            )}
          </div>
          <Input 
            readOnly 
            value={`₱${totalPayable.toLocaleString()}`}
            className="font-headline font-bold text-xl text-primary bg-white h-12 border-slate-200"
          />
          <p className="text-[10px] text-muted-foreground px-1 italic">
            * Result includes principal + interest
          </p>
        </div>

        {/* Total Interest Logic Demonstration */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Interest Logic</span>
          <div className="bg-white border rounded-md p-2 font-code text-xs text-slate-600 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <span className="text-green-600 font-bold">=INTEREST</span>
            {term === 0.25 ? (
              <span>(₱{amount.toLocaleString()} * 5%)</span>
            ) : (
              <span>(₱{amount.toLocaleString()} * {(rate * 100).toFixed(0)}% * {term} mo)</span>
            )}
          </div>
          <div className="flex justify-between items-center text-sm px-1">
            <span className="text-muted-foreground italic text-xs">Total Interest:</span>
            <span className="font-bold text-slate-700">₱{totalInterest.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-medium">
        <Calculator className="h-3 w-3" />
        <span>CALCULATING: {term === 0.25 ? '5% FLAT FOR 7 DAYS' : '10% PER MONTH RULE'}</span>
      </div>
    </div>
  );
}

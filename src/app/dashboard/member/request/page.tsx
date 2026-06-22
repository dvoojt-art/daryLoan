'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ExcelFormulaInput } from '@/components/ExcelFormulaInput';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Info, 
  FunctionSquare, 
  Loader2, 
  User,
  AlertCircle,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { collection, addDoc, query, where } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function LoanRequestPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const [amount, setAmount] = useState(5000);
  const [term, setTerm] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [loanerName, setLoanerName] = useState('');
  const [comakerId, setComakerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Base monthly rate is 10%
  const monthlyInterestRate = 0.10;
  const { toast } = useToast();

  // Real-time Contributions Query for Consistency Check
  const contributionsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'contributions'),
      where('memberId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: contributions, loading: contributionsLoading } = useCollection<any>(contributionsQuery);

  // Fetch all members for comaker selection
  const membersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', '==', 'member'));
  }, [firestore]);

  const { data: members, loading: membersLoading } = useCollection<any>(membersQuery);

  // Filter out current user from comaker list
  const availableComakers = useMemo(() => {
    if (!members || !user) return [];
    // We filter by email as it's the unique identifier across different doc creation methods
    return members.filter(m => m.email !== user.email);
  }, [members, user]);

  // Dynamic Probability Logic
  const { consistencyScore, probabilityResult } = useMemo(() => {
    const count = contributions?.length || 0;
    let score = 0;
    if (count >= 5) score = 0.95;
    else if (count >= 3) score = 0.85;
    else if (count > 0) score = 0.60;
    else score = 0;
    
    const percentage = Math.round((amount / 30000) * 100);
    const result = `${percentage}%`;
    
    return { consistencyScore: score, probabilityResult: result };
  }, [contributions, amount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !firestore) return;

    if (!loanerName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide the name of the loaner.",
        variant: "destructive",
      });
      return;
    }

    if (!purpose.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a purpose for your loan request.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const storedInterestRate = term === 0.25 ? 0.05 : monthlyInterestRate;

    const loanData = {
      memberId: user.uid,
      comakerId: comakerId === 'none' ? null : (comakerId || null),
      loanerName: loanerName,
      amount: amount,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
      interestRate: storedInterestRate,
      termMonths: term,
      purpose: purpose,
    };

    const loansCollection = collection(firestore, 'loans');

    addDoc(loansCollection, loanData)
      .then(() => {
        setIsSubmitting(false);
        toast({
          title: "Application Submitted",
          description: `Request for ₱${amount.toLocaleString()} has been sent for admin review.`,
        });
        router.push('/dashboard/member');
      })
      .catch(async (e) => {
        const error = new FirestorePermissionError({
          path: loansCollection.path,
          operation: 'create',
          requestResourceData: loanData
        });
        errorEmitter.emit('permission-error', error);
        setIsSubmitting(false);
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
        <h1 className="text-3xl font-headline font-bold text-slate-800">New Loan Application</h1>
        <p className="text-muted-foreground">Adjust your loan parameters to see live community interest calculations.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Loan Details</CardTitle>
              <CardDescription>Specify the details for this request.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="loanerName">Full Name of Loaner</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="loanerName" 
                    placeholder="Enter the full name of the actual loaner" 
                    className="pl-10"
                    value={loanerName}
                    onChange={(e) => setLoanerName(e.target.value)}
                    required
                  />
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  * If the member is requesting for themselves, enter your own name.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comaker">Co-Maker / Guarantor (Optional)</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                  <Select value={comakerId} onValueChange={setComakerId}>
                    <SelectTrigger id="comaker" className="pl-10 h-11">
                      <SelectValue placeholder="Select a co-maker" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Co-Maker</SelectItem>
                      {availableComakers.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          <div className="flex flex-col text-left">
                            <span className="font-bold">{m.name}</span>
                            <span className="text-[10px] text-muted-foreground">{m.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  * Selecting a co-maker with strong history can improve your approval probability.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Requested Amount (₱)</Label>
                  <div className="flex flex-col items-end">
                    <span className={`text-lg font-headline font-bold ${amount >= 30000 ? 'text-accent' : 'text-primary'}`}>
                      ₱{amount.toLocaleString()}
                    </span>
                    {amount >= 30000 && (
                      <span className="text-[10px] font-bold text-accent uppercase flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Shield Limit Reached
                      </span>
                    )}
                  </div>
                </div>
                <Slider 
                  value={[amount]} 
                  onValueChange={(v) => setAmount(v[0])} 
                  min={0} 
                  max={30000} 
                  step={500} 
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Min: ₱0</span>
                  <span>Max: ₱30,000</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="term">Repayment Term</Label>
                <Select value={term.toString()} onValueChange={(v) => setTerm(parseFloat(v))}>
                  <SelectTrigger id="term" className="h-11">
                    <SelectValue placeholder="Select repayment term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.25">7 Days</SelectItem>
                    <SelectItem value="1">1 Month</SelectItem>
                    <SelectItem value="2">2 Months</SelectItem>
                    <SelectItem value="3">3 Months</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground italic">
                  * 7 days term is 5% interest, others are 10% per month of the principal.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Loan</Label>
                <Textarea 
                  id="purpose" 
                  placeholder="e.g., Home renovation, education fees, emergency medical expense..." 
                  className="min-h-[100px]"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 border-t pt-6">
              <Button type="button" variant="ghost" asChild disabled={isSubmitting}>
                <Link href="/dashboard/member">Cancel</Link>
              </Button>
              <Button type="submit" className="bg-accent hover:bg-accent/90 text-white font-bold shadow-md min-w-[140px]" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
            <FunctionSquare className="h-4 w-4" />
            Live Formula Engine
          </div>
          
          <ExcelFormulaInput 
            label="Estimated Total Interest"
            amount={amount}
            rate={monthlyInterestRate}
            term={term}
          />

          <Card className="bg-primary/5 border-primary/10 overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm">Pre-Approval Shield</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Instant eligibility based on shield limit (₱30k) and member history.
                </p>
                <div className="bg-white/50 p-2 rounded border font-code text-[10px] text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
                  =IF(AMOUNT &gt; 30000, "Review", ROUND(AMOUNT/30000*100) &amp; "%")
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Result:</span>
                  {contributionsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <span className={`text-lg font-headline font-bold ${amount >= 30000 ? 'text-accent' : 'text-primary'}`}>
                      {probabilityResult}
                    </span>
                  )}
                </div>
                {amount >= 30000 && (
                  <p className="text-[9px] text-accent font-bold uppercase italic leading-none">* Manual Admin Approval Required</p>
                )}
                {consistencyScore > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold uppercase text-muted-foreground">
                      <span>History Consistency</span>
                      <span>{(consistencyScore * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${consistencyScore * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="p-4 bg-accent/5 rounded-xl border border-accent/10 flex gap-3">
            <Info className="h-5 w-5 text-accent shrink-0" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Calculations are based on <b>5% for 7 days</b> and <b>10% per month</b> for longer terms. Final interest rates may be adjusted during manual review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

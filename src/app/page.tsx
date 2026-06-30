import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wallet, Users, ShieldCheck, ArrowRight, CheckCircle2, Table as TableIcon, FunctionSquare } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-[#010642] sticky top-0 z-50 shadow-sm">
        <Link className="flex items-center justify-center gap-2" href="#">
          <Wallet className="h-6 w-6 text-accent" />
          <div className="flex flex-col -space-y-1">
            <span className="font-headline text-xl tracking-tighter">
              <span className="font-medium text-white">Dary</span>
              <span className="text-accent font-bold">Loan</span>
            </span>
            <span className="text-[10px] text-slate-300 font-medium italic leading-none">Problema mo'y may solusyon!</span>
          </div>
        </Link>
        <Button className="h-8 px-3 rounded-full text-sm text-accent hover:bg-[#a87505] hover:text-white ml-auto flex gap-4 sm:gap-6">
          <Link href="/login2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-white-500" />
              <span className="font-semibold">Admin Portal</span>
            </div>
          </Link>
        </Button>
      </header>

      <main className="flex-1"> 
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-white to-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
               <img src="/coins.png" width={120} height={75}
                  className="rounded-xl shadow-lg"
                  />
              <div className="space-y-2">
                <h1 className="text-3xl font-headline font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  SINKING FUNDS<br />
                  <span className="text-accent">Tracker 2026</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl font-body">
                  Automate records, streamline collections, and manage your sinking funds with ease.
                </p>
              </div>
              <div className="flex justify-center">
                <Button asChild size="lg" className="bg-accent hover:bg-[#a87505] text-white border-none shadow-md">
                  <Link href="/login"><Users className="h-4 w-4" />Access DaryLoan Portal <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Excel Sync Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 px-4 md:gap-16 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <FunctionSquare className="h-3 w-3" />
                  Excel-Sync Formula Engine
                </div>
                <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-4xl md:text-5xl">Configure with the Familiarity of Excel</h2>
                <p className="text-muted-foreground md:text-lg leading-relaxed">
                  Admins can customize financial logic using standard Excel syntax. Automate everything from simple sums to complex conditional logic without writing a single line of code.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">=SUM (Payments) for real-time ledgers</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">=IF (Balance &lt;= 0, "Fullypaid")</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">=LoanAmount * InterestRate logic</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">=Contribution + Savings automated pool</span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl opacity-50" />
                <div className="relative bg-[#010642] p-8 rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
                  <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-500 h-3 w-3 rounded-full" />
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Admin Formula Editor</span>
                    </div>
                    <TableIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Formula Input (Cell D14)</label>
                      <div className="bg-white/10 p-4 rounded-xl font-code text-sm text-accent border border-white/10 flex items-center gap-3">
                        <span className="text-accent font-bold">fx</span>
                        <span className="text-white">= AMOUNT * ( INTEREST_RATE * 1 MONTH )</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">PRINCIPAL_AMOUNT</p>
                        <div className="font-code text-xs text-slate-400 mb-2">= SUM ( D5 : D20 )</div>
                        <p className="text-xl font-headline font-bold text-green-400">₱480,000</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">10% INTEREST_RATE</p>
                        <div className="font-code text-xs text-slate-400 mb-2">Display Value</div>
                        <p className="text-xl font-headline font-bold text-accent">₱48,000</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 flex items-center justify-center">
                      <div className="bg-white/5 px-4 py-2 rounded-full flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-300 uppercase">Formula Engine Active by Daryl</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 bg-[#010642]">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">© 2026 DaryLoan Inc. All rights reserved.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-sm text-slate-400 hover:text-white hover:underline underline-offset-4 transition-colors" href="/features">
              Features
            </Link>
            <Link className="text-sm text-slate-400 hover:text-white hover:underline underline-offset-4 transition-colors" href="/privacy">
              Privacy
            </Link>
            <Link className="text-sm text-slate-400 hover:text-white hover:underline underline-offset-4 transition-colors" href="/terms">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

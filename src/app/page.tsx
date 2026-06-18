import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wallet, ShieldCheck, PieChart, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="#">
          <Wallet className="h-6 w-6 text-primary" />
          <div className="flex flex-col -space-y-1">
            <span className="font-headline text-xl tracking-tighter">
              <span className="font-bold text-slate-800">Dary</span>
              <span className="text-yellow-600 font-medium">Loan</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-medium leading-none">Problema mo'y may solusyon!</span>
          </div>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
            Features
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-white to-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-headline font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Smart Loan Management <br />
                  <span className="text-primary">For Community Growth</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl font-body">
                  Automate records, streamline collections, and make data-driven decisions with our AI-powered fintech platform.
                </p>
              </div>
              <div className="flex justify-center">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                  <Link href="/login">Access DaryLoan Portal <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-primary/10 p-4 rounded-2xl">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-headline font-bold">Secure Gated Roles</h2>
                <p className="text-muted-foreground">Dedicated portals for Admins and Members with custom permissions and security layers.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-accent/10 p-4 rounded-2xl">
                  <Zap className="h-8 w-8 text-accent" />
                </div>
                <h2 className="text-xl font-headline font-bold">AI Risk Tool</h2>
                <p className="text-muted-foreground">Generative AI analyzes contribution history to provide instant risk assessments for loans.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-primary/10 p-4 rounded-2xl">
                  <PieChart className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-headline font-bold">Smart Reporting</h2>
                <p className="text-muted-foreground">Real-time dashboards for disbursements, collections, and total outstanding balances.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Excel Sync Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 px-10 md:gap-16 lg:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-4xl">Excel-Sync Formulas</h2>
                <p className="text-muted-foreground md:text-lg">
                  No more manual calculations. Our smart forms use pre-defined Excel-like logic to automate interest rates and monthly amortizations.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span>Real-time PMT calculation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span>Automated amortization schedules</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span>One-click exports for bookkeeping</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-2xl border border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <div className="h-24 w-24 bg-accent/10 rounded-full blur-3xl" />
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Formula Logic</label>
                    <div className="bg-secondary p-3 rounded-lg font-code text-sm text-primary">
                      =PMT(INTEREST_RATE/12, TERM_MONTHS, LOAN_AMOUNT)
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background p-4 rounded-xl">
                      <p className="text-sm text-muted-foreground">Interest</p>
                      <p className="text-2xl font-headline font-bold">5.0%</p>
                    </div>
                    <div className="bg-background p-4 rounded-xl">
                      <p className="text-sm text-muted-foreground">Result</p>
                      <p className="text-2xl font-headline font-bold text-accent">$1,245.50</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 border-t bg-white">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2024 DaryLoan Inc. All rights reserved.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-sm hover:underline underline-offset-4" href="#">
              Privacy
            </Link>
            <Link className="text-sm hover:underline underline-offset-4" href="#">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

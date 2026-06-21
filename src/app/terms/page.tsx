'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white">
        <Link href="/" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto py-12 px-6 space-y-8">
        <div className="flex items-center gap-3">
          <div className="bg-accent/10 p-3 rounded-xl">
            <FileText className="h-6 w-6 text-accent" />
          </div>
          <h1 className="text-4xl font-headline font-bold">Terms of Service</h1>
        </div>

        <section className="space-y-4">
          <p className="text-muted-foreground italic">Effective Date: June 2026</p>
          <p className="leading-relaxed">
            Welcome to DaryLoan. By accessing or using our platform, you agree to comply with and be bound by the following terms and conditions.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-headline font-bold">1. Eligibility</h2>
          <p className="leading-relaxed text-muted-foreground">
            To use DaryLoan services, you must be a registered member of a community organization that has contracted with DaryLoan. You must provide accurate and complete information during registration.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-headline font-bold">2. Loan Applications</h2>
          <p className="leading-relaxed text-muted-foreground">
            Submission of a loan request does not guarantee approval. Approval is subject to risk assessment, contribution history, and administrator discretion. Interest rates and repayment terms are calculated using standard amortization logic but are finalized by administrators.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-headline font-bold">3. Repayment Obligations</h2>
          <p className="leading-relaxed text-muted-foreground">
            Members are responsible for timely repayments according to the agreed schedule. Failure to meet repayment deadlines may affect your credit standing within the community and your eligibility for future financial assistance.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-headline font-bold">4. Prohibited Conduct</h2>
          <p className="leading-relaxed text-muted-foreground">
            Users may not use the platform for any fraudulent activities, attempt to bypass security measures, or provide false financial records. DaryLoan reserves the right to terminate access for any violations of these terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-headline font-bold">5. Limitation of Liability</h2>
          <p className="leading-relaxed text-muted-foreground">
            DaryLoan provides the platform "as is" and is not responsible for the financial decisions made by organization administrators or the outcome of AI risk assessments.
          </p>
        </section>

        <div className="pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            Need more clarification? Contact us at support@daryloan.com
          </p>
        </div>
      </main>
    </div>
  );
}

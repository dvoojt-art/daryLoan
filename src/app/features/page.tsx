'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, ShieldCheck, Zap, PieChart, FileText } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-white/10 bg-[#010642]">
        <Link href="/" className="flex items-center gap-2 text-white hover:text-accent transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto py-12 px-6 space-y-8">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-xl">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-headline font-bold">Features</h1>
        </div>
        <section
        id="features"
        className="w-full py-12 md:py-24 lg:py-32 bg-white"
        >
        <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-primary/10 p-4 rounded-2xl">
                <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-headline font-bold">
                Secure Gated Roles
                </h2>
                <p className="text-muted-foreground">
                Dedicated portals for Admins and Members with custom permissions
                and security layers.
                </p>
            </div>

            <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-accent/10 p-4 rounded-2xl">
                <Zap className="h-8 w-8 text-accent" />
                </div>
                <h2 className="text-xl font-headline font-bold">
                AI Risk Tool
                </h2>
                <p className="text-muted-foreground">
                Generative AI analyzes contribution history to provide instant
                risk assessments for loans.
                </p>
            </div>

            <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-primary/10 p-4 rounded-2xl">
                <PieChart className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-headline font-bold">
                Smart Reporting
                </h2>
                <p className="text-muted-foreground">
                Real-time dashboards for disbursements, collections, and total
                outstanding balances.
                </p>
            </div>
            </div>
        </div>
        </section>
        </main>
    </div>
  );
}
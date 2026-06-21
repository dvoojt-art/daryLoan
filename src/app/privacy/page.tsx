'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
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
          <div className="bg-primary/10 p-3 rounded-xl">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-headline font-bold">Privacy Policy</h1>
        </div>

        <section className="space-y-4">
          <p className="text-muted-foreground italic">Last Updated: June 2026</p>
          <p className="leading-relaxed">
            At DaryLoan, we are committed to protecting your personal and financial information. This Privacy Policy outlines how we collect, use, and safeguard your data when you use our platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-headline font-bold">1. Information We Collect</h2>
          <p className="leading-relaxed">
            We collect information you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Contact details (Name, Email, Phone Number)</li>
            <li>Financial records (Contribution history, loan requests)</li>
            <li>Authentication credentials</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-headline font-bold">2. Use of AI Analysis</h2>
          <p className="leading-relaxed">
            DaryLoan uses Generative AI models to analyze contribution history and provide risk assessments. This analysis is used solely for the purpose of assisting administrators in loan approval decisions and is not shared with third-party advertisers.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-headline font-bold">3. Data Security</h2>
          <p className="leading-relaxed">
            We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure. All financial transactions and personal records are encrypted and stored securely.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-headline font-bold">4. Your Rights</h2>
          <p className="leading-relaxed">
            You have the right to access, correct, or request the deletion of your personal data. Please contact your community administrator for assistance with data management requests.
          </p>
        </section>

        <div className="pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            Questions about our privacy practices? Reach out at privacy@daryloan.com
          </p>
        </div>
      </main>
    </div>
  );
}

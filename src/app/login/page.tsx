'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, ShieldCheck, User, Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent, role: 'admin' | 'member') => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login by redirecting after a short delay
    setTimeout(() => {
      router.push(`/dashboard/${role}`);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative">
      <div className="absolute top-8 left-8">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Homepage
          </Link>
        </Button>
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="flex items-center justify-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col items-start -space-y-1 text-left">
              <h1 className="text-3xl font-headline">
                <span className="font-bold text-slate-800">Dary</span>
                <span className="text-accent font-medium">Loan</span>
              </h1>
              <span className="text-[10px] text-muted-foreground font-medium italic">Problema mo'y may solusyon!</span>
            </div>
          </Link>
          <p className="text-muted-foreground pt-4 text-sm">Secure Portal Login</p>
        </div>

        <Card className="border-none shadow-xl overflow-hidden">
          <Tabs defaultValue="member" className="w-full">
            <div className="bg-muted/50 p-1 border-b">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="member" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Member
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Admin
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="member">
              <form onSubmit={(e) => handleLogin(e, 'member')}>
                <CardHeader>
                  <CardTitle className="text-xl">Member Login</CardTitle>
                  <CardDescription>Enter your credentials to access your portal.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="member-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="member-email" 
                        type="email" 
                        placeholder="member@example.com" 
                        className="pl-10" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="member-password">Password</Label>
                      <Link href="#" className="text-xs text-primary hover:underline">Forgot?</Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="member-password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10" 
                        required 
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white font-bold" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Sign in as Member'}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="admin">
              <form onSubmit={(e) => handleLogin(e, 'admin')}>
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Admin Portal</CardTitle>
                  <CardDescription>Restricted access for system administrators.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="admin-email" 
                        type="email" 
                        placeholder="admin@daryloan.com" 
                        className="pl-10" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-password">Password</Label>
                      <Link href="#" className="text-xs text-primary hover:underline">Forgot?</Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="admin-password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10" 
                        required 
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full bg-primary" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Enter Admin Console'}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="px-6 pb-8 text-center">
            <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
              By logging in, you agree to our{' '}
              <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and{' '}
              <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

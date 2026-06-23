'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, ShieldCheck, User, Lock, Mail, Loader2, ArrowLeft, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';


export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent, role: 'admin' | 'member') => {
    e.preventDefault();
    if (!auth) return;

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userEmail = userCredential.user.email?.toLowerCase();
      
      // Admin can access both portals.
      if (userEmail === 'admin@daryloan.com') {
        router.push(`/dashboard/${role}`);
      // Members can only access the member portal.
      } else if (userEmail && role === 'member') {
        router.push('/dashboard/member');
      // Deny access if a member tries to log into the admin portal.
      } else {
        await auth.signOut();
        throw new Error("Access denied. You are not authorized to access the admin portal.");
      }
      
      toast({
        title: "Welcome back!",
        description: "Successfully signed into your portal.",
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        icon: <AlertTriangle className="h-4 w-4" />,
        title: "Authentication Failed",
        description: error.message || "Invalid email or password.",
      });
    } finally {
      setIsLoading(false);
    }
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

      <div className="w-full max-w-md space-y-8 bg-[#010642] p-8 rounded-3xl shadow-2xl border border-white/10">
        <div className="text-center space-y-2">
          <Link href="/" className="flex items-center justify-center gap-2">
            <div className="bg-accent p-2 rounded-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col items-start -space-y-1 text-left">
              <h1 className="text-3xl font-headline">
                <span className="font-bold text-white">Dary</span>
                <span className="text-accent font-medium">Loan</span>
              </h1>
              <span className="text-[10px] text-slate-300 font-medium italic">Problema mo'y may solusyon!</span>
            </div>
          </Link>
          <p className="text-slate-400 pt-4 text-sm font-medium uppercase tracking-wider">Secure Portal Login</p>
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
                  <CardDescription>Enter credentials to access your portal.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="member-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="member-email" 
                        type="email" 
                        placeholder="sinking@daryloan.com" 
                        className="pl-10" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="member-password">Password</Label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="member-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                      </button>
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-password">Password</Label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full bg-primary" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Sign in as Admin'}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="px-6 py-8 text-center bg-[#010642]">
            <p className="text-[10px] text-slate-400 leading-relaxed max-w-[280px] mx-auto">
              By logging in, you agree to our{' '}
              <Link href="/terms" className="underline hover:text-white transition-colors">Terms of Service</Link> and{' '}
              <Link href="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</Link>.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

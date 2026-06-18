
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Wallet, ShieldCheck, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (role: 'admin' | 'member') => {
    // Simulate login by redirecting
    router.push(`/dashboard/${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="flex items-center justify-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-headline font-bold text-primary">LendMate</h1>
          </Link>
          <p className="text-muted-foreground">Secure Portal Login</p>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Select your access role to continue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full h-16 justify-between text-left border-primary/20 hover:border-primary hover:bg-primary/5 transition-all group"
              onClick={() => handleLogin('admin')}
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-primary">Administrator</div>
                  <div className="text-xs text-muted-foreground">Full system access & tools</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>

            <Button 
              variant="outline" 
              className="w-full h-16 justify-between text-left border-accent/20 hover:border-accent hover:bg-accent/5 transition-all group"
              onClick={() => handleLogin('member')}
            >
              <div className="flex items-center gap-4">
                <div className="bg-accent/10 p-2 rounded-full group-hover:bg-accent/20 transition-colors">
                  <User className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-accent">Member</div>
                  <div className="text-xs text-muted-foreground">View records & request loans</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-xs text-muted-foreground text-center">
              By logging in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

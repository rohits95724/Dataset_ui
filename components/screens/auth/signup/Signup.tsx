"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Database, ShieldCheck, ArrowRight, Loader2, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const GoogleIcon = () => (
  <svg className="mr-2.5 h-5 w-5 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

export default function Signup() {
  const router = useRouter();
  const { loginWithGoogle, isAuthenticated, isLoading } = useAuth();
  const { addToast } = useToast();

  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleGoogleClick = async () => {
    setConnecting(true);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Google OAuth initiation failed.";
      addToast(errMsg, "error");
      setConnecting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6 md:p-12 relative overflow-hidden">
      {/* Dynamic background decoration */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-emerald-600/10 dark:bg-emerald-600/5 blur-3xl -z-10 pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl p-4 sm:p-8 backdrop-blur-md relative animate-fade-in">
        
        {/* Left Side: Premium SaaS branding & signup benefits */}
        <div className="hidden md:flex flex-col space-y-6 p-6 h-full justify-between border-r border-zinc-200 dark:border-zinc-800/60 pr-8">
          <div className="space-y-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
              <Database className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white leading-none">
                Start for Free
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Unlock instant access to advanced medical registry visualizers, state audit filters, and location proximity analyzers.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">No Credentials Required</h4>
                <p className="text-[10px] text-muted-foreground">Sign up with your existing corporate Google Account without remembering new passwords.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Instant Team Collaboration</h4>
                <p className="text-[10px] text-muted-foreground">Share parsed databases and state metrics with other authenticated users.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">GDPR & HIPPA Compliant Data Handling</h4>
                <p className="text-[10px] text-muted-foreground">Encryption at rest and in transit for all client-side loaded spreadsheet rows.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-150 dark:border-zinc-800/80">
            <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Ready to load registry spreadsheet data containing over 20,000 doctor rows.</span>
          </div>
        </div>

        {/* Right Side: Google Login Center */}
        <div className="flex flex-col space-y-6 py-6 px-2">
          {/* Header */}
          <div className="flex flex-col space-y-2 text-center md:text-left">
            <div className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md mx-auto mb-2">
              <Database className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white leading-none">
              Sign Up
            </h1>
            <p className="text-xs text-muted-foreground">
              Establish your visualizer profile in seconds using Google.
            </p>
          </div>

          {!connecting ? (
            /* Main Register Card with Google Button */
            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-md bg-white dark:bg-zinc-900/40 relative">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg font-bold">Create Account</CardTitle>
                <CardDescription className="text-xs">
                  AeroData relies on Google Identity for profile synchronization and single sign-on.
                </CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <Button
                  onClick={handleGoogleClick}
                  disabled={isLoading}
                  className="w-full bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 font-semibold border border-zinc-300 dark:border-zinc-700 shadow-sm py-5 cursor-pointer flex items-center justify-center transition-all duration-200 hover:shadow-md"
                >
                  <GoogleIcon />
                  Sign up with Google
                </Button>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2 pb-6">
                <div className="flex items-center gap-1.5 justify-center text-[10px] text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Secured by Google Identity Services
                </div>
              </CardFooter>
            </Card>
          ) : (
            /* Authentication Loading State */
            <Card className="border border-emerald-200/50 dark:border-emerald-950 shadow-md bg-white dark:bg-zinc-900/40 py-8 px-4 animate-pulse">
              <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                <div className="text-center space-y-1.5">
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-150">
                    Registering with Google Accounts
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Redirecting to Google Identity Provider...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Direct Link to Login */}
          <div className="text-center text-xs text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Sign in with Google
            </Link>
          </div>
        </div>
        
      </div>
    </div>
  );
}

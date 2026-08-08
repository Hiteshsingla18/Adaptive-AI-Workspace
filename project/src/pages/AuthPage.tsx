import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type Mode = 'login' | 'register';

export function AuthPage({ mode }: { mode: Mode }) {
  const [active, setActive] = useState<Mode>(mode);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [oauthSubmitting, setOauthSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');
    const fullName = String(form.get('name') ?? '');

    setSubmitting(true);
    const { error } =
      active === 'login'
        ? await signIn(email, password)
        : await signUp(email, password, fullName);
    setSubmitting(false);

    if (error) {
      toast({ title: active === 'login' ? 'Sign-in failed' : 'Sign-up failed', description: error, variant: 'destructive' });
      return;
    }

    if (active === 'register') {
      toast({
        title: 'Check your inbox',
        description: 'Confirm your email to finish creating your account, then sign in.',
      });
      setActive('login');
      return;
    }

    navigate('/dashboard');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="grid-bg absolute inset-0 opacity-50" />
      <div className="absolute left-1/2 top-1/3 h-72 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <Link to="/" className="mb-8 flex items-center justify-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Command className="h-5 w-5" />
            </div>
            <span className="font-heading text-base font-semibold tracking-tight">Adaptive AI</span>
          </Link>

          <div className="glass rounded-2xl p-8 shadow-2xl">
            <div className="mb-6 flex rounded-lg bg-muted/50 p-1">
              {(['login', 'register'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setActive(m)}
                  className="relative flex-1 rounded-md py-2 text-sm font-medium transition-colors"
                >
                  {active === m && (
                    <motion.div
                      layoutId="auth-tab"
                      className="absolute inset-0 rounded-md bg-primary text-primary-foreground"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className={active === m ? 'relative text-primary-foreground' : 'relative text-muted-foreground'}>
                    {m === 'login' ? 'Sign in' : 'Sign up'}
                  </span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="font-heading text-2xl font-bold tracking-tight text-zinc-50">
                  {active === 'login' ? 'Welcome back' : 'Create your account'}
                </h1>
                <p className="mt-1 text-sm font-normal text-zinc-400">
                  {active === 'login'
                    ? 'Sign in to your adaptive workspace.'
                    : 'Start adapting your workspace in minutes.'}
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {active === 'register' && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Full name</Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="name" name="name" placeholder="Alex Kim" className="pl-9" required />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="email" name="email" type="email" placeholder="alex@adaptive.ai" className="pl-9" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="group w-full" disabled={submitting}>
                    {submitting ? 'Please wait…' : active === 'login' ? 'Sign in' : 'Create account'}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-800/80" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 font-normal text-zinc-500">or continue with</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  disabled={oauthSubmitting}
                  onClick={async () => {
                    setOauthSubmitting(true);
                    const { error } = await signInWithGoogle();
                    setOauthSubmitting(false);

                    if (error) {
                      toast({
                        title: 'Google sign-in failed',
                        description: error,
                        variant: 'destructive',
                      });
                    }
                  }}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </Button>

                <p className="mt-6 text-center text-xs font-normal text-zinc-400">
                  {active === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    onClick={() => setActive(active === 'login' ? 'register' : 'login')}
                    className="font-medium text-primary hover:underline"
                  >
                    {active === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

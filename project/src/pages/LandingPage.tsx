import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Eye,
  Brain,
  Activity,
  ShieldCheck,
  Cpu,
  Command,
  Github,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Eye,
    title: 'Vision that runs in your browser',
    desc: 'Posture and focus tracking from your webcam. No plugins, no uploads — frames stay on your device.',
  },
  {
    icon: Brain,
    title: 'Recommendations that learn your habits',
    desc: 'The longer you use it, the more it adapts. nudges are based on your patterns, not a generic checklist.',
  },
  {
    icon: Activity,
    title: 'Metrics updated every second',
    desc: 'Posture, fatigue, focus, lighting, and stress — streamed live so you always know where you stand.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy by design',
    desc: 'Only anonymized metrics leave your machine. Your camera feed is never stored or transmitted.',
  },
  {
    icon: Cpu,
    title: 'Works with the hardware you own',
    desc: 'Pair with smart chairs, standing desks, and ambient lights. Start with just a webcam.',
  },
  {
    icon: Command,
    title: 'A dashboard you will actually check',
    desc: 'Every metric is one glance away. No clutter, no noise — just the numbers that matter.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/50 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Command className="h-4 w-4" />
            </div>
            <span className="font-heading text-sm font-semibold tracking-tight">Adaptive AI</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#preview" className="transition-colors hover:text-foreground">Preview</a>
            <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="grid-bg absolute inset-0 opacity-60" />
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 text-center md:px-8 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800/80 bg-card/60 px-3 py-1 text-xs text-zinc-400 backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Now with real-time vision overlays
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-heading mx-auto max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight text-zinc-50 sm:text-6xl"
          >
            Your workspace,{' '}
            <span className="gradient-text">adapted to you</span> in real time.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-6 max-w-2xl text-base font-normal text-zinc-400 sm:text-lg"
          >
            Adaptive AI Workspace watches your posture, focus, and environment
            through your webcam — then tells you exactly what to fix, and when
            to take a break.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button size="lg" asChild className="group">
              <Link to="/dashboard">
                Open dashboard
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/register">Create account</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Mock UI illustration */}
      <section id="preview" className="relative mx-auto max-w-6xl px-4 pb-24 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-card p-2 shadow-2xl"
        >
          <div className="flex items-center gap-1.5 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <div className="grid gap-3 rounded-xl bg-background p-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-zinc-800/80 bg-card/40 md:h-64">
                <div className="text-center">
                  <Eye className="mx-auto h-10 w-10 text-zinc-600" />
                  <p className="mt-2 text-sm text-zinc-400">Live camera preview</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {['Posture', 'Focus', 'Fatigue'].map((m) => (
                  <div key={m} className="rounded-lg border border-zinc-800/80 bg-card/50 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">{m}</p>
                    <p className="font-heading mt-1 text-xl font-bold text-zinc-100">78</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {['Raise monitor 2 cm', 'Break in 12 min', 'Increase lighting'].map((r) => (
                <div key={r} className="rounded-lg border border-zinc-800/80 bg-card/50 p-3 text-sm">
                  <p className="font-medium text-zinc-100">{r}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">AI recommendation</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            What it actually does
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-normal text-zinc-400">
            Six things that make a measurable difference to how you work.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-50px' }}
              className="group rounded-2xl border border-zinc-800/80 bg-card p-6 transition-colors duration-200 hover:border-zinc-700"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-heading mt-4 text-base font-semibold tracking-tight text-zinc-100">{f.title}</h3>
              <p className="mt-1.5 text-sm font-normal text-zinc-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-24 md:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-card p-10 text-center md:p-16"
        >
          <div className="absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <h2 className="font-heading relative text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            Try it with your camera
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm font-normal text-zinc-400">
            Free during beta. No credit card, no installation — just open the dashboard and allow camera access.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/register">Create free account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/dashboard">Explore the demo</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Command className="h-4 w-4" />
              </div>
              <span className="font-heading text-sm font-semibold tracking-tight">Adaptive AI Workspace</span>
            </div>
            <div className="flex items-center gap-5 text-zinc-500">
              <a href="#" className="hover:text-foreground"><Github className="h-5 w-5" /></a>
              <a href="#" className="hover:text-foreground"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-foreground"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>
          <p className="mt-6 text-center text-xs font-normal text-zinc-500 md:text-left">
            © {new Date().getFullYear()} Adaptive AI Workspace. Built for healthier, more focused work.
          </p>
        </div>
      </footer>
    </div>
  );
}

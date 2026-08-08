import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Cpu,
  History,
  Settings,
  LogOut,
  X,
  type LucideIcon,
} from 'lucide-react';
import { navItems } from '@/data/dummyData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  BarChart3,
  FileText,
  Cpu,
  History,
  Settings,
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.user_metadata?.full_name;
  const email = user?.email ?? 'Signed in';
  const initials = (() => {
    const name = typeof displayName === 'string' && displayName.trim() ? displayName : email;
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return 'WU';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  })();

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-zinc-800/80 bg-card/80 backdrop-blur-xl transition-transform duration-300 md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-800/80 px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <span className="font-heading text-sm font-semibold tracking-tight">
              Adaptive AI
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Workspace
          </p>
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] ?? LayoutDashboard;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-lg bg-primary/10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon
                      className={cn(
                        'relative h-4 w-4 shrink-0',
                        isActive && 'text-primary'
                      )}
                    />
                    <span className="relative">{item.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-indicator"
                        className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800/80 p-3">
          <button
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
          <div className="mt-2 rounded-lg border border-zinc-800/80 bg-background/50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate font-heading text-xs font-medium text-zinc-100">
                  {typeof displayName === 'string' && displayName.trim() ? displayName : 'Workspace User'}
                </p>
                <p className="truncate text-[11px] font-normal text-zinc-400">{email}</p>
              </div>
            </div>
            <p className="font-heading text-xs font-medium text-zinc-100">Pro Plan</p>
            <p className="mt-0.5 text-[11px] font-normal text-zinc-400">
              Real-time vision + analytics active.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  Command,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTelemetry } from '@/contexts/TelemetryContext';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { metrics } = useTelemetry();
  const { user, signOut } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const displayName = useMemo(() => {
    const fullName = user?.user_metadata?.full_name;
    if (typeof fullName === 'string' && fullName.trim()) {
      return fullName;
    }
    return user?.email?.split('@')[0] ?? 'Workspace User';
  }, [user]);

  const initials = useMemo(() => {
    const parts = displayName.split(' ').filter(Boolean);
    if (parts.length === 0) return 'WU';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [displayName]);

  const notifications = [
    { title: 'Posture alert', body: 'Your shoulders are slouching forward.', time: '2m ago' },
    { title: 'Break reminder', body: 'Stand up and stretch in 12 minutes.', time: '8m ago' },
    { title: 'Lighting low', body: 'Ambient light dropped below 500 lux.', time: '15m ago' },
  ];

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-800/80 bg-background/70 px-4 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Command className="h-4 w-4" />
          </div>
          <span className="font-heading hidden text-sm font-semibold tracking-tight sm:block">
            Adaptive AI
          </span>
        </Link>
      </div>

      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search metrics, devices, reports..."
          className="border-zinc-800/80 bg-card/50 pl-9 text-sm"
        />
        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-zinc-800/80 bg-muted px-1.5 py-0.5 text-[10px] text-zinc-400 lg:block">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:block">
          <StatusBadge
            status={metrics.cameraConnected ? 'live' : 'offline'}
            label={metrics.cameraConnected ? 'Workspace Live' : 'Workspace Idle'}
          />
        </div>

        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-80 border-zinc-800/80 bg-popover p-0"
          >
            <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3">
              <span className="font-heading text-sm font-semibold text-zinc-100">Notifications</span>
              <span className="text-xs font-normal text-zinc-400">{notifications.length} new</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((n, i) => (
                <div
                  key={i}
                  className="flex gap-3 border-b border-zinc-800/60 px-4 py-3 last:border-0 hover:bg-muted/40"
                >
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{n.title}</p>
                    <p className="text-xs font-normal text-zinc-400">{n.body}</p>
                    <p className="mt-1 text-[10px] font-normal text-zinc-500">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={profileOpen} onOpenChange={setProfileOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 rounded-full outline-none">
              <Avatar className="h-8 w-8 border border-zinc-800/80">
                <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 border-zinc-800/80 bg-popover p-1.5">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-zinc-100">{displayName}</p>
              <p className="text-xs font-normal text-zinc-400">{user?.email ?? 'Signed in'}</p>
            </div>
            <div className="my-1 h-px bg-zinc-800/80" />
            <button
              onClick={() => navigate('/settings')}
              className={cn('flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-muted hover:text-zinc-100')}
            >
              <User className="h-4 w-4" /> Profile
            </button>
            <button
              onClick={() => navigate('/settings')}
              className={cn('flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-muted hover:text-zinc-100')}
            >
              <Settings className="h-4 w-4" /> Settings
            </button>
            <div className="my-1 h-px bg-zinc-800/80" />
            <button
              onClick={async () => {
                await signOut();
                navigate('/');
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}

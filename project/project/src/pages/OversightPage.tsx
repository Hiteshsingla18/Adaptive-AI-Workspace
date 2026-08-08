import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2, ShieldCheck, Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMyProfile, fetchVisibleChecklists, type ChecklistRecord, type Profile } from '@/lib/profile';
import { downloadChecklistRecordPacket } from '@/lib/reviewPacket';
import { AGENT_ROLES, type AgentRole } from '@/types/telemetry';
import { cn } from '@/lib/utils';

const OVERSIGHT_ROLES: AgentRole[] = ['admin', 'authority', 'hospital', 'investigator', 'reviewer'];

export function OversightPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [records, setRecords] = useState<ChecklistRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<AgentRole | 'all'>('all');
  const [scopeAllUsers, setScopeAllUsers] = useState(true);

  const isOversight = profile ? OVERSIGHT_ROLES.includes(profile.role) : false;

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      const [p, r] = await Promise.all([fetchMyProfile(user.id), fetchVisibleChecklists()]);
      if (isMounted) {
        setProfile(p);
        setRecords(r);
        setLoading(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Records already reflect what RLS decided to return. "My records" further
  // narrows that client-side for convenience — it never widens it, since the
  // query never brought back more than the database allowed in the first
  // place.
  const scoped = scopeAllUsers || !isOversight ? records : records.filter((r) => r.user_id === user?.id);
  const filtered = roleFilter === 'all' ? scoped : scoped.filter((r) => r.roles.includes(roleFilter));

  return (
    <div>
      <PageHeader
        title="Oversight"
        subtitle="Role-scoped view of every recommendation's source checklist — enforced by the database, not the browser."
      />

      {!loading && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-zinc-800/80 bg-card p-4">
          <ShieldCheck className={cn('h-4 w-4', isOversight ? 'text-emerald-300' : 'text-zinc-500')} />
          <p className="text-xs font-normal text-zinc-400">
            Signed in as <span className="font-medium text-zinc-200">{profile?.role ?? 'user'}</span>.{' '}
            {isOversight
              ? 'This role can read every user\u2019s recommendation checklists — Postgres row-level security grants that, not this page.'
              : 'This role can only read your own recommendation checklists. Switching roles in Settings changes what the same query returns.'}
          </p>
          {isOversight && (
            <Button
              variant="outline"
              size="sm"
              className="ml-auto gap-1.5"
              onClick={() => setScopeAllUsers((v) => !v)}
            >
              <Users className="h-3.5 w-3.5" />
              {scopeAllUsers ? 'Showing all users' : 'Showing my records'}
            </Button>
          )}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-1.5">
        {(['all', ...AGENT_ROLES] as const).map((role) => {
          const count =
            role === 'all' ? scoped.length : scoped.filter((r) => r.roles.includes(role)).length;
          const active = roleFilter === role;
          return (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors',
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              )}
            >
              {role} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      <p className="mb-3 text-xs font-normal text-zinc-500">
        Showing {filtered.length} of {records.length} visible record{records.length === 1 ? '' : 's'}.
      </p>

      {loading ? (
        <div className="flex items-center justify-center rounded-lg border border-zinc-800/80 bg-card p-10 text-sm text-zinc-400">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading visible records…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-zinc-800/80 bg-card p-10 text-center text-sm text-zinc-400">
          No records for this role/scope. Connect the camera on the Dashboard to generate some, or switch roles in Settings.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rec, index) => {
            const pct = rec.total_count > 0 ? Math.round((rec.complete_count / rec.total_count) * 100) : 0;
            const isOwn = rec.user_id === user?.id;
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="rounded-lg border border-zinc-800/80 bg-card p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-zinc-100">{rec.title}</p>
                      <Badge variant={isOwn ? 'secondary' : 'outline'} className="text-[10px]">
                        {isOwn ? 'you' : `user ${rec.user_id.slice(0, 8)}`}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs font-normal text-zinc-400">
                      Roles: {rec.roles.length ? rec.roles.join(', ') : 'none recorded'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => user && downloadChecklistRecordPacket(rec, user.id)}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export packet
                  </Button>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Progress value={pct} className="h-1.5 flex-1" />
                  <span className="text-xs font-medium text-zinc-300">
                    {rec.complete_count}/{rec.total_count} · {pct}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

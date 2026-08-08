import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Palette,
  Bell,
  Video,
  SlidersHorizontal,
  Moon,
  Sun,
  Check,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const tabs = [
  { value: 'profile', label: 'Profile', icon: User },
  { value: 'theme', label: 'Theme', icon: Palette },
  { value: 'notifications', label: 'Notifications', icon: Bell },
  { value: 'camera', label: 'Camera', icon: Video },
  { value: 'sensitivity', label: 'AI Sensitivity', icon: SlidersHorizontal },
];

const inputClass = 'bg-zinc-900/60 border-zinc-800 text-sm text-zinc-100 focus:border-blue-500/80';

export function SettingsPage() {
  const { toast } = useToast();
  const [postureAlerts, setPostureAlerts] = useState(true);
  const [breakReminders, setBreakReminders] = useState(true);
  const [lightingWarnings, setLightingWarnings] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [autoConnect, setAutoConnect] = useState(false);
  const [highQuality, setHighQuality] = useState(true);
  const [sensitivity, setSensitivity] = useState(70);

  const save = (section: string) =>
    toast({ title: 'Settings saved', description: `Your ${section} preferences have been updated.` });

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your profile, preferences, and AI behavior." />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 overflow-x-auto rounded-lg bg-card p-1.5 no-scrollbar">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
              <t.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key="settings-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4"
          >
            <TabsContent value="profile">
              <div className="max-w-2xl space-y-5 rounded-lg border border-zinc-800/80 bg-card p-5">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border border-zinc-800">
                    <AvatarFallback className="bg-primary/15 text-base font-semibold text-primary">AK</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">Change avatar</Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-zinc-400">Full name</Label>
                    <Input defaultValue="Alex Kim" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-zinc-400">Email</Label>
                    <Input defaultValue="alex@adaptive.ai" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-zinc-400">Role</Label>
                    <Input defaultValue="Software Engineer" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-zinc-400">Timezone</Label>
                    <Input defaultValue="UTC-08 (Pacific)" className={inputClass} />
                  </div>
                </div>
                <Button onClick={() => save('profile')}>Save changes</Button>
              </div>
            </TabsContent>

            <TabsContent value="theme">
              <div className="max-w-2xl space-y-5 rounded-lg border border-zinc-800/80 bg-card p-5">
                <div>
                  <p className="font-heading text-sm font-semibold text-zinc-100">Appearance</p>
                  <p className="mt-0.5 text-xs font-normal text-zinc-400">Adaptive AI is optimized for dark mode.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Dark', icon: Moon, active: true },
                    { label: 'Light', icon: Sun, active: false },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                        opt.active ? 'border-primary bg-primary/5' : 'border-zinc-800/80 hover:border-zinc-700'
                      )}
                    >
                      <opt.icon className="h-4 w-4 text-primary" />
                      <span className="font-heading text-sm font-medium text-zinc-100">{opt.label}</span>
                      {opt.active && <Check className="ml-auto h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-zinc-400">Accent color</Label>
                  <div className="flex gap-3">
                    {['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map((c, i) => (
                      <button
                        key={c}
                        className={cn(
                          'h-8 w-8 rounded-full transition-all',
                          i === 0 ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'hover:scale-110'
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={() => save('theme')}>Apply theme</Button>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <div className="max-w-2xl space-y-3 rounded-lg border border-zinc-800/80 bg-card p-5">
                {[
                  { label: 'Posture alerts', desc: 'Get notified when your posture slips.', val: postureAlerts, set: setPostureAlerts },
                  { label: 'Break reminders', desc: 'Periodic reminders to stand and stretch.', val: breakReminders, set: setBreakReminders },
                  { label: 'Lighting warnings', desc: 'Alert when ambient light is too low.', val: lightingWarnings, set: setLightingWarnings },
                  { label: 'Weekly digest', desc: 'A summary of your week, every Monday.', val: weeklyDigest, set: setWeeklyDigest },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between border-b border-zinc-800/80 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{n.label}</p>
                      <p className="text-xs font-normal text-zinc-400">{n.desc}</p>
                    </div>
                    <Switch checked={n.val} onCheckedChange={n.set} />
                  </div>
                ))}
                <Button onClick={() => save('notification')}>Save preferences</Button>
              </div>
            </TabsContent>

            <TabsContent value="camera">
              <div className="max-w-2xl space-y-3 rounded-lg border border-zinc-800/80 bg-card p-5">
                {[
                  { label: 'Auto-connect on launch', desc: 'Automatically connect camera when the app opens.', val: autoConnect, set: setAutoConnect },
                  { label: 'High quality stream', desc: 'Use 720p+ capture for better vision accuracy.', val: highQuality, set: setHighQuality },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between border-b border-zinc-800/80 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{n.label}</p>
                      <p className="text-xs font-normal text-zinc-400">{n.desc}</p>
                    </div>
                    <Switch checked={n.val} onCheckedChange={n.set} />
                  </div>
                ))}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-zinc-400">Camera device</Label>
                  <Input defaultValue="Built-in FaceTime HD Camera" readOnly className={inputClass} />
                </div>
                <Button onClick={() => save('camera')}>Save camera settings</Button>
              </div>
            </TabsContent>

            <TabsContent value="sensitivity">
              <div className="max-w-2xl space-y-5 rounded-lg border border-zinc-800/80 bg-card p-5">
                <div>
                  <p className="font-heading text-sm font-semibold text-zinc-100">AI Sensitivity</p>
                  <p className="mt-0.5 text-xs font-normal text-zinc-400">Control how aggressively the AI nudges you.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-zinc-400">Sensitivity level</Label>
                    <span className="font-heading text-sm font-bold text-zinc-100">{sensitivity}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sensitivity}
                    onChange={(e) => setSensitivity(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-primary"
                  />
                  <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    <span>Relaxed</span>
                    <span>Balanced</span>
                    <span>Strict</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['Posture', 'Fatigue', 'Focus'].map((m) => (
                    <div key={m} className="rounded-md border border-zinc-800/80 bg-background/40 p-2.5 text-center">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">{m}</p>
                      <p className="font-heading mt-1 text-xs font-bold text-zinc-100">Active</p>
                    </div>
                  ))}
                </div>
                <Button onClick={() => save('AI sensitivity')}>Apply sensitivity</Button>
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

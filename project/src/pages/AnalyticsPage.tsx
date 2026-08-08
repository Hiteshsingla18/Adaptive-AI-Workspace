import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { PageHeader } from '@/components/shared/PageHeader';
import { analyticsChartData } from '@/data/dummyData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const tooltipStyle = {
  backgroundColor: '#141414',
  border: '1px solid #3f3f46',
  borderRadius: '0.375rem',
  fontSize: '12px',
  color: '#e4e4e7',
  padding: '6px 10px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
};

function ChartCard({
  title,
  subtitle,
  trend,
  trendValue,
  index,
  children,
}: {
  title: string;
  subtitle: string;
  trend: 'up' | 'down' | 'flat';
  trendValue: string;
  index: number;
  children: React.ReactNode;
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-300' : trend === 'down' ? 'text-rose-300' : 'text-zinc-400';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
    >
      <Card className="overflow-hidden rounded-lg border border-zinc-800/80 bg-card transition-colors duration-200 hover:border-zinc-700/80">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b border-zinc-800/80 px-4 py-3">
          <div>
            <CardTitle className="font-heading text-sm font-semibold tracking-tight text-zinc-100">{title}</CardTitle>
            <p className="mt-0.5 text-xs font-normal text-zinc-400">{subtitle}</p>
          </div>
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon className="h-3.5 w-3.5" />
            {trendValue}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-4">{children}</CardContent>
      </Card>
    </motion.div>
  );
}

export function AnalyticsPage() {
  const data = analyticsChartData;

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Trends and patterns from your last seven days."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Daily Posture Score"
          subtitle="Last 7 days"
          trend="up"
          trendValue="+6%"
          index={0}
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.dailyPosture}>
              <defs>
                <linearGradient id="postureGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="day" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#3f3f46', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} fill="url(#postureGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Weekly Productivity"
          subtitle="Focus vs. breaks taken"
          trend="up"
          trendValue="+12%"
          index={1}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.weeklyProductivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="day" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#27272a40' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="focus" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="breaks" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Fatigue Trend"
          subtitle="Throughout the day"
          trend="down"
          trendValue="-8%"
          index={2}
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.fatigueTrend}>
              <defs>
                <linearGradient id="fatigueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(30 90% 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(30 90% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="hour" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#3f3f46', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="fatigue" stroke="#f59e0b" strokeWidth={2} fill="url(#fatigueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Focus Trend"
          subtitle="Throughout the day"
          trend="flat"
          trendValue="±2%"
          index={3}
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.focusTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="hour" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#3f3f46', strokeWidth: 1 }} />
              <Line type="monotone" dataKey="focus" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 2.5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Lighting History"
          subtitle="Lux over the week"
          trend="up"
          trendValue="+15%"
          index={4}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.lightingHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="day" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#27272a40' }} />
              <Bar dataKey="lux" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Summary"
          subtitle="Weekly averages"
          trend="up"
          trendValue="+4%"
          index={5}
        >
          <div className="grid grid-cols-2 gap-3 py-1">
            {[
              { label: 'Avg Posture', value: '78%', color: 'text-blue-300' },
              { label: 'Avg Focus', value: '74%', color: 'text-emerald-300' },
              { label: 'Avg Fatigue', value: '41%', color: 'text-amber-300' },
              { label: 'Avg Lighting', value: '487 lux', color: 'text-violet-300' },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-zinc-800/80 bg-background/50 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">{s.label}</p>
                <p className={`font-heading mt-1 text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

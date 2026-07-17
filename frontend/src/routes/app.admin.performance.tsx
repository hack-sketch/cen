import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/app/admin/performance")({ component: Page });

const participationData = [
  { month: "Mar", pct: 45 },
  { month: "Apr", pct: 55 },
  { month: "May", pct: 62 },
  { month: "Jun", pct: 71 },
  { month: "Jul", pct: 78 },
];

const creditsData = [
  { month: "Mar", credits: 120 },
  { month: "Apr", credits: 210 },
  { month: "May", credits: 310 },
  { month: "Jun", credits: 470 },
  { month: "Jul", credits: 550 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-line-strong/30 p-3 rounded-xl shadow-lg font-body text-xs min-w-[120px] transition-all">
        {label && <p className="font-bold text-ink border-b border-line pb-1 mb-1.5">{label}</p>}
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4 py-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color || item.payload?.fill }} />
              <span className="text-on-surface-variant font-medium">{item.name}</span>
            </div>
            <span className="font-bold text-ink">
              {item.name === "Participation" ? `${item.value}%` : item.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function Page() {
  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="Performance Metrics" 
        description="Monitor community activity ratios and credit circulation levels." 
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-line/60 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex flex-col justify-between">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Participation Rate</span>
            <div className="flex justify-between items-baseline mt-2.5">
              <span className="text-3xl font-bold text-ink">78%</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+7% MoM</span>
            </div>
            <span className="text-[10px] text-on-surface-variant/80 mt-2">Target: 80% active members</span>
          </CardContent>
        </Card>

        <Card className="border-line/60 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex flex-col justify-between">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Circulating Credits</span>
            <div className="flex justify-between items-baseline mt-2.5">
              <span className="text-3xl font-bold text-ink">550</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+17.0%</span>
            </div>
            <span className="text-[10px] text-on-surface-variant/80 mt-2">Active in-society currency</span>
          </CardContent>
        </Card>

        <Card className="border-line/60 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex flex-col justify-between">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Avg Trade Completion</span>
            <div className="flex justify-between items-baseline mt-2.5">
              <span className="text-3xl font-bold text-ink">2.4d</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">-12.5% time</span>
            </div>
            <span className="text-[10px] text-on-surface-variant/80 mt-2">Trade request to closure</span>
          </CardContent>
        </Card>

        <Card className="border-line/60 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex flex-col justify-between">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Dispute Ratio</span>
            <div className="flex justify-between items-baseline mt-2.5">
              <span className="text-3xl font-bold text-ink">0.8%</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Healthy</span>
            </div>
            <span className="text-[10px] text-on-surface-variant/80 mt-2">Below 2% platform target</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Participation Rate Area Chart */}
        <Card className="border-line/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-ink">Participation Rate Profile</CardTitle>
            <CardDescription className="text-xs text-on-surface-variant">Percentage of total registered members engaging in exchanges monthly.</CardDescription>
          </CardHeader>
          <CardContent className="h-68">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={participationData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="participateGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#105644" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#105644" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.5)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#64748b", fontSize: 11 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#64748b", fontSize: 11 }} 
                  unit="%"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="pct" 
                  name="Participation"
                  stroke="#105644" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#participateGrad)" 
                  dot={{ r: 4, stroke: "#105644", strokeWidth: 1.5, fill: "#ffffff" }}
                  activeDot={{ r: 6, stroke: "#105644", strokeWidth: 2, fill: "#ffffff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Credits Circulating Bar Chart */}
        <Card className="border-line/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-ink">Total Credits in Circulation</CardTitle>
            <CardDescription className="text-xs text-on-surface-variant">The total sum of credits actively trading hands inside the society.</CardDescription>
          </CardHeader>
          <CardContent className="h-68">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={creditsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="creditsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.65} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.5)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#64748b", fontSize: 11 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#64748b", fontSize: 11 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="credits" 
                  name="Credits"
                  fill="url(#creditsGrad)" 
                  radius={[5, 5, 0, 0]} 
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

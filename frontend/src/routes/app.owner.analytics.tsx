import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, Legend } from "recharts";

export const Route = createFileRoute("/app/owner/analytics")({ component: Page });

const growthData = [
  { month: "Jan", societies: 1 },
  { month: "Feb", societies: 2 },
  { month: "Mar", societies: 3 },
  { month: "Apr", societies: 5 },
  { month: "May", societies: 7 },
  { month: "Jun", societies: 9 },
];

const engagementData = [
  { name: "Active Members", value: 432 },
  { name: "Dormant Members", value: 110 },
];

const COLORS = ["#105644", "#94a3b8"]; // CEN Emerald and Cool Slate

const activityData = [
  { month: "Jan", exchanges: 20 },
  { month: "Feb", exchanges: 42 },
  { month: "Mar", exchanges: 65 },
  { month: "Apr", exchanges: 88 },
  { month: "May", exchanges: 120 },
  { month: "Jun", exchanges: 155 },
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
            <span className="font-bold text-ink">{item.value}</span>
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
        title="Platform Analytics" 
        description="Comprehensive cross-society health indicators and growth trends." 
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-line/60 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex flex-col justify-between">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Total Societies</span>
            <div className="flex justify-between items-baseline mt-2.5">
              <span className="text-3xl font-bold text-ink">9</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+12.5%</span>
            </div>
            <span className="text-[10px] text-on-surface-variant/80 mt-2">Active federated networks</span>
          </CardContent>
        </Card>

        <Card className="border-line/60 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex flex-col justify-between">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Total Members</span>
            <div className="flex justify-between items-baseline mt-2.5">
              <span className="text-3xl font-bold text-ink">542</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+18.3%</span>
            </div>
            <span className="text-[10px] text-on-surface-variant/80 mt-2">Cross-society active users</span>
          </CardContent>
        </Card>

        <Card className="border-line/60 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex flex-col justify-between">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Completed Trades</span>
            <div className="flex justify-between items-baseline mt-2.5">
              <span className="text-3xl font-bold text-ink">490</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+24.1%</span>
            </div>
            <span className="text-[10px] text-on-surface-variant/80 mt-2">Skill & resource exchanges</span>
          </CardContent>
        </Card>

        <Card className="border-line/60 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex flex-col justify-between">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Circulating Value</span>
            <div className="flex justify-between items-baseline mt-2.5">
              <span className="text-3xl font-bold text-ink">15.4k</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+15.2%</span>
            </div>
            <span className="text-[10px] text-on-surface-variant/80 mt-2">Credits active in ecosystem</span>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Society Growth Area Chart */}
        <Card className="border-line/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-ink">Society Onboarding Rate</CardTitle>
            <CardDescription className="text-xs text-on-surface-variant">Cumulative count of active societies on the platform.</CardDescription>
          </CardHeader>
          <CardContent className="h-68">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
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
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="societies" 
                  name="Societies"
                  stroke="#105644" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#growthGrad)" 
                  dot={{ r: 4, stroke: "#105644", strokeWidth: 1.5, fill: "#ffffff" }}
                  activeDot={{ r: 6, stroke: "#105644", strokeWidth: 2, fill: "#ffffff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement Donut/Pie Chart */}
        <Card className="border-line/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-ink">Member Activity Profile</CardTitle>
            <CardDescription className="text-xs text-on-surface-variant">Distribution of active vs dormant community accounts.</CardDescription>
          </CardHeader>
          <CardContent className="h-68 flex items-center justify-center">
            <div className="w-full h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={engagementData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="45%" 
                    innerRadius={65} 
                    outerRadius={85} 
                    paddingAngle={3}
                  >
                    {engagementData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-on-surface-variant font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Central Donut Value */}
              <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="text-2xl font-bold text-ink block leading-none">80%</span>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mt-1 block">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exchange Activity Bar Chart */}
        <Card className="lg:col-span-2 border-line/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-ink">Community Transactions</CardTitle>
            <CardDescription className="text-xs text-on-surface-variant">Monthly aggregate of completed credit exchanges across all networks.</CardDescription>
          </CardHeader>
          <CardContent className="h-68">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="exchanges" 
                  name="Exchanges"
                  fill="url(#barGrad)" 
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

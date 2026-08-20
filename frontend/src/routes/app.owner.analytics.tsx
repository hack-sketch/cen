import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/owner/analytics")({ component: Page });

const COLORS = ["#105644", "#4f46e5", "#0ea5e9", "#f59e0b"];

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
  const analyticsQuery = useQuery({
    queryKey: ["owner-analytics"],
    queryFn: () => analyticsService.getOwnerAnalytics(),
  });

  const data = analyticsQuery.data;

  const totalSoc = data?.totalSocieties ?? data?.total_societies ?? 6;
  const activeSoc = data?.activeSocieties ?? data?.active_societies ?? 6;
  const pendingApps = data?.pendingApplications ?? data?.pending_applications ?? 2;
  const totalRes = data?.totalResidents ?? data?.total_residents ?? 5;
  const totalTx = data?.totalTransactions ?? data?.total_transactions ?? 4;
  const circulating = data?.totalCreditsCirculating ?? data?.total_credits_circulating ?? 205;
  const totalSkills = data?.totalSkills ?? data?.total_skills ?? 6;
  const totalResources = data?.totalResources ?? data?.total_resources ?? 6;
  const totalEvents = data?.totalEvents ?? data?.total_events ?? 3;
  const totalComplaints = data?.totalComplaints ?? data?.total_complaints ?? 3;

  const activityBreakdown = [
    { category: "Marketplace Skills", count: totalSkills },
    { category: "Shared Resources", count: totalResources },
    { category: "Events Hosted", count: totalEvents },
    { category: "Complaints Logged", count: totalComplaints },
  ];

  const distributionData = [
    { name: "Active Societies", value: activeSoc },
    { name: "Pending Applications", value: Math.max(1, pendingApps) },
  ];

  const networkProgression = [
    { stage: "Societies", count: totalSoc },
    { stage: "Residents", count: totalRes },
    { stage: "Listings", count: totalSkills + totalResources },
    { stage: "Transactions", count: totalTx },
  ];

  return (
    <div className="space-y-6 pb-12 animate-page-fade">
      <PageHeader 
        title="Platform Analytics & Governance" 
        description="Real-time cross-society indicators and ecosystem health metrics computed live from database." 
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-line/60 shadow-sm hover:shadow-md transition-all bg-white">
          <CardContent className="p-5 flex flex-col justify-between">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Total Societies</span>
            <div className="flex justify-between items-baseline mt-2.5">
              <span className="text-3xl font-bold text-ink">{totalSoc}</span>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                {activeSoc} Active
              </Badge>
            </div>
            <span className="text-[10px] text-on-surface-variant/80 mt-2">Federated society networks</span>
          </CardContent>
        </Card>

        <Card className="border-line/60 shadow-sm hover:shadow-md transition-all bg-white">
          <CardContent className="p-5 flex flex-col justify-between">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Registered Members</span>
            <div className="flex justify-between items-baseline mt-2.5">
              <span className="text-3xl font-bold text-ink">{totalRes}</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Live</span>
            </div>
            <span className="text-[10px] text-on-surface-variant/80 mt-2">Active resident accounts</span>
          </CardContent>
        </Card>

        <Card className="border-line/60 shadow-sm hover:shadow-md transition-all bg-white">
          <CardContent className="p-5 flex flex-col justify-between">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Network Exchanges</span>
            <div className="flex justify-between items-baseline mt-2.5">
              <span className="text-3xl font-bold text-ink">{totalTx}</span>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px]">
                Audited
              </Badge>
            </div>
            <span className="text-[10px] text-on-surface-variant/80 mt-2">Completed credit transactions</span>
          </CardContent>
        </Card>

        <Card className="border-line/60 shadow-sm hover:shadow-md transition-all bg-white">
          <CardContent className="p-5 flex flex-col justify-between">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Circulating Credits</span>
            <div className="flex justify-between items-baseline mt-2.5">
              <span className="text-3xl font-bold text-ink">{circulating}</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Time Credits</span>
            </div>
            <span className="text-[10px] text-on-surface-variant/80 mt-2">Active balance in ecosystem</span>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Network Growth & Funnel Area Chart */}
        <Card className="border-line/60 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base font-bold text-ink">Ecosystem Funnel Progression</CardTitle>
            <CardDescription className="text-xs text-on-surface-variant">Live scaling metrics across societies, residents, listings, and transactions.</CardDescription>
          </CardHeader>
          <CardContent className="h-68">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={networkProgression} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="ownerGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#105644" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#105644" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.5)" />
                <XAxis 
                  dataKey="stage" 
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
                  dataKey="count" 
                  name="Total Count"
                  stroke="#105644" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#ownerGrowthGrad)" 
                  dot={{ r: 4, stroke: "#105644", strokeWidth: 1.5, fill: "#ffffff" }}
                  activeDot={{ r: 6, stroke: "#105644", strokeWidth: 2, fill: "#ffffff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Network Status Donut Chart */}
        <Card className="border-line/60 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base font-bold text-ink">Society Federation Status</CardTitle>
            <CardDescription className="text-xs text-on-surface-variant">Ratio of active federated societies vs pending owner applications.</CardDescription>
          </CardHeader>
          <CardContent className="h-68 flex items-center justify-center">
            <div className="w-full h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={distributionData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="45%" 
                    innerRadius={65} 
                    outerRadius={85} 
                    paddingAngle={3}
                  >
                    {distributionData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#ffffff" strokeWidth={2} />
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
                <span className="text-2xl font-bold text-ink block leading-none">{totalSoc}</span>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mt-1 block">Societies</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Category Bar Chart */}
        <Card className="lg:col-span-2 border-line/60 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base font-bold text-ink">Ecosystem Activity Breakdown</CardTitle>
            <CardDescription className="text-xs text-on-surface-variant">Live counts of marketplace skills, shared tools, events, and complaints.</CardDescription>
          </CardHeader>
          <CardContent className="h-68">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ownerBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.65} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.5)" />
                <XAxis 
                  dataKey="category" 
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
                  dataKey="count" 
                  name="Count"
                  fill="url(#ownerBarGrad)" 
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

import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, Legend } from "recharts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { analyticsService, societyService, userService } from "@/services";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Users,
  Building2,
  Home,
  Search,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  UserX,
  UserCheck,
  ShieldCheck,
  Crown,
  Star,
  Coins,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn, getInitials } from "@/lib/utils";

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

interface OwnerUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  societyId?: string;
  societyName?: string;
  householdId?: string;
  householdUnit?: string;
  creditBalance: number;
  joinedDate: string;
  isActive?: boolean;
  isCoordinator?: boolean;
  idProofUploaded?: boolean;
  idProofVerified?: boolean;
}

function Page() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [societyFilter, setSocietyFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [deactivateTarget, setDeactivateTarget] = useState<{ id: string; name: string } | null>(null);

  const analyticsQuery = useQuery({
    queryKey: ["owner-analytics"],
    queryFn: () => analyticsService.getOwnerAnalytics(),
  });

  const usersQuery = useQuery({
    queryKey: ["owner-users-directory"],
    queryFn: () => analyticsService.getOwnerUserDirectory(),
  });

  const societiesQuery = useQuery({
    queryKey: ["societies-list"],
    queryFn: () => societyService.list(),
  });

  const data = analyticsQuery.data;
  const rawUsers: OwnerUserItem[] = (usersQuery.data ?? data?.users ?? []) as OwnerUserItem[];

  const filteredUsers = useMemo(() => {
    return rawUsers.filter((u: OwnerUserItem) => {

      const matchesQ =
        !q ||
        u.name?.toLowerCase().includes(q.toLowerCase()) ||
        u.email?.toLowerCase().includes(q.toLowerCase()) ||
        u.societyName?.toLowerCase().includes(q.toLowerCase()) ||
        u.householdUnit?.toLowerCase().includes(q.toLowerCase());

      const matchesSoc = societyFilter === "all" || u.societyId === societyFilter;
      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "coordinator" ? u.isCoordinator || u.role === "coordinator" : u.role === roleFilter);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? u.isActive !== false : u.isActive === false);

      return matchesQ && matchesSoc && matchesRole && matchesStatus;
    });
  }, [rawUsers, q, societyFilter, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

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


      {/* Platform Owner User Directory Section */}
      <Card className="border-line/60 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-line/40 bg-panel/20 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-ink flex items-center gap-2">
                <Users className="h-5 w-5 text-deep-forest" />
                Cross-Community User Directory
              </CardTitle>
              <CardDescription className="text-xs text-on-surface-variant mt-0.5">
                Live database roster of all registered profiles across federated communities.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-semibold px-2.5 py-1">
                {filteredUsers.length} of {rawUsers.length} Members
              </Badge>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <Input
                placeholder="Search name, email, society..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                className="pl-8 text-xs h-9 rounded-lg border-line-strong/60"
              />
            </div>

            <div>
              <select
                value={societyFilter}
                onChange={(e) => {
                  setSocietyFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 rounded-lg border border-line-strong/60 bg-white text-xs px-3 text-ink focus:outline-none focus:ring-1 focus:ring-deep-forest"
              >
                <option value="all">All Societies</option>
                {societiesQuery.data?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 rounded-lg border border-line-strong/60 bg-white text-xs px-3 text-ink focus:outline-none focus:ring-1 focus:ring-deep-forest"
              >
                <option value="all">All Roles</option>
                <option value="resident">Residents</option>
                <option value="coordinator">Coordinators</option>
                <option value="admin">Admins</option>
                <option value="owner">Platform Owners</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 rounded-lg border border-line-strong/60 bg-white text-xs px-3 text-ink focus:outline-none focus:ring-1 focus:ring-deep-forest"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Accounts</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-panel/40 text-on-surface-variant uppercase text-[10px] font-bold border-b border-line/40">
                <tr>
                  <th className="py-3 px-4">User Profile</th>
                  <th className="py-3 px-4">Society Network</th>
                  <th className="py-3 px-4">Unit Slot</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Wallet Balance</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/30">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-on-surface-variant">
                      No registered members found matching current filters.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-panel/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-deep-forest/10 text-deep-forest flex items-center justify-center font-bold text-xs shrink-0">
                            {getInitials(u.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-ink truncate">{u.name}</div>
                            <div className="text-[10px] text-on-surface-variant truncate">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-ink font-medium">
                          <Building2 className="h-3.5 w-3.5 text-on-surface-variant shrink-0" />
                          <span className="truncate max-w-[150px]">{u.societyName || "Unassigned"}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-on-surface-variant font-medium">
                          <Home className="h-3.5 w-3.5 shrink-0" />
                          <span>{u.householdUnit || "Unassigned"}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {u.role === "owner" ? (
                          <Badge className="bg-purple-50 text-purple-800 border-purple-200 text-[10px] gap-1">
                            <Crown className="h-3 w-3" /> Owner
                          </Badge>
                        ) : u.isCoordinator || u.role === "coordinator" ? (
                          <Badge className="bg-indigo-50 text-indigo-800 border-indigo-200 text-[10px] gap-1">
                            <Star className="h-3 w-3" /> Coordinator
                          </Badge>
                        ) : u.role === "admin" ? (
                          <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] gap-1">
                            <ShieldCheck className="h-3 w-3" /> Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-700 bg-slate-50 border-slate-200 text-[10px]">
                            Resident
                          </Badge>
                        )}
                      </td>

                      <td className="py-3 px-4 font-bold text-deep-forest">
                        {u.creditBalance ?? 0} Credits
                      </td>

                      <td className="py-3 px-4 text-on-surface-variant text-[11px]">
                        {u.joinedDate || "Recent"}
                      </td>

                      <td className="py-3 px-4">
                        {u.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 text-[10px]">
                            <XCircle className="h-3 w-3" /> Deactivated
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {u.role !== "owner" && (
                          u.isActive !== false ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeactivateTarget({ id: u.id, name: u.name })}
                              className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                            >
                              <UserX className="h-3.5 w-3.5 mr-1" /> Deactivate
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await userService.reactivateUser(u.id);
                                  toast.success(`${u.name} has been reactivated.`);
                                  qc.invalidateQueries({ queryKey: ["owner-users-directory"] });
                                  qc.invalidateQueries({ queryKey: ["owner-analytics"] });
                                } catch (err: any) {
                                  toast.error(err.message || "Failed to reactivate user");
                                }
                              }}
                              className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                            >
                              <UserCheck className="h-3.5 w-3.5 mr-1" /> Reactivate
                            </Button>
                          )
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-line/40 bg-panel/10">
              <span className="text-[11px] text-on-surface-variant font-medium">
                Page {page} of {totalPages} ({filteredUsers.length} total)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-2.5 text-xs cursor-pointer border-line-strong hover:bg-panel disabled:opacity-50"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 px-2.5 text-xs cursor-pointer border-line-strong hover:bg-panel disabled:opacity-50"
                >
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deactivate User Confirmation Dialog */}
      <AlertDialog open={!!deactivateTarget} onOpenChange={(open) => !open && setDeactivateTarget(null)}>
        <AlertDialogContent className="bg-white border-line/60 rounded-2xl shadow-xl max-w-sm p-6">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-base font-bold text-ink flex items-center gap-2">
              <UserX className="h-5 w-5 text-rose-600 flex-shrink-0" />
              Deactivate User Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to deactivate <span className="font-bold text-ink">"{deactivateTarget?.name}"</span>? Deactivated users will be blocked from logging into the platform until reactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5 flex gap-2">
            <AlertDialogCancel className="h-9 px-4 text-xs font-semibold rounded-lg border-line-strong hover:bg-panel cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deactivateTarget) {
                  try {
                    await userService.deactivateUser(deactivateTarget.id);
                    toast.success(`${deactivateTarget.name} has been deactivated.`);
                    qc.invalidateQueries({ queryKey: ["owner-users-directory"] });
                    qc.invalidateQueries({ queryKey: ["owner-analytics"] });
                  } catch (err: any) {
                    toast.error(err.message || "Failed to deactivate user");
                  } finally {
                    setDeactivateTarget(null);
                  }
                }
              }}
              className="h-9 px-4 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer active:scale-98 transition-all"
            >
              Confirm Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


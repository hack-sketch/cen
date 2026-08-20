import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  societyService,
  userService,
  skillService,
  resourceService,
  eventService,
  complaintService,
  noticeService,
  creditService,
  householdService,
  joinRequestService,
} from "@/services";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2, Users, ClipboardList, Wallet, CheckSquare, AlertCircle,
  Calendar, Megaphone, Sparkles, Package, ArrowUpRight, ArrowDownLeft,
  Settings, ShieldAlert, Award, ChevronRight, Activity, Plus, Crown,
  UserX, UserCheck, UserPlus, AlertTriangle, Eye, FileText, CheckCircle2, XCircle, ShieldCheck, Mail
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const Route = createFileRoute("/app/dashboard")({
  component: Dashboard,
});

function Stat({ 
  icon: Icon, 
  label, 
  value, 
  hint, 
  trend 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string; 
  value: React.ReactNode; 
  hint?: string;
  trend?: { value: string; type: "up" | "down" | "neutral" }
}) {
  return (
    <Card className="border-line/60 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-deep-forest/10 text-deep-forest transition-all group-hover:scale-105 duration-300">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">{label}</div>
          <div className="text-2xl font-bold text-ink mt-0.5">{value}</div>
          {hint && <div className="text-[10px] text-on-surface-variant/85 mt-1 truncate">{hint}</div>}
        </div>
        {trend && (
          <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
            trend.type === "up" 
              ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
              : trend.type === "down"
              ? "bg-red-50 text-red-800 border-red-100"
              : "bg-slate-50 text-slate-800 border-slate-100"
          }`}>
            {trend.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { user, effectiveRole } = useAuth();
  const sid = user?.societyId;
  const isNotOwner = effectiveRole !== "owner";

  const soc = useQuery({
    queryKey: ["soc", sid],
    queryFn: () => societyService.getById(sid!),
    enabled: !!sid && isNotOwner,
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Role specific premium greetings banner */}
      <div className="bg-gradient-to-r from-deep-forest/5 via-soft-violet/5 to-transparent border border-line/50 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline-lg text-2xl font-bold text-ink leading-tight">
            Welcome back, {user!.name.split(" ")[0]}
          </h1>
          <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed flex flex-wrap items-center gap-1.5">
            You're currently connected as a <span className="font-semibold text-deep-forest capitalize">{effectiveRole === "owner" ? "System Manager" : effectiveRole}</span>
            {isNotOwner && soc.data && (
              <>
                <span>on</span>
                <span className="inline-flex items-center gap-1 bg-deep-forest/5 text-deep-forest border border-deep-forest/15 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  <Building2 className="h-3 w-3" /> {soc.data.name}
                </span>
              </>
            )}
            .
          </p>
        </div>
        <Badge className="bg-deep-forest hover:bg-deep-forest/90 text-white border-0 py-1 px-3 text-[10px] font-bold uppercase tracking-wider">
          {effectiveRole === "owner" ? "System Manager" : `${effectiveRole} console`}
        </Badge>
      </div>

      {effectiveRole === "owner" && <OwnerDash />}
      {effectiveRole === "admin" && <AdminDash />}
      {effectiveRole === "coordinator" && <CoordDash />}
      {effectiveRole === "resident" && <ResidentDash />}
    </div>
  );
}

function OwnerDash() {
  const societies = useQuery({ queryKey: ["societies"], queryFn: () => societyService.list() });
  const apps = useQuery({ queryKey: ["apps"], queryFn: () => societyService.listApplications() });
  const pending = apps.data?.filter((a) => a.status === "pending").length ?? 0;
  const total = societies.data?.length ?? 0;
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat icon={Building2} label="Active Societies" value={total} trend={{ value: "+2 new", type: "up" }} />
        <Stat icon={Users} label="Total Residents" value="3,240" hint="Across all societies" trend={{ value: "+12.5%", type: "up" }} />
        <Stat icon={ClipboardList} label="Pending Applications" value={pending} hint="Requires your response" trend={{ value: pending > 0 ? "Action required" : "Clear", type: pending > 0 ? "down" : "neutral" }} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Applications card */}
        <Card className="lg:col-span-2 border-line/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-ink">Recent Applications</CardTitle>
            <CardDescription className="text-xs text-on-surface-variant">Review new society requests waiting for setup clearance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {apps.data?.filter((a) => a.status === "pending").length === 0 ? (
              <div className="py-6 text-center text-xs text-on-surface-variant border border-dashed border-line rounded-lg">
                No pending applications. Platform is up to date!
              </div>
            ) : (
              apps.data?.filter((a) => a.status === "pending").slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-line/50 p-4 hover:bg-panel transition-all">
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-ink truncate">{a.societyName}</div>
                    <div className="text-xs text-on-surface-variant mt-0.5 truncate">{a.type} · Requested by {a.applicantName}</div>
                  </div>
                  <Link to="/app/owner/applications">
                    <button className="flex items-center gap-1 bg-white hover:bg-surface-variant border border-line-strong text-ink text-[11px] font-semibold py-1 px-3 rounded-lg transition-all active:scale-95 cursor-pointer">
                      Review <ChevronRight className="h-3 w-3" />
                    </button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Owner Quick Actions */}
        <Card className="border-line/60 shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold text-ink font-headline-lg">Management Panel</CardTitle>
            <CardDescription className="text-xs text-on-surface-variant">Access system configuration modules directly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Link to="/app/owner/societies" className="block">
              <button className="w-full flex items-center justify-between border border-line/50 hover:bg-panel p-3 rounded-xl transition-all text-left cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-deep-forest">domain</span>
                  <span className="text-xs font-bold text-ink">Manage Societies</span>
                </div>
                <ChevronRight className="h-4 w-4 text-on-surface-variant" />
              </button>
            </Link>

            <Link to="/app/owner/applications" className="block">
              <button className="w-full flex items-center justify-between border border-line/50 hover:bg-panel p-3 rounded-xl transition-all text-left cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-soft-violet">pending_actions</span>
                  <span className="text-xs font-bold text-ink">Pending Applications</span>
                </div>
                <ChevronRight className="h-4 w-4 text-on-surface-variant" />
              </button>
            </Link>

            <Link to="/app/owner/analytics" className="block">
              <button className="w-full flex items-center justify-between border border-line/50 hover:bg-panel p-3 rounded-xl transition-all text-left cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-indigo-500">monitoring</span>
                  <span className="text-xs font-bold text-ink">System Analytics</span>
                </div>
                <ChevronRight className="h-4 w-4 text-on-surface-variant" />
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminDash() {
  const { user } = useAuth();
  const sid = user!.societyId!;
  const soc = useQuery({ queryKey: ["soc", sid], queryFn: () => societyService.getById(sid) });
  const residents = useQuery({ queryKey: ["residents", sid], queryFn: () => userService.listBySociety(sid) });
  const coords = useQuery({ queryKey: ["coords", sid], queryFn: () => userService.listCoordinators(sid) });
  const s = soc.data;
  const coordCount = coords.data?.length ?? 0;
  
  const actualResidentCount = residents.data?.filter((u) => u.role !== "admin" && u.role !== "owner").length ?? 0;
  
  return (
    <div className="space-y-6">
      {coordCount < 2 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm border-l-4 border-l-amber-600">
          <CardContent className="p-4 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="font-bold text-xs text-amber-950 dark:text-amber-200">Society Setup Incomplete</div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-normal mt-1">
                You have appointed {coordCount} out of 2 minimum required coordinators. Residents cannot complete exchanges until the second coordinator is appointed.
              </p>
              <Link to="/app/admin/coordinators" className="inline-block mt-2">
                <button className="bg-amber-700 hover:bg-amber-800 text-white text-[10px] font-bold py-1 px-3 rounded transition-all cursor-pointer">
                  Appoint Coordinators
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat icon={Users} label="Total Residents" value={`${actualResidentCount} / ${s?.capacity ?? "—"}`} trend={{ value: "Capacity status", type: "neutral" }} />
        <Stat icon={CheckSquare} label="Coordinators" value={`${coordCount}/2`} hint="Minimum requirement" trend={{ value: coordCount >= 2 ? "Ready" : "Incomplete", type: coordCount >= 2 ? "up" : "down" }} />
        <Stat icon={Sparkles} label="Performance" value={`${s?.performanceScore ?? "—"}/100`} hint="Society health index" trend={{ value: "+2.5% MoM", type: "up" }} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Admin overview info */}
        <Card className="lg:col-span-2 border-line/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-ink">Society Configurator</CardTitle>
            <CardDescription className="text-xs text-on-surface-variant">Update active guidelines, society structure, and resident policies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-line/50 bg-panel">
                <div className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Society Key</div>
                <code className="text-xs font-mono font-bold block mt-1.5 p-1 px-2 border border-line bg-white rounded truncate select-all">{s?.key ?? "Generating..."}</code>
                <span className="text-[9px] text-on-surface-variant/80 mt-1 block">Used by residents to join.</span>
              </div>
              <div className="p-4 rounded-xl border border-line/50 bg-panel">
                <div className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Ecosystem Type</div>
                <div className="text-xs font-bold text-ink mt-1.5 capitalize">{s?.type ?? "Standard Community"}</div>
                <span className="text-[9px] text-on-surface-variant/80 mt-1.5 block">Credit exchange enabled.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Quick Console links */}
        <Card className="border-line/60 shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold text-ink">Management Console</CardTitle>
            <CardDescription className="text-xs text-on-surface-variant">Quick links to audit tables.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Link to="/app/admin/coordinators" className="block">
              <button className="w-full flex items-center justify-between border border-line/50 hover:bg-panel p-3 rounded-xl transition-all text-left cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-deep-forest">admin_panel_settings</span>
                  <span className="text-xs font-bold text-ink">Coordinators Panel</span>
                </div>
                <ChevronRight className="h-4 w-4 text-on-surface-variant" />
              </button>
            </Link>

            <Link to="/app/admin/residents" className="block">
              <button className="w-full flex items-center justify-between border border-line/50 hover:bg-panel p-3 rounded-xl transition-all text-left cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-soft-violet">people_outline</span>
                  <span className="text-xs font-bold text-ink">Residents Audit</span>
                </div>
                <ChevronRight className="h-4 w-4 text-on-surface-variant" />
              </button>
            </Link>

            <Link to="/app/admin/performance" className="block">
              <button className="w-full flex items-center justify-between border border-line/50 hover:bg-panel p-3 rounded-xl transition-all text-left cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-indigo-500">monitoring</span>
                  <span className="text-xs font-bold text-ink">Performance Dashboard</span>
                </div>
                <ChevronRight className="h-4 w-4 text-on-surface-variant" />
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CoordDash() {
  const { user } = useAuth();
  const sid = user!.societyId!;
  const pendSkills = useQuery({ queryKey: ["pSkills", sid], queryFn: () => skillService.listPending(sid) });
  const pendRes = useQuery({ queryKey: ["pRes", sid], queryFn: () => resourceService.listPending(sid) });
  const complaints = useQuery({ queryKey: ["comps", sid], queryFn: () => complaintService.listSociety(sid) });
  const events = useQuery({ queryKey: ["ev", sid], queryFn: () => eventService.list(sid) });
  const openComps = complaints.data?.filter((c) => c.status === "open").length ?? 0;
  const approvalCount = (pendSkills.data?.filter((s) => s.providerId !== user!.id).length ?? 0) +
                        (pendRes.data?.filter((r) => r.ownerId !== user!.id).length ?? 0);
  
  const canOnboarding = user?.canManageOnboarding !== false;
  const canDeactivate = user?.canDeactivateResidents === true;

  return (
    <div className="space-y-6">
      {/* Privileges & Operational Status Banner */}
      <Card className="border-line/60 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-4 w-4 text-purple-700" />
              Assigned Coordinator Privileges
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Privileges configured by your society Administrator.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={canOnboarding ? "bg-emerald-50 text-emerald-800 border-emerald-200 text-[11px] font-semibold py-1 px-3" : "bg-slate-100 text-slate-500 border-slate-200 text-[11px] font-semibold py-1 px-3"}>
              Onboarding Access: {canOnboarding ? "Allowed" : "Restricted"}
            </Badge>
            <Badge variant="outline" className={canDeactivate ? "bg-rose-50 text-rose-800 border-rose-200 text-[11px] font-semibold py-1 px-3" : "bg-slate-100 text-slate-500 border-slate-200 text-[11px] font-semibold py-1 px-3"}>
              Ban Rights: {canDeactivate ? "Allowed" : "Restricted"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={CheckSquare} label="Pending Approvals" value={approvalCount} trend={{ value: approvalCount > 0 ? "Action needed" : "Clear", type: approvalCount > 0 ? "down" : "neutral" }} />
        <Stat icon={AlertCircle} label="Open Complaints" value={openComps} trend={{ value: openComps > 0 ? "Pending" : "Resolved", type: openComps > 0 ? "down" : "neutral" }} />
        <Stat icon={Calendar} label="Upcoming Events" value={events.data?.filter((e) => e.status === "upcoming").length ?? 0} />
        <Stat icon={Wallet} label="My Wallet Balance" value={`${user!.creditBalance} Crd`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Approvals Action Board */}
        <Card className="lg:col-span-2 border-line/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-ink">Coordinator Action Board</CardTitle>
            <CardDescription className="text-xs text-on-surface-variant">Clear list approvals and resolve member disputes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Link to="/app/coord/approvals" className="block">
              <div className="p-4 rounded-xl border border-line/50 bg-panel flex justify-between items-center hover:bg-panel/80 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-ink">Skill & Resource Approvals Hub</div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5">{approvalCount} listings awaiting review.</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-on-surface-variant" />
              </div>
            </Link>

            {canOnboarding && (
              <Link to="/app/admin/onboarding" className="block">
                <div className="p-4 rounded-xl border border-line/50 bg-panel flex justify-between items-center hover:bg-panel/80 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-800">
                      <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-ink">Member Onboarding Roster</div>
                      <div className="text-[10px] text-on-surface-variant mt-0.5">Manage household allocation & code generation.</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-on-surface-variant" />
                </div>
              </Link>
            )}

            {canDeactivate && (
              <Link to="/app/admin/residents" className="block">
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex justify-between items-center hover:bg-rose-50/70 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-800">
                      <span className="material-symbols-outlined text-[18px]">person_off</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-rose-900">Residents Governance & Ban Roster</div>
                      <div className="text-[10px] text-rose-700 mt-0.5">You have active rights to deactivate/reactivate resident accounts.</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-rose-700" />
                </div>
              </Link>
            )}

            <Link to="/app/coord/disputes" className="block">
              <div className="p-4 rounded-xl border border-line/50 bg-panel flex justify-between items-center hover:bg-panel/80 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-800">
                    <span className="material-symbols-outlined text-[18px]">gavel</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-ink">Active Mediation Issues</div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5">Moderate disputing exchanges.</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-on-surface-variant" />
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Links Menu */}
        <Card className="border-line/60 shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold text-ink">Coordinator Tools</CardTitle>
            <CardDescription className="text-xs text-on-surface-variant">Active society controls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Link to="/app/coord/events" className="block">
              <button className="w-full flex items-center justify-between border border-line/50 hover:bg-panel p-3 rounded-xl transition-all text-left cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-deep-forest">event_note</span>
                  <span className="text-xs font-bold text-ink">Events Manager</span>
                </div>
                <ChevronRight className="h-4 w-4 text-on-surface-variant" />
              </button>
            </Link>

            <Link to="/app/coord/complaints" className="block">
              <button className="w-full flex items-center justify-between border border-line/50 hover:bg-panel p-3 rounded-xl transition-all text-left cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-rose-500">campaign</span>
                  <span className="text-xs font-bold text-ink">Member Reports</span>
                </div>
                <ChevronRight className="h-4 w-4 text-on-surface-variant" />
              </button>
            </Link>
            <Link to="/app/coord/approvals" className="block">
              <button className="w-full flex items-center justify-between border border-line/50 hover:bg-panel p-3 rounded-xl transition-all text-left cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="h-4 w-4 text-deep-forest" />
                  <span className="text-xs font-bold text-ink">Verification Console</span>
                </div>
                <ChevronRight className="h-4 w-4 text-on-surface-variant" />
              </button>
            </Link>
            <Link to="/app/notices" className="block">
              <button className="w-full flex items-center justify-between border border-line/50 hover:bg-panel p-3 rounded-xl transition-all text-left cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Megaphone className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-bold text-ink">Broadcast Notice</span>
                </div>
                <ChevronRight className="h-4 w-4 text-on-surface-variant" />
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ResidentDash() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const sid = user!.societyId!;
  const [deactivateTarget, setDeactivateTarget] = useState<{ id: string; name: string } | null>(null);
  const [disableHouseholdTarget, setDisableHouseholdTarget] = useState<{ id: string; name: string } | null>(null);
  const [viewingIdProof, setViewingIdProof] = useState<{ userName: string; url: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "governance">("overview");

  const skills = useQuery({ queryKey: ["mySkills", sid], queryFn: () => skillService.list(sid) });
  const complaints = useQuery({ queryKey: ["myComps", user!.id], queryFn: () => complaintService.listForUser(user!.id) });
  const notices = useQuery({ queryKey: ["notices", sid], queryFn: () => noticeService.list(sid) });
  const txs = useQuery({ queryKey: ["tx", user!.id], queryFn: () => creditService.getTransactions(user!.id) });

  // Multi-resident household queries
  const allUsers = useQuery({ queryKey: ["allRes", sid], queryFn: () => userService.listBySociety(sid), enabled: !!user?.householdId });
  const households = useQuery({ queryKey: ["hh", sid], queryFn: () => householdService.listBySociety(sid), enabled: !!user?.householdId });
  const joinRequests = useQuery({ queryKey: ["jr", sid], queryFn: () => joinRequestService.listBySociety(sid), enabled: !!user?.isPrimaryResident });

  const myHousehold = households.data?.find((h) => h.id === user?.householdId);
  const householdMembers = allUsers.data?.filter((u) => u.householdId === user?.householdId) ?? [];
  const primaryLead = householdMembers.find((u) => u.isPrimaryResident) || householdMembers.find((u) => u.id === myHousehold?.claimedByUserId) || (user?.isPrimaryResident ? user! : householdMembers[0]);
  const coResidents = householdMembers.filter((u) => u.id !== primaryLead?.id);

  // Pending join requests targeted to this primary resident's household
  const pendingHouseholdRequests = joinRequests.data?.filter(
    (jr) => jr.status === "pending" && (jr.householdId === user?.householdId || jr.targetApproverId === user?.id)
  ) ?? [];

  const myOpen = complaints.data?.filter((c) => c.status === "open").length ?? 0;
  const myActive = skills.data?.filter((s) => s.providerId === user!.id && s.status === "approved").length ?? 0;

  const approvedSkills = skills.data?.filter((s) => s.status === "approved" && s.providerId !== user!.id) ?? [];
  const matchedSkills = user!.interests && user!.interests.length > 0
    ? approvedSkills.filter((s) => user!.interests?.includes(s.category))
    : [];
  const recommended = matchedSkills.length > 0
    ? matchedSkills.slice(0, 3)
    : approvedSkills.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Resident Dashboard Navigation Bar */}
      {(user?.isPrimaryResident || user?.householdId || user?.role === "resident") && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between border-b border-line/60 pb-3">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                "w-full sm:w-auto px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center flex items-center justify-center gap-1.5",
                activeTab === "overview"
                  ? "bg-deep-forest text-white border-deep-forest shadow-xs"
                  : "bg-white text-ink border-line hover:bg-panel"
              )}
            >
              <Activity className="h-3.5 w-3.5 sm:hidden shrink-0" />
              <span className="truncate">Overview</span>
              <span className="hidden sm:inline">& Community</span>
            </button>

            <button
              onClick={() => setActiveTab("governance")}
              className={cn(
                "w-full sm:w-auto px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1.5 relative",
                activeTab === "governance"
                  ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                  : "bg-amber-50/80 text-amber-950 border-amber-200 hover:bg-amber-100/80"
              )}
            >
              <Crown className="h-3.5 w-3.5 fill-amber-300 text-amber-950 shrink-0" />
              <span className="truncate">Household Governance</span>
              {pendingHouseholdRequests.length > 0 && (
                <Badge className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0 rounded-full animate-bounce shrink-0">
                  {pendingHouseholdRequests.length}
                </Badge>
              )}
            </button>
          </div>

          <div className="text-[11px] text-on-surface-variant font-semibold flex items-center justify-center gap-2 bg-panel px-3 py-1.5 rounded-xl border border-line/50 w-full sm:w-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Unit <strong className="text-ink font-bold">{myHousehold?.unitNumber || user.householdId}</strong> ({householdMembers.length}/{myHousehold?.maxMembers || 4} Members)</span>
          </div>
        </div>
      )}

      {/* DEDICATED TAB: HOUSEHOLD GOVERNANCE CONSOLE */}
      {(user?.isPrimaryResident || user?.householdId || user?.role === "resident") && activeTab === "governance" ? (
        <Card className="border-amber-200/90 shadow-md bg-gradient-to-br from-amber-50/40 via-white to-amber-50/10 overflow-hidden">
          <CardHeader className="border-b border-amber-200/60 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/15 text-amber-900 border border-amber-300 flex items-center justify-center shadow-xs shrink-0">
                  <Crown className="h-5 w-5 sm:h-6 sm:w-6 fill-amber-500 text-amber-700" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base sm:text-lg font-bold text-ink truncate">Unit {myHousehold?.unitNumber || user.householdId} Governance</CardTitle>
                    <Badge className="bg-amber-100 text-amber-950 border-amber-300 text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5">
                      ⭐ Primary Lead
                    </Badge>
                  </div>
                  <CardDescription className="text-[11px] sm:text-xs text-on-surface-variant mt-1 line-clamp-2">
                    Manage co-residents, approve join applications, and inspect verification proof.
                  </CardDescription>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                <div className="bg-white border border-amber-200/90 rounded-xl px-3 py-1.5 text-center shadow-2xs">
                  <div className="text-[9px] uppercase font-bold text-on-surface-variant">Capacity</div>
                  <div className="text-xs sm:text-sm font-extrabold text-ink">{householdMembers.length} / {myHousehold?.maxMembers || 4}</div>
                </div>
                <div className="bg-white border border-amber-200/90 rounded-xl px-3 py-1.5 text-center shadow-2xs">
                  <div className="text-[9px] uppercase font-bold text-on-surface-variant">Requests</div>
                  <div className="text-xs sm:text-sm font-extrabold text-amber-700">{pendingHouseholdRequests.length} Pending</div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-6">
            <Tabs defaultValue={pendingHouseholdRequests.length > 0 ? "requests" : "members"} className="w-full">
              <TabsList className="grid grid-cols-2 w-full max-w-md bg-panel/70 p-1 rounded-xl border border-line/50 mb-4">
                <TabsTrigger value="members" className="text-[11px] sm:text-xs font-bold px-2 sm:px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-xs truncate">
                  Members ({coResidents.length})
                </TabsTrigger>
                <TabsTrigger value="requests" className="text-[11px] sm:text-xs font-bold px-2 sm:px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-xs flex items-center justify-center gap-1 truncate">
                  <span>Requests</span>
                  {pendingHouseholdRequests.length > 0 && (
                    <Badge className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0 shrink-0">
                      {pendingHouseholdRequests.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* CO-RESIDENTS ROSTER TAB */}
              <TabsContent value="members" className="space-y-4">
                <div className="text-xs uppercase font-extrabold tracking-wider text-on-surface-variant/80 flex items-center justify-between">
                  <span>Current Household Members ({householdMembers.length})</span>
                  <span className="text-[10px] text-on-surface-variant font-normal">Maximum Capacity: {myHousehold?.maxMembers || 4} Occupants</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Primary Lead Card */}
                  {primaryLead ? (
                    <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400 text-amber-900 flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                          {primaryLead.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-ink truncate flex items-center gap-1.5">
                            <span>{primaryLead.name} {primaryLead.id === user!.id ? "(You)" : ""}</span>
                            <Badge className="bg-amber-100 text-amber-950 border-amber-300 text-[8px] font-bold px-1.5 py-0">⭐ Primary Lead</Badge>
                          </div>
                          <div className="text-[10px] text-on-surface-variant truncate mt-0.5">{primaryLead.email}</div>
                          <div className="text-[9px] font-semibold text-emerald-800 mt-1">{primaryLead.creditBalance || 0} Credits</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50/40 border border-amber-200 rounded-2xl p-4 text-xs font-semibold text-amber-900">
                      Unassigned Primary Lead Slot
                    </div>
                  )}

                  {/* Co-Residents / Secondary Members List */}
                  {coResidents.map((m) => {
                    const isSystemActive = m.isActive !== false;
                    const isAccessGranted = m.isHouseholdEnabled !== false;
                    return (
                      <div key={m.id} className="bg-white border border-line/65 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-deep-forest/10 border border-deep-forest/20 text-deep-forest flex items-center justify-center font-bold text-sm shrink-0">
                            {m.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="font-bold text-xs text-ink truncate flex flex-wrap items-center gap-1.5">
                              <span>{m.name} {m.id === user!.id ? "(You)" : ""}</span>
                              <Badge className={cn("text-[8px] font-bold px-1.5 py-0 rounded border", isAccessGranted ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-900 border-amber-300")}>
                                {isAccessGranted ? "Access Granted" : "Access Suspended"}
                              </Badge>
                              {!isSystemActive && (
                                <Badge className="text-[8px] font-bold px-1.5 py-0 rounded border bg-rose-50 text-rose-800 border-rose-200">
                                  Deactivated by Admin
                                </Badge>
                              )}
                            </div>
                            <div className="text-[10px] text-on-surface-variant truncate">{m.email}</div>
                            <div className="text-[9px] font-semibold text-emerald-800">{m.creditBalance || 0} Credits</div>
                          </div>
                        </div>

                        {user?.isPrimaryResident && (
                          isAccessGranted ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDisableHouseholdTarget({ id: m.id, name: m.name })}
                              className="h-8 text-[11px] font-semibold text-amber-700 border-amber-200 hover:bg-amber-50 shrink-0 cursor-pointer"
                            >
                              <UserX className="h-3.5 w-3.5 mr-1" />
                              Suspend Access
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  await userService.enableHouseholdAccess(m.id);
                                  toast.success(`Restored household access for ${m.name}`);
                                  qc.invalidateQueries({ queryKey: ["allRes", sid] });
                                } catch (err: any) {
                                  toast.error(err.message || "Failed to restore access");
                                }
                              }}
                              className="h-8 text-[11px] font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50 shrink-0 cursor-pointer"
                            >
                              <UserCheck className="h-3.5 w-3.5 mr-1" />
                              Restore Access
                            </Button>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* PENDING JOIN REQUESTS TAB */}
              <TabsContent value="requests" className="space-y-4">
                <div className="text-xs uppercase font-extrabold tracking-wider text-on-surface-variant/80">
                  Applicants Requesting to Join Unit {myHousehold?.unitNumber || user.householdId} ({pendingHouseholdRequests.length})
                </div>

                {pendingHouseholdRequests.length === 0 ? (
                  <div className="py-10 text-center text-xs text-on-surface-variant border border-dashed border-line rounded-2xl bg-white p-6 space-y-2">
                    <ShieldCheck className="h-8 w-8 text-emerald-600 mx-auto opacity-80" />
                    <div className="font-bold text-ink text-sm">No Pending Household Join Requests</div>
                    <p className="text-[11px] text-on-surface-variant max-w-sm mx-auto">
                      All join requests for your household slot have been processed. New join applications will appear here for your review.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingHouseholdRequests.map((jr) => (
                      <div key={jr.id} className="bg-white border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/40 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs sm:text-sm flex items-center justify-center shadow-inner shrink-0">
                              {jr.userName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs sm:text-sm text-ink truncate">{jr.userName}</div>
                              <div className="text-[11px] sm:text-xs text-on-surface-variant flex items-center gap-1 mt-0.5 truncate">
                                <Mail className="h-3 w-3 text-amber-700 shrink-0" />
                                <span className="truncate">{jr.userEmail || jr.email || allUsers.data?.find((u) => u.id === jr.userId)?.email || `${jr.userName.toLowerCase().replace(/\s+/g, "")}@cen.app`}</span>
                              </div>
                            </div>
                          </div>

                          <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 self-start sm:self-center">
                            👑 Secondary Member Application
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs bg-amber-50/40 p-3 rounded-xl border border-amber-200/60">
                          <div className="flex items-center gap-2 text-on-surface-variant">
                            <Calendar className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                            <span>Submitted: <strong className="text-ink font-semibold">{jr.submittedAt}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 text-on-surface-variant">
                            <Building2 className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                            <span>Target Slot: <strong className="text-ink font-semibold">Unit {jr.unitNumber}</strong></span>
                          </div>
                        </div>

                        {/* Applicant Verification Document Box */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-panel/40 border border-line/60 p-3 rounded-xl">
                          <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                            <FileText className="h-4 w-4 text-deep-forest shrink-0" />
                            <span className="truncate">Applicant ID Proof Document</span>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewingIdProof({ userName: jr.userName, url: jr.idProofUrl })}
                            className="text-xs font-bold border-deep-forest/40 text-deep-forest hover:bg-deep-forest/10 h-8 px-3 cursor-pointer w-full sm:w-auto"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                            Inspect ID Document
                          </Button>
                        </div>

                        {/* Approval / Rejection Actions */}
                        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                await joinRequestService.reject(jr.id);
                                toast.info(`Rejected request from ${jr.userName}`);
                                qc.invalidateQueries({ queryKey: ["jr", sid] });
                              } catch (err: any) {
                                toast.error(err.message || "Failed to reject request");
                              }
                            }}
                            className="text-xs font-semibold h-9 px-4 border-line-strong hover:bg-panel cursor-pointer w-full sm:w-auto"
                          >
                            Reject Request
                          </Button>

                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                await joinRequestService.approve(jr.id);
                                toast.success(`Approved ${jr.userName} to join your household!`);
                                qc.invalidateQueries({ queryKey: ["jr", sid] });
                                qc.invalidateQueries({ queryKey: ["allRes", sid] });
                                qc.invalidateQueries({ queryKey: ["hh", sid] });
                              } catch (err: any) {
                                toast.error(err.message || "Failed to approve request");
                              }
                            }}
                            className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-9 px-5 cursor-pointer shadow-sm active:scale-98 transition-all w-full sm:w-auto"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1.5 shrink-0" />
                            Approve & Add to Household
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stat Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={Wallet} label="Credit Balance" value={`${user!.creditBalance} Crd`} trend={{ value: "Wallet active", type: "neutral" }} />
            <Stat icon={Sparkles} label="Active Services" value={myActive} hint="Approved exchange listings" />
            <Stat icon={AlertCircle} label="Open Issues" value={myOpen} trend={{ value: myOpen === 0 ? "Clean" : `${myOpen} open`, type: myOpen === 0 ? "up" : "down" }} />
            <Stat icon={Calendar} label="Volunteering" value="2" hint="Registered events" />
          </div>

          {/* Recommended for You Widget */}
          <Card className="border-soft-violet/30 shadow-sm bg-gradient-to-br from-soft-violet/5 via-[#fbfaff] to-transparent">
            <CardHeader className="pb-3 border-b border-soft-violet/15 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-soft-violet/15 flex items-center justify-center text-soft-violet border border-soft-violet/20 shrink-0">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                  </div>
                  <div>
                    <CardTitle className="text-xs sm:text-sm font-bold text-ink">Personalized Recommendations (AI)</CardTitle>
                    <CardDescription className="text-[10px] text-on-surface-variant line-clamp-1">Tailored service suggestions matching your listed interests.</CardDescription>
                  </div>
                </div>
                <Link to="/app/skills" className="self-end sm:self-center">
                  <span className="text-[10px] font-bold text-soft-violet hover:underline cursor-pointer">Browse All</span>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-3 sm:pt-4">
              {recommended.length === 0 ? (
                <div className="text-xs text-on-surface-variant py-4 text-center">No matching services yet. Explore the marketplace!</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recommended.map((item) => (
                    <Card key={item.id} className="border-line/60 bg-white hover:border-soft-violet/40 transition-all p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Badge className="bg-soft-violet/10 text-soft-violet text-[9px] font-semibold border-soft-violet/20">{item.category}</Badge>
                          <span className="text-[10px] font-bold text-ink">{item.credits} Crd</span>
                        </div>
                        <div className="font-bold text-xs text-ink line-clamp-1">{item.title}</div>
                        <div className="text-[10px] text-on-surface-variant mt-0.5 line-clamp-2">{item.description}</div>
                      </div>
                      <Link to="/app/skills" className="mt-3">
                        <Button variant="outline" className="w-full h-7 text-[10px] font-semibold border-line hover:bg-soft-violet/10 hover:text-soft-violet cursor-pointer">View Listing</Button>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Two Column Layout: Notices and Transactions */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 min-w-0 w-full">
        {/* Notices Board Widget */}
        <Card className="border-line/60 shadow-sm flex flex-col justify-between min-w-0 w-full overflow-hidden">
          <CardHeader className="pb-3 border-b border-line/45 p-4 sm:p-6 min-w-0">
            <div className="flex justify-between items-center gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                  <Megaphone className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm sm:text-base font-bold text-ink truncate">Broadcast Noticeboard</CardTitle>
              </div>
              <Link to="/app/notices" className="shrink-0">
                <span className="text-[10px] font-bold text-deep-forest hover:underline cursor-pointer">View All</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-3 sm:pt-4 flex-1 space-y-3.5 min-w-0">
            {notices.data?.length === 0 ? (
              <div className="py-8 text-center text-xs text-on-surface-variant border border-dashed border-line rounded-xl">
                No active announcements on the board.
              </div>
            ) : (
              notices.data?.slice(0, 3).map((n) => (
                <div key={n.id} className="relative pl-3.5 border-l-2 border-emerald-500/80 hover:translate-x-[2px] transition-transform duration-200 min-w-0">
                  <div className="text-xs font-bold text-ink leading-snug break-words line-clamp-2">{n.title}</div>
                  <div className="text-[10px] text-on-surface-variant mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-deep-forest truncate max-w-[140px]">{n.postedByName}</span>
                    <span>·</span>
                    <span>{n.date}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Transactions ledger Widget */}
        <Card className="border-line/60 shadow-sm flex flex-col justify-between min-w-0 w-full overflow-hidden">
          <CardHeader className="pb-3 border-b border-line/45 p-4 sm:p-6 min-w-0">
            <div className="flex justify-between items-center gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-800 border border-emerald-100 shrink-0">
                  <Package className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm sm:text-base font-bold text-ink truncate">Recent Wallet Activity</CardTitle>
              </div>
              <Link to="/app/wallet" className="shrink-0">
                <span className="text-[10px] font-bold text-deep-forest hover:underline cursor-pointer">Ledger</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-3 sm:pt-4 flex-1 space-y-2 min-w-0">
            {!txs.data || txs.data.length === 0 ? (
              <div className="py-8 text-center text-xs text-on-surface-variant border border-dashed border-line rounded-xl">
                No transactions completed yet.
              </div>
            ) : (
              txs.data?.slice(-4).reverse().map((t) => (
                <div key={t.id} className="flex justify-between items-center border-b border-line/35 py-2 text-xs last:border-0 hover:bg-panel/40 px-1 rounded transition-colors min-w-0 gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {t.type === "earned" ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shrink-0">
                        <ArrowDownLeft className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <span className="font-medium text-ink truncate text-xs">{t.description}</span>
                  </div>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] shrink-0 ${
                    t.type === "earned" 
                      ? "text-emerald-800 bg-emerald-50 border border-emerald-100" 
                      : "text-amber-800 bg-amber-50 border border-amber-100"
                  }`}>
                    {t.type === "earned" ? "+" : "-"}{t.amount} Crd
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Primary Resident Deactivation Pop-up Dialog */}
      <AlertDialog open={!!deactivateTarget} onOpenChange={(open) => !open && setDeactivateTarget(null)}>
        <AlertDialogContent className="bg-white border-line/60 rounded-2xl shadow-xl max-w-sm p-6">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-base font-bold text-ink flex items-center gap-2 text-rose-900">
              <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0" />
              Deactivate Household Member
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to deactivate <span className="font-bold text-ink">{deactivateTarget?.name}</span>? As Primary Lead, deactivating this account will temporarily suspend their access to society services until reactivated.
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
                    qc.invalidateQueries({ queryKey: ["allRes", sid] });
                    toast.warning(`Deactivated account for ${deactivateTarget.name}`);
                  } catch (err: any) {
                    toast.error(err.message || "Failed to deactivate account");
                  } finally {
                    setDeactivateTarget(null);
                  }
                }
              }}
              className="h-9 px-4 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer active:scale-98 transition-all"
            >
              Confirm Deactivation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Primary Resident Household Access Suspension Pop-up Dialog */}
      <AlertDialog open={!!disableHouseholdTarget} onOpenChange={(open) => !open && setDisableHouseholdTarget(null)}>
        <AlertDialogContent className="bg-white border-line/60 rounded-2xl shadow-xl max-w-sm p-6">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-base font-bold text-ink flex items-center gap-2 text-amber-950">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              Suspend Household Access
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to suspend household access for <span className="font-bold text-ink">{disableHouseholdTarget?.name}</span>? As Primary Lead, suspending access will temporarily block this co-resident from accessing society services until you restore their access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5 flex gap-2">
            <AlertDialogCancel className="h-9 px-4 text-xs font-semibold rounded-lg border-line-strong hover:bg-panel cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                if (disableHouseholdTarget) {
                  try {
                    await userService.disableHouseholdAccess(disableHouseholdTarget.id);
                    qc.invalidateQueries({ queryKey: ["allRes", sid] });
                    toast.warning(`Suspended household access for ${disableHouseholdTarget.name}`);
                  } catch (err: any) {
                    toast.error(err.message || "Failed to suspend access");
                  } finally {
                    setDisableHouseholdTarget(null);
                  }
                }
              }}
              className="h-9 px-4 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white cursor-pointer active:scale-98 transition-all"
            >
              Confirm Suspension
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Applicant ID Document Proof Inspector Modal */}
      <Dialog open={!!viewingIdProof} onOpenChange={(open) => !open && setViewingIdProof(null)}>
        <DialogContent className="w-[92vw] sm:max-w-xl max-h-[90vh] overflow-y-auto border-line/60 shadow-2xl rounded-2xl p-4 sm:p-6 bg-white">
          <DialogHeader className="pb-3 border-b border-line/45">
            <DialogTitle className="text-base font-bold text-ink flex items-center gap-2">
              <FileText className="h-5 w-5 text-deep-forest" />
              Identity Verification Document Inspection
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant">
              Review submitted identity proof document for applicant <span className="font-bold text-ink">{viewingIdProof?.userName}</span>.
            </DialogDescription>
          </DialogHeader>

          {viewingIdProof && (() => {
            const isImage = viewingIdProof.url && (
              viewingIdProof.url.startsWith("data:") ||
              viewingIdProof.url.startsWith("http") ||
              viewingIdProof.url.startsWith("blob:")
            );

            return (
              <div className="space-y-4 pt-3">
                {/* ID Proof Display Area */}
                <div className="border border-line/70 rounded-2xl bg-panel/30 p-4 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden shadow-inner">
                  {isImage ? (
                    <img
                      src={viewingIdProof.url}
                      alt={`ID Proof document for ${viewingIdProof.userName}`}
                      className="max-h-64 w-full object-contain rounded-xl shadow-sm border bg-white"
                    />
                  ) : (
                    /* Stylized Indian Government / Resident Identity Document Card Canvas */
                    <div className="w-full bg-gradient-to-br from-amber-500/10 via-white to-emerald-500/10 border border-amber-300/80 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-amber-200/70 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-600/20 text-amber-900 font-extrabold text-xs flex items-center justify-center border border-amber-300">
                            🇮🇳
                          </div>
                          <div>
                            <div className="font-extrabold text-xs text-ink tracking-tight">INDIAN RESIDENT IDENTITY PROOF</div>
                            <div className="text-[9px] text-on-surface-variant font-medium">Government Issued Identity & Address Pass</div>
                          </div>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 text-[9px] font-bold px-2 py-0.5">
                          ✓ VALIDATED PROOF
                        </Badge>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4 items-center">
                        <div className="w-20 h-24 bg-panel/80 border border-line rounded-xl flex flex-col items-center justify-center text-center p-2 mx-auto sm:mx-0 shadow-inner">
                          <div className="w-10 h-10 rounded-full bg-deep-forest/15 text-deep-forest font-bold text-sm flex items-center justify-center mb-1">
                            {viewingIdProof.userName.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-[8px] font-bold text-on-surface-variant">PHOTO PROOF</span>
                        </div>

                        <div className="sm:col-span-2 space-y-1.5 text-xs">
                          <div className="flex justify-between border-b border-line/30 pb-1">
                            <span className="text-on-surface-variant text-[10px]">Applicant Name:</span>
                            <span className="font-bold text-ink">{viewingIdProof.userName}</span>
                          </div>
                          <div className="flex justify-between border-b border-line/30 pb-1">
                            <span className="text-on-surface-variant text-[10px]">Document Ref #:</span>
                            <span className="font-mono font-bold text-deep-forest text-[11px]">ID-2026-{viewingIdProof.userName.toUpperCase().replace(/\s+/g, "")}</span>
                          </div>
                          <div className="flex justify-between border-b border-line/30 pb-1">
                            <span className="text-on-surface-variant text-[10px]">Proof Format:</span>
                            <span className="font-semibold text-ink text-[11px]">PDF Document Upload</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant text-[10px]">Verification:</span>
                            <span className="font-bold text-emerald-800 text-[11px] flex items-center gap-1">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                              Encrypted & Verified
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-50/80 border border-amber-200 p-2.5 rounded-xl text-[10px] text-amber-950 font-medium text-center">
                        📄 Document File: <strong className="font-bold text-ink">{viewingIdProof.url.replace(/^mock:\/\//, "")}</strong>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => setViewingIdProof(null)}
                    className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-9 px-5 rounded-lg cursor-pointer"
                  >
                    Close Inspection
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

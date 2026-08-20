import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { householdService, userService } from "@/services";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import { UserX, UserCheck, AlertCircle, Home, Users, Star, Crown } from "lucide-react";
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/admin/residents")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [viewMode, setViewMode] = useState<"grouped" | "table">("grouped");
  const [deactivateTarget, setDeactivateTarget] = useState<{ id: string; name: string } | null>(null);
  
  const sid = user?.societyId || "soc-demo";
  const list = useQuery({ queryKey: ["allRes", sid], queryFn: () => userService.listBySociety(sid) });
  const householdsQuery = useQuery({ queryKey: ["hh", sid], queryFn: () => householdService.listBySociety(sid) });

  const rows = list.data?.filter((u) => u.role !== "admin" && u.role !== "owner" && u.name.toLowerCase().includes(q.toLowerCase())) ?? [];

  // Group residents by Household
  const householdGroups: Record<string, { unitNumber: string; maxMembers: number; members: typeof rows }> = {};
  
  rows.forEach((r) => {
    const hhId = r.householdId || "unassigned";
    const householdObj = householdsQuery.data?.find((h) => h.id === hhId);
    const unitLabel = householdObj ? householdObj.unitNumber : hhId !== "unassigned" ? hhId : "Unassigned Slot";
    const maxM = householdObj?.maxMembers || 4;

    if (!householdGroups[unitLabel]) {
      householdGroups[unitLabel] = {
        unitNumber: unitLabel,
        maxMembers: maxM,
        members: [],
      };
    }
    householdGroups[unitLabel].members.push(r);
  });

  // Sort each household members so primary resident is at top
  Object.values(householdGroups).forEach((g) => {
    g.members.sort((a, b) => {
      if (a.isPrimaryResident && !b.isPrimaryResident) return -1;
      if (!a.isPrimaryResident && b.isPrimaryResident) return 1;
      return 0;
    });
  });

  // Permission check: Admin/Owner always allowed. Coordinator allowed only if canDeactivateResidents is true.
  const canDeactivate = user?.role === "admin" || user?.role === "owner" || (user?.isCoordinator && user?.canDeactivateResidents === true);

  return (
    <div className="space-y-5 animate-page-fade">
      <PageHeader title="Residents Roster & Household Directory" description="View household slot assignments, primary residents, and manage account active status." />
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Input placeholder="Search residents by name or household unit…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm bg-white text-xs h-9 border-line-strong/60" />

        <div className="flex items-center gap-1.5 bg-panel/40 p-1 rounded-xl border border-line/60">
          <Button
            size="sm"
            variant={viewMode === "grouped" ? "default" : "ghost"}
            onClick={() => setViewMode("grouped")}
            className={cn("h-8 text-xs font-semibold px-3 rounded-lg cursor-pointer", viewMode === "grouped" ? "bg-deep-forest text-white shadow-xs" : "text-ink hover:bg-panel")}
          >
            <Home className="h-3.5 w-3.5 mr-1.5" />
            Grouped by Household Slot
          </Button>
          <Button
            size="sm"
            variant={viewMode === "table" ? "default" : "ghost"}
            onClick={() => setViewMode("table")}
            className={cn("h-8 text-xs font-semibold px-3 rounded-lg cursor-pointer", viewMode === "table" ? "bg-deep-forest text-white shadow-xs" : "text-ink hover:bg-panel")}
          >
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Roster Table View
          </Button>
        </div>
      </div>

      {viewMode === "grouped" ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(householdGroups).map(([unitLabel, group]) => {
            const primaryMember = group.members.find((m) => m.isPrimaryResident) || group.members[0];
            const secondaryMembers = group.members.filter((m) => m.id !== primaryMember?.id);

            return (
              <Card key={unitLabel} className="border-line/65 shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden">
                {/* Household Unit Header */}
                <div className="bg-gradient-to-r from-emerald-900 to-deep-forest p-4 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-md flex items-center justify-center font-bold text-xs text-white border border-white/20">
                      <Home className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm tracking-tight">{unitLabel}</h3>
                      <p className="text-[10px] text-emerald-100/80">Household Slot</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-white border-emerald-400/40 text-[10px] font-bold px-2 py-0.5 backdrop-blur-xs">
                    {group.members.length} / {group.maxMembers} Members
                  </Badge>
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Highlighted Primary Resident */}
                  {primaryMember && (
                    <div className="border border-amber-200/90 bg-gradient-to-br from-amber-50/80 via-amber-50/30 to-white rounded-xl p-3.5 space-y-2 relative shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-extrabold tracking-wider text-amber-900 flex items-center gap-1">
                          <Crown className="h-3.5 w-3.5 text-amber-600 fill-amber-500" />
                          Primary Resident (Lead Occupant)
                        </span>
                        <Badge className="bg-amber-100 text-amber-950 border-amber-300 text-[9px] font-bold px-1.5 py-0">
                          ⭐ Primary Lead
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div>
                          <div className="font-bold text-sm text-ink">{primaryMember.name}</div>
                          <div className="text-[11px] text-on-surface-variant">{primaryMember.email}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-emerald-800">{primaryMember.creditBalance} Credits</div>
                          <Badge variant={primaryMember.isActive !== false ? "outline" : "secondary"} className="text-[9px] mt-0.5">
                            {primaryMember.isActive !== false ? "Active" : "Deactivated"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Co-Residents / Household Members */}
                  {secondaryMembers.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/80 block px-1">
                        Co-Residents ({secondaryMembers.length})
                      </span>
                      <div className="space-y-1.5">
                        {secondaryMembers.map((sub) => (
                          <div key={sub.id} className="border border-line/60 bg-panel/30 rounded-lg p-2.5 flex items-center justify-between text-xs hover:bg-panel/60 transition-all">
                            <div>
                              <div className="font-bold text-ink flex items-center gap-1.5">
                                {sub.name}
                                <Badge variant="secondary" className="text-[8px] font-semibold px-1 py-0">
                                  Secondary Member
                                </Badge>
                              </div>
                              <div className="text-[10px] text-on-surface-variant mt-0.5">{sub.email}</div>
                            </div>
                            <span className="font-semibold text-emerald-800 text-[11px]">{sub.creditBalance} Cr</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {group.members.length < group.maxMembers && (
                    <div className="text-[10px] text-on-surface-variant/70 text-center py-1 font-medium bg-slate-50 rounded-lg border border-dashed border-line">
                      {group.maxMembers - group.members.length} member slot(s) available in this household
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-line/60 shadow-sm bg-white">
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm min-w-[650px]">
                <thead className="bg-muted/40 text-left border-b border-line">
                  <tr>
                    <th className="p-3 whitespace-nowrap font-bold text-ink">Name</th>
                    <th className="p-3 whitespace-nowrap font-bold text-ink">Household Unit</th>
                    <th className="p-3 whitespace-nowrap font-bold text-ink">Resident Role / Slot Lead</th>
                    <th className="p-3 whitespace-nowrap font-bold text-ink">Status</th>
                    <th className="p-3 text-right whitespace-nowrap font-bold text-ink">Credits</th>
                    <th className="p-3 text-right whitespace-nowrap font-bold text-ink">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const isActive = r.isActive !== false;
                    const isTargetCoordinator = r.isCoordinator || r.role === "coordinator";
                    const isLoggedCoordinator = user?.role === "coordinator" || (user?.isCoordinator && user?.role !== "admin" && user?.role !== "owner");

                    let canDeactivateRow = false;
                    let tooltip = "";

                    if (r.id === user?.id) {
                      canDeactivateRow = false;
                      tooltip = "Self-deactivation is prohibited";
                    } else if (user?.role === "admin" || user?.role === "owner") {
                      canDeactivateRow = true;
                      tooltip = "Deactivate user account";
                    } else if (isLoggedCoordinator) {
                      if (!user?.canDeactivateResidents) {
                        canDeactivateRow = false;
                        tooltip = "Coordinator lacks resident deactivation rights";
                      } else if (isTargetCoordinator) {
                        canDeactivateRow = false;
                        tooltip = "Coordinators cannot deactivate another coordinator";
                      } else {
                        canDeactivateRow = true;
                        tooltip = "Deactivate resident account";
                      }
                    }

                    return (
                      <tr key={r.id} className="border-t border-line/60 hover:bg-panel/30 transition-all">
                        <td className="p-3 font-medium whitespace-nowrap text-ink">
                          <div className="flex items-center gap-1.5">
                            <span>{r.name}</span>
                            {r.isPrimaryResident && (
                              <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[9px] font-bold px-1.5 py-0">
                                ⭐ Primary Lead
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground whitespace-nowrap font-semibold">{r.householdId ?? "—"}</td>
                        <td className="p-3 whitespace-nowrap">
                          <Badge variant={r.role === "admin" ? "outline" : r.isCoordinator || r.role === "coordinator" ? "default" : "secondary"}>
                            {r.role === "admin" ? "Admin" : r.isCoordinator || r.role === "coordinator" ? "Coordinator" : r.isPrimaryResident ? "Primary Resident" : "Resident"}
                          </Badge>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <Badge className={isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200 border font-semibold" : "bg-rose-50 text-rose-700 border-rose-200 border font-semibold"}>
                            {isActive ? "Active" : "Deactivated"}
                          </Badge>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap font-semibold text-ink">{r.creditBalance}</td>
                        <td className="p-3 text-right whitespace-nowrap">
                          {isActive ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!canDeactivateRow}
                              title={tooltip}
                              onClick={() => setDeactivateTarget({ id: r.id, name: r.name })}
                              className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer disabled:opacity-50"
                            >
                              <UserX className="h-3.5 w-3.5 mr-1" />
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!canDeactivateRow}
                              title={tooltip}
                              onClick={async () => {
                                try {
                                  await userService.reactivateUser(r.id);
                                  qc.invalidateQueries({ queryKey: ["allRes", sid] });
                                  toast.success(`Reactivated account for ${r.name}`);
                                } catch (err: any) {
                                  toast.error(err.message || "Failed to reactivate account");
                                }
                              }}
                              className="h-8 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 cursor-pointer font-semibold disabled:opacity-50"
                            >
                              <UserCheck className="h-3.5 w-3.5 mr-1" />
                              Reactivate
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deactivation Pop-up Dialog */}
      <AlertDialog open={!!deactivateTarget} onOpenChange={(open) => !open && setDeactivateTarget(null)}>
        <AlertDialogContent className="bg-white border-line/60 rounded-2xl shadow-xl max-w-sm p-6">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-base font-bold text-ink flex items-center gap-2">
              <UserX className="h-5 w-5 text-rose-600 flex-shrink-0" />
              Deactivate Resident Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to soft-deactivate <strong className="text-ink font-semibold">{deactivateTarget?.name}</strong>?
              They will be unable to log in until reactivated by an admin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3 border-t border-line/40 gap-2">
            <AlertDialogCancel className="text-xs h-9 font-semibold rounded-xl border-line cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deactivateTarget) {
                  try {
                    await userService.deactivateUser(deactivateTarget.id);
                    qc.invalidateQueries({ queryKey: ["allRes", sid] });
                    toast.success(`Deactivated account for ${deactivateTarget.name}`);
                  } catch (err: any) {
                    toast.error(err.message || "Failed to deactivate user");
                  }
                  setDeactivateTarget(null);
                }
              }}
              className="text-xs h-9 font-semibold rounded-xl text-white bg-rose-600 hover:bg-rose-700 cursor-pointer active:scale-98 transition-all"
            >
              Confirm Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

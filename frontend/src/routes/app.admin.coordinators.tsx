import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, UserMinus, ShieldCheck, ShieldAlert, CheckSquare, UserCog, Sparkles } from "lucide-react";
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

export const Route = createFileRoute("/app/admin/coordinators")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const { user, refetchUser } = useAuth();
  const sid = user!.societyId!;
  const all = useQuery({ queryKey: ["allRes", sid], queryFn: () => userService.listBySociety(sid) });
  
  const [sel, setSel] = useState<string>("");
  const [canOnboarding, setCanOnboarding] = useState<boolean>(true);
  const [canDeactivate, setCanDeactivate] = useState<boolean>(false);
  const [confirmDemote, setConfirmDemote] = useState<{ id: string; name: string } | null>(null);

  const coords = all.data?.filter((u) => u.isCoordinator && u.role !== "admin" && u.role !== "owner") ?? [];
  const residents = all.data?.filter((u) => !u.isCoordinator && u.role !== "admin" && u.role !== "owner") ?? [];

  return (
    <div className="space-y-6 animate-page-fade">
      <PageHeader 
        title="Coordinators & Granular Permissions" 
        description="Promote residents to coordinator and assign specific onboarding & resident governance privileges." 
      />

      {coords.length < 2 && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs font-semibold text-amber-900 shadow-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span>Notice: At least 2 active coordinators are recommended for balanced society administration.</span>
        </div>
      )}

      {/* Promotion Panel */}
      <Card className="border-line/60 shadow-sm bg-white overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-deep-forest via-emerald-600 to-indigo-600"></div>
        <CardHeader className="pb-3 pt-5 border-b border-line/40 bg-panel/20">
          <CardTitle className="text-sm font-bold text-ink flex items-center gap-2">
            <UserCog className="h-4.5 w-4.5 text-deep-forest" />
            Promote Resident & Configure Privileges
          </CardTitle>
          <CardDescription className="text-xs text-on-surface-variant">
            Select a resident from your society roster and assign their operational rights.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant block">
                Select Resident to Promote
              </label>
              <Select value={sel} onValueChange={setSel}>
                <SelectTrigger className="w-full border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-xl bg-white">
                  <SelectValue placeholder="Choose resident from roster..." />
                </SelectTrigger>
                <SelectContent>
                  {residents.length === 0 ? (
                    <SelectItem value="none" disabled className="text-xs text-muted-foreground">
                      No eligible residents found
                    </SelectItem>
                  ) : (
                    residents.map((r) => (
                      <SelectItem key={r.id} value={r.id} className="text-xs font-medium">
                        {r.name} ({r.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Privilege Selection */}
            <div className="space-y-3 border border-line/60 p-4 rounded-xl bg-panel/20">
              <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant block border-b border-line/40 pb-1.5">
                Initial Coordinator Privileges
              </span>
              
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <CheckSquare className="h-3.5 w-3.5 text-emerald-700" />
                      Member Onboarding Access
                    </span>
                    <p className="text-[10px] text-on-surface-variant">
                      Approve join requests and verify household unit claims.
                    </p>
                  </div>
                  <Switch 
                    checked={canOnboarding} 
                    onCheckedChange={setCanOnboarding} 
                    className="data-[state=checked]:bg-deep-forest"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-line/35 pt-2.5">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                      Deactivate / Ban Resident Rights
                    </span>
                    <p className="text-[10px] text-on-surface-variant">
                      Grant rights to soft-deactivate resident accounts.
                    </p>
                  </div>
                  <Switch 
                    checked={canDeactivate} 
                    onCheckedChange={setCanDeactivate} 
                    className="data-[state=checked]:bg-rose-600"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-line/40">
            <Button 
              disabled={!sel || sel === "none"} 
              onClick={async () => {
                await userService.promote(sel, canOnboarding, canDeactivate);
                if (sel === user?.id) await refetchUser();
                setSel(""); 
                qc.invalidateQueries({ queryKey: ["allRes", sid] });
                toast.success("Resident successfully promoted to Coordinator!");
              }} 
              className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 px-5 rounded-xl shadow-sm cursor-pointer active:scale-98 transition-all w-full sm:w-auto"
            >
              Promote to Coordinator
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Privilege Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm text-ink">Active Society Coordinators ({coords.length})</span>
          <span className="text-[11px] text-on-surface-variant">Toggle privilege switches below to update rights in real time.</span>
        </div>

        {coords.map((c) => {
          const onboardingAccess = c.canManageOnboarding !== false;
          const deactivateAccess = c.canDeactivateResidents === true;

          return (
            <Card key={c.id} className="border-line/60 shadow-sm hover:shadow-md transition-all duration-300 bg-white">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                {/* Profile Identity */}
                <div className="flex items-center gap-3.5 min-w-[220px]">
                  <div className="w-10 h-10 rounded-full bg-deep-forest/10 border border-deep-forest/20 text-deep-forest flex items-center justify-center font-bold text-sm shadow-inner flex-shrink-0">
                    {c.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-ink truncate">{c.name}</span>
                      <Badge className="bg-purple-50 border-purple-200 text-purple-800 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full pointer-events-none border">
                        Coordinator
                      </Badge>
                    </div>
                    <div className="text-xs text-on-surface-variant truncate">{c.email}</div>
                  </div>
                </div>

                {/* Granular Privilege Switches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 max-w-xl bg-panel/30 p-3.5 rounded-xl border border-line/50">
                  {/* Onboarding Access Toggle */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-ink block">Onboarding Access</span>
                      <span className="text-[9px] text-on-surface-variant block">Approve requests & units</span>
                    </div>
                    <Switch 
                      checked={onboardingAccess} 
                      onCheckedChange={async (checked) => {
                        await userService.updateCoordinatorPermissions(c.id, checked, deactivateAccess);
                        if (c.id === user?.id) await refetchUser();
                        qc.invalidateQueries({ queryKey: ["allRes", sid] });
                        toast.info(`Updated onboarding access for ${c.name}`);
                      }}
                      className="data-[state=checked]:bg-deep-forest"
                    />
                  </div>

                  {/* Deactivation Rights Toggle */}
                  <div className="flex items-center justify-between gap-3 border-t sm:border-t-0 sm:border-l border-line/40 pt-2 sm:pt-0 sm:pl-3">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-rose-900 block">Ban / Deactivate Rights</span>
                      <span className="text-[9px] text-on-surface-variant block">Soft-deactivate accounts</span>
                    </div>
                    <Switch 
                      checked={deactivateAccess} 
                      onCheckedChange={async (checked) => {
                        await userService.updateCoordinatorPermissions(c.id, onboardingAccess, checked);
                        if (c.id === user?.id) await refetchUser();
                        qc.invalidateQueries({ queryKey: ["allRes", sid] });
                        toast.info(`Updated ban rights for ${c.name}`);
                      }}
                      className="data-[state=checked]:bg-rose-600"
                    />
                  </div>
                </div>

                {/* Demote Action */}
                <div className="flex justify-end border-t md:border-t-0 pt-3 md:pt-0 border-line/40">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs font-semibold h-9 px-3.5 border-line-strong hover:bg-panel cursor-pointer text-rose-600 hover:text-rose-700 hover:bg-rose-50" 
                    onClick={() => setConfirmDemote({ id: c.id, name: c.name })}
                  >
                    <UserMinus className="h-3.5 w-3.5 mr-1" />
                    Remove Role
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Demote Confirmation Modal */}
      <AlertDialog open={!!confirmDemote} onOpenChange={(open) => !open && setConfirmDemote(null)}>
        <AlertDialogContent className="bg-white border-line/60 rounded-2xl shadow-xl max-w-sm p-6">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-base font-bold text-ink flex items-center gap-2">
              <UserMinus className="h-5 w-5 text-rose-600 flex-shrink-0" />
              Remove Coordinator Role
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to remove the Coordinator role from <strong className="text-ink font-semibold">{confirmDemote?.name}</strong>?
              They will be demoted back to a standard resident.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3 border-t border-line/40 gap-2">
            <AlertDialogCancel className="text-xs h-9 font-semibold rounded-xl border-line cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmDemote) {
                  try {
                    await userService.demote(confirmDemote.id);
                    if (confirmDemote.id === user?.id) await refetchUser();
                    qc.invalidateQueries({ queryKey: ["allRes", sid] });
                    toast.success(`Removed Coordinator role from ${confirmDemote.name}`);
                  } catch (err: any) {
                    toast.error(err.message || "Failed to demote coordinator");
                  }
                  setConfirmDemote(null);
                }
              }}
              className="text-xs h-9 font-semibold rounded-xl text-white bg-rose-600 hover:bg-rose-700 cursor-pointer active:scale-98 transition-all"
            >
              Confirm Demote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

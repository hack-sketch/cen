import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { societyService, userService } from "@/services";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, ShieldCheck, Mail, User as UserIcon, Building, Activity, Database } from "lucide-react";

export const Route = createFileRoute("/app/profile")({ component: Page });

function Page() {
  const { user, setUserById } = useAuth();
  const qc = useQueryClient();

  const soc = useQuery({ 
    queryKey: ["soc", user?.societyId], 
    queryFn: () => user?.societyId ? societyService.getById(user.societyId) : Promise.resolve(null), 
    enabled: !!user?.societyId 
  });

  // State management for profile form fields
  const [name, setName] = useState(user!.name);
  const [email, setEmail] = useState(user!.email);
  const [societyName, setSocietyName] = useState(soc.data?.name ?? "");
  const [saving, setSaving] = useState(false);

  // Sync state if society data loaded late
  if (soc.data && !societyName && soc.data.name !== societyName) {
    setSocietyName(soc.data.name);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Build details payload
      const payload: Record<string, string> = { name, email };
      
      // If user is Admin, they can rename their society
      if (user!.role === "admin" && societyName.trim()) {
        payload.societyName = societyName;
      }

      await userService.updateProfile(user!.id, payload);
      await setUserById(user!.id);
      qc.invalidateQueries();
      toast.success("Profile details updated successfully!");
    } catch {
      toast.error("Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const isOwner = user!.role === "owner";
  const isAdmin = user!.role === "admin";
  const displayRole = isOwner ? "System Manager" : user!.role;

  return (
    <div className="space-y-6 pb-12 animate-page-fade">
      <PageHeader title="Profile Settings" description="Manage your account profile details, security items, and active nodes." />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: General Profile Status card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-line/60 shadow-sm overflow-hidden bg-white">
            <div className="h-2 bg-deep-forest"></div>
            <CardContent className="p-5 flex flex-col items-center text-center space-y-4 pt-6">
              <div className="w-16 h-16 rounded-full bg-deep-forest/5 text-deep-forest border border-deep-forest/15 flex items-center justify-center font-bold text-xl shadow-inner">
                {name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              
              <div>
                <div className="font-bold text-base text-ink">{name}</div>
                <div className="text-xs text-on-surface-variant mt-0.5">{email}</div>
              </div>

              <div className="flex flex-wrap justify-center gap-1.5 pt-1.5">
                <Badge className="pointer-events-none bg-deep-forest/10 border border-deep-forest/20 text-deep-forest text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-full tracking-wider hover:bg-deep-forest/10 hover:text-deep-forest">
                  {displayRole}
                </Badge>
                {user!.isCoordinator && user!.role !== "coordinator" && (
                  <Badge className="pointer-events-none bg-soft-violet/10 border border-soft-violet/20 text-soft-violet text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-full tracking-wider hover:bg-soft-violet/10 hover:text-soft-violet">
                    Coordinator
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Wallet Stats card (Non-owners only) */}
          {!isOwner && (
            <Card className="border-line/60 shadow-sm bg-white">
              <CardHeader className="pb-3 pt-4 border-b border-line/45">
                <CardTitle className="text-xs font-bold text-ink uppercase tracking-wider">Wallet Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-medium">Credits Balance:</span>
                  <span className="font-bold text-deep-forest">{user!.creditBalance} Credits</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-line/35 pt-3">
                  <span className="text-on-surface-variant font-medium">ID Verification Status:</span>
                  {user!.idProofUploaded ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="h-4 w-4" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                      <XCircle className="h-4 w-4" /> Pending
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side: Dynamic Form and settings (Changes based on Steward role vs Resident/Admin) */}
        <div className="md:col-span-2 space-y-6">
          {isOwner ? (
            /* Manager Specific Layout Details */
            <div className="space-y-6">
              {/* Profile details editor */}
              <Card className="border-line/60 shadow-sm bg-white">
                <CardHeader className="pb-3 border-b border-line/45 bg-panel/30">
                  <CardTitle className="text-sm font-bold text-ink">Manager Identity Profile</CardTitle>
                  <CardDescription className="text-xs text-on-surface-variant">Update your platform contact details.</CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-ink">Manager Name</Label>
                        <Input 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          className="h-10 text-xs rounded-lg border-line-strong/60"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-ink">Notification Email</Label>
                        <Input 
                          type="email"
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          className="h-10 text-xs rounded-lg border-line-strong/60"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={saving}
                      className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs px-5 h-10 rounded-lg cursor-pointer shadow-sm ml-auto block"
                    >
                      {saving ? "Saving..." : "Save Manager Profile"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Manager-Only Platform Metrics & System Logs */}
              <Card className="border-line/60 shadow-sm bg-white">
                <CardHeader className="pb-3 border-b border-line/45">
                  <CardTitle className="text-sm font-bold text-ink flex items-center gap-2">
                    <Database className="h-4.5 w-4.5 text-soft-violet" />
                    System Manager Settings
                  </CardTitle>
                  <CardDescription className="text-xs text-on-surface-variant">Review network node configurations and server indicators.</CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="border border-line/60 p-4 rounded-xl bg-panel/30">
                      <div className="text-[9px] uppercase font-bold text-on-surface-variant">Core Node Protocol</div>
                      <div className="text-lg font-bold text-ink mt-1">CEN-v2.0-Alpha</div>
                    </div>
                    <div className="border border-line/60 p-4 rounded-xl bg-panel/30">
                      <div className="text-[9px] uppercase font-bold text-on-surface-variant">Active Database Cluster</div>
                      <div className="text-lg font-bold text-ink mt-1">Online (Primary)</div>
                    </div>
                    <div className="border border-line/60 p-4 rounded-xl bg-panel/30">
                      <div className="text-[9px] uppercase font-bold text-on-surface-variant">System Security Ledger</div>
                      <div className="text-lg font-bold text-ink mt-1 flex items-center gap-1 text-emerald-700">
                        <ShieldCheck className="h-4.5 w-4.5" /> Activated
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-soft-violet/5 via-indigo-50/10 to-transparent border border-line/55 rounded-xl p-4 flex gap-3 items-start">
                    <Activity className="h-5 w-5 text-soft-violet flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-ink">System Manager Note</span>
                      <p className="text-[10px] text-on-surface-variant leading-normal mt-1">
                        As a System Manager, you are responsible for approving new society registrations, managing protocol-level credit distributions, and monitoring performance across active federated clusters.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Resident and Admin Editor Panel */
            <Card className="border-line/60 shadow-sm bg-white">
              <CardHeader className="pb-3 border-b border-line/45 bg-panel/30">
                <CardTitle className="text-sm font-bold text-ink">Account Profile Details</CardTitle>
                <CardDescription className="text-xs text-on-surface-variant">Manage credentials and local society registrations.</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-ink">Full Name</Label>
                      <Input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Your Name"
                        className="h-10 text-xs rounded-lg border-line-strong/60"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-ink">Email Address</Label>
                      <Input 
                        type="email"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="name@email.com"
                        className="h-10 text-xs rounded-lg border-line-strong/60"
                      />
                    </div>

                    {/* Admin only: Society Name editing */}
                    {isAdmin && (
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-xs font-bold text-ink flex items-center gap-1.5">
                          <Building className="h-4.5 w-4.5 text-deep-forest" />
                          Society Name (Admin Authority Only)
                        </Label>
                        <Input 
                          value={societyName} 
                          onChange={(e) => setSocietyName(e.target.value)} 
                          placeholder="Society Name"
                          className="h-10 text-xs rounded-lg border-line-strong/60 bg-emerald-50/20 border-emerald-200"
                        />
                        <span className="text-[9px] text-on-surface-variant block mt-0.5">Changing this will update the society branding for all registered residents.</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs px-5 h-10 rounded-lg cursor-pointer shadow-sm ml-auto block"
                  >
                    {saving ? "Saving..." : "Save Profile Details"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Safety/Information footer pill */}
          <div className="bg-panel/40 border border-line/45 rounded-xl p-4 flex gap-3 items-start">
            <ShieldCheck className="h-5 w-5 text-deep-forest flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-ink">Account Security</span>
              <p className="text-[10px] text-on-surface-variant leading-normal mt-1">
                To maintain a safe community, credit trading and profile logs are tracked. Profile verification requests are moderated by local coordinators.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

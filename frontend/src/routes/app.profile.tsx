import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { societyService, userService } from "@/services";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, ShieldCheck, Mail, User as UserIcon, Building, Activity, Database, LogOut, Sparkles, Clock, UploadCloud, FileText } from "lucide-react";
import { cn, formatDocFilename } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";



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

export const Route = createFileRoute("/app/profile")({ component: Page });

function Page() {
  const navigate = useNavigate();
  const { user, setUserById, refetchUser } = useAuth();
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
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

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
                <div className="space-y-2 border-t border-line/35 pt-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant font-medium">ID Verification Status:</span>
                    {(() => {
                      if (isAdmin || isOwner) {
                        return (
                          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-300 border text-[10px] font-bold">
                            <ShieldCheck className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Verified Authority
                          </Badge>
                        );
                      }
                      if (!user!.societyId) {
                        return (
                          <Badge className="bg-slate-100 text-slate-700 border-slate-300 border text-[10px] font-bold">
                            <Clock className="h-3.5 w-3.5 mr-1" /> Awaiting Society
                          </Badge>
                        );
                      }
                      if (user!.idProofVerified || user!.verificationStatus === "verified") {
                        return (
                          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-300 border text-[10px] font-bold">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Verified Resident
                          </Badge>
                        );
                      }
                      if (user!.idProofUploaded || user!.verificationStatus === "pending") {
                        return (
                          <Badge className="bg-amber-50 text-amber-900 border-amber-300 border text-[10px] font-bold">
                            <Clock className="h-3.5 w-3.5 mr-1 text-amber-600" /> In Review
                          </Badge>
                        );
                      }
                      return (
                        <Badge className="bg-rose-50 text-rose-800 border-rose-300 border text-[10px] font-bold">
                          <XCircle className="h-3.5 w-3.5 mr-1 text-rose-600" /> Not Verified
                        </Badge>
                      );
                    })()}
                  </div>

                  {!isAdmin && !isOwner && user!.societyId && (
                    <div className="pt-1">
                      <IdProofUploadDialog user={user!} />
                    </div>
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

          {/* Community Interests & Skills Survey (Residents & Coordinators only) */}
          {user?.societyId && (user.role === "resident" || user.role === "coordinator") && (
            <ProfileSurveyCard user={user!} />
          )}


          {/* Leave Society Action Card (Residents and Coordinators only) */}
          {user?.societyId && (user.role === "resident" || user.role === "coordinator") && (
            <Card className="border-rose-200 shadow-sm bg-rose-50/30">
              <CardHeader className="pb-3 border-b border-rose-100">
                <CardTitle className="text-sm font-bold text-rose-900 flex items-center gap-2">
                  <LogOut className="h-4 w-4 text-rose-600" />
                  Leave Society
                </CardTitle>
                <CardDescription className="text-xs text-rose-700">
                  Voluntarily detach your account from <span className="font-bold">{soc.data?.name || "your current society"}</span>.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-between">
                <span className="text-[11px] text-rose-800/80">
                  Your claimed household and coordinator roles in this society will be released.
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowLeaveConfirm(true)}
                  className="bg-white hover:bg-rose-100 text-rose-700 border-rose-300 font-semibold text-xs h-9 px-4 cursor-pointer"
                >
                  Leave Society
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Official Society Administration Desk Governance Card (Admins only) */}
          {user?.societyId && user.role === "admin" && (
            <Card className="border-deep-forest/20 shadow-sm bg-emerald-50/30">
              <CardHeader className="pb-3 border-b border-emerald-100">
                <CardTitle className="text-sm font-bold text-deep-forest flex items-center gap-2">
                  <Building className="h-4 w-4 text-deep-forest" />
                  Official Society Administration Desk
                </CardTitle>
                <CardDescription className="text-xs text-emerald-800">
                  Active administrator authority for <span className="font-bold">{soc.data?.name || "this community"}</span>.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <span className="text-[11px] text-emerald-900/80 leading-relaxed">
                  This account manages society configuration, flat capacity, and coordinator assignments. Institutional administration transfer and society decommissioning are governed by the Platform Owner.
                </span>
                <Badge variant="outline" className="bg-white text-deep-forest border-emerald-300 text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 flex-shrink-0">
                  Institutional Desk
                </Badge>
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

      {/* Leave Society Confirmation Dialog */}
      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent className="bg-white border-line/60 rounded-2xl shadow-xl max-w-sm p-6">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-base font-bold text-ink flex items-center gap-2">
              <LogOut className="h-5 w-5 text-rose-600 flex-shrink-0" />
              Confirm Leave Society
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to leave <span className="font-bold text-ink">{soc.data?.name || "this society"}</span>? Your unit assignment will be un-claimed. You can join another society at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5 flex gap-2">
            <AlertDialogCancel className="h-9 px-4 text-xs font-semibold rounded-lg border-line-strong hover:bg-panel cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                try {
                  await userService.leaveSociety();
                  await setUserById(user!.id);
                  if (typeof refetchUser === "function") {
                    await refetchUser();
                  }
                  localStorage.removeItem("cen.coordViewMode");
                  qc.clear();
                  toast.success("Successfully left society. Please select or request a society.");
                  navigate({ to: "/app" });
                } catch (err: any) {
                  toast.error(err.message || "Failed to leave society");
                } finally {
                  setShowLeaveConfirm(false);
                }
              }}
              className="h-9 px-4 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer active:scale-98 transition-all"
            >
              Confirm Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProfileSurveyCard({ user }: { user: any }) {
  const qc = useQueryClient();
  const { setUserById } = useAuth();
  const [loading, setLoading] = useState(false);

  const AVAILABLE_INTERESTS = [
    "Gardening",
    "Cooking & Baking",
    "Tech & IT",
    "Home Repairs",
    "Fitness & Yoga",
    "Music & Arts",
    "Tutoring",
    "Pet Care",
    "Civic Volunteering",
  ];

  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    user?.interests || []
  );
  const [skillsText, setSkillsText] = useState(user?.offeredSkillsText || "");
  const [volunteerInterest, setVolunteerInterest] = useState(user?.volunteerInterest || "yes");

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.updateOnboardingSurvey(user.id, {
        interests: selectedInterests,
        offeredSkillsText: skillsText,
        volunteerInterest: volunteerInterest,
      });
      await setUserById(user.id);
      qc.invalidateQueries();
      toast.success("Community survey & preferences saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update survey.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-line/60 shadow-sm bg-white overflow-hidden">
      <CardHeader className="pb-3 border-b border-line/45 bg-gradient-to-r from-deep-forest/5 via-soft-violet/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-deep-forest/10 flex items-center justify-center text-deep-forest border border-deep-forest/20">
              <Sparkles className="h-4 w-4 text-deep-forest" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-ink">Community Preferences & Skills Survey</CardTitle>
              <CardDescription className="text-xs text-on-surface-variant">Update your interests, offered skills, and volunteer availability anytime.</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-[9px] bg-white font-bold border-deep-forest/30 text-deep-forest">
            Personalization
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-ink">Areas of Interest & Needs</Label>
            <div className="flex flex-wrap gap-2 pt-0.5">
              {AVAILABLE_INTERESTS.map((item) => {
                const active = selectedInterests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                      active
                        ? "bg-deep-forest text-white border-deep-forest shadow-2xs scale-102"
                        : "bg-slate-50 text-ink border-line/60 hover:bg-slate-100"
                    )}
                  >
                    {active ? "✓ " : "+ "}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-ink">Skills or Services You Can Offer</Label>
            <Input
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="e.g. Balcony gardening, mathematics tutoring, home electrical fixes..."
              className="h-10 text-xs rounded-lg border-line-strong/60"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-ink">Volunteering Willingness</Label>
            <div className="flex gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
              {[
                { value: "yes", label: "Yes, invite me for drives" },
                { value: "weekends", label: "Weekends only" },
                { value: "no", label: "Not at this time" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setVolunteerInterest(opt.value)}
                  className={cn(
                    "flex-1 min-w-[120px] py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer",
                    volunteerInterest === opt.value
                      ? "bg-emerald-50 text-emerald-950 border-emerald-300 font-bold"
                      : "bg-slate-50 text-on-surface-variant border-line/60 hover:bg-slate-100"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs px-5 h-10 rounded-lg cursor-pointer shadow-sm ml-auto block"
          >
            {loading ? "Saving Preferences..." : "Save Preferences"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function IdProofUploadDialog({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [docName, setDocName] = useState(formatDocFilename(user?.idProofUrl));
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(user?.idProofUrl || null);
  const qc = useQueryClient();
  const { setUserById } = useAuth();

  useEffect(() => {
    if (user?.idProofUrl) {
      setFileDataUrl(user.idProofUrl);
      setDocName(formatDocFilename(user.idProofUrl));
    } else {
      setFileDataUrl(null);
      setDocName("");
    }
  }, [user?.idProofUrl, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) {
      toast.error("File size must be under 2MB.");
      return;
    }
    setDocName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileDataUrl && !docName) {
      toast.error("Please select a document or image to upload.");
      return;
    }
    setLoading(true);
    try {
      const payloadUrl = fileDataUrl || `mock://${docName || "id_proof.pdf"}`;
      await userService.uploadIdProof(user.id, payloadUrl);
      await setUserById(user.id);
      qc.invalidateQueries();
      toast.success("Identity proof submitted for coordinator verification!");
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload ID proof.");
    } finally {
      setLoading(false);
    }
  };

  const isVerified = user.idProofVerified || user.verificationStatus === "verified";
  const isPending = !isVerified && (user.idProofUploaded || user.verificationStatus === "pending");
  const isImage = fileDataUrl && (
    fileDataUrl.startsWith("data:image") || 
    fileDataUrl.startsWith("http") || 
    fileDataUrl.startsWith("blob:")
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-[11px] font-bold h-8 border-line-strong hover:bg-panel cursor-pointer flex items-center justify-center gap-1.5"
        >
          <UploadCloud className="h-3.5 w-3.5 text-deep-forest" />
          {isVerified ? "Update ID Document" : isPending ? "Replace Submitted Proof" : "Upload ID Proof Document"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md w-[95vw] border-line/60 rounded-2xl p-4 sm:p-6 bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-line/35">
          <DialogTitle className="text-base font-bold text-ink flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-deep-forest" />
            Resident Identity Verification
          </DialogTitle>
          <DialogDescription className="text-xs text-on-surface-variant">
            Upload your government ID, resident card, or tenancy document for coordinator verification.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="border-2 border-dashed border-line-strong/60 rounded-2xl p-5 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <input
              type="file"
              id="id-proof-upload-input"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="id-proof-upload-input" className="cursor-pointer flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-deep-forest/10 text-deep-forest flex items-center justify-center">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div className="text-xs font-bold text-ink truncate max-w-[280px]">
                {docName ? docName : "Click to select ID photo or document"}
              </div>
              <span className="text-[10px] text-on-surface-variant">Supports PDF, PNG, JPG up to 2MB</span>
            </label>
          </div>

          {fileDataUrl && (
            <div className="rounded-xl border border-line p-3 bg-panel/30 flex flex-col items-center justify-center gap-2">
              {isImage ? (
                <div className="relative group max-h-40 overflow-hidden rounded-lg">
                  <img src={fileDataUrl} alt="ID Preview" className="max-h-36 w-full object-contain rounded-lg shadow-2xs bg-white border" />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-deep-forest p-2 bg-white rounded-lg border w-full justify-center">
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate max-w-[240px]">{docName || "Submitted_ID_Proof.pdf"}</span>
                </div>
              )}
            </div>
          )}

          {isPending && (
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600 shrink-0" />
              <span>A coordinator is currently reviewing your previous document. Uploading a new one will replace it.</span>
            </div>
          )}

          <Button
            disabled={loading || (!fileDataUrl && !docName)}
            onClick={handleUpload}
            className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 rounded-lg shadow-sm cursor-pointer active:scale-98 transition-all"
          >
            {loading ? "Submitting Document..." : "Submit for Verification"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}



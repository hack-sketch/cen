import { createFileRoute, Outlet, useNavigate, Link, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { joinRequestService, societyService, userService } from "@/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, ShieldAlert, LogOut, Building, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const currentUserId = localStorage.getItem("cen.currentUserId");
      if (!currentUserId) {
        throw redirect({ to: "/login" });
      }
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const { user, loading, logout } = useAuth();
  const nav = useNavigate();
  
  const [requestStatus, setRequestStatus] = useState<"loading" | "approved" | "pending_join" | "pending_society" | "rejected_join" | "rejected_society" | "none">("loading");
  const [extraInfo, setExtraInfo] = useState<any>(null);
  const [societyName, setSocietyName] = useState("");
  const [showSurvey, setShowSurvey] = useState(false);

  const checkStatus = () => {
    if (loading) return;
    if (!user) {
      nav({ to: "/login" });
      return;
    }

    if (user.role === "owner" || user.societyId) {
      setRequestStatus("approved");
      return;
    }

    Promise.all([
      joinRequestService.getByUserId(user.id),
      societyService.getApplicationByEmail(user.email)
    ]).then(([jr, sa]) => {
      if (jr) {
        setExtraInfo(jr);
        if (jr.status === "pending") {
          setRequestStatus("pending_join");
          societyService.getById(jr.societyId).then(s => s && setSocietyName(s.name));
        } else if (jr.status === "rejected") {
          setRequestStatus("rejected_join");
          societyService.getById(jr.societyId).then(s => s && setSocietyName(s.name));
        } else {
          setRequestStatus("approved");
        }
      } else if (sa) {
        setExtraInfo(sa);
        if (sa.status === "pending") {
          setRequestStatus("pending_society");
        } else if (sa.status === "rejected") {
          setRequestStatus("rejected_society");
        } else {
          setRequestStatus("approved");
        }
      } else {
        setRequestStatus("none");
      }
    });
  };

  useEffect(() => {
    checkStatus();
    if (user) {
      setShowSurvey(!user.hasCompletedSurvey);
    }
  }, [loading, user, nav]);

  if (loading || requestStatus === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-panel/20 font-body">
        <div className="flex flex-col items-center gap-5">
          <div className="relative flex items-center justify-center w-16 h-16">
            <div className="absolute inset-0 rounded-full border border-dashed border-deep-forest/40 animate-[spin_8s_linear_infinite]" />
            <div className="absolute w-11 h-11 rounded-full border-2 border-t-soft-violet border-r-transparent border-b-soft-violet border-l-transparent animate-[spin_1.5s_linear_infinite_reverse]" />
            {/* Core pulsing brand gradient sphere with a central 'C' */}
            <div className="absolute w-7 h-7 rounded-full bg-gradient-to-tr from-deep-forest to-soft-violet flex items-center justify-center shadow-md shadow-deep-forest/20 animate-pulse">
              <span className="text-[10px] font-extrabold text-white select-none leading-none">C</span>
            </div>
            <div className="absolute w-4 h-4 rounded-full bg-white opacity-40 animate-ping" />
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <span className="text-[10px] font-bold text-ink uppercase tracking-[0.3em] animate-pulse">
              Loading Console
            </span>
            <span className="text-[9px] text-on-surface-variant font-medium tracking-wide">
              Initializing secure session...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (showSurvey) {
    return (
      <OnboardingSurveyModal 
        user={user} 
        onComplete={() => setShowSurvey(false)} 
        buttonText="Finish" 
      />
    );
  }

  // Auth gate screens
  if (requestStatus === "pending_join") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-panel/20 p-4 font-body relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] bg-[#e2efe9]/30 rounded-full blur-[130px] -z-10"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[55%] bg-[#ece9f5]/30 rounded-full blur-[130px] -z-10"></div>
        <div className="w-full max-w-md space-y-6">
          <Card className="border-line/60 shadow-xl bg-white/95 backdrop-blur-md p-6 text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto text-amber-600 animate-pulse">
              <Clock className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl font-bold text-ink">Waiting for Coordinator Approval</CardTitle>
              <CardDescription className="text-xs text-on-surface-variant leading-relaxed">
                Hi <span className="font-semibold text-ink">{user?.name}</span>, your request to join <span className="font-semibold text-ink">{societyName || "your society"}</span> (Household Unit <span className="font-semibold text-ink">{extraInfo?.unitNumber}</span>) is currently pending coordinator verification.
              </CardDescription>
            </div>
            <div className="bg-panel/40 border border-line/40 rounded-xl p-4 text-xs text-left space-y-2">
              <div className="font-bold text-ink uppercase tracking-wider text-[10px]">Verification Details</div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Applicant:</span><span className="font-semibold text-ink">{extraInfo?.userName}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Request Date:</span><span className="font-semibold text-ink">{extraInfo?.submittedAt}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Status:</span><Badge className="bg-amber-50 border border-amber-200 text-amber-800 uppercase text-[9px] font-bold tracking-wider pointer-events-none">Pending Coordinator</Badge></div>
            </div>
            <p className="text-xs text-on-surface-variant/90 leading-normal">
              For security, residents are only admitted to the trade exchange once their identity proof and household registry match coordinator records.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={async () => {
                  if (extraInfo) {
                    await joinRequestService.deleteRequest(extraInfo.id);
                    toast.info("Request cancelled. You can now choose another society.");
                    checkStatus();
                  }
                }}
                className="w-full h-10 border-line-strong hover:bg-panel text-xs font-semibold cursor-pointer active:scale-98 transition-all"
              >
                Cancel Request & Choose Different Society
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => logout()}
                className="w-full h-10 text-xs font-semibold hover:bg-rose-50 text-rose-600 cursor-pointer active:scale-98 transition-all"
              >
                <LogOut className="mr-1.5 h-4 w-4" /> Sign Out
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (requestStatus === "pending_society") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-panel/20 p-4 font-body relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] bg-[#e2efe9]/30 rounded-full blur-[130px] -z-10"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[55%] bg-[#ece9f5]/30 rounded-full blur-[130px] -z-10"></div>
        <div className="w-full max-w-md space-y-6">
          <Card className="border-line/60 shadow-xl bg-white/95 backdrop-blur-md p-6 text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-soft-violet/10 flex items-center justify-center mx-auto text-soft-violet animate-pulse">
              <Building className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl font-bold text-ink">Application Under Review</CardTitle>
              <CardDescription className="text-xs text-on-surface-variant leading-relaxed">
                Your setup request for <span className="font-semibold text-ink">"{extraInfo?.societyName}"</span> is pending platform manager approval. The system administrator will verify the community location and details before activating your network.
              </CardDescription>
            </div>
            <div className="bg-panel/40 border border-line/40 rounded-xl p-4 text-xs text-left space-y-2">
              <div className="font-bold text-ink uppercase tracking-wider text-[10px]">Application details</div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Applicant:</span><span className="font-semibold text-ink">{extraInfo?.applicantName}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Contact:</span><span className="font-semibold text-ink">{extraInfo?.applicantContact}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Status:</span><Badge className="bg-amber-50 border border-amber-200 text-amber-800 uppercase text-[9px] font-bold tracking-wider pointer-events-none">Awaiting Owner</Badge></div>
            </div>
            <p className="text-xs text-on-surface-variant/90 leading-normal">
              You will gain access to the society coordinator management console immediately upon verification.
            </p>
            <div className="pt-2">
              <Button 
                variant="outline" 
                onClick={() => logout()}
                className="w-full h-10 border-line-strong hover:bg-panel text-xs font-semibold cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (requestStatus === "rejected_join") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-panel/20 p-4 font-body relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] bg-[#e2efe9]/30 rounded-full blur-[130px] -z-10"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[55%] bg-[#ece9f5]/30 rounded-full blur-[130px] -z-10"></div>
        <div className="w-full max-w-md space-y-6">
          <Card className="border-line/60 shadow-xl bg-white/95 backdrop-blur-md p-6 text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto text-rose-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl font-bold text-ink">Join Request Rejected</CardTitle>
              <CardDescription className="text-xs text-on-surface-variant leading-relaxed">
                Your request to join <span className="font-semibold text-ink">{societyName}</span> was declined by the society coordinator. This usually happens if the uploaded ID proof doesn't match local unit directory registry.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button 
                onClick={async () => {
                  if (extraInfo) {
                    await joinRequestService.deleteRequest(extraInfo.id);
                    checkStatus();
                  }
                }}
                className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 rounded-lg shadow-sm cursor-pointer active:scale-98 transition-all"
              >
                Try Joining Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => logout()}
                className="w-full h-10 border-line-strong hover:bg-panel text-xs font-semibold cursor-pointer active:scale-98 transition-all"
              >
                Sign Out
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (requestStatus === "rejected_society") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-panel/20 p-4 font-body relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] bg-[#e2efe9]/30 rounded-full blur-[130px] -z-10"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[55%] bg-[#ece9f5]/30 rounded-full blur-[130px] -z-10"></div>
        <div className="w-full max-w-md space-y-6">
          <Card className="border-line/60 shadow-xl bg-white/95 backdrop-blur-md p-6 text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto text-rose-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl font-bold text-ink">Application Rejected</CardTitle>
              <CardDescription className="text-xs text-on-surface-variant leading-relaxed">
                Your application to start <span className="font-semibold text-ink">"{extraInfo?.societyName}"</span> has been rejected by the platform managers.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => logout()}
                className="w-full h-10 border-line-strong hover:bg-panel text-xs font-semibold cursor-pointer active:scale-98 transition-all"
              >
                Sign Out
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (requestStatus === "none") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-6 font-body relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-[#e2efe9] rounded-full blur-[150px] opacity-60 animate-pulse" style={{ animationDuration: '15s' }}></div>
        <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-[#ece9f5] rounded-full blur-[150px] opacity-60 animate-pulse" style={{ animationDuration: '15s' }}></div>
        
        {/* Subtle grid pattern layer */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] -z-20"></div>

        <div className="w-full max-w-3xl space-y-8 relative z-10">
          {/* Top Brand Tag */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-deep-forest to-emerald-600 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-950/10">C</div>
              <div className="flex flex-col">
                <span className="font-extrabold text-ink uppercase tracking-wider text-[11px] leading-none">CEN Platform</span>
                <span className="text-[9px] text-on-surface-variant mt-0.5">Community Exchange Network</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] font-bold text-ink">Logged in as</div>
                <div className="text-[10px] text-on-surface-variant font-medium">{user?.email}</div>
              </div>
              <button 
                onClick={() => logout()} 
                className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/85 px-3 py-1.5 rounded-lg border border-rose-100 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <LogOut className="h-3 w-3" /> Sign Out
              </button>
            </div>
          </div>

          {/* Main Card */}
          <Card className="border-line/45 shadow-2xl bg-white/90 backdrop-blur-md p-8 md:p-10 rounded-3xl space-y-8">
            <div className="space-y-3 max-w-xl">
              <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-100/70 hover:bg-emerald-100/40 text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md">
                Profile Onboarding
              </Badge>
              <h1 className="text-3xl md:text-4xl font-extrabold text-ink tracking-tight leading-tight">
                Welcome to CEN, <span className="bg-gradient-to-r from-deep-forest via-emerald-600 to-indigo-600 bg-clip-text text-transparent">{user?.name}</span>!
              </h1>
              <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
                Your profile has been created successfully. To start exchanging services and credits, choose how you would like to connect to our platform today.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-2">
              {/* Option 1: Join Existing */}
              <div className="flex flex-col justify-between p-6 rounded-2xl border border-line bg-gradient-to-b from-panel/20 to-panel/5 hover:border-deep-forest/45 hover:shadow-lg hover:shadow-emerald-900/5 transition-all group relative overflow-hidden">
                {/* Decorative house backglow */}
                <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-deep-forest/5 rounded-full blur-xl group-hover:bg-deep-forest/10 transition-colors"></div>
                
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-xl bg-deep-forest/5 text-deep-forest flex items-center justify-center border border-deep-forest/15 group-hover:scale-110 group-hover:bg-deep-forest group-hover:text-white transition-all duration-300">
                    <Building className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-extrabold text-ink">Join Existing Society</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Search for your residential society, apartment building, or cooperative housing group to find neighbors.
                    </p>
                  </div>
                  
                  <ul className="space-y-2 py-1 text-[11px] text-on-surface-variant/90">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-deep-forest"></span>
                      Search and claim your household unit
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-deep-forest"></span>
                      Earn credits trading skills with neighbors
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-deep-forest"></span>
                      Participate in society events & notices
                    </li>
                  </ul>
                </div>

                <Link to="/join-society" className="mt-6 w-full z-10">
                  <Button className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-bold text-xs h-10 rounded-xl shadow-md shadow-emerald-950/10 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1.5 group-hover:translate-y-[-1px]">
                    Find & Join Society <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Option 2: Request New Setup */}
              <div className="flex flex-col justify-between p-6 rounded-2xl border border-line bg-gradient-to-b from-panel/20 to-panel/5 hover:border-soft-violet/40 hover:shadow-lg hover:shadow-indigo-900/5 transition-all group relative overflow-hidden">
                {/* Decorative sparkles backglow */}
                <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-soft-violet/5 rounded-full blur-xl group-hover:bg-soft-violet/10 transition-colors"></div>
                
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-xl bg-soft-violet/5 text-soft-violet flex items-center justify-center border border-soft-violet/15 group-hover:scale-110 group-hover:bg-soft-violet group-hover:text-white transition-all duration-300">
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-extrabold text-ink">Request New Network</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Propose launching a brand-new CEN network for your condominium, local estate, or community.
                    </p>
                  </div>

                  <ul className="space-y-2 py-1 text-[11px] text-on-surface-variant/90">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-soft-violet"></span>
                      Submit coordinator proposals for approval
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-soft-violet"></span>
                      Onboard your apartment unit residents
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-soft-violet"></span>
                      Moderate listings and resolve disputes
                    </li>
                  </ul>
                </div>

                <Link to="/request-society" className="mt-6 w-full z-10">
                  <Button variant="outline" className="w-full border-line-strong hover:bg-soft-violet/5 hover:border-soft-violet text-ink hover:text-soft-violet font-bold text-xs h-10 rounded-xl cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1.5 group-hover:translate-y-[-1px]">
                    Propose New Setup <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t border-line/40 text-[10px] text-on-surface-variant font-medium">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                System status: Fully operational & secure
              </span>
              <span>Need help? Contact platform support at support@cen.app</span>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return <AppShell><Outlet /></AppShell>;
}

export function OnboardingSurveyModal({ 
  user, 
  onComplete, 
  buttonText = "Finish" 
}: { 
  user: any; 
  onComplete: () => void; 
  buttonText?: string;
}) {
  const { setUserById } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [interests, setInterests] = useState<string[]>([]);
  const [skillsText, setSkillsText] = useState("");
  const [volunteerPref, setVolunteerPref] = useState<string>("maybe");
  const [calibrating, setCalibrating] = useState(false);

  const CATS = [
    { name: "Tutoring", label: "Tutoring & Education", desc: "Teaching subjects, exam prep, academic help" },
    { name: "Gardening", label: "Gardening & Outdoors", desc: "Yard work, organic farming, landscape care" },
    { name: "Repair", label: "Home Repairs & DIY", desc: "Plumbing, electrical fixes, bicycle tuning" },
    { name: "Wellness", label: "Wellness & Yoga", desc: "Fitness training, meditation classes, yoga instruction" },
    { name: "Music", label: "Music & Arts", desc: "Guitar lessons, painting workshops, creative crafts" },
    { name: "Electronics", label: "Electronics & Tech", desc: "Laptop troubleshooting, cameras, audio setups" },
    { name: "Tools", label: "Tools Sharing", desc: "Lending drill sets, ladders, garden supplies" },
  ];

  const handleInterestToggle = (catName: string) => {
    if (interests.includes(catName)) {
      setInterests(interests.filter((i) => i !== catName));
    } else {
      setInterests([...interests, catName]);
    }
  };

  const handleSkipAll = async () => {
    toast.info("Survey skipped. You can always update your interests later.");
    await userService.updateOnboardingSurvey(user.id, {
      interests: [],
      offeredSkillsText: "",
      volunteerInterest: "maybe",
    });
    await setUserById(user.id);
    onComplete();
  };

  const handleNextStep = () => {
    setStep((prev) => (prev + 1) as any);
  };

  const handlePrevStep = () => {
    setStep((prev) => (prev - 1) as any);
  };

  const handleFinish = async () => {
    setStep(5);
    setCalibrating(true);
    // Simulate AI calibration delay
    await new Promise((r) => setTimeout(r, 2000));
    
    await userService.updateOnboardingSurvey(user.id, {
      interests,
      offeredSkillsText: skillsText,
      volunteerInterest: volunteerPref,
    });
    
    await setUserById(user.id);
    toast.success("AI Profile Calibration complete!");
    setCalibrating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 font-body">
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#e2efe9]/20 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#ece9f5]/20 rounded-full blur-[120px] -z-10"></div>

      <Card className="w-full max-w-lg border-line/60 shadow-2xl bg-white/95 backdrop-blur-md p-6 relative overflow-hidden">
        {step < 5 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-line">
            <div 
              className="h-full bg-deep-forest transition-all duration-300" 
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5 pt-3 animate-page-fade">
            <div className="w-12 h-12 rounded-2xl bg-deep-forest/10 flex items-center justify-center mx-auto text-deep-forest">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-xl font-bold text-ink">Welcome to CEN, {user.name}!</CardTitle>
              <CardDescription className="text-xs text-on-surface-variant leading-relaxed">
                Let's customize your profile with a quick 30-second survey. This enables our AI Suggestion Engine to tailor recommendations for trades and volunteer events matching your talents.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2.5 pt-4">
              <Button 
                onClick={handleNextStep} 
                className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 w-full cursor-pointer shadow-sm active:scale-98 transition-all"
              >
                Let's Customize My Profile
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleSkipAll} 
                className="text-on-surface-variant hover:text-ink text-xs font-semibold h-10 w-full hover:bg-panel cursor-pointer active:scale-98 transition-all"
              >
                Skip Onboarding Survey
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-page-fade">
            <div className="flex justify-between items-center pb-2 border-b border-line/45">
              <div>
                <h3 className="font-bold text-sm text-ink">1. Areas of Interest</h3>
                <p className="text-[10px] text-on-surface-variant">Select standard categories you would like to explore or share.</p>
              </div>
              <span className="text-[10px] font-bold text-deep-forest bg-deep-forest/5 px-2 py-0.5 rounded border border-deep-forest/15">Step 1/3</span>
            </div>

            <div className="grid gap-2 max-h-56 overflow-y-auto pr-1">
              {CATS.map((c) => {
                const active = interests.includes(c.name);
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleInterestToggle(c.name)}
                    className={cn(
                      "flex items-start text-left p-2.5 rounded-xl border transition-all cursor-pointer",
                      active 
                        ? "bg-deep-forest/5 border-deep-forest text-ink" 
                        : "border-line hover:border-line-strong hover:bg-panel"
                    )}
                  >
                    <div className="flex items-center h-5 mr-3 mt-0.5">
                      <input 
                        type="checkbox" 
                        checked={active} 
                        readOnly 
                        className="rounded border-line-strong text-deep-forest focus:ring-deep-forest h-3.5 w-3.5 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-ink leading-none">{c.label}</div>
                      <p className="text-[10px] text-on-surface-variant mt-1 leading-snug">{c.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-line/45">
              <Button 
                variant="outline" 
                onClick={handlePrevStep}
                className="h-9 px-4 text-xs font-semibold border-line-strong hover:bg-panel cursor-pointer"
              >
                Back
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  onClick={handleNextStep}
                  className="h-9 px-4 text-xs font-semibold text-on-surface-variant hover:text-ink cursor-pointer"
                >
                  Skip Question
                </Button>
                <Button 
                  onClick={handleNextStep}
                  className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-9 px-5 rounded-lg cursor-pointer"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-page-fade">
            <div className="flex justify-between items-center pb-2 border-b border-line/45">
              <div>
                <h3 className="font-bold text-sm text-ink">2. Skills or Resources</h3>
                <p className="text-[10px] text-on-surface-variant">What specific things can you offer? (e.g. math tutor, power tool sharing)</p>
              </div>
              <span className="text-[10px] font-bold text-deep-forest bg-deep-forest/5 px-2 py-0.5 rounded border border-deep-forest/15">Step 2/3</span>
            </div>

            <div className="space-y-1.5 py-2">
              <Label className="text-xs font-bold text-ink">Describe your offerings (Optional)</Label>
              <Textarea 
                placeholder="I can teach acoustic guitar, share a cordless drill, or help setting up a backyard garden..." 
                value={skillsText} 
                onChange={(e) => setSkillsText(e.target.value)} 
                className="text-xs rounded-lg border-line-strong/60 min-h-[100px] leading-relaxed focus:border-deep-forest focus:ring-1 focus:ring-deep-forest/20"
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-line/45">
              <Button 
                variant="outline" 
                onClick={handlePrevStep}
                className="h-9 px-4 text-xs font-semibold border-line-strong hover:bg-panel cursor-pointer"
              >
                Back
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  onClick={handleNextStep}
                  className="h-9 px-4 text-xs font-semibold text-on-surface-variant hover:text-ink cursor-pointer"
                >
                  Skip Question
                </Button>
                <Button 
                  onClick={handleNextStep}
                  className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-9 px-5 rounded-lg cursor-pointer"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-page-fade">
            <div className="flex justify-between items-center pb-2 border-b border-line/45">
              <div>
                <h3 className="font-bold text-sm text-ink">3. Volunteering Interest</h3>
                <p className="text-[10px] text-on-surface-variant">Would you be interested in participating in community events or cleanups?</p>
              </div>
              <span className="text-[10px] font-bold text-deep-forest bg-deep-forest/5 px-2 py-0.5 rounded border border-deep-forest/15">Step 3/3</span>
            </div>

            <div className="space-y-3 py-3">
              {[
                { val: "yes", label: "Yes, definitely", desc: "Let me know when there are events seeking volunteer coordinators." },
                { val: "maybe", label: "Maybe", desc: "Ask me on a case-by-case basis depending on the event focus." },
                { val: "no", label: "No, thanks", desc: "I prefer to stick to skill and resource trading for now." }
              ].map((o) => (
                <label
                  key={o.val}
                  className={cn(
                    "flex items-start text-left p-3 rounded-xl border transition-all cursor-pointer",
                    volunteerPref === o.val 
                      ? "bg-deep-forest/5 border-deep-forest text-ink font-semibold" 
                      : "border-line hover:border-line-strong hover:bg-panel"
                  )}
                >
                  <input 
                    type="radio" 
                    name="volunteer" 
                    value={o.val}
                    checked={volunteerPref === o.val}
                    onChange={(e) => setVolunteerPref(e.target.value)}
                    className="mt-1 mr-3 text-deep-forest focus:ring-deep-forest h-4 w-4 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-ink leading-none">{o.label}</div>
                    <p className="text-[10px] text-on-surface-variant mt-1 leading-snug">{o.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-line/45">
              <Button 
                variant="outline" 
                onClick={handlePrevStep}
                className="h-9 px-4 text-xs font-semibold border-line-strong hover:bg-panel cursor-pointer"
              >
                Back
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  onClick={handleFinish}
                  className="h-9 px-4 text-xs font-semibold text-on-surface-variant hover:text-ink cursor-pointer"
                >
                  Skip Question
                </Button>
                <Button 
                  onClick={handleFinish}
                  className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-9 px-5 rounded-lg cursor-pointer"
                >
                  Finish
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col items-center gap-4 py-8 text-center animate-page-fade">
            {calibrating ? (
              <div className="flex flex-col items-center gap-5 py-4 text-center">
                <div className="relative flex items-center justify-center w-14 h-14">
                  <div className="absolute inset-0 rounded-full border border-dashed border-deep-forest/40 animate-[spin_8s_linear_infinite]" />
                  <div className="absolute w-9 h-9 rounded-full border-2 border-t-soft-violet border-r-transparent border-b-soft-violet border-l-transparent animate-[spin_1.5s_linear_infinite_reverse]" />
                  {/* Core pulsing brand gradient sphere with a central 'C' */}
                  <div className="absolute w-6 h-6 rounded-full bg-gradient-to-tr from-deep-forest to-soft-violet flex items-center justify-center shadow-md shadow-deep-forest/20 animate-pulse">
                    <span className="text-[9px] font-extrabold text-white select-none leading-none">C</span>
                  </div>
                  <div className="absolute w-3.5 h-3.5 rounded-full bg-white opacity-40 animate-ping" />
                </div>
                <div>
                  <div className="text-xs font-bold text-ink uppercase tracking-widest animate-pulse">Calibrating AI Suggestions...</div>
                  <p className="text-[10px] text-on-surface-variant mt-1.5 leading-normal max-w-xs">
                    Indexing your interests against active society requests and event coordinates to matching suggestions...
                  </p>
                </div>
              </div>
            ) : (
              <>
                <CheckCircle2 className="h-14 w-14 text-emerald-600 animate-bounce" />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-ink">AI Calibration Complete!</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed max-w-sm">
                    Thank you, {user.name}! Your preferences are saved. Your dashboard has been customized with interest-based skill recommendations.
                  </p>
                </div>
                <Button 
                  onClick={onComplete}
                  className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 px-6 rounded-lg shadow-sm mt-2 active:scale-98 transition-all"
                >
                  {buttonText}
                </Button>
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

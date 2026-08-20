import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { societyService } from "@/services";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { OnboardingSurveyModal } from "@/routes/app";
import { CheckCircle2, Lock, Building } from "lucide-react";

export const Route = createFileRoute("/request-society")({
  head: () => ({ meta: [{ title: "Request a new society — CEN" }] }),
  component: RequestSociety,
});

function RequestSociety() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [form, setForm] = useState({
    societyName: "",
    type: "Residential Apartment",
    address: "",
    applicantName: "",
    applicantContact: "",
    reason: "",
    residentCount: 100,
    membersPerHousehold: 4,
    initialCredits: 10,
  });

  const [existingApp, setExistingApp] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        applicantName: user.name,
        applicantContact: user.email,
      }));
      setShowSurvey(!user.hasCompletedSurvey);
      societyService.getApplicationByEmail(user.email).then((sa) => {
        if (sa && sa.status === "pending") {
          setExistingApp(sa);
        }
      });
    }
  }, [user]);

  const upd = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalForm = {
      ...form,
      applicantName: user?.name || form.applicantName || "Applicant",
      applicantContact: user?.email || form.applicantContact || "contact@cen.app",
      reason: form.reason || "Request to setup society network",
      residentCount: Number(form.residentCount) || 100,
      membersPerHousehold: Number(form.membersPerHousehold) || 4,
      initialCredits: Number(form.initialCredits) || 10,
    };
    try {
      await societyService.submitApplication(finalForm);
      toast.success("Application submitted for owner review");
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-panel/10 font-body">
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
              Verifying Session
            </span>
            <span className="text-[9px] text-on-surface-variant font-medium tracking-wide">
              Establishing community credentials...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-panel/20 p-4 font-body">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-deep-forest flex items-center justify-center font-bold text-white text-sm">C</div>
              <span className="font-bold text-ink uppercase tracking-widest text-xs">CEN Network</span>
            </Link>
          </div>
          <Card className="border-line/60 shadow-xl bg-white p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-soft-violet/10 flex items-center justify-center mx-auto text-soft-violet">
              <Lock className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold text-ink">Account Required</CardTitle>
              <CardDescription className="text-xs text-on-surface-variant leading-relaxed">
                You must sign in or create an account first to request to setup a society network. This links your proposal securely to your profile.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/signup" search={{ redirect: "/request-society" }}><Button className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10">Sign Up (Create Account)</Button></Link>
              <Link to="/login" search={{ redirect: "/request-society" }}><Button variant="outline" className="w-full h-10 border-line-strong hover:bg-panel text-xs font-semibold">Sign In (Login)</Button></Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (showSurvey) {
    return <OnboardingSurveyModal user={user} onComplete={() => setShowSurvey(false)} buttonText="Continue" />;
  }

  if (existingApp) {
    return (
      <div className="mx-auto grid min-h-screen max-w-lg place-items-center p-6 font-body">
        <Card className="w-full border-line/60 shadow-xl bg-white p-6 text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-soft-violet/10 flex items-center justify-center mx-auto text-soft-violet animate-pulse">
            <Building className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl font-bold text-ink">Application Pending Owner Approval</CardTitle>
            <CardDescription className="text-xs text-on-surface-variant leading-relaxed">
              Hi <span className="font-semibold text-ink">{user?.name}</span>, your setup request for <span className="font-semibold text-ink">"{existingApp.societyName}"</span> is currently pending platform owner verification and approval.
            </CardDescription>
          </div>
          <div className="bg-panel/40 border border-line/40 rounded-xl p-4 text-xs text-left space-y-2">
            <div className="font-bold text-ink uppercase tracking-wider text-[10px]">Application Details</div>
            <div className="flex justify-between"><span className="text-on-surface-variant">Society Name:</span><span className="font-semibold text-ink">{existingApp.societyName}</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">Applicant:</span><span className="font-semibold text-ink">{existingApp.applicantName}</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">Contact:</span><span className="font-semibold text-ink">{existingApp.applicantContact}</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">Status:</span><span className="font-bold text-amber-800 uppercase text-[10px]">Awaiting Owner Approval</span></div>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={async () => {
                await societyService.deleteApplication(existingApp.id);
                toast.info("Society application cancelled.");
                setExistingApp(null);
              }}
              className="w-full h-10 border-line-strong hover:bg-panel text-xs font-semibold cursor-pointer active:scale-98 transition-all"
            >
              Cancel Request
            </Button>
            <Button onClick={() => navigate({ to: "/app/dashboard" })} className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 rounded-lg active:scale-98 transition-all">Go to Console Dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto grid min-h-screen max-w-lg place-items-center p-6">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center gap-3 pt-10 text-center">
            <CheckCircle2 className="h-14 w-14 text-emerald-600" />
            <h1 className="text-xl font-bold text-ink">Application Submitted</h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Your application has been submitted and is pending review by platform management. You will be redirected to the console dashboard to view your status.
            </p>
            <div className="flex gap-2.5 pt-2">
              <Button onClick={() => navigate({ to: "/app/dashboard" })} className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 px-5 rounded-lg active:scale-98 transition-all">Go to Dashboard</Button>
              <Button variant="outline" onClick={() => navigate({ to: "/" })} className="h-10 border-line-strong hover:bg-panel text-xs font-semibold px-5 rounded-lg active:scale-98 transition-all">Back to Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4 py-10 lg:py-16">
      <Link to="/" className="text-sm text-muted-foreground hover:underline">← Back</Link>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Request a new society</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tell us about your community. The platform owner will review and reach out.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="sn">Society name</Label>
                <Input id="sn" required value={form.societyName} onChange={(e) => upd("societyName", e.target.value)} />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => upd("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Residential Apartment", "Club", "NGO", "Cultural", "Housing Society", "Other"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="addr">Full address</Label>
              <Input id="addr" required value={form.address} onChange={(e) => upd("address", e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="an">Applicant name</Label>
                <Input id="an" required value={form.applicantName} onChange={(e) => upd("applicantName", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="ac">Email or phone</Label>
                <Input id="ac" required value={form.applicantContact} onChange={(e) => upd("applicantContact", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="rc">Suggested Total Units</Label>
                <Input id="rc" type="number" required min={1} value={form.residentCount} onChange={(e) => upd("residentCount", e.target.value === "" ? "" as any : Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="mph">Members / Slot Limit</Label>
                <Input id="mph" type="number" required min={1} max={20} value={form.membersPerHousehold} onChange={(e) => upd("membersPerHousehold", e.target.value === "" ? "" as any : Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="ic">Initial Credits / Slot</Label>
                <Input id="ic" type="number" required min={0} value={form.initialCredits} onChange={(e) => upd("initialCredits", e.target.value === "" ? "" as any : Number(e.target.value))} />
              </div>
            </div>
            <div>
              <Label htmlFor="rs">Why do you want CEN?</Label>
              <Textarea id="rs" rows={4} value={form.reason} onChange={(e) => upd("reason", e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Submit application</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

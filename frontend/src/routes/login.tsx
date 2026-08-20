import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth";
import { authService } from "@/services";
import { sendPasswordResetEmail, resetDirectPassword } from "@/lib/firebaseAuth";
import { toast } from "sonner";
import { Sparkles, Building2, ShieldCheck, Milestone, ArrowRight, ChevronRight, Mail, CheckCircle2, Loader2 } from "lucide-react";



type LoginSearch = {
  redirect?: string;
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    return {
      redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    };
  },
  head: () => ({ meta: [{ title: "Login — CEN" }] }),
  component: Login,
});

const DEMO = [
  { role: "Owner (Aman)", email: "owner@cen.app", desc: "Manage all societies", color: "bg-teal-50 border-teal-200 text-teal-800" },
  { role: "Admin (Rohit)", email: "admin@cen.app", desc: "Oversee single network", color: "bg-indigo-50 border-indigo-200 text-indigo-800" },
  { role: "Coordinator (Vinay)", email: "coord@cen.app", desc: "Disputes & listings", color: "bg-emerald-50 border-emerald-200 text-emerald-800" },
  { role: "Resident (Aman)", email: "resident@cen.app", desc: "Exchange skills & help", color: "bg-slate-50 border-slate-200 text-slate-800" },
];

function Login() {
  const nav = useNavigate();
  const { redirect } = Route.useSearch();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("password123");

  // Forgot / Reset password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEm = forgotEmail.trim().toLowerCase();
    if (!cleanEm) {
      toast.error("Please enter your account email address.");
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      toast.error("Passwords do not match. Please re-enter.");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await authService.resetPassword(cleanEm, forgotNewPassword);
      setEmail(cleanEm);
      setPw(forgotNewPassword);
      setForgotSuccess(true);
      setForgotMessage(res.message || "Password updated successfully! You can now sign in.");
      toast.success("Password updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password. Please verify the email.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleQuickLoginAfterReset = async () => {
    setForgotOpen(false);
    try {
      const u = await login(forgotEmail.trim().toLowerCase(), forgotNewPassword);
      if (u) {
        toast.success(`Signed in as ${u.name}`);
        if (redirect) {
          nav({ to: redirect });
        } else {
          nav({ to: "/app/dashboard" });
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to log in.");
    }
  };


  const submit = async (e: React.FormEvent) => {

    e.preventDefault();
    try {
      const u = await login(email, pw);
      if (!u) return toast.error("No account found — try a demo email below.");
      toast.success(`Welcome ${u.name}`);
      if (redirect) {
        nav({ to: redirect });
      } else {
        nav({ to: "/app/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to log in.");
    }
  };

  const quick = async (em: string) => {
    setEmail(em);
    try {
      const u = await login(em, "password123");
      if (u) {
        toast.success(`Connected as ${u.name} (${u.role})`);
        if (redirect) {
          nav({ to: redirect });
        } else {
          nav({ to: "/app/dashboard" });
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to log in.");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-panel/20 font-body relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#e2efe9]/30 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#ece9f5]/30 rounded-full blur-[120px] -z-10"></div>

      {/* Left Column - Product Focus (hidden on mobile) */}
      <div className="hidden lg:flex lg:col-span-5 bg-deep-forest text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Radial grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0f_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#06261d]/40 to-[#031c15]/90"></div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-white text-base border border-white/20">
              C
            </div>
            <span className="font-bold tracking-tight text-white text-sm uppercase tracking-widest">CEN Network</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 my-auto">
          <h2 className="text-3xl font-bold font-headline-lg leading-tight tracking-tight">
            Exchange skills, <br />
            build local trust.
          </h2>
          <p className="text-xs text-emerald-100/80 leading-relaxed max-w-sm">
            CEN is a credit-based network designed to empower neighbors. Trade time, share resources, and organize your local society.
          </p>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-4 w-4 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold">Federated Societies</h4>
                <p className="text-[10px] text-emerald-100/70 mt-0.5">Independent local networks operated by custom rules.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold">Mediated Disputes</h4>
                <p className="text-[10px] text-emerald-100/70 mt-0.5">Coordinators mediate list reviews and transaction conflicts.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Milestone className="h-4 w-4 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold">Zero-Commission Credits</h4>
                <p className="text-[10px] text-emerald-100/70 mt-0.5">Community credits circulate value without central fee cuts.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[10px] text-emerald-200/50 flex justify-between">
          <span>© {new Date().getFullYear()} CEN Platform</span>
          <span>Terms & Privacy</span>
        </div>
      </div>

      {/* Right Column - Forms & Demo Entry */}
      <div className="lg:col-span-7 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-lg space-y-6">
          {/* Card Form */}
          <Card className="border-line/60 shadow-xl bg-white/95 backdrop-blur-md">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold text-ink">Sign In</CardTitle>
                  <CardDescription className="text-xs text-on-surface-variant mt-1">Access your society dashboard console.</CardDescription>
                </div>
                <div className="lg:hidden h-8 w-8 rounded-lg bg-deep-forest flex items-center justify-center font-bold text-white text-xs">
                  C
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-ink">Email Address</Label>
                  <Input 
                    type="email" 
                    placeholder="rohit@cen.app" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 rounded-lg border-line-strong/60 focus:border-deep-forest focus:ring-1 focus:ring-deep-forest/20 text-xs"
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-ink">Password</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setForgotSuccess(false);
                        setForgotMessage("");
                        setForgotOpen(true);
                      }}
                      className="text-[10px] text-on-surface-variant hover:underline cursor-pointer bg-transparent border-0 p-0 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input 
                    type="password" 
                    required 
                    value={pw} 
                    onChange={(e) => setPw(e.target.value)}
                    className="h-10 rounded-lg border-line-strong/60 focus:border-deep-forest focus:ring-1 focus:ring-deep-forest/20 text-xs"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-on-surface-variant">New to CEN?</span>
                  <Link to="/signup" className="text-deep-forest font-bold hover:underline flex items-center gap-0.5">
                    Create account <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <Button type="submit" className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold h-10 rounded-lg text-xs cursor-pointer shadow-sm">
                  Sign In
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Demo Accs */}
          <Card className="border-dashed border-line shadow-sm bg-panel/30">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="flex items-center gap-1.5 text-xs font-bold text-ink">
                <Sparkles className="h-4 w-4 text-deep-forest animate-pulse" /> Sandbox Quick Login
              </CardTitle>
              <CardDescription className="text-[10px] text-on-surface-variant">Select any role below to bypass authentication and review society mockups.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2.5 sm:grid-cols-2">
              {DEMO.map((d) => (
                <button
                  key={d.email}
                  onClick={() => quick(d.email)}
                  className="flex items-center justify-between rounded-xl border border-line-strong/40 bg-white p-3 text-left hover:border-deep-forest hover:bg-deep-forest/5 transition-all group active:scale-98 cursor-pointer shadow-sm"
                >
                  <div className="min-w-0">
                    <span className={`inline-block text-[8px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border mb-1.5 ${d.color}`}>
                      {d.role}
                    </span>
                    <div className="text-[10px] font-bold text-ink truncate leading-tight">{d.email}</div>
                    <div className="text-[9px] text-on-surface-variant truncate mt-0.5">{d.desc}</div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                </button>
              ))}
            </CardContent>
          </Card>

          <div className="text-center">
            <Link to="/" className="text-[11px] font-semibold text-on-surface-variant hover:text-ink transition-colors hover:underline">
              ← Back to homepage
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot / Reset Password Modal Dialog */}
      <Dialog
        open={forgotOpen}
        onOpenChange={(open) => {
          setForgotOpen(open);
          if (!open) {
            setForgotSuccess(false);
            setForgotMessage("");
            setForgotNewPassword("");
            setForgotConfirmPassword("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-white border-line/60 shadow-2xl p-6">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-deep-forest/10 flex items-center justify-center text-deep-forest mb-2">
              <Mail className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-ink">Reset Your Account Password</DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant">
              Enter your account email and choose a new password. The update will take effect immediately.
            </DialogDescription>
          </DialogHeader>

          {forgotSuccess ? (
            <div className="space-y-4 pt-2">
              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertTitle className="font-bold text-xs">Password Updated Successfully</AlertTitle>
                <AlertDescription className="text-xs text-emerald-800/90 mt-1">
                  Your credentials for <span className="font-semibold">{forgotEmail}</span> have been updated in the system. Your login form is now filled with your new password.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={handleQuickLoginAfterReset}
                  className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 rounded-lg cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  Sign In Now (1-Click) <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForgotOpen(false)}
                  className="w-full text-xs border-line-strong hover:bg-panel cursor-pointer"
                >
                  Back to Sign In Form
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <Label htmlFor="forgot-email" className="text-xs font-bold text-ink">
                  Account Email Address
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="resident@cen.app"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="h-9 rounded-lg border-line-strong/60 focus:border-deep-forest focus:ring-1 focus:ring-deep-forest/20 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="forgot-new-pw" className="text-xs font-bold text-ink">
                  New Password
                </Label>
                <Input
                  id="forgot-new-pw"
                  type="password"
                  placeholder="Enter new password (min. 6 characters)"
                  required
                  minLength={6}
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  className="h-9 rounded-lg border-line-strong/60 focus:border-deep-forest focus:ring-1 focus:ring-deep-forest/20 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="forgot-confirm-pw" className="text-xs font-bold text-ink">
                  Confirm New Password
                </Label>
                <Input
                  id="forgot-confirm-pw"
                  type="password"
                  placeholder="Re-enter new password"
                  required
                  minLength={6}
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  className="h-9 rounded-lg border-line-strong/60 focus:border-deep-forest focus:ring-1 focus:ring-deep-forest/20 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForgotOpen(false)}
                  className="h-9 border-line-strong text-xs font-semibold hover:bg-panel cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={forgotLoading}
                  className="h-9 bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs px-5 rounded-lg cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}



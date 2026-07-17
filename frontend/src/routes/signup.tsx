import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { authService } from "@/services";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

type SignupSearch = {
  redirect?: string;
};

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>): SignupSearch => {
    return {
      redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    };
  },
  head: () => ({ meta: [{ title: "Sign up — CEN" }] }),
  component: Signup,
});

function Signup() {
  const nav = useNavigate();
  const { redirect } = Route.useSearch();
  const { setUserById } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error("Passwords do not match");
    const u = await authService.signup(form.name, form.email);
    if (u) {
      await setUserById(u.id);
      toast.success("Account created — now claim your household or request a society");
      if (redirect) {
        nav({ to: redirect });
      } else {
        nav({ to: "/app/dashboard" });
      }
    } else {
      toast.error("Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-panel/20 p-4 font-body relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] bg-[#e2efe9]/30 rounded-full blur-[130px] -z-10"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[55%] bg-[#ece9f5]/30 rounded-full blur-[130px] -z-10"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-deep-forest flex items-center justify-center font-bold text-white text-sm shadow-sm">
              C
            </div>
            <span className="font-bold text-ink tracking-tight leading-none text-xs uppercase tracking-widest">CEN Network</span>
          </Link>
        </div>

        <Card className="border-line/60 shadow-xl bg-white/95 backdrop-blur-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-ink">Create Account</CardTitle>
            <CardDescription className="text-xs text-on-surface-variant mt-1">Join a community exchange or request a new society setup.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-ink">Full Name</Label>
                <Input 
                  placeholder="John Doe"
                  required 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  className="h-10 rounded-lg border-line-strong/60 focus:border-deep-forest focus:ring-1 focus:ring-deep-forest/20 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-ink">Email Address</Label>
                <Input 
                  type="email" 
                  placeholder="name@mail.com"
                  required 
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  className="h-10 rounded-lg border-line-strong/60 focus:border-deep-forest focus:ring-1 focus:ring-deep-forest/20 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-ink">Password</Label>
                <Input 
                  type="password" 
                  required 
                  value={form.password} 
                  onChange={(e) => setForm({ ...form, password: e.target.value })} 
                  className="h-10 rounded-lg border-line-strong/60 focus:border-deep-forest focus:ring-1 focus:ring-deep-forest/20 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-ink">Confirm Password</Label>
                <Input 
                  type="password" 
                  required 
                  value={form.confirm} 
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })} 
                  className="h-10 rounded-lg border-line-strong/60 focus:border-deep-forest focus:ring-1 focus:ring-deep-forest/20 text-xs"
                />
              </div>

              <div className="flex items-center gap-1.5 py-1 text-[10px] text-on-surface-variant/90 leading-tight">
                <ShieldCheck className="h-4 w-4 text-deep-forest flex-shrink-0" />
                <span>By signing up, you agree to local exchange guidelines & guidelines.</span>
              </div>

              <Button type="submit" className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold h-10 rounded-lg text-xs cursor-pointer shadow-sm mt-1">
                Create Account
              </Button>

              <div className="text-center text-xs text-on-surface-variant pt-2 border-t border-line/45 mt-2">
                Already registered?{" "}
                <Link to="/login" className="text-deep-forest font-bold hover:underline">
                  Login instead
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant hover:text-ink transition-colors hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

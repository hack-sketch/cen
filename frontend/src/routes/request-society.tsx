import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { societyService } from "@/services";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/request-society")({
  head: () => ({ meta: [{ title: "Request a new society — CEN" }] }),
  component: RequestSociety,
});

function RequestSociety() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    societyName: "",
    type: "Residential Apartment",
    address: "",
    applicantName: "",
    applicantContact: "",
    reason: "",
  });
  const upd = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: replace with real API call to backend
    await societyService.submitApplication(form);
    toast.success("Application submitted for owner review");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mx-auto grid min-h-screen max-w-lg place-items-center p-6">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center gap-3 pt-10 text-center">
            <CheckCircle2 className="h-14 w-14 text-primary" />
            <h1 className="text-xl font-semibold">Application submitted</h1>
            <p className="text-sm text-muted-foreground">
              Your application has been submitted and is pending owner approval. You'll be notified once reviewed.
            </p>
            <Button onClick={() => navigate({ to: "/" })}>Back to home</Button>
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

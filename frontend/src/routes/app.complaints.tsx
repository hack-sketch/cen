import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { complaintService, userService } from "@/services";
import { categorizeComplaint } from "@/services/ai";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, ShieldAlert, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/complaints")({ component: Page });

function Page() {
  const { user } = useAuth();
  const list = useQuery({ queryKey: ["myComps", user!.id], queryFn: () => complaintService.listForUser(user!.id) });
  return (
    <div className="space-y-6 pb-12 animate-page-fade">
      <PageHeader 
        title="My Complaints" 
        description="File disputes or regular complaints and track resolution progress anonymously." 
        action={
          <div className="flex gap-2"><NewComplaintDialog /><PrivateComplaintDialog /></div>
        } 
      />
      <div className="space-y-4">
        {list.data?.map((c) => (
          <Card key={c.id} className="border-line/60 shadow-[0_4px_20px_-4px_rgba(16,86,68,0.04)] hover:shadow-[0_12px_30px_-6px_rgba(16,86,68,0.1)] hover:-translate-y-0.5 transition-all duration-300 bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start gap-4 pb-4 border-b border-line/20">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-bold text-lg text-ink leading-snug">{c.subject}</h3>
                    <Badge variant="outline" className="text-xs border-line font-medium text-on-surface-variant bg-panel/30 uppercase px-2 py-0.5">{c.category}</Badge>
                    <Badge className={cn(
                      "text-xs uppercase font-bold border px-2 py-0.5",
                      c.status === "open" ? "bg-amber-50 border-amber-200 text-amber-800" :
                      c.status === "in-review" ? "bg-blue-50 border-blue-200 text-blue-800" :
                      "bg-emerald-50 border-emerald-200 text-emerald-800"
                    )}>
                      {c.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1.5">Filed on {c.createdAt}</p>
                </div>
              </div>
              
              <p className="text-sm sm:text-base text-ink leading-relaxed pt-4 mt-1 whitespace-pre-line pl-2 border-l-2 border-line/30">
                {c.description}
              </p>
            </CardContent>
          </Card>
        ))}
        {list.data?.length === 0 && (
          <div className="py-12 text-center text-xs text-on-surface-variant border border-dashed border-line rounded-xl bg-white">
            You haven't filed any complaints yet.
          </div>
        )}
      </div>
    </div>
  );
}

function NewComplaintDialog() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", category: "General" });
  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 px-4 rounded-lg shadow-sm cursor-pointer active:scale-98 transition-all">
          <Plus className="mr-1.5 h-4 w-4" /> File Complaint
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-line/60 rounded-2xl p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <DialogHeader className="pb-3 border-b border-line/35">
          <DialogTitle className="text-base font-bold text-ink">File a Complaint</DialogTitle>
          <span className="text-xs text-on-surface-variant">Submit local issues, noise complaints, or facility alerts to coordinators.</span>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">Subject</Label>
            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief title of the issue" className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-lg"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {["General", "Noise", "Facilities", "Safety", "Other"].map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">Detailed Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Please explain the details of your complaint..." rows={4} className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs rounded-lg p-3" />
          </div>
          <div className="flex items-center gap-2.5 py-1.5 px-1 bg-panel/20 border border-dashed rounded-lg">
            <input
              type="checkbox"
              id="anon-check-normal"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4.5 w-4.5 rounded border-line-strong text-deep-forest focus:ring-deep-forest cursor-pointer"
            />
            <Label htmlFor="anon-check-normal" className="text-xs font-semibold text-ink cursor-pointer select-none">
              File Anonymously (Hide your identity from coordinators)
            </Label>
          </div>
          <Button 
            disabled={!form.subject.trim() || !form.description.trim() || loading} 
            className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 rounded-lg shadow-sm cursor-pointer mt-2 active:scale-98 transition-all" 
            onClick={async () => {
              setLoading(true);
              try {
                const { priority } = await categorizeComplaint(form.description);
                await complaintService.file({
                  filedById: user!.id, filedByName: isAnonymous ? "Anonymous" : user!.name, involvedUserIds: [],
                  subject: form.subject, description: form.description, category: form.category,
                  priority, societyId: user!.societyId!, assignedCoordinatorId: "u-coord",
                });
                setOpen(false); 
                qc.invalidateQueries();
                setForm({ subject: "", description: "", category: "General" });
                setIsAnonymous(false);
                toast.success("Complaint filed successfully!");
              } catch {
                toast.error("Failed to file complaint.");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Filing..." : "Submit Complaint"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PrivateComplaintDialog() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [form, setForm] = useState({ subject: "", description: "", targetCoordinatorId: "" });
  const [loading, setLoading] = useState(false);
  const coords = useQuery({ queryKey: ["coords", user!.societyId], queryFn: () => userService.listCoordinators(user!.societyId!) });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-xs font-semibold h-10 px-4 border-line-strong hover:bg-panel cursor-pointer active:scale-98 transition-all shadow-sm">
          <ShieldAlert className="mr-1.5 h-4 w-4 text-orange-500" /> Coordinator Conduct
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-line/60 rounded-2xl p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <DialogHeader className="pb-3 border-b border-line/35">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-ink">
            <EyeOff className="h-4.5 w-4.5 text-deep-forest animate-pulse" /> Confidential Audit complaint
          </DialogTitle>
          <span className="text-xs text-on-surface-variant">Confidential channel sent to Admin. You can choose whether to reveal your identity.</span>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">Target Coordinator</Label>
            <Select value={form.targetCoordinatorId} onValueChange={(v) => setForm({ ...form, targetCoordinatorId: v })}>
              <SelectTrigger className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-lg"><SelectValue placeholder="Select target coordinator" /></SelectTrigger>
              <SelectContent>{coords.data?.map((c) => <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">Subject</Label>
            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject of misconduct or issue" className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">Detailed Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Please explain the details of the misconduct privately..." rows={4} className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs rounded-lg p-3" />
          </div>
          <div className="flex items-center gap-2.5 py-1.5 px-1 bg-panel/20 border border-dashed rounded-lg">
            <input
              type="checkbox"
              id="anon-check-private"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4.5 w-4.5 rounded border-line-strong text-deep-forest focus:ring-deep-forest cursor-pointer"
            />
            <Label htmlFor="anon-check-private" className="text-xs font-semibold text-ink cursor-pointer select-none">
              File Anonymously (Hide your identity from Admin)
            </Label>
          </div>
          <Button 
            className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 rounded-lg shadow-sm cursor-pointer mt-2 active:scale-98 transition-all" 
            disabled={!form.targetCoordinatorId || !form.subject.trim() || !form.description.trim() || loading} 
            onClick={async () => {
              setLoading(true);
              try {
                await complaintService.fileAgainstCoordinator({
                  filedById: user!.id, filedByName: isAnonymous ? "Anonymous" : user!.name,
                  subject: form.subject, description: form.description,
                  category: "Coordinator Conduct", targetCoordinatorId: form.targetCoordinatorId,
                  societyId: user!.societyId!, priority: "high",
                });
                setOpen(false);
                qc.invalidateQueries({ queryKey: ["priv", user!.societyId] });
                setForm({ subject: "", description: "", targetCoordinatorId: "" });
                setIsAnonymous(true);
                toast.success("Confidential complaint filed with Admin");
              } catch {
                toast.error("Failed to file private complaint.");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Sending..." : "Send Private Complaint"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

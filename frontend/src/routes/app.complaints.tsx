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

export const Route = createFileRoute("/app/complaints")({ component: Page });

function Page() {
  const { user } = useAuth();
  const list = useQuery({ queryKey: ["myComps", user!.id], queryFn: () => complaintService.listForUser(user!.id) });
  return (
    <div>
      <PageHeader title="Complaints" description="File complaints and track resolution. Your complaint against a coordinator stays confidential." action={
        <div className="flex gap-2"><NewComplaintDialog /><PrivateComplaintDialog /></div>
      } />
      <div className="space-y-3">
        {list.data?.map((c) => (
          <Card key={c.id}><CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2"><h3 className="font-medium">{c.subject}</h3><Badge variant="secondary">{c.category}</Badge></div>
                <p className="mt-1 text-sm">{c.description}</p>
                <div className="mt-1 text-xs text-muted-foreground">Filed {c.createdAt}</div>
              </div>
              <Badge>{c.status}</Badge>
            </div>
          </CardContent></Card>
        ))}
        {list.data?.length === 0 && <div className="text-sm text-muted-foreground">You haven't filed any complaints.</div>}
      </div>
    </div>
  );
}

function NewComplaintDialog() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", category: "General" });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" /> File complaint</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New complaint</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["General", "Noise", "Facilities", "Safety", "Other"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={async () => {
            // AI will categorize/prioritize on the coordinator side.
            const { priority } = await categorizeComplaint(form.description);
            await complaintService.file({
              filedById: user!.id, filedByName: user!.name, involvedUserIds: [],
              subject: form.subject, description: form.description, category: form.category,
              priority, societyId: user!.societyId!, assignedCoordinatorId: "u-coord",
            });
            setOpen(false); qc.invalidateQueries();
            toast.success("Complaint filed");
          }}>Submit</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PrivateComplaintDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", targetCoordinatorId: "" });
  const coords = useQuery({ queryKey: ["coords", user!.societyId], queryFn: () => userService.listCoordinators(user!.societyId!) });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><ShieldAlert className="mr-1 h-4 w-4 text-orange-500" /> Against coordinator</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle className="flex items-center gap-2"><EyeOff className="h-4 w-4" /> Confidential complaint</DialogTitle></DialogHeader>
        <div className="rounded-md border-l-4 border-primary bg-primary/5 p-3 text-xs">
          Only the Admin will see this. Your identity will be shown as <b>Anonymous</b> to everyone including the coordinator.
        </div>
        <div className="space-y-3">
          <div><Label>Coordinator</Label>
            <Select value={form.targetCoordinatorId} onValueChange={(v) => setForm({ ...form, targetCoordinatorId: v })}>
              <SelectTrigger><SelectValue placeholder="Select coordinator" /></SelectTrigger>
              <SelectContent>{coords.data?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <Button className="w-full" disabled={!form.targetCoordinatorId} onClick={async () => {
            await complaintService.fileAgainstCoordinator({
              filedById: user!.id, filedByName: user!.name,
              subject: form.subject, description: form.description,
              category: "Coordinator Conduct", targetCoordinatorId: form.targetCoordinatorId,
              societyId: user!.societyId!, priority: "high",
            });
            setOpen(false);
            toast.success("Confidential complaint filed with Admin");
          }}>Send to Admin</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

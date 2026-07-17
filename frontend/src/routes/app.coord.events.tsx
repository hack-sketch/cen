import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { eventService } from "@/services";
import { suggestVolunteers, type VolunteerSuggestion } from "@/services/ai";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Plus, Sparkles } from "lucide-react";

export const Route = createFileRoute("/app/coord/events")({ component: Page });

function Page() {
  const { user } = useAuth();
  const sid = user!.societyId!;
  const qc = useQueryClient();
  const events = useQuery({ queryKey: ["ev", sid], queryFn: () => eventService.list(sid) });
  const vrs = useQuery({ queryKey: ["vr", sid], queryFn: () => eventService.listVolunteerRequests(sid) });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", volunteersNeeded: 4 });

  return (
    <div>
      <PageHeader title="Events" description="Create and manage community events. Approve volunteer requests." action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" /> New event</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create event</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div><Label>Volunteers needed</Label><Input type="number" value={form.volunteersNeeded} onChange={(e) => setForm({ ...form, volunteersNeeded: +e.target.value })} /></div>
              </div>
              <Button className="w-full" onClick={async () => {
                // TODO: replace with real API call to backend
                await eventService.create({ ...form, createdByCoordinatorId: user!.id, societyId: sid });
                setOpen(false); qc.invalidateQueries({ queryKey: ["ev", sid] });
                toast.success("Event created");
              }}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      } />

      <div className="space-y-3">
        {events.data?.map((e) => {
          const reqs = vrs.data?.filter((v) => v.eventId === e.id) ?? [];
          return (
            <Card key={e.id}><CardContent className="pt-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /><h3 className="font-semibold">{e.title}</h3><Badge>{e.status}</Badge></div>
                  <div className="text-xs text-muted-foreground">{e.date} · {e.volunteers.length}/{e.volunteersNeeded} volunteers</div>
                  <p className="mt-1 text-sm">{e.description}</p>
                </div>
                <SuggestButton eventId={e.id} eventTitle={e.title} />
              </div>
              {reqs.length > 0 && (
                <div className="mt-4 space-y-2 border-t pt-3">
                  <div className="text-xs font-medium text-muted-foreground">Volunteer requests</div>
                  {reqs.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                      <div>
                        {r.residentName} <Badge variant="outline" className="ml-1">{r.type}</Badge>
                      </div>
                      {r.status === "pending" ? (
                        <div className="flex gap-1">
                          <Button size="sm" onClick={async () => { await eventService.approveVolunteer(r.id); qc.invalidateQueries(); toast.success("Approved"); }}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={async () => { await eventService.rejectVolunteer(r.id); qc.invalidateQueries(); }}>Reject</Button>
                        </div>
                      ) : <Badge>{r.status}</Badge>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent></Card>
          );
        })}
      </div>
    </div>
  );
}

function SuggestButton({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const [items, setItems] = useState<VolunteerSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={async () => {
          // TODO: connect to real AI backend recommendation endpoint
          setItems(await suggestVolunteers(eventId));
        }}>
          <Sparkles className="mr-1 h-4 w-4 text-primary" /> Suggest volunteers
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>AI-suggested volunteers</DialogTitle></DialogHeader>
        <div className="space-y-2">
          {items.map((s) => (
            <div key={s.user.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="font-medium">{s.user.name}</div>
                <div className="text-xs text-muted-foreground">{s.reason} · match {s.score}%</div>
              </div>
              <Button size="sm" onClick={async () => {
                await eventService.inviteVolunteer(eventId, s.user.id, s.user.name, eventTitle);
                qc.invalidateQueries();
                toast.success(`Invited ${s.user.name}`);
              }}>Invite</Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
import { Calendar, Plus, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/coord/events")({ component: Page });

function Page() {
  const { user } = useAuth();
  const sid = user!.societyId!;
  const qc = useQueryClient();
  const events = useQuery({ queryKey: ["ev", sid], queryFn: () => eventService.list(sid) });
  const vrs = useQuery({ queryKey: ["vr", sid], queryFn: () => eventService.listVolunteerRequests(sid) });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ title: string; description: string; date: string; volunteersNeeded: number | string }>({ title: "", description: "", date: "", volunteersNeeded: 4 });

  return (
    <div className="space-y-6 pb-12 animate-page-fade">
      <PageHeader 
        title="Events Board" 
        description="Schedule upcoming society assemblies, analyze profiles to recruit volunteers, and moderate signups." 
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 px-4 rounded-lg shadow-sm cursor-pointer active:scale-98 transition-all">
                <Plus className="mr-1.5 h-4 w-4" /> Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-line/60 rounded-2xl p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
              <DialogHeader className="pb-3 border-b border-line/35">
                <DialogTitle className="text-base font-bold text-ink">Schedule Community Event</DialogTitle>
                <span className="text-xs text-on-surface-variant">Publish an event to let residents register and spend or earn credits.</span>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Event Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Park Cleanup Day" className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Provide event goals, location details, etc..." className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs rounded-lg p-3" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Scheduled Date</Label>
                    <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-lg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Volunteers Required</Label>
                    <Input type="number" value={form.volunteersNeeded} onChange={(e) => setForm({ ...form, volunteersNeeded: e.target.value === "" ? "" : Number(e.target.value) })} className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-lg" />
                  </div>
                </div>
                <Button className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 rounded-lg shadow-sm cursor-pointer mt-2 active:scale-98 transition-all" onClick={async () => {
                  await eventService.create({ ...form, volunteersNeeded: Number(form.volunteersNeeded) || 0, createdByCoordinatorId: user!.id, societyId: sid });
                  setOpen(false); 
                  qc.invalidateQueries({ queryKey: ["ev", sid] });
                  toast.success("Event created successfully!");
                }}>Create Event</Button>
              </div>
            </DialogContent>
          </Dialog>
        } 
      />

      <div className="space-y-4">
        {events.data?.map((e) => {
          const reqs = vrs.data?.filter((v) => v.eventId === e.id) ?? [];
          return (
            <Card key={e.id} className="border-line/60 shadow-[0_4px_20px_-4px_rgba(16,86,68,0.04)] hover:shadow-[0_12px_30px_-6px_rgba(16,86,68,0.1)] hover:-translate-y-0.5 transition-all duration-300 bg-white">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-line/20">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-deep-forest/5 text-deep-forest border border-deep-forest/15 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-bold text-lg text-ink">{e.title}</h3>
                        <Badge className="bg-deep-forest/5 border border-deep-forest/15 text-deep-forest text-xs uppercase font-bold tracking-wider px-2 py-0.5 pointer-events-none rounded">
                          {e.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1.5">Scheduled: <span className="font-semibold text-ink">{e.date}</span> · Capacity: <span className="font-semibold text-ink">{e.volunteers.length} / {e.volunteersNeeded}</span> Volunteers</p>
                    </div>
                  </div>
                  <SuggestButton eventId={e.id} eventTitle={e.title} />
                </div>

                <div className="pt-4 pb-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-on-surface-variant/80 block mb-1">Details & Roster Instructions</span>
                  <p className="text-sm sm:text-base text-ink leading-relaxed">{e.description}</p>
                </div>

                {reqs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-line/20 space-y-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-on-surface-variant/80 block mb-2">Volunteer Roster Status</span>
                    <div className="grid gap-2">
                      {reqs.map((r) => (
                        <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line/40 p-3.5 text-sm bg-panel/20">
                          <div>
                            <span className="font-bold text-ink">{r.residentName}</span>
                            <Badge variant="outline" className="ml-2 text-xs font-semibold border-line bg-white text-on-surface-variant uppercase px-2 py-0.5">{r.type}</Badge>
                          </div>
                          <div>
                            {r.status === "left" ? (
                              <div className="text-sm text-rose-800 bg-rose-50 border border-rose-100 rounded-lg px-4 py-2 max-w-sm italic">
                                <span className="font-bold not-italic text-rose-950 block text-xs uppercase tracking-wider mb-0.5">Withdrew from event</span>
                                Reason: "{r.leaveReason || "No reason provided."}"
                              </div>
                            ) : r.type === "self-requested" && r.status === "pending" ? (
                              <div className="flex gap-1.5">
                                <Button size="sm" className="h-9 text-xs font-semibold px-3 bg-deep-forest hover:bg-deep-forest/90 text-white cursor-pointer active:scale-98 transition-all" onClick={async () => { await eventService.approveVolunteer(r.id); qc.invalidateQueries(); toast.success("Approved volunteer request!"); }}>Approve</Button>
                                <Button size="sm" variant="outline" className="h-9 text-xs font-semibold px-3 border-line-strong hover:bg-panel cursor-pointer" onClick={async () => { await eventService.rejectVolunteer(r.id); qc.invalidateQueries(); toast.info("Rejected volunteer request."); }}>Reject</Button>
                              </div>
                            ) : r.type === "coordinator-invited" && r.status === "pending" ? (
                              <Badge className="bg-blue-50 border-blue-200 text-blue-800 text-xs uppercase font-bold tracking-wider px-2 py-0.5 border">
                                Invited (Pending Response)
                              </Badge>
                            ) : (
                              <Badge className={cn(
                                "text-xs uppercase font-bold border px-2 py-0.5",
                                r.status === "approved" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
                              )}>
                                {r.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function SuggestButton({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const [items, setItems] = useState<VolunteerSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs font-semibold h-9 px-3 border-line-strong hover:bg-panel cursor-pointer flex-shrink-0" onClick={async () => {
          setLoading(true);
          try {
            setItems(await suggestVolunteers(eventId));
          } catch {
            toast.error("Failed to suggestions.");
          } finally {
            setLoading(false);
          }
        }}>
          <Sparkles className="mr-1.5 h-3.5 w-3.5 text-soft-violet animate-pulse" /> AI Invite Recs
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-line/60 rounded-2xl p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <DialogHeader className="pb-3 border-b border-line/35">
          <DialogTitle className="text-base font-bold text-ink">AI Volunteer Matchmaker</DialogTitle>
          <span className="text-xs text-on-surface-variant">Recommended residents with skills or interest matches matching event description.</span>
        </DialogHeader>
        <div className="space-y-3 pt-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
          {loading ? (
            <div className="py-6 text-center text-xs text-on-surface-variant">Running match recommendation agent...</div>
          ) : items.map((s) => (
            <div key={s.user.id} className="flex items-center justify-between gap-4 rounded-xl border border-line/40 p-3 bg-panel/15 text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-ink">{s.user.name}</div>
                <div className="text-[10px] text-on-surface-variant font-medium">{s.reason}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50 text-[9px] font-bold">{s.score}% Match</Badge>
                <Button size="sm" className="h-[28px] text-[10px] font-semibold px-3 bg-deep-forest hover:bg-deep-forest/90 text-white cursor-pointer active:scale-98 transition-all" onClick={async () => {
                  await eventService.inviteVolunteer(eventId, s.user.id, s.user.name, eventTitle);
                  qc.invalidateQueries();
                  toast.success(`Invited ${s.user.name}!`);
                }}>Invite</Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

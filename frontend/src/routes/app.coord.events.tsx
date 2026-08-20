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
import { eventService, userService } from "@/services";
import { suggestVolunteers, type VolunteerSuggestion } from "@/services/ai";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Plus, Sparkles, UserPlus, UserX } from "lucide-react";
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

  const withdrawnReqs = vrs.data?.filter((v) => v.status === "left") ?? [];

  return (
    <div className="space-y-6 pb-12 animate-page-fade">
      <PageHeader 
        title="Events Board" 
        description="Schedule upcoming society assemblies, analyze profiles to recruit volunteers, and moderate signups." 
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 px-4 rounded-lg shadow-sm cursor-pointer active:scale-98 transition-all w-full sm:w-auto">
                <Plus className="mr-1.5 h-4 w-4" /> Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto border-line/60 rounded-2xl p-4 sm:p-6">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  try {
                    await eventService.create({ ...form, volunteersNeeded: Number(form.volunteersNeeded) || 0, createdByCoordinatorId: user!.id, societyId: sid });
                    setOpen(false); 
                    setForm({ title: "", description: "", date: "", volunteersNeeded: 4 });
                    qc.invalidateQueries({ queryKey: ["ev", sid] });
                    toast.success("Event created successfully!");
                  } catch (err: any) {
                    toast.error(err.message || "Failed to create event.");
                  }
                }}>Create Event</Button>
              </div>
            </DialogContent>
          </Dialog>
        } 
      />

      {withdrawnReqs.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 sm:p-5 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-2">
              <UserX className="h-4 w-4 text-rose-600 flex-shrink-0" />
              Withdrawn Volunteers Audit Log ({withdrawnReqs.length})
            </div>
            <Badge variant="outline" className="bg-white border-rose-200 text-rose-800 text-[10px] font-semibold self-start sm:self-auto">
              Resident Opt-Out Records
            </Badge>
          </div>
          <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2">
            {withdrawnReqs.map((w) => (
              <div key={w.id} className="bg-white p-3.5 rounded-xl border border-rose-100 shadow-xs space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-ink">{w.residentName}</span>
                  <Badge className="bg-rose-100 text-rose-800 border-none text-[10px] font-semibold">
                    Withdrew
                  </Badge>
                </div>
                <div className="text-[11px] text-on-surface-variant">
                  Event: <span className="font-semibold text-ink">"{w.eventTitle}"</span>
                </div>
                <div className="text-rose-900 bg-rose-50/80 rounded-lg p-2.5 text-[11px] italic border border-rose-100">
                  <span className="font-semibold not-italic text-rose-950">Reason: </span>
                  "{w.leaveReason || "No reason provided."}"
                </div>
                <div className="pt-1 flex justify-end">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-[10px] font-semibold px-2.5 border-rose-200 text-rose-700 hover:bg-rose-50 cursor-pointer"
                    onClick={async () => {
                      await eventService.inviteVolunteer(w.eventId, w.residentId, w.residentName, w.eventTitle);
                      qc.invalidateQueries({ queryKey: ["vr", sid] });
                      toast.success(`Sent new volunteer invitation to ${w.residentName}`);
                    }}
                  >
                    Re-invite Resident
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {events.data?.map((e) => {
          const reqs = vrs.data?.filter((v) => v.eventId === e.id) ?? [];
          const eventWithdrawnCount = reqs.filter((r) => r.status === "left").length;

          return (
            <Card key={e.id} className="border-line/60 shadow-xs hover:shadow-md transition-shadow bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3.5 border-b border-line/20">
                  <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
                    <div className="w-9 h-9 rounded-xl bg-deep-forest/5 text-deep-forest border border-deep-forest/15 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base sm:text-lg text-ink">{e.title}</h3>
                        <Badge className="bg-deep-forest/5 border border-deep-forest/15 text-deep-forest text-[10px] sm:text-xs uppercase font-bold tracking-wider px-2 py-0.5 pointer-events-none rounded">
                          {e.status}
                        </Badge>
                        {eventWithdrawnCount > 0 && (
                          <Badge className="bg-rose-50 border border-rose-200 text-rose-700 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded">
                            {eventWithdrawnCount} Withdrawn
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">Scheduled: <span className="font-semibold text-ink">{e.date}</span> · Capacity: <span className="font-semibold text-ink">{e.volunteers.length} / {e.volunteersNeeded}</span> Volunteers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0 w-full sm:w-auto">
                    <SuggestButton eventId={e.id} eventTitle={e.title} />
                    <ManualInviteButton eventId={e.id} eventTitle={e.title} sid={sid} />
                  </div>
                </div>

                <div className="pt-1 pb-1">
                  <span className="text-xs uppercase font-bold tracking-wider text-on-surface-variant/80 block mb-1">Details & Roster Instructions</span>
                  <p className="text-xs sm:text-sm text-ink leading-relaxed">{e.description}</p>
                </div>

                {reqs.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-line/20 space-y-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-on-surface-variant/80 block mb-2">Volunteer Roster Status</span>
                    <div className="grid gap-2">
                      {reqs.map((r) => (
                        <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-line/40 p-3 text-xs bg-panel/20">
                          <div>
                            <span className="font-bold text-ink">{r.residentName}</span>
                            <Badge variant="outline" className="ml-2 text-[10px] font-semibold border-line bg-white text-on-surface-variant uppercase px-2 py-0.5">{r.type}</Badge>
                          </div>
                          <div>
                            {r.status === "left" ? (
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl p-3 w-full">
                                <div>
                                  <span className="font-bold text-rose-950 uppercase tracking-wider block text-[10px] mb-0.5">Withdrew from event</span>
                                  <span className="italic">Reason: "{r.leaveReason || "No reason provided."}"</span>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 text-[10px] font-semibold px-2.5 border-rose-300 text-rose-700 hover:bg-white cursor-pointer self-end sm:self-auto"
                                  onClick={async () => {
                                    await eventService.inviteVolunteer(r.eventId, r.residentId, r.residentName, e.title);
                                    qc.invalidateQueries({ queryKey: ["vr", sid] });
                                    toast.success(`Re-invited ${r.residentName} to event.`);
                                  }}
                                >
                                  Re-invite
                                </Button>
                              </div>
                            ) : r.type === "self-requested" && r.status === "pending" ? (
                              <div className="flex gap-1.5 pt-1 sm:pt-0">
                                <Button size="sm" className="h-8 text-xs font-semibold px-3 bg-deep-forest hover:bg-deep-forest/90 text-white cursor-pointer active:scale-98 transition-all" onClick={async () => { await eventService.approveVolunteer(r.id); qc.invalidateQueries(); toast.success("Approved volunteer request!"); }}>Approve Application</Button>
                                <Button size="sm" variant="outline" className="h-8 text-xs font-semibold px-3 border-line-strong hover:bg-panel cursor-pointer" onClick={async () => { await eventService.rejectVolunteer(r.id); qc.invalidateQueries(); toast.info("Rejected volunteer request."); }}>Reject</Button>
                              </div>
                            ) : r.type === "coordinator-invited" && r.status === "pending" ? (
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className="bg-blue-50 border-blue-200 text-blue-800 text-[10px] font-semibold px-2 py-0.5 border">
                                  Invited Resident (Pending Response)
                                </Badge>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 text-[10px] text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
                                  onClick={async () => { 
                                    await eventService.cancelInvite(r.id); 
                                    qc.invalidateQueries({ queryKey: ["vr", sid] }); 
                                    toast.info(`Cancelled invitation for ${r.residentName}.`); 
                                  }}
                                >
                                  Cancel Request
                                </Button>
                              </div>
                            ) : (
                              <Badge className={cn(
                                "text-[10px] uppercase font-bold border px-2 py-0.5",
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
        <Button variant="outline" size="sm" className="text-xs font-semibold h-9 px-3 border-line-strong hover:bg-panel cursor-pointer flex-1 sm:flex-initial" onClick={async () => {
          setLoading(true);
          try {
            setItems(await suggestVolunteers(eventId));
          } catch {
            toast.error("Failed to suggestions.");
          } finally {
            setLoading(false);
          }
        }}>
          <Sparkles className="mr-1.5 h-3.5 w-3.5 text-soft-violet animate-pulse flex-shrink-0" /> AI Invite Recs
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto border-line/60 rounded-2xl p-4 sm:p-6">
        <DialogHeader className="pb-3 border-b border-line/35">
          <DialogTitle className="text-base font-bold text-ink">AI Volunteer Matchmaker</DialogTitle>
          <span className="text-xs text-on-surface-variant">Recommended residents with skills or interest matches matching event description.</span>
        </DialogHeader>
        <div className="space-y-3 pt-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
          {loading ? (
            <div className="py-6 text-center text-xs text-on-surface-variant">Running match recommendation agent...</div>
          ) : items.map((s) => (
            <div key={s.user.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-line/40 p-3 bg-panel/15 text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-ink">{s.user.name}</div>
                <div className="text-[10px] text-on-surface-variant font-medium">{s.reason}</div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
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

function ManualInviteButton({ eventId, eventTitle, sid }: { eventId: string; eventTitle: string; sid: string }) {
  const [open, setOpen] = useState(false);
  const [selectedResId, setSelectedResId] = useState("");
  const qc = useQueryClient();
  const residents = useQuery({ queryKey: ["allRes", sid], queryFn: () => userService.listBySociety(sid) });
  const vrs = useQuery({ queryKey: ["vr", sid], queryFn: () => eventService.listVolunteerRequests(sid) });

  const activeResList = residents.data?.filter((u) => u.role === "resident" && u.isActive !== false) ?? [];
  const existingReqs = vrs.data?.filter((v) => v.eventId === eventId) ?? [];

  const handleInvite = async () => {
    if (!selectedResId) return toast.error("Select a resident to invite.");
    const target = activeResList.find((r) => r.id === selectedResId);
    if (!target) return;

    const existing = existingReqs.find((v) => v.residentId === target.id);
    if (existing) {
      if (existing.status === "pending") {
        return toast.error(`${target.name} already has a pending invitation or application for this event.`);
      } else if (existing.status === "approved") {
        return toast.error(`${target.name} is already a confirmed volunteer for this event.`);
      }
    }

    try {
      await eventService.inviteVolunteer(eventId, target.id, target.name, eventTitle);
      qc.invalidateQueries({ queryKey: ["vr", sid] });
      toast.success(`Volunteer invitation sent to ${target.name}!`);
      setOpen(false);
      setSelectedResId("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send invitation.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs font-semibold h-9 px-3 border-line-strong hover:bg-panel cursor-pointer flex-1 sm:flex-initial">
          <UserPlus className="mr-1.5 h-3.5 w-3.5 text-deep-forest flex-shrink-0" /> Manual Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto border-line/60 rounded-2xl p-4 sm:p-6 bg-white">
        <DialogHeader className="pb-3 border-b border-line/35">
          <DialogTitle className="text-base font-bold text-ink">Invite Resident to Volunteer</DialogTitle>
          <span className="text-xs text-on-surface-variant">Select any resident from your society roster to manually invite.</span>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-ink">Select Resident</Label>
            <select
              value={selectedResId}
              onChange={(e) => setSelectedResId(e.target.value)}
              className="w-full h-10 rounded-lg border border-line-strong bg-white px-3 text-xs focus:ring-1 focus:ring-deep-forest/20"
            >
              <option value="">-- Choose a resident from roster --</option>
              {activeResList.map((r) => {
                const isAlready = existingReqs.some((v) => v.residentId === r.id && (v.status === "pending" || v.status === "approved"));
                return (
                  <option key={r.id} value={r.id} disabled={isAlready}>
                    {r.name} ({r.email}) {isAlready ? "— [Already Invited / Active]" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <Button
            onClick={handleInvite}
            className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 rounded-lg shadow-sm cursor-pointer active:scale-98 transition-all"
          >
            Send Volunteer Invitation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

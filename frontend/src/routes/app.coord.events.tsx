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
import { suggestVolunteers, checkEventClash, getCoordinatorEventSuggestions, type VolunteerSuggestion } from "@/services/ai";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Plus, Sparkles, UserPlus, UserX, AlertCircle, CheckCircle2, Lightbulb, Palette, Pencil, Trash2, CheckCircle, Clock } from "lucide-react";
import { cn, formatEventTimeRange } from "@/lib/utils";
import { EventCalendar, type CalendarEvent } from "@/components/calendar/EventCalendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


export const Route = createFileRoute("/app/coord/events")({ component: Page });

const COLOR_OPTIONS = [
  { name: "Emerald", bg: "#d1fae5", text: "#065f46" },
  { name: "Amber", bg: "#fef3c7", text: "#92400e" },
  { name: "Blue", bg: "#dbeafe", text: "#1e40af" },
  { name: "Rose", bg: "#ffe4e6", text: "#9f1239" },
  { name: "Violet", bg: "#ede9fe", text: "#5b21b6" },
];

function Page() {
  const { user } = useAuth();
  const sid = user!.societyId!;
  const qc = useQueryClient();
  const events = useQuery({ queryKey: ["ev", sid], queryFn: () => eventService.list(sid) });
  const vrs = useQuery({ queryKey: ["vr", sid], queryFn: () => eventService.listVolunteerRequests(sid) });
  const suggestions = useQuery({ queryKey: ["coordEventSuggestions", sid], queryFn: () => getCoordinatorEventSuggestions() });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    volunteersNeeded: number | string;
    color: string;
    textColor: string;
  }>({
    title: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    startTime: "09:00",
    endTime: "17:00",
    volunteersNeeded: 4,
    color: "#d1fae5",
    textColor: "#065f46",
  });

  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [rejectingReq, setRejectingReq] = useState<any | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState("");

  const [clashResult, setClashResult] = useState<{ hasClash: boolean; reason: string } | null>(null);

  const [checkingClash, setCheckingClash] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const withdrawnReqs = vrs.data?.filter((v) => v.status === "left") ?? [];

  const handleCheckClash = async (targetForm = form) => {
    if (!targetForm.title || !targetForm.date) {
      toast.warning("Please provide a title and date first.");
      return;
    }
    setCheckingClash(true);
    try {
      const st = targetForm.date && targetForm.startTime ? `${targetForm.date}T${targetForm.startTime}:00` : `${targetForm.date}T09:00:00`;
      const et = targetForm.date && targetForm.endTime ? `${targetForm.date}T${targetForm.endTime}:00` : `${targetForm.date}T17:00:00`;
      const res = await checkEventClash(targetForm.title, targetForm.description, st, et, sid);
      setClashResult(res);
      if (res.hasClash) {
        toast.warning("Schedule overlap detected. See recommendations below.");
      } else {
        toast.success("Schedule is clear with no conflicts!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to check clashes.");
    } finally {
      setCheckingClash(false);
    }
  };

  const handleCompleteEvent = async (eventId: string, eventTitle: string) => {
    try {
      await eventService.complete(eventId);
      qc.invalidateQueries({ queryKey: ["ev", sid] });
      if (selectedEvent?.id === eventId) setSelectedEvent(null);
      toast.success(`Marked '${eventTitle}' as completed!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to complete event.");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await eventService.delete(eventId);
      qc.invalidateQueries({ queryKey: ["ev", sid] });
      qc.invalidateQueries({ queryKey: ["vr", sid] });
      if (selectedEvent?.id === eventId) setSelectedEvent(null);
      setDeleteConfirmId(null);
      toast.success("Event deleted successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete event.");
    }
  };

  const openEditModal = (ev: any) => {
    const rawSt = ev.startTime || "";
    const rawEt = ev.endTime || "";
    const startTimeHour = rawSt.includes("T") ? rawSt.split("T")[1].slice(0, 5) : (rawSt.slice(0, 5) || "09:00");
    const endTimeHour = rawEt.includes("T") ? rawEt.split("T")[1].slice(0, 5) : (rawEt.slice(0, 5) || "17:00");
    setEditingEvent(ev);
    setEditForm({
      id: ev.id,
      title: ev.title || "",
      description: ev.description || "",
      date: ev.date || (rawSt ? rawSt.slice(0, 10) : new Date().toISOString().slice(0, 10)),
      startTime: startTimeHour,
      endTime: endTimeHour,
      volunteersNeeded: ev.volunteersNeeded || 4,
      color: ev.color || "#d1fae5",
      textColor: ev.textColor || "#065f46",
      status: ev.status || "upcoming",
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.title || !editForm.date) {
      toast.error("Please provide a title and date.");
      return;
    }
    try {
      const st = `${editForm.date}T${editForm.startTime || "09:00"}:00`;
      const et = `${editForm.date}T${editForm.endTime || "17:00"}:00`;
      await eventService.update(editForm.id, {
        title: editForm.title,
        description: editForm.description,
        date: editForm.date,
        startTime: st,
        endTime: et,
        volunteersNeeded: Number(editForm.volunteersNeeded) || 1,
        color: editForm.color,
        textColor: editForm.textColor,
        status: editForm.status,
      });
      setEditingEvent(null);
      qc.invalidateQueries({ queryKey: ["ev", sid] });
      toast.success("Event updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update event.");
    }
  };

  const calendarEvents: CalendarEvent[] = (events.data || []).map((e) => ({
    id: e.id,
    title: e.title,
    startTime: e.startTime || (e.date ? `${e.date}T09:00:00` : undefined),
    endTime: e.endTime || (e.date ? `${e.date}T17:00:00` : undefined),
    date: e.date,
    color: e.color || "#d1fae5",
    textColor: e.textColor || "#065f46",
    raw: e,
  }));

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
                <span className="text-xs text-on-surface-variant">Publish an event to let residents register, volunteer, and participate.</span>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Event Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Park Cleanup & Tree Planting" className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Provide event goals, location details, prerequisites..." className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs rounded-lg p-3 min-h-[75px]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Event Date</Label>
                    <Input 
                      type="date" 
                      value={form.date} 
                      onChange={(e) => {
                        setForm({ ...form, date: e.target.value });
                        setClashResult(null);
                      }} 
                      className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-lg" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Start Time</Label>
                    <Input 
                      type="time" 
                      value={form.startTime} 
                      onChange={(e) => {
                        setForm({ ...form, startTime: e.target.value });
                        setClashResult(null);
                      }} 
                      className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-lg" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">End Time</Label>
                    <Input 
                      type="time" 
                      value={form.endTime} 
                      onChange={(e) => {
                        setForm({ ...form, endTime: e.target.value });
                        setClashResult(null);
                      }} 
                      className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-lg" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Volunteers Required</Label>
                  <Input type="number" min={1} value={form.volunteersNeeded} onChange={(e) => setForm({ ...form, volunteersNeeded: e.target.value === "" ? "" : Number(e.target.value) })} className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-lg" />
                </div>

                {/* Color Theme Selector */}
                <div className="space-y-1.5 pt-1">
                  <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant flex items-center gap-1.5">
                    <Palette className="h-3.5 w-3.5 text-deep-forest" /> Calendar Theme Palette
                  </Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setForm({ ...form, color: c.bg, textColor: c.text })}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5",
                          form.color === c.bg ? "ring-2 ring-deep-forest ring-offset-1 shadow-xs" : "opacity-80 hover:opacity-100"
                        )}
                        style={{ backgroundColor: c.bg, color: c.text, borderColor: c.text + "30" }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.text }} />
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Clash Checker Button */}
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={checkingClash}
                    onClick={() => handleCheckClash(form)}
                    className="w-full text-xs font-semibold border-line-strong/70 hover:bg-soft-violet/5 hover:border-soft-violet/40 cursor-pointer flex items-center justify-center gap-1.5 h-9"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-soft-violet animate-pulse" />
                    {checkingClash ? "Checking Schedule Overlaps..." : "Check Schedule Overlaps (AI)"}
                  </Button>
                </div>

                {clashResult && (
                  <div className={cn(
                    "p-3 rounded-xl border text-xs space-y-1 animate-in fade-in-50",
                    clashResult.hasClash ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-emerald-50 border-emerald-200 text-emerald-900"
                  )}>
                    <div className="font-bold flex items-center gap-1.5 text-[11px]">
                      {clashResult.hasClash ? (
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      )}
                      <span>{clashResult.hasClash ? "Overlap Advisory" : "Schedule Clear"}</span>
                    </div>
                    <p className="text-[11.5px] leading-relaxed pl-5">{clashResult.reason}</p>
                  </div>
                )}

                <Button className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 rounded-lg shadow-sm cursor-pointer mt-2 active:scale-98 transition-all" onClick={async () => {
                  try {
                    const eventDate = form.date || new Date().toISOString().slice(0, 10);
                    const st = form.startTime ? `${eventDate}T${form.startTime}:00` : `${eventDate}T09:00:00`;
                    const et = form.endTime ? `${eventDate}T${form.endTime}:00` : `${eventDate}T17:00:00`;
                    await eventService.create({
                      title: form.title,
                      description: form.description,
                      date: eventDate,
                      startTime: st,
                      endTime: et,
                      volunteersNeeded: Number(form.volunteersNeeded) || 1,
                      createdByCoordinatorId: user!.id,
                      societyId: sid,
                      color: form.color,
                      textColor: form.textColor,
                    });
                    setOpen(false); 
                    setForm({ title: "", description: "", date: new Date().toISOString().slice(0, 10), startTime: "09:00", endTime: "17:00", volunteersNeeded: 4, color: "#d1fae5", textColor: "#065f46" });
                    setClashResult(null);
                    qc.invalidateQueries({ queryKey: ["ev", sid] });
                    toast.success("Event created successfully!");
                  } catch (err: any) {
                    toast.error(err.message || "Failed to create event.");
                  }
                }}>Create & Publish Event</Button>
              </div>
            </DialogContent>
          </Dialog>
        } 
      />



      {/* AI Event Ideas from Resident Surveys */}
      {suggestions.data && suggestions.data.length > 0 && (
        <div className="rounded-2xl border border-line/60 bg-gradient-to-r from-soft-violet/10 via-amber-500/5 to-deep-forest/5 p-4 sm:p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-soft-violet animate-pulse" />
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">AI Event Ideas for Your Society</h3>
            </div>
            <Badge variant="outline" className="text-[10px] bg-white border-line font-bold text-soft-violet">
              Survey-Informed
            </Badge>
          </div>
          <p className="text-xs text-on-surface-variant">
            Intelligently derived from onboarding survey interests of residents across your residential society.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {suggestions.data.map((sug, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-xl border border-line/60 shadow-2xs space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="font-bold text-xs text-ink">{sug.title}</div>
                  <p className="text-[11px] text-on-surface-variant line-clamp-2">{sug.description}</p>
                  <p className="text-[10px] text-deep-forest font-semibold italic">💡 {sug.reason}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px] font-bold border-soft-violet/30 text-soft-violet hover:bg-soft-violet/10 cursor-pointer w-full mt-2"
                  onClick={() => {
                    setForm({
                      ...form,
                      title: sug.title,
                      description: `${sug.description} (Goal: ${sug.reason})`,
                    });
                    setOpen(true);
                  }}
                >
                  <Lightbulb className="mr-1 h-3 w-3" /> Use This Idea
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

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

      <EventCalendar 
        events={calendarEvents}
        defaultView="Month"
        onEventClick={(ev) => setSelectedEvent(ev.raw || events.data?.find((e) => e.id === ev.id))}
        renderSchedule={() => (
          <div className="space-y-4">
            {events.data?.map((e) => {
              const reqs = vrs.data?.filter((v) => v.eventId === e.id) ?? [];
              const eventWithdrawnCount = reqs.filter((r) => r.status === "left").length;

              return (
                <Card key={e.id} className="border-line/60 shadow-xs hover:shadow-md transition-shadow bg-white rounded-2xl overflow-hidden">
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3.5 border-b border-line/20">
                      <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
                        <div 
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border"
                          style={{ backgroundColor: e.color || "#d1fae5", color: e.textColor || "#065f46", borderColor: (e.textColor || "#065f46") + "30" }}
                        >
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
                          <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-2 flex-wrap">
                            <span>Scheduled: <span className="font-semibold text-ink">{e.date}</span></span>
                            <span>·</span>
                            <span>Time: <span className="font-semibold text-ink">{formatEventTimeRange(e.startTime, e.endTime)}</span></span>
                            <span>·</span>
                            <span>Capacity: <span className="font-semibold text-ink">{e.volunteers.length} / {e.volunteersNeeded}</span> Volunteers</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto flex-shrink-0 w-full sm:w-auto">
                        {e.status !== "completed" && e.status !== "cancelled" && (
                          <>
                            <SuggestButton eventId={e.id} eventTitle={e.title} />
                            <ManualInviteButton eventId={e.id} eventTitle={e.title} sid={sid} />
                          </>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(e)}
                          className="h-9 text-xs font-semibold px-2.5 border-line-strong hover:bg-panel cursor-pointer"
                          title="Edit event details"
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1 text-slate-600" /> Edit
                        </Button>

                        {e.status !== "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCompleteEvent(e.id, e.title)}
                            className="h-9 text-xs font-semibold px-2.5 border-emerald-300 text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100 cursor-pointer"
                            title="Mark event as completed"
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Complete
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirmId(e.id)}
                          className="h-9 text-xs font-semibold px-2 border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete event"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
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
                                    <Button size="sm" className="h-8 text-xs font-semibold px-3 bg-deep-forest hover:bg-deep-forest/90 text-white cursor-pointer active:scale-98 transition-all" onClick={async () => { await eventService.approveVolunteer(r.id); qc.invalidateQueries({ queryKey: ["vr", sid] }); qc.invalidateQueries({ queryKey: ["ev", sid] }); toast.success("Approved volunteer request!"); }}>Approve Application</Button>
                                    <Button size="sm" variant="outline" className="h-8 text-xs font-semibold px-3 border-line-strong hover:bg-panel cursor-pointer" onClick={() => { setRejectingReq(r); setRejectionReasonText(""); }}>Decline with Reason</Button>
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
                                ) : r.status === "rejected" ? (
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-rose-800 bg-rose-50/70 border border-rose-200 rounded-xl p-3 w-full">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <Badge className="bg-rose-100 text-rose-900 border-none text-[10px] font-bold uppercase tracking-wider">
                                          Declined
                                        </Badge>
                                        <span className="italic text-[11.5px] text-rose-900">
                                          Reason: "{r.rejectionReason || "Volunteer capacity reached for this shift."}"
                                        </span>
                                      </div>
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
        )}
      />

      {/* Selected Event Modal (from Calendar Click) */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-[600px] p-0 border-line/60 rounded-2xl overflow-hidden bg-white">
          {selectedEvent && (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-line/30">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
                    style={{ backgroundColor: selectedEvent.color || "#d1fae5", color: selectedEvent.textColor || "#065f46" }}
                  >
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-ink">{selectedEvent.title}</h3>
                    <p className="text-xs text-on-surface-variant">Scheduled: {selectedEvent.date}</p>
                  </div>
                </div>
                <Badge className="bg-deep-forest/5 text-deep-forest uppercase text-[10px] font-bold">
                  {selectedEvent.status}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">{selectedEvent.description}</p>
              <div className="text-xs font-semibold text-ink">
                Volunteer Capacity: {selectedEvent.volunteers?.length || 0} / {selectedEvent.volunteersNeeded} Registered
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-line/30 flex-wrap">
                {selectedEvent.status !== "completed" && selectedEvent.status !== "cancelled" && (
                  <>
                    <SuggestButton eventId={selectedEvent.id} eventTitle={selectedEvent.title} />
                    <ManualInviteButton eventId={selectedEvent.id} eventTitle={selectedEvent.title} sid={sid} />
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const ev = selectedEvent;
                    setSelectedEvent(null);
                    openEditModal(ev);
                  }}
                  className="h-9 text-xs font-semibold px-3 border-line-strong hover:bg-panel cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1 text-slate-600" /> Edit Event
                </Button>
                {selectedEvent.status !== "completed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCompleteEvent(selectedEvent.id, selectedEvent.title)}
                    className="h-9 text-xs font-semibold px-3 border-emerald-300 text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100 cursor-pointer"
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Mark Complete
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const evId = selectedEvent.id;
                    setSelectedEvent(null);
                    setDeleteConfirmId(evId);
                  }}
                  className="h-9 text-xs font-semibold px-3 border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
        <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto border-line/60 rounded-2xl p-4 sm:p-6 bg-white">
          <DialogHeader className="pb-3 border-b border-line/35">
            <DialogTitle className="text-base font-bold text-ink flex items-center gap-2">
              <Pencil className="h-4.5 w-4.5 text-deep-forest" />
              Edit Community Event
            </DialogTitle>
            <span className="text-xs text-on-surface-variant">Update event details, timing schedule, volunteer limits, or theme.</span>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Event Title</Label>
              <Input value={editForm.title || ""} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Description</Label>
              <Textarea value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs rounded-lg p-3 min-h-[75px]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Event Date</Label>
                <Input 
                  type="date" 
                  value={editForm.date || ""} 
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} 
                  className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-lg" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Start Time</Label>
                <Input 
                  type="time" 
                  value={editForm.startTime || ""} 
                  onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })} 
                  className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-lg" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">End Time</Label>
                <Input 
                  type="time" 
                  value={editForm.endTime || ""} 
                  onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })} 
                  className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-lg" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Volunteers Needed</Label>
                <Input type="number" min={1} value={editForm.volunteersNeeded || 4} onChange={(e) => setEditForm({ ...editForm, volunteersNeeded: e.target.value === "" ? "" : Number(e.target.value) })} className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Status</Label>
                <select 
                  value={editForm.status || "upcoming"} 
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full border border-line-strong/60 rounded-lg h-10 text-xs px-3 bg-white font-medium focus:ring-1 focus:ring-deep-forest/20"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Color Palette */}
            <div className="space-y-1.5 pt-1">
              <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-deep-forest" /> Theme Palette
              </Label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, color: c.bg, textColor: c.text })}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5",
                      editForm.color === c.bg ? "ring-2 ring-deep-forest ring-offset-1 shadow-xs" : "opacity-80 hover:opacity-100"
                    )}
                    style={{ backgroundColor: c.bg, color: c.text, borderColor: c.text + "30" }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.text }} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setEditingEvent(null)}
                className="flex-1 text-xs h-10 rounded-lg cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveEdit}
                className="flex-1 bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 rounded-lg shadow-sm cursor-pointer active:scale-98 transition-all"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Event Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent className="bg-white border-line/60 rounded-2xl shadow-xl max-w-sm p-6">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-base font-bold text-ink flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-rose-600 flex-shrink-0" />
              Delete Event
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to permanently cancel and delete this event? This will remove all volunteer roster assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3 border-t border-line/40 gap-2">
            <AlertDialogCancel className="text-xs h-9 font-semibold rounded-xl border-line cursor-pointer">
              Keep Event
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDeleteEvent(deleteConfirmId)}
              className="text-xs h-9 font-semibold rounded-xl text-white bg-rose-600 hover:bg-rose-700 cursor-pointer active:scale-98 transition-all"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Volunteer Dialog with Preset Chips & Reason */}

      <Dialog open={!!rejectingReq} onOpenChange={(open) => !open && setRejectingReq(null)}>
        <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto border-line/60 rounded-2xl p-4 sm:p-6 bg-white">
          <DialogHeader className="pb-3 border-b border-line/35">
            <DialogTitle className="text-base font-bold text-ink">Decline Volunteer Application</DialogTitle>
            <span className="text-xs text-on-surface-variant">
              Provide an optional, constructive reason to let <span className="font-semibold text-ink">{rejectingReq?.residentName}</span> know why their application couldn't be approved.
            </span>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Quick Reason Presets</Label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Volunteer capacity reached for this event",
                  "Role prerequisites/qualifications already filled",
                  "Schedule and shift overlap with existing roster",
                  "Event volunteer slots allocated to first-time applicants",
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectionReasonText(preset)}
                    className={cn(
                      "text-[11px] px-2.5 py-1 rounded-lg border text-left transition-all cursor-pointer",
                      rejectionReasonText === preset
                        ? "bg-rose-50 border-rose-300 text-rose-900 font-semibold"
                        : "bg-panel/40 border-line/60 text-on-surface-variant hover:bg-panel"
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Custom Remarks</Label>
              <Textarea
                rows={3}
                value={rejectionReasonText}
                onChange={(e) => setRejectionReasonText(e.target.value)}
                placeholder="Type a polite reason or note for the resident..."
                className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs rounded-lg p-3"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-line/40">
              <Button
                variant="outline"
                type="button"
                onClick={() => setRejectingReq(null)}
                className="flex-1 text-xs h-10 rounded-lg cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  if (rejectingReq) {
                    await eventService.rejectVolunteer(
                      rejectingReq.id,
                      rejectionReasonText.trim() || "Volunteer capacity reached for this event"
                    );
                    qc.invalidateQueries({ queryKey: ["vr", sid] });
                    toast.info(`Declined application for ${rejectingReq.residentName}.`);
                    setRejectingReq(null);
                  }
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs h-10 rounded-lg shadow-sm cursor-pointer active:scale-98 transition-all"
              >
                Confirm Decline
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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

import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { complaintService } from "@/services";
import { useAuth } from "@/lib/auth";
import { categorizeComplaint } from "@/services/ai";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles, MessageSquare, CheckCircle2, Clock, XCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/coord/complaints")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const sid = user!.societyId!;
  const list = useQuery({ queryKey: ["comps", sid], queryFn: () => complaintService.listSociety(sid) });

  return (
    <div className="space-y-6 pb-12 animate-page-fade">
      <PageHeader title="Reported Complaints" description="All regular complaints filed by residents in this society. Track, review, add review notes, or resolve conflict reports." />
      <div className="space-y-4">
        {list.data?.map((c: any) => <ComplaintRow key={c.id} c={c} onChange={() => qc.invalidateQueries({ queryKey: ["comps", sid] })} />)}
        {list.data?.length === 0 && (
          <div className="py-12 text-center text-xs text-on-surface-variant border border-dashed border-line rounded-2xl bg-white/50 p-6">
            No complaints filed in this society.
          </div>
        )}
      </div>
    </div>
  );
}

function ComplaintRow({ c, onChange }: { c: any; onChange: () => void }) {
  const [aiTag, setAiTag] = useState<{ category: string; priority: string } | null>(null);
  const [actionType, setActionType] = useState<"in-review" | "resolved" | "dismissed" | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    categorizeComplaint(c.description).then(setAiTag);
  }, [c.description]);

  const titleText = c.subject || c.title || "Complaint";
  const isAnon = c.isAnonymous || c.filedByName === "Anonymous" || c.filedByUserName === "Anonymous";
  const filedByName = isAnon ? "Anonymous" : (c.filedByName || c.filedByUserName || "Resident");
  const statusStr = c.status === "under_review" ? "in-review" : c.status;

  const handleActionSubmit = async () => {
    if (!actionType) return;
    setLoading(true);
    try {
      await complaintService.takeAction(c.id, actionType, note.trim() || undefined);
      toast.success(
        actionType === "in-review" ? "Marked as Under Review with note" :
        actionType === "resolved" ? "Complaint marked as Resolved" : "Complaint dismissed"
      );
      setActionType(null);
      setNote("");
      onChange();
    } catch {
      toast.error("Failed to update complaint status.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await complaintService.delete(c.id);
      toast.success("Complaint deleted.");
      onChange();
    } catch {
      toast.error("Failed to delete complaint.");
    }
  };

  return (
    <Card className="border-line/60 shadow-xs hover:shadow-md transition-shadow bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-4 sm:p-6 space-y-3.5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-line/20">
          <div className="space-y-1 w-full sm:w-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-ink">{titleText}</h3>
              <Badge variant="outline" className="text-[10px] uppercase font-bold px-2 py-0.5 border-line-strong">
                {c.category}
              </Badge>
              {statusStr === "open" && (
                <Badge className="bg-amber-50 border-amber-200 text-amber-800 text-[10px] sm:text-xs uppercase font-bold border px-2 py-0.5">Open</Badge>
              )}
              {statusStr === "in-review" && (
                <Badge className="bg-blue-50 border-blue-200 text-blue-800 text-[10px] sm:text-xs uppercase font-bold border px-2 py-0.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Under Review
                </Badge>
              )}
              {statusStr === "resolved" && (
                <Badge className="bg-emerald-50 border-emerald-200 text-emerald-800 text-[10px] sm:text-xs uppercase font-bold border px-2 py-0.5 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Resolved
                </Badge>
              )}
              {statusStr === "dismissed" && (
                <Badge className="bg-rose-50 border-rose-200 text-rose-800 text-[10px] sm:text-xs uppercase font-bold border px-2 py-0.5 flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> Dismissed
                </Badge>
              )}
              {aiTag && (
                <Badge variant="outline" className="border-soft-violet/35 bg-soft-violet/5 text-soft-violet text-[10px] sm:text-xs font-bold flex items-center gap-1 uppercase tracking-wider px-2 py-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-soft-violet animate-pulse" /> AI Priority: {aiTag.priority}
                </Badge>
              )}
            </div>
            <p className="text-xs text-on-surface-variant mt-1">Filed by <span className="font-semibold text-ink">{filedByName}</span> · {c.createdAt}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto flex-shrink-0">
            {statusStr !== "resolved" && statusStr !== "dismissed" && (
              <div className="flex gap-1.5 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 sm:h-9 text-xs font-semibold px-2.5 sm:px-3 border-line-strong hover:bg-blue-50 text-blue-700 cursor-pointer"
                  onClick={() => {
                    setActionType("in-review");
                    setNote(c.resolutionNotes || "We will look into this issue immediately.");
                  }}
                >
                  In Review
                </Button>
                <Button
                  size="sm"
                  className="h-8 sm:h-9 text-xs font-semibold px-2.5 sm:px-3 bg-deep-forest hover:bg-deep-forest/90 text-white cursor-pointer active:scale-98 transition-all shadow-sm"
                  onClick={() => {
                    setActionType("resolved");
                    setNote(c.resolutionNotes || "Resolved after investigation.");
                  }}
                >
                  Resolve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 sm:h-9 text-xs font-semibold px-2.5 sm:px-3 text-rose-600 hover:bg-rose-50 border-line-strong hover:border-rose-200 cursor-pointer"
                  onClick={() => {
                    setActionType("dismissed");
                    setNote(c.resolutionNotes || "Dismissed following coordinator review.");
                  }}
                >
                  Dismiss
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
              title="Delete Complaint"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-ink leading-relaxed pt-2 whitespace-pre-line pl-2.5 border-l-2 border-line/30">
          {c.description}
        </p>

        {c.resolutionNotes && (
          <div className="mt-3 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-blue-900 uppercase tracking-wider text-[10px]">
              <MessageSquare className="h-3.5 w-3.5 text-blue-700" /> Coordinator Note / Resolution
            </div>
            <p className="italic leading-normal">{c.resolutionNotes}</p>
          </div>
        )}

        {/* Action Dialog */}
        <Dialog open={!!actionType} onOpenChange={(open) => !open && setActionType(null)}>
          <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto border-line/60 rounded-2xl p-4 sm:p-6">
            <DialogHeader className="pb-3 border-b border-line/35">
              <DialogTitle className="text-base font-bold text-ink">
                {actionType === "in-review" ? "Mark Complaint Under Review" :
                 actionType === "resolved" ? "Resolve Complaint" : "Dismiss Complaint"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">
                  Note to Resident (Will be displayed on resident's complaint card)
                </Label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. We will look into it, or explanation of resolution..."
                  rows={4}
                  className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs rounded-lg p-3"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setActionType(null)} className="h-9 text-xs font-semibold">
                  Cancel
                </Button>
                <Button disabled={loading} size="sm" onClick={handleActionSubmit} className="h-9 text-xs bg-deep-forest text-white font-semibold px-4">
                  {loading ? "Saving..." : "Submit Update"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

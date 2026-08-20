import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { disputeService } from "@/services";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Scale, CheckCircle2, Clock, Trash2, Save, AlertCircle, User, MessageSquare, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/coord/disputes")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const sid = user!.societyId!;
  const disputesQuery = useQuery({ queryKey: ["coordDisputes", sid], queryFn: () => disputeService.list(sid) });

  return (
    <div className="space-y-6 pb-12 animate-page-fade">
      <PageHeader
        title="Disputes & Mediation"
        description="Workspace for resolving transaction conflicts and mediating trade disputes between residents."
      />
      <div className="space-y-5">
        {disputesQuery.data?.map((d: any) => (
          <CoordDisputeCard key={d.id} d={d} onChange={() => qc.invalidateQueries({ queryKey: ["coordDisputes", sid] })} />
        ))}

        {disputesQuery.data?.length === 0 && (
          <div className="py-12 text-center text-xs text-on-surface-variant border border-dashed border-line rounded-2xl bg-white/50 p-6">
            No active trade disputes reported in this society.
          </div>
        )}
      </div>
    </div>
  );
}

function CoordDisputeCard({ d, onChange }: { d: any; onChange: () => void }) {
  const [coordNote, setCoordNote] = useState(d.coordinatorNote || "");
  const [savingNote, setSavingNote] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolveSummary, setResolveSummary] = useState(d.resolutionNotes || "");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    setCoordNote(d.coordinatorNote || "");
  }, [d.coordinatorNote]);

  useEffect(() => {
    setResolveSummary(d.resolutionNotes || "");
  }, [d.resolutionNotes]);

  // Action 1: Save Coordinator Note only
  const handleSaveNote = async () => {
    setSavingNote(true);
    try {
      const res = await disputeService.updateNote(d.id, coordNote.trim());
      if (res && res.coordinatorNote !== undefined) {
        setCoordNote(res.coordinatorNote);
      }
      toast.success("Coordinator note saved successfully!");
      onChange();
    } catch {
      toast.error("Failed to save coordinator note.");
    } finally {
      setSavingNote(false);
    }
  };

  const handleSetUnderReview = async () => {
    setUpdatingStatus(true);
    try {
      await disputeService.updateStatus(d.id, "under_review", undefined);
      toast.info("Dispute marked as Under Review.");
      onChange();
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Action 2: Save Resolution Verdict only
  const handleMarkResolved = async () => {
    if (!resolveSummary.trim()) {
      toast.error("Please enter the Resolution Verdict text before confirming.");
      return;
    }
    setUpdatingStatus(true);
    try {
      await disputeService.updateStatus(d.id, "resolved", resolveSummary.trim());
      toast.success("Dispute marked as Resolved with final verdict!");
      setResolveDialogOpen(false);
      onChange();
    } catch {
      toast.error("Failed to save resolution verdict.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    try {
      await disputeService.delete(d.id);
      toast.success("Dispute record deleted.");
      onChange();
    } catch {
      toast.error("Failed to delete dispute.");
    }
  };

  return (
    <Card className="border-line/60 shadow-xs hover:shadow-md transition-shadow bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-line/25">
          <div className="space-y-1 w-full sm:w-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
                <Scale className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-ink">{d.itemTitle}</h3>
              <Badge variant="outline" className="text-[10px] uppercase font-bold px-2 py-0.5 border-line-strong text-ink bg-panel">
                {d.itemType}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-on-surface-variant pt-0.5">
              <span className="flex items-center gap-1 font-medium">
                <User className="h-3.5 w-3.5 text-deep-forest" /> Filer: <span className="font-bold text-ink">{d.filedByName || d.buyerName}</span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span>Buyer: <span className="font-semibold text-ink">{d.buyerName}</span></span>
              <span>vs</span>
              <span>Seller: <span className="font-semibold text-ink">{d.ownerName}</span></span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
            <Badge className={cn(
              "text-[11px] sm:text-xs uppercase font-bold border px-3 py-0.5 rounded-full shadow-2xs",
              d.status === "open" ? "bg-amber-50 border-amber-200 text-amber-900" :
              d.status === "under_review" ? "bg-blue-50 border-blue-200 text-blue-900" :
              "bg-emerald-50 border-emerald-200 text-emerald-900"
            )}>
              {d.status === "under_review" ? "Under Review" : d.status}
            </Badge>
            <Button size="sm" variant="outline" className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer rounded-lg px-2.5" onClick={handleDelete}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
          </div>
        </div>

        {/* Section 1: Prominent Filed Dispute Reason & Detailed Explanation */}
        <div className="p-3.5 sm:p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs uppercase tracking-wider">
            <AlertCircle className="h-4 w-4 text-amber-700 flex-shrink-0" />
            <span>Dispute Reason & Detailed Explanation</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed bg-white/70 p-3 rounded-lg border border-amber-200/50 whitespace-pre-wrap">
            {d.reason || "No detailed explanation provided."}
          </p>
        </div>

        {/* Section 2: Resident Statements */}
        <div className="space-y-2">
          <span className="text-[11px] uppercase font-bold tracking-wider text-on-surface-variant flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-deep-forest" /> Resident Statements & Claims
          </span>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 text-xs">
            <div className="p-3.5 rounded-xl border bg-slate-50/80 border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 uppercase text-[10px] block">Buyer ({d.buyerName}) Statement</span>
              <p className="text-slate-700 italic leading-normal">
                {d.buyerNote ? `"${d.buyerNote}"` : "No note added by buyer yet."}
              </p>
            </div>
            <div className="p-3.5 rounded-xl border bg-slate-50/80 border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 uppercase text-[10px] block">Seller ({d.ownerName}) Statement</span>
              <p className="text-slate-700 italic leading-normal">
                {d.ownerNote ? `"${d.ownerNote}"` : "No note added by seller yet."}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Coordinator Saved Note (Visible to all 3) */}
        {d.coordinatorNote && (
          <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 space-y-1">
            <span className="font-bold text-blue-900 uppercase text-[10px] flex items-center gap-1">
              <Scale className="h-3.5 w-3.5 text-blue-700 flex-shrink-0" /> Coordinator Saved Mediation Note (Visible to Residents)
            </span>
            <p className="font-semibold text-blue-950 leading-relaxed">{d.coordinatorNote}</p>
          </div>
        )}

        {/* Section 4: Resolution Verdict (Visible to all 3) */}
        {d.resolutionNotes && (
          <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-emerald-900 uppercase text-[10px] flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 flex-shrink-0" /> Official Resolution Verdict
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setResolveDialogOpen(true)}
                className="h-6 text-[10px] text-emerald-800 hover:bg-emerald-100 font-semibold px-2 cursor-pointer"
              >
                <Edit3 className="h-3 w-3 mr-1" /> Edit Verdict
              </Button>
            </div>
            <p className="font-semibold text-emerald-950 leading-relaxed">{d.resolutionNotes}</p>
          </div>
        )}

        {/* Section 5: Coordinator Note Draft & Actions */}
        <div className="pt-3 space-y-3 border-t border-line/25">
          <div className="flex justify-between items-center">
            <Label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant block">
              Coordinator Mediation Note
            </Label>
            {d.coordinatorNote && (
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ✓ Saved & Visible to Both Residents
              </span>
            )}
          </div>
          <Textarea
            placeholder="Write mediation guidance or notes for both residents..."
            value={coordNote}
            onChange={(e) => setCoordNote(e.target.value)}
            className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs rounded-xl p-3.5 min-h-[90px] bg-panel/20"
          />
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-2.5 pt-1">
            <Button
              variant="outline"
              size="sm"
              disabled={savingNote}
              onClick={handleSaveNote}
              className="h-9 text-xs font-semibold px-4 border-line-strong hover:bg-panel cursor-pointer flex items-center justify-center gap-1.5 rounded-lg active:scale-98 transition-all w-full sm:w-auto"
            >
              <Save className="h-3.5 w-3.5 text-deep-forest" /> {savingNote ? "Saving..." : "Save Note"}
            </Button>

            {d.status !== "under_review" && d.status !== "resolved" && (
              <Button
                variant="outline"
                size="sm"
                disabled={updatingStatus}
                onClick={handleSetUnderReview}
                className="h-9 text-xs font-semibold px-4 border-blue-200 text-blue-700 hover:bg-blue-50 cursor-pointer flex items-center justify-center gap-1.5 rounded-lg active:scale-98 transition-all w-full sm:w-auto"
              >
                <Clock className="h-3.5 w-3.5" /> Mark Under Review
              </Button>
            )}

            <Button
              size="sm"
              onClick={() => setResolveDialogOpen(true)}
              className="h-9 text-xs font-semibold px-4 bg-deep-forest hover:bg-deep-forest/90 text-white cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1.5 rounded-lg shadow-sm w-full sm:w-auto"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> {d.resolutionNotes ? "Edit Resolution Verdict" : "Mark Resolved & Issue Verdict"}
            </Button>
          </div>
        </div>

        {/* Resolution Verdict Dialog */}
        <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
          <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto border-line/60 rounded-2xl p-4 sm:p-6">
            <DialogHeader className="pb-3 border-b border-line/35">
              <DialogTitle className="text-base font-bold text-ink">Official Resolution Verdict</DialogTitle>
              <span className="text-xs text-on-surface-variant">This official verdict will be recorded and displayed to both buyer and seller.</span>
            </DialogHeader>
            <div className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">
                  Resolution Verdict Explanation
                </Label>
                <Textarea
                  value={resolveSummary}
                  onChange={(e) => setResolveSummary(e.target.value)}
                  placeholder="Explain the final outcome or agreement (e.g., Refund issued to buyer or service re-fulfilled per coordinator review)."
                  rows={4}
                  className="border-line-strong text-xs rounded-lg p-3"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setResolveDialogOpen(false)} className="h-9 text-xs font-semibold">
                  Cancel
                </Button>
                <Button disabled={updatingStatus || !resolveSummary.trim()} size="sm" onClick={handleMarkResolved} className="h-9 text-xs bg-deep-forest text-white font-semibold px-4">
                  {updatingStatus ? "Saving..." : "Save & Confirm Resolution"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

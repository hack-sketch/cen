import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { complaintService, userService } from "@/services";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldAlert, EyeOff, MessageSquare, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/admin/private-complaints")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const sid = user!.societyId!;
  const list = useQuery({ queryKey: ["priv", sid], queryFn: () => complaintService.listPrivateAgainstCoordinators(sid) });
  const users = useQuery({ queryKey: ["allRes", sid], queryFn: () => userService.listBySociety(sid) });
  const nameOf = (id?: string) => users.data?.find((u) => u.id === id)?.name ?? "Unknown";

  return (
    <div className="space-y-6 pb-12 animate-page-fade">
      <PageHeader title="Confidential Reports" description="Complaints filed privately against active coordinators. Coordinator roles cannot view this panel." />
      <div className="rounded-xl border border-dashed border-deep-forest/30 bg-deep-forest/5 p-4 text-sm flex items-center gap-2">
        <EyeOff className="h-4.5 w-4.5 text-deep-forest flex-shrink-0 animate-pulse" /> 
        <span className="font-semibold text-deep-forest">Secure Audit Channel</span> · Confidential reports delivered exclusively to Society Admin.
      </div>
      <div className="space-y-4">
        {list.data?.map((c: any) => (
          <PrivateComplaintRow key={c.id} c={c} nameOf={nameOf} onChange={() => qc.invalidateQueries({ queryKey: ["priv", sid] })} />
        ))}
        {list.data?.length === 0 && (
          <div className="py-12 text-center text-xs text-on-surface-variant border border-dashed border-line rounded-xl bg-white">
            No confidential reports logged against coordinators.
          </div>
        )}
      </div>
    </div>
  );
}

function PrivateComplaintRow({ c, nameOf, onChange }: { c: any; nameOf: (id?: string) => string; onChange: () => void }) {
  const [actionType, setActionType] = useState<"in-review" | "resolved" | "dismissed" | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const titleText = c.subject || c.title || "Coordinator Conduct Complaint";
  const statusStr = c.status === "under_review" ? "in-review" : c.status;
  const isAnon = c.isAnonymous || c.filedByName === "Anonymous" || c.filedByUserName === "Anonymous";
  const filedByName = isAnon ? "Anonymous" : (c.filedByName || c.filedByUserName || "Resident");

  const handleActionSubmit = async () => {
    if (!actionType) return;
    setLoading(true);
    try {
      await complaintService.takeAction(c.id, actionType, note.trim() || undefined);
      toast.success(
        actionType === "in-review" ? "Updated to Under Review with note" :
        actionType === "resolved" ? "Confidential report resolved" : "Confidential report dismissed"
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

  return (
    <Card className="border-line/60 shadow-[0_4px_20px_-4px_rgba(16,86,68,0.04)] hover:shadow-[0_12px_30px_-6px_rgba(16,86,68,0.1)] hover:-translate-y-0.5 transition-all duration-300 bg-white">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-line/20">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <ShieldAlert className="h-5 w-5 text-orange-500 flex-shrink-0" />
              <h3 className="font-bold text-lg text-ink leading-snug">{titleText}</h3>
              <Badge variant="outline" className="text-xs border-line font-medium text-on-surface-variant bg-panel/30 uppercase px-2 py-0.5">{c.category}</Badge>
              {statusStr === "open" && (
                <Badge className="bg-amber-50 border-amber-200 text-amber-800 text-xs uppercase font-bold border px-2 py-0.5">Open</Badge>
              )}
              {statusStr === "in-review" && (
                <Badge className="bg-blue-50 border-blue-200 text-blue-800 text-xs uppercase font-bold border px-2 py-0.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Under Review
                </Badge>
              )}
              {statusStr === "resolved" && (
                <Badge className="bg-emerald-50 border-emerald-200 text-emerald-800 text-xs uppercase font-bold border px-2 py-0.5 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Resolved
                </Badge>
              )}
              {statusStr === "dismissed" && (
                <Badge className="bg-rose-50 border-rose-200 text-rose-800 text-xs uppercase font-bold border px-2 py-0.5 flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> Dismissed
                </Badge>
              )}
            </div>
            <p className="text-xs text-on-surface-variant mt-1.5">
              Filed by: <span className="font-semibold text-ink">{filedByName}</span> · Target coordinator: <span className="font-semibold text-ink">{nameOf(c.targetCoordinatorId)}</span>
            </p>
          </div>
          {statusStr !== "resolved" && statusStr !== "dismissed" && (
            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-xs font-semibold px-3 border-line-strong hover:bg-amber-50 text-amber-800 cursor-pointer"
                onClick={() => {
                  setActionType("in-review");
                  setNote(c.resolutionNotes || "Admin is reviewing coordinator conduct.");
                }}
              >
                In Review
              </Button>
              <Button
                size="sm"
                className="h-9 text-xs font-semibold px-3 bg-deep-forest hover:bg-deep-forest/90 text-white cursor-pointer active:scale-98 transition-all shadow-sm"
                onClick={() => {
                  setActionType("resolved");
                  setNote(c.resolutionNotes || "Admin resolved issue with target coordinator.");
                }}
              >
                Resolve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-xs font-semibold px-3 text-rose-600 hover:bg-rose-50 border-line-strong hover:border-rose-200 cursor-pointer"
                onClick={() => {
                  setActionType("dismissed");
                  setNote(c.resolutionNotes || "Dismissed following admin audit.");
                }}
              >
                Dismiss
              </Button>
            </div>
          )}
        </div>

        <p className="text-sm sm:text-base text-ink leading-relaxed pt-4 mt-1 whitespace-pre-line pl-2 border-l-2 border-line/30">
          {c.description}
        </p>

        {c.resolutionNotes && (
          <div className="mt-4 p-3 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs text-blue-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-blue-900 uppercase tracking-wider text-[10px]">
              <MessageSquare className="h-3.5 w-3.5 text-blue-700" /> Admin Note / Audit Result
            </div>
            <p className="italic">{c.resolutionNotes}</p>
          </div>
        )}

        {/* Action Dialog */}
        <Dialog open={!!actionType} onOpenChange={(open) => !open && setActionType(null)}>
          <DialogContent className="sm:max-w-md border-line/60 rounded-2xl p-6">
            <DialogHeader className="pb-3 border-b border-line/35">
              <DialogTitle className="text-base font-bold text-ink">
                {actionType === "in-review" ? "Set Confidential Report to Under Review" :
                 actionType === "resolved" ? "Resolve Confidential Report" : "Dismiss Confidential Report"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">
                  Admin Audit Note (Will be visible on filer's complaint card)
                </Label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Explain admin findings or review status..."
                  rows={4}
                  className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs rounded-lg p-3"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setActionType(null)} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button disabled={loading} size="sm" onClick={handleActionSubmit} className="h-9 text-xs bg-deep-forest text-white">
                  {loading ? "Saving..." : "Submit Audit Update"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

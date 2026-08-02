import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { societyService } from "@/services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
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
import { ClipboardList, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/owner/applications")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const apps = useQuery({ queryKey: ["apps"], queryFn: () => societyService.listApplications() });
  const [confirmReject, setConfirmReject] = useState<{ id: string; societyName: string } | null>(null);

  return (
    <div className="space-y-6 pb-12 animate-page-fade">
      <PageHeader title="Society Applications" description="Approve or reject requests to bring CEN to new societies." />
      <div className="space-y-4">
        {apps.data?.map((a) => (
          <Card key={a.id} className="border-line/60 shadow-[0_4px_20px_-4px_rgba(16,86,68,0.04)] hover:shadow-[0_12px_30px_-6px_rgba(16,86,68,0.1)] hover:-translate-y-0.5 transition-all duration-300 bg-white">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-line/20">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-ink">{a.societyName}</h3>
                    <Badge className={cn(
                      "text-xs uppercase font-bold border px-2 py-0.5",
                      a.status === "pending" ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"
                    )}>
                      {a.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">{a.type} · Registered Entity</p>
                </div>
                {a.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <ApproveDialog id={a.id} initialCapacity={a.residentCount} suggestedInitialCredits={a.initialCredits} onDone={() => qc.invalidateQueries({ queryKey: ["apps"] })} />
                    <Button variant="outline" className="h-[36px] text-xs font-semibold px-4 active:scale-98 transition-all border-line-strong hover:bg-panel cursor-pointer" onClick={() => setConfirmReject({ id: a.id, societyName: a.societyName })}>Reject</Button>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-6 pt-4 mt-2">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-on-surface-variant/80">Applicant Info</span>
                  <p className="text-sm font-semibold text-ink mt-1">{a.applicantName}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{a.applicantContact}</p>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-on-surface-variant/80">Location Detail</span>
                  <p className="text-sm font-semibold text-ink mt-1">{a.address}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{a.type}</p>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-on-surface-variant/80">Requested Slots</span>
                  <p className="text-sm font-bold text-deep-forest mt-1">{a.residentCount ?? "100"}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Household capacity</p>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-on-surface-variant/80">Initial Credits</span>
                  <p className="text-sm font-bold text-deep-forest mt-1">{a.initialCredits ?? 10} Credits</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Per house grant</p>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-on-surface-variant/80">Proposal Reason</span>
                  <p className="text-sm text-ink leading-relaxed italic mt-1 pr-2">"{a.reason}"</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!confirmReject} onOpenChange={(open) => !open && setConfirmReject(null)}>
        <AlertDialogContent className="bg-white border-line/60 rounded-2xl shadow-xl max-w-sm p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-base font-bold text-ink flex items-center gap-2">
              <XCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
              Reject Application
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to reject the application for <span className="font-bold text-ink">"{confirmReject?.societyName}"</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5 flex gap-2">
            <AlertDialogCancel className="h-9 px-4 text-xs font-semibold rounded-lg border-line-strong hover:bg-panel cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                if (confirmReject) {
                  await societyService.rejectApplication(confirmReject.id);
                  toast.info("Application rejected");
                  qc.invalidateQueries({ queryKey: ["apps"] });
                  setConfirmReject(null);
                }
              }}
              className="h-9 px-4 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer active:scale-98 transition-all"
            >
              Confirm Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ApproveDialog({
  id,
  initialCapacity = 200,
  suggestedInitialCredits = 10,
  onDone,
}: {
  id: string;
  initialCapacity?: number;
  suggestedInitialCredits?: number;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [cap, setCap] = useState<number | string>(initialCapacity);
  const [initCredits, setInitCredits] = useState<number | string>(suggestedInitialCredits);

  useEffect(() => {
    if (open) {
      setCap(initialCapacity);
      setInitCredits(suggestedInitialCredits);
    }
  }, [open, initialCapacity, suggestedInitialCredits]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-[36px] px-4 cursor-pointer shadow-sm active:scale-98 transition-all">Approve</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-line/60 rounded-2xl p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <DialogHeader className="pb-3 border-b border-line/35">
          <DialogTitle className="text-base font-bold text-ink">Approve society</DialogTitle>
          <span className="text-xs text-on-surface-variant">Initialize community parameters including member slot capacity and initial credits per household.</span>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">Maximum member capacity (Slots)</Label>
            <Input type="number" min={1} value={cap} onChange={(e) => setCap(e.target.value === "" ? "" : Number(e.target.value))} className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">Initial credits per household / slot</Label>
            <Input type="number" min={0} value={initCredits} onChange={(e) => setInitCredits(e.target.value === "" ? "" : Number(e.target.value))} className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-lg" />
            <p className="text-[10px] text-on-surface-variant">Every household approved to join this society will automatically receive these credits.</p>
          </div>
          <Button className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 rounded-lg shadow-sm cursor-pointer mt-2 active:scale-98 transition-all" onClick={async () => {
            await societyService.approveApplication(id, Number(cap) || 200, Number(initCredits) || 10);
            toast.success("Society approved and activated with configured initial credits");
            setOpen(false);
            onDone();
          }}>Confirm approval</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

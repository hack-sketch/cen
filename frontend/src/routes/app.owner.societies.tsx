import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { societyService } from "@/services";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Settings2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/owner/societies")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [confirmSuspend, setConfirmSuspend] = useState<{ id: string; name: string } | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const societies = useQuery({ queryKey: ["societies", q], queryFn: () => societyService.list(q) });
  const list = societies.data ?? [];
  return (
    <div className="space-y-6 pb-12 animate-page-fade">
      <PageHeader title="Societies Directory" description="Operational catalog of all active and suspended Community Exchange Networks." />
      <Input placeholder="Search societies..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm h-10 text-xs rounded-lg border-line-strong/60 focus:border-deep-forest focus:ring-1 focus:ring-deep-forest/20" />
      <div className="grid gap-4">
        {list.map((s: any) => (
          <Card key={s.id} className="border-line/60 shadow-[0_4px_20px_-4px_rgba(16,86,68,0.04)] hover:shadow-[0_12px_30px_-6px_rgba(16,86,68,0.1)] hover:-translate-y-0.5 transition-all duration-300 bg-white">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-line/20">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-ink">{s.name}</h3>
                    <Badge className={cn(
                      "text-xs uppercase font-bold border px-2 py-0.5",
                      s.status === "active" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
                    )}>
                      {s.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">{s.type} · {s.address}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {s.status === "active" ? (
                    <>
                      <EditConfigDialog society={s} onDone={() => qc.invalidateQueries({ queryKey: ["societies"] })} />
                      <Button
                        variant="outline"
                        className="h-[34px] text-xs font-semibold px-4 border-rose-200 text-rose-700 hover:bg-rose-50 cursor-pointer"
                        onClick={() => {
                          setSuspendReason("");
                          setConfirmSuspend({ id: s.id, name: s.name });
                        }}
                      >
                        Suspend
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      className="h-[34px] text-xs font-semibold px-4 border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                      onClick={async () => {
                        try {
                          await societyService.revokeSuspension(s.id);
                          toast.success(`Suspension revoked for "${s.name}". Network is now active.`);
                          qc.invalidateQueries({ queryKey: ["societies"] });
                        } catch (err: any) {
                          toast.error(err.message || "Failed to revoke suspension");
                        }
                      }}
                    >
                      Revoke Suspension / Reactivate
                    </Button>
                  )}
                </div>
              </div>

              {s.status === "suspended" && (
                <div className="mt-4 p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2">
                  <div className="text-xs text-rose-900">
                    <span className="font-bold">Suspension Reason: </span>
                    {s.suspensionReason || "Under administrative policy review."}
                  </div>
                  {s.suspensionAppeal && (
                    <div className="text-xs bg-white/80 p-2.5 rounded-lg border border-rose-200 text-slate-800">
                      <span className="font-bold text-deep-forest">Admin Appeal: </span>
                      "{s.suspensionAppeal}"
                      {s.suspensionAppealDate && <span className="text-[10px] text-on-surface-variant ml-2">({s.suspensionAppealDate})</span>}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-4 mt-2">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-on-surface-variant/80">Capacity Slots</span>
                  <p className="text-sm font-semibold text-ink mt-1">{s.capacity} Households</p>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-on-surface-variant/80">Initial Credits</span>
                  <p className="text-sm font-semibold text-deep-forest mt-1">{s.initialCredits ?? 10} Credits / House</p>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-on-surface-variant/80">Coordinators</span>
                  <p className="text-sm font-semibold text-ink mt-1">{s.coordinatorCount} Active</p>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-on-surface-variant/80">Performance</span>
                  <p className="text-sm font-semibold text-deep-forest mt-1">{s.performanceScore} / 100</p>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-on-surface-variant/80">Access Token Key</span>
                  <p className="mt-1"><code className="rounded bg-panel border px-2.5 py-0.5 text-sm font-mono font-semibold text-ink">{s.key}</code></p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!confirmSuspend} onOpenChange={(open) => !open && setConfirmSuspend(null)}>
        <AlertDialogContent className="bg-white border-line/60 rounded-2xl shadow-xl max-w-md p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-base font-bold text-ink flex items-center gap-2">
              <XCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
              Suspend Community Network
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to suspend <span className="font-bold text-ink">"{confirmSuspend?.name}"</span>? All operational access and marketplace activities for its members will be immediately frozen.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-1.5 my-3">
            <label className="text-xs font-bold text-ink">Suspension Reason / Notice to Community <span className="text-rose-600">*</span></label>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Provide a specific justification (e.g., Policy violation, compliance audit, fraudulent coordinator activity)..."
              rows={3}
              className="w-full text-xs p-2.5 rounded-lg border border-line-strong/60 focus:outline-none focus:ring-1 focus:ring-rose-500 text-ink bg-white resize-none"
            />
          </div>

          <AlertDialogFooter className="mt-5 flex gap-2">
            <AlertDialogCancel className="h-9 px-4 text-xs font-semibold rounded-lg border-line-strong hover:bg-panel cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                if (confirmSuspend) {
                  try {
                    await societyService.suspend(confirmSuspend.id, suspendReason || "Platform policy compliance investigation.");
                    toast.info(`Society "${confirmSuspend.name}" has been suspended.`);
                    qc.invalidateQueries({ queryKey: ["societies"] });
                    setConfirmSuspend(null);
                  } catch (err: any) {
                    toast.error(err.message || "Failed to suspend society");
                  }
                }
              }}
              className="h-9 px-4 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer active:scale-98 transition-all"
            >
              Confirm Suspend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

}

function EditConfigDialog({ society, onDone }: { society: import("@/mocks/data").Society; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [cap, setCap] = useState<number | string>(society.capacity);
  const [initCreds, setInitCreds] = useState<number | string>(society.initialCredits ?? 10);

  useEffect(() => {
    if (open) {
      setCap(society.capacity);
      setInitCreds(society.initialCredits ?? 10);
    }
  }, [open, society]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-[34px] text-xs font-semibold px-3 border-line-strong hover:bg-panel cursor-pointer gap-1.5">
          <Settings2 className="h-3.5 w-3.5 text-on-surface-variant" />
          Edit Parameters
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-line/60 rounded-2xl p-6">
        <DialogHeader className="pb-3 border-b border-line/35">
          <DialogTitle className="text-base font-bold text-ink">Edit {society.name} Parameters</DialogTitle>
          <span className="text-xs text-on-surface-variant">Update member slots capacity and default initial credits for newly joining households.</span>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">Total Slots Capacity</Label>
            <Input type="number" min={1} value={cap} onChange={(e) => setCap(e.target.value === "" ? "" : Number(e.target.value))} className="border-line-strong text-xs h-10 rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">Initial Credits per House / Slot</Label>
            <Input type="number" min={0} value={initCreds} onChange={(e) => setInitCreds(e.target.value === "" ? "" : Number(e.target.value))} className="border-line-strong text-xs h-10 rounded-lg" />
            <p className="text-[10px] text-on-surface-variant">Newly approved members will receive this credit amount when onboarded.</p>
          </div>
          <Button className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 rounded-lg shadow-sm cursor-pointer mt-2 active:scale-98 transition-all" onClick={async () => {
            await societyService.updateSocietyConfig(society.id, {
              capacity: Number(cap) || society.capacity,
              initialCredits: Number(initCreds) || 10,
            });
            toast.success("Society parameters updated successfully");
            setOpen(false);
            onDone();
          }}>Save Configuration</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

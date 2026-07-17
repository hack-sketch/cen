import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { societyService } from "@/services";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
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
import { XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/owner/societies")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [confirmSuspend, setConfirmSuspend] = useState<{ id: string; name: string } | null>(null);
  const societies = useQuery({ queryKey: ["societies"], queryFn: () => societyService.list() });
  const list = societies.data?.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())) ?? [];
  return (
    <div className="space-y-6 pb-12 animate-page-fade">
      <PageHeader title="Societies Directory" description="Operational catalog of all active and suspended Community Exchange Networks." />
      <Input placeholder="Search societies..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm h-10 text-xs rounded-lg border-line-strong/60 focus:border-deep-forest focus:ring-1 focus:ring-deep-forest/20" />
      <div className="grid gap-4">
        {list.map((s) => (
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
                {s.status === "active" && (
                  <Button variant="outline" className="h-[34px] text-xs font-semibold px-4 border-line-strong hover:bg-panel cursor-pointer flex-shrink-0" onClick={() => setConfirmSuspend({ id: s.id, name: s.name })}>Suspend</Button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 mt-2">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-on-surface-variant/80">Capacity</span>
                  <p className="text-sm font-semibold text-ink mt-1">{s.capacity} Households</p>
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
        <AlertDialogContent className="bg-white border-line/60 rounded-2xl shadow-xl max-w-sm p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-base font-bold text-ink flex items-center gap-2">
              <XCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
              Suspend Society
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to suspend <span className="font-bold text-ink">"{confirmSuspend?.name}"</span>? Suspending a society will disable listings and community operations for all its members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5 flex gap-2">
            <AlertDialogCancel className="h-9 px-4 text-xs font-semibold rounded-lg border-line-strong hover:bg-panel cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                if (confirmSuspend) {
                  await societyService.suspend(confirmSuspend.id);
                  toast.info("Society suspended");
                  qc.invalidateQueries({ queryKey: ["societies"] });
                  setConfirmSuspend(null);
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

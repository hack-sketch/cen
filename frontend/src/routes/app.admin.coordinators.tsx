import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, UserMinus } from "lucide-react";
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

export const Route = createFileRoute("/app/admin/coordinators")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const sid = user!.societyId!;
  const all = useQuery({ queryKey: ["allRes", sid], queryFn: () => userService.listBySociety(sid) });
  const [sel, setSel] = useState<string>("");
  const [confirmDemote, setConfirmDemote] = useState<{ id: string; name: string } | null>(null);
  const coords = all.data?.filter((u) => u.isCoordinator) ?? [];
  const residents = all.data?.filter((u) => !u.isCoordinator) ?? [];

  return (
    <div>
      <PageHeader title="Coordinators Manager" description="Promote residents to coordinator or remove coordinator status." />
      {coords.length < 2 && (
        <div className="mb-4 flex items-center gap-2 rounded-md border-l-4 border-orange-500 bg-orange-50 p-3 text-sm text-orange-800 dark:bg-orange-950/40 dark:text-orange-200">
          <AlertTriangle className="h-4 w-4" /> Minimum 2 coordinators required for society to be operational.
        </div>
      )}
      <Card className="mb-6 border-line/60 shadow-sm"><CardContent className="p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[280px]">
            <span className="text-xs uppercase font-bold tracking-wider text-on-surface-variant block mb-1.5">Select Resident to Promote</span>
            <Select value={sel} onValueChange={setSel}>
              <SelectTrigger className="w-full border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-sm h-10 rounded-lg"><SelectValue placeholder="Choose resident from roster..." /></SelectTrigger>
              <SelectContent>
                {residents.map((r) => <SelectItem key={r.id} value={r.id} className="text-sm">{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button disabled={!sel} onClick={async () => {
            await userService.promote(sel);
            setSel(""); qc.invalidateQueries({ queryKey: ["allRes", sid] });
            toast.success("Promoted to coordinator");
          }} className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 px-5 rounded-lg shadow-sm cursor-pointer active:scale-98 transition-all">
            Promote to Coordinator
          </Button>
        </div>
      </CardContent></Card>

      <div className="space-y-3">
        {coords.map((c) => (
          <Card key={c.id} className="border-line/60 shadow-sm hover:shadow-md transition-all duration-300 bg-white">
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-base text-ink">{c.name}</div>
                <div className="text-sm text-on-surface-variant mt-1">{c.email}</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-purple-50 border-purple-200 text-purple-800 text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full pointer-events-none border">Coordinator</Badge>
                <Button variant="outline" size="sm" className="text-xs font-semibold h-9 px-3 border-line-strong hover:bg-panel cursor-pointer text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => setConfirmDemote({ id: c.id, name: c.name })}>Remove</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!confirmDemote} onOpenChange={(open) => !open && setConfirmDemote(null)}>
        <AlertDialogContent className="bg-white border-line/60 rounded-2xl shadow-xl max-w-sm p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-base font-bold text-ink flex items-center gap-2">
              <UserMinus className="h-5 w-5 text-rose-600 flex-shrink-0" />
              Remove Coordinator Role
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to remove the Coordinator role from <span className="font-bold text-ink">{confirmDemote?.name}</span>? They will be demoted to a regular Resident.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5 flex gap-2">
            <AlertDialogCancel className="h-9 px-4 text-xs font-semibold rounded-lg border-line-strong hover:bg-panel cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                if (confirmDemote) {
                  await userService.demote(confirmDemote.id);
                  qc.invalidateQueries({ queryKey: ["allRes", sid] });
                  toast.info("Coordinator status removed.");
                  setConfirmDemote(null);
                }
              }}
              className="h-9 px-4 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer active:scale-98 transition-all"
            >
              Confirm Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

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
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/app/admin/coordinators")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const sid = user!.societyId!;
  const all = useQuery({ queryKey: ["allRes", sid], queryFn: () => userService.listBySociety(sid) });
  const [sel, setSel] = useState<string>("");
  const coords = all.data?.filter((u) => u.isCoordinator) ?? [];
  const residents = all.data?.filter((u) => !u.isCoordinator) ?? [];

  return (
    <div>
      <PageHeader title="Coordinators" description="Promote residents to coordinator or remove coordinator status." />
      {coords.length < 2 && (
        <div className="mb-4 flex items-center gap-2 rounded-md border-l-4 border-orange-500 bg-orange-50 p-3 text-sm text-orange-800 dark:bg-orange-950/40 dark:text-orange-200">
          <AlertTriangle className="h-4 w-4" /> Minimum 2 coordinators required for society to be operational.
        </div>
      )}
      <Card className="mb-4"><CardContent className="pt-6">
        <div className="flex flex-wrap gap-2">
          <Select value={sel} onValueChange={setSel}>
            <SelectTrigger className="w-72"><SelectValue placeholder="Choose resident to promote" /></SelectTrigger>
            <SelectContent>
              {residents.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button disabled={!sel} onClick={async () => {
            // TODO: replace with real API call to backend
            await userService.promote(sel);
            setSel(""); qc.invalidateQueries({ queryKey: ["allRes", sid] });
            toast.success("Promoted to coordinator");
          }}>Promote</Button>
        </div>
      </CardContent></Card>

      <div className="space-y-2">
        {coords.map((c) => (
          <Card key={c.id}><CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge>Coordinator</Badge>
                <Button variant="outline" size="sm" onClick={async () => {
                  await userService.demote(c.id);
                  qc.invalidateQueries({ queryKey: ["allRes", sid] });
                  toast.info("Coordinator removed");
                }}>Remove</Button>
              </div>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}

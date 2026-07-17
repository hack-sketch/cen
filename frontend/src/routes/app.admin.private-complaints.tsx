import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { complaintService, userService } from "@/services";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { ShieldAlert, EyeOff } from "lucide-react";

export const Route = createFileRoute("/app/admin/private-complaints")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const sid = user!.societyId!;
  const list = useQuery({ queryKey: ["priv", sid], queryFn: () => complaintService.listPrivateAgainstCoordinators(sid) });
  const users = useQuery({ queryKey: ["allRes", sid], queryFn: () => userService.listBySociety(sid) });
  const nameOf = (id?: string) => users.data?.find((u) => u.id === id)?.name ?? "Unknown";
  return (
    <div>
      <PageHeader title="Private Complaints (Admin only)" description="Complaints against coordinators. Filers are anonymous. Coordinators cannot see this tab." />
      <div className="mb-4 flex items-center gap-2 rounded-md border-l-4 border-primary bg-primary/5 p-3 text-sm">
        <EyeOff className="h-4 w-4 text-primary" /> Confidential channel — only you can view these.
      </div>
      <div className="space-y-3">
        {list.data?.map((c) => (
          <Card key={c.id}><CardContent className="pt-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-orange-500" />
                  <h3 className="font-semibold">{c.subject}</h3>
                  <Badge variant="secondary">{c.category}</Badge>
                  <Badge variant={c.priority === "high" ? "destructive" : "outline"}>AI: {c.priority}</Badge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Filed by: Anonymous · Target coordinator: {nameOf(c.targetCoordinatorId)}</div>
                <p className="mt-2 text-sm">{c.description}</p>
              </div>
              <div className="flex gap-2">
                {c.status === "open" && (
                  <>
                    <Button size="sm" variant="outline" onClick={async () => {
                      // TODO: replace with real API call to backend
                      await complaintService.takeAction(c.id, "in-review");
                      qc.invalidateQueries({ queryKey: ["priv", sid] });
                    }}>Warn</Button>
                    <Button size="sm" onClick={async () => {
                      await complaintService.takeAction(c.id, "resolved");
                      qc.invalidateQueries({ queryKey: ["priv", sid] });
                      toast.success("Marked resolved");
                    }}>Resolve</Button>
                    <Button size="sm" variant="ghost" onClick={async () => {
                      await complaintService.takeAction(c.id, "dismissed");
                      qc.invalidateQueries({ queryKey: ["priv", sid] });
                    }}>Dismiss</Button>
                  </>
                )}
                {c.status !== "open" && <Badge>{c.status}</Badge>}
              </div>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}

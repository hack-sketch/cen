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

export const Route = createFileRoute("/app/owner/societies")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const societies = useQuery({ queryKey: ["societies"], queryFn: () => societyService.list() });
  const list = societies.data?.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())) ?? [];
  return (
    <div>
      <PageHeader title="Societies" description="Read-only directory. You can suspend a society if required." />
      <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="mb-4 max-w-sm" />
      <div className="grid gap-3">
        {list.map((s) => (
          <Card key={s.id}>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{s.name}</h3>
                    <Badge variant={s.status === "active" ? "default" : "destructive"}>{s.status}</Badge>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.type} · {s.address}</div>
                  <div className="mt-2 flex gap-6 text-sm">
                    <div><span className="text-muted-foreground">Capacity:</span> {s.capacity}</div>
                    <div><span className="text-muted-foreground">Coordinators:</span> {s.coordinatorCount}</div>
                    <div><span className="text-muted-foreground">Performance:</span> {s.performanceScore}/100</div>
                    <div><span className="text-muted-foreground">Key:</span> <code className="rounded bg-muted px-1">{s.key}</code></div>
                  </div>
                </div>
                {s.status === "active" && (
                  <Button variant="outline" onClick={async () => {
                    // TODO: replace with real API call to backend
                    await societyService.suspend(s.id);
                    toast.info("Society suspended");
                    qc.invalidateQueries({ queryKey: ["societies"] });
                  }}>Suspend</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

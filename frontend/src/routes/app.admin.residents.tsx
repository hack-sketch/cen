import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

export const Route = createFileRoute("/app/admin/residents")({ component: Page });

function Page() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const list = useQuery({ queryKey: ["allRes", user!.societyId], queryFn: () => userService.listBySociety(user!.societyId!) });
  const rows = list.data?.filter((u) => u.name.toLowerCase().includes(q.toLowerCase())) ?? [];
  return (
    <div>
      <PageHeader title="Residents" description="Read-only roster." />
      <Input placeholder="Search residents…" value={q} onChange={(e) => setQ(e.target.value)} className="mb-4 max-w-sm" />
      <Card><CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left"><tr>
            <th className="p-3">Name</th><th className="p-3">Household</th><th className="p-3">Role</th><th className="p-3 text-right">Credits</th>
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3 text-muted-foreground">{r.householdId ?? "—"}</td>
                <td className="p-3"><Badge variant={r.isCoordinator ? "default" : "secondary"}>{r.isCoordinator ? "Coordinator" : "Resident"}</Badge></td>
                <td className="p-3 text-right">{r.creditBalance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );
}

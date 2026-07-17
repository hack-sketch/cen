import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createFileRoute("/app/coord/disputes")({ component: Page });

const disputes = [
  { id: "d-1", parties: "Anaya vs Karan", subject: "Bike repair credits", status: "open" },
  { id: "d-2", parties: "Sana vs Meera", subject: "Missed yoga slot refund", status: "in-review" },
];

function Page() {
  const [notes, setNotes] = useState<Record<string, string>>({});
  return (
    <div>
      <PageHeader title="Disputes & Mediation" description="Workspace for resolving conflicts between members." />
      <div className="space-y-3">
        {disputes.map((d) => (
          <Card key={d.id}><CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{d.subject}</h3>
                <div className="text-xs text-muted-foreground">{d.parties}</div>
              </div>
              <Badge>{d.status}</Badge>
            </div>
            <Textarea
              className="mt-3"
              placeholder="Mediation notes…"
              value={notes[d.id] ?? ""}
              onChange={(e) => setNotes({ ...notes, [d.id]: e.target.value })}
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm">Save notes</Button>
              <Button size="sm">Mark resolved</Button>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}

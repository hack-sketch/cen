import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/coord/disputes")({ component: Page });

const disputes = [
  { id: "d-1", parties: "Anaya vs Karan", subject: "Bike repair credits", status: "open" },
  { id: "d-2", parties: "Sana vs Meera", subject: "Missed yoga slot refund", status: "in-review" },
];

function Page() {
  const [notes, setNotes] = useState<Record<string, string>>({});
  return (
    <div className="space-y-6 pb-12 animate-page-fade">
      <PageHeader title="Disputes & Mediation" description="Workspace for resolving conflicts and mediating transaction complaints between members." />
      <div className="space-y-4">
        {disputes.map((d) => (
          <Card key={d.id} className="border-line/60 shadow-[0_4px_20px_-4px_rgba(16,86,68,0.04)] hover:shadow-[0_12px_30px_-6px_rgba(16,86,68,0.1)] hover:-translate-y-0.5 transition-all duration-300 bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start pb-4 border-b border-line/20">
                <div>
                  <h3 className="font-bold text-lg text-ink">{d.subject}</h3>
                  <div className="text-sm text-on-surface-variant mt-1.5 font-medium">Parties: <span className="font-semibold text-ink">{d.parties}</span></div>
                </div>
                <Badge className={cn(
                  "text-xs uppercase font-bold border px-2.5 py-0.5 rounded-full",
                  d.status === "open" ? "bg-amber-50 border-amber-200 text-amber-800" :
                  d.status === "in-review" ? "bg-blue-50 border-blue-200 text-blue-800" :
                  "bg-emerald-50 border-emerald-200 text-emerald-800"
                )}>
                  {d.status}
                </Badge>
              </div>
              <div className="pt-4 space-y-3">
                <span className="text-xs uppercase font-bold tracking-wider text-on-surface-variant block mb-1">Mediation Logs & Draft Notes</span>
                <Textarea
                  placeholder="Draft mediation terms, action resolutions, or policy guidelines..."
                  value={notes[d.id] ?? ""}
                  onChange={(e) => setNotes({ ...notes, [d.id]: e.target.value })}
                  className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-sm rounded-lg p-3 min-h-[80px]"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="outline" size="sm" className="h-9 text-xs font-semibold px-4 border-line-strong hover:bg-panel cursor-pointer">Save Notes</Button>
                  <Button size="sm" className="h-9 text-xs font-semibold px-4 bg-deep-forest hover:bg-deep-forest/90 text-white cursor-pointer active:scale-98 transition-all">Mark Resolved</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

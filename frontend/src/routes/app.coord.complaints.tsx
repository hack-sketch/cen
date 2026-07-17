import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { complaintService } from "@/services";
import { useAuth } from "@/lib/auth";
import { categorizeComplaint } from "@/services/ai";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/app/coord/complaints")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const sid = user!.societyId!;
  const list = useQuery({ queryKey: ["comps", sid], queryFn: () => complaintService.listSociety(sid) });
  return (
    <div>
      <PageHeader title="Complaints" description="All regular complaints in the society. Take action or mediate." />
      <div className="space-y-3">
        {list.data?.map((c) => <ComplaintRow key={c.id} c={c} onChange={() => qc.invalidateQueries({ queryKey: ["comps", sid] })} />)}
      </div>
    </div>
  );
}

function ComplaintRow({ c, onChange }: { c: import("@/mocks/data").Complaint; onChange: () => void }) {
  const [aiTag, setAiTag] = useState<{ category: string; priority: string } | null>(null);
  useEffect(() => {
    // TODO: connect to real AI backend classification endpoint
    categorizeComplaint(c.description).then(setAiTag);
  }, [c.description]);
  return (
    <Card><CardContent className="pt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{c.subject}</h3>
            <Badge variant="secondary">{c.category}</Badge>
            <Badge>{c.status}</Badge>
            {aiTag && (
              <Badge variant="outline" className="border-primary/40 text-primary">
                <Sparkles className="mr-1 h-3 w-3" /> AI: {aiTag.priority}
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">by {c.filedByName} · {c.createdAt}</div>
          <p className="mt-2 text-sm">{c.description}</p>
        </div>
        {c.status !== "resolved" && c.status !== "dismissed" && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={async () => { await complaintService.takeAction(c.id, "in-review"); onChange(); }}>In review</Button>
            <Button size="sm" onClick={async () => { await complaintService.takeAction(c.id, "resolved"); onChange(); toast.success("Marked resolved"); }}>Resolve</Button>
            <Button size="sm" variant="ghost" onClick={async () => { await complaintService.takeAction(c.id, "dismissed"); onChange(); }}>Dismiss</Button>
          </div>
        )}
      </div>
    </CardContent></Card>
  );
}

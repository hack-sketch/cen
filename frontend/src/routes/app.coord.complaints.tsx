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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/coord/complaints")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const sid = user!.societyId!;
  const list = useQuery({ queryKey: ["comps", sid], queryFn: () => complaintService.listSociety(sid) });
  return (
    <div className="space-y-6 pb-12 animate-page-fade">
      <PageHeader title="Reported Complaints" description="All regular complaints filed by residents in this society. Track, review, or resolve conflict reports." />
      <div className="space-y-4">
        {list.data?.map((c) => <ComplaintRow key={c.id} c={c} onChange={() => qc.invalidateQueries({ queryKey: ["comps", sid] })} />)}
        {list.data?.length === 0 && (
          <div className="py-12 text-center text-xs text-on-surface-variant border border-dashed border-line rounded-xl bg-white">
            No complaints filed in this society.
          </div>
        )}
      </div>
    </div>
  );
}

function ComplaintRow({ c, onChange }: { c: import("@/mocks/data").Complaint; onChange: () => void }) {
  const [aiTag, setAiTag] = useState<{ category: string; priority: string } | null>(null);
  useEffect(() => {
    categorizeComplaint(c.description).then(setAiTag);
  }, [c.description]);

  return (
    <Card className="border-line/60 shadow-[0_4px_20px_-4px_rgba(16,86,68,0.04)] hover:shadow-[0_12px_30px_-6px_rgba(16,86,68,0.1)] hover:-translate-y-0.5 transition-all duration-300 bg-white">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-line/20">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="font-bold text-lg text-ink leading-snug">{c.subject}</h3>
              <Badge variant="outline" className="text-xs border-line font-medium text-on-surface-variant bg-panel/30 uppercase px-2 py-0.5">
                {c.category}
              </Badge>
              <Badge className={cn(
                "text-xs uppercase font-bold border px-2 py-0.5",
                c.status === "open" ? "bg-amber-50 border-amber-200 text-amber-800" :
                c.status === "in-review" ? "bg-blue-50 border-blue-200 text-blue-800" :
                "bg-emerald-50 border-emerald-200 text-emerald-800"
              )}>
                {c.status}
              </Badge>
              {aiTag && (
                <Badge variant="outline" className="border-soft-violet/35 bg-soft-violet/5 text-soft-violet text-xs font-bold flex items-center gap-1 uppercase tracking-wider px-2 py-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-soft-violet animate-pulse" /> AI Priority: {aiTag.priority}
                </Badge>
              )}
            </div>
            <p className="text-xs text-on-surface-variant mt-1.5">Filed by <span className="font-semibold text-ink">{c.filedByName}</span> · {c.createdAt}</p>
          </div>
          {c.status !== "resolved" && c.status !== "dismissed" && (
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" variant="outline" className="h-9 text-xs font-semibold px-3 border-line-strong hover:bg-panel cursor-pointer" onClick={async () => { await complaintService.takeAction(c.id, "in-review"); onChange(); }}>In Review</Button>
              <Button size="sm" className="h-9 text-xs font-semibold px-3 bg-deep-forest hover:bg-deep-forest/90 text-white cursor-pointer active:scale-98 transition-all shadow-sm" onClick={async () => { await complaintService.takeAction(c.id, "resolved"); onChange(); toast.success("Marked resolved"); }}>Resolve</Button>
              <Button size="sm" variant="outline" className="h-9 text-xs font-semibold px-3 text-rose-600 hover:bg-rose-50 border-line-strong hover:border-rose-200 cursor-pointer" onClick={async () => { await complaintService.takeAction(c.id, "dismissed"); onChange(); toast.info("Complaint dismissed."); }}>Dismiss</Button>
            </div>
          )}
        </div>

        <p className="text-sm sm:text-base text-ink leading-relaxed pt-4 mt-1 whitespace-pre-line pl-2 border-l-2 border-line/30">
          {c.description}
        </p>
      </CardContent>
    </Card>
  );
}

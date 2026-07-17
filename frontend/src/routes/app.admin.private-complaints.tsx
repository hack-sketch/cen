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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/admin/private-complaints")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const sid = user!.societyId!;
  const list = useQuery({ queryKey: ["priv", sid], queryFn: () => complaintService.listPrivateAgainstCoordinators(sid) });
  const users = useQuery({ queryKey: ["allRes", sid], queryFn: () => userService.listBySociety(sid) });
  const nameOf = (id?: string) => users.data?.find((u) => u.id === id)?.name ?? "Unknown";
  return (
    <div className="space-y-6 pb-12 animate-page-fade">
      <PageHeader title="Confidential Reports" description="Complaints filed privately against active coordinators. Coordinator roles cannot view this panel." />
      <div className="rounded-xl border border-dashed border-deep-forest/30 bg-deep-forest/5 p-4 text-sm flex items-center gap-2">
        <EyeOff className="h-4.5 w-4.5 text-deep-forest flex-shrink-0 animate-pulse" /> 
        <span className="font-semibold text-deep-forest">Secure Audit Channel</span> · Filer identities are permanently hashed and hidden.
      </div>
      <div className="space-y-4">
        {list.data?.map((c) => (
          <Card key={c.id} className="border-line/60 shadow-[0_4px_20px_-4px_rgba(16,86,68,0.04)] hover:shadow-[0_12px_30px_-6px_rgba(16,86,68,0.1)] hover:-translate-y-0.5 transition-all duration-300 bg-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-line/20">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <ShieldAlert className="h-5 w-5 text-orange-500 flex-shrink-0" />
                    <h3 className="font-bold text-lg text-ink leading-snug">{c.subject}</h3>
                    <Badge variant="outline" className="text-xs border-line font-medium text-on-surface-variant bg-panel/30 uppercase px-2 py-0.5">{c.category}</Badge>
                    <Badge variant={c.priority === "high" ? "destructive" : "outline"} className="text-xs uppercase font-bold px-2 py-0.5">AI: {c.priority}</Badge>
                    <Badge className={cn(
                      "text-xs uppercase font-bold border px-2 py-0.5",
                      c.status === "open" ? "bg-amber-50 border-amber-200 text-amber-800" :
                      c.status === "in-review" ? "bg-blue-50 border-blue-200 text-blue-800" :
                      "bg-emerald-50 border-emerald-200 text-emerald-800"
                    )}>
                      {c.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1.5">Filed by: <span className="font-semibold text-ink">Anonymous</span> · Target coordinator: <span className="font-semibold text-ink">{nameOf(c.targetCoordinatorId)}</span></p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {c.status === "open" && (
                    <>
                      <Button size="sm" variant="outline" className="h-9 text-xs font-semibold px-3 border-line-strong hover:bg-panel cursor-pointer text-amber-700 hover:bg-amber-50" onClick={async () => {
                        await complaintService.takeAction(c.id, "in-review");
                        qc.invalidateQueries({ queryKey: ["priv", sid] });
                        toast.info("Logged as In Review.");
                      }}>Warn</Button>
                      <Button size="sm" className="h-9 text-xs font-semibold px-3 bg-deep-forest hover:bg-deep-forest/90 text-white cursor-pointer active:scale-98 transition-all shadow-sm" onClick={async () => {
                        await complaintService.takeAction(c.id, "resolved");
                        qc.invalidateQueries({ queryKey: ["priv", sid] });
                        toast.success("Marked resolved");
                      }}>Resolve</Button>
                      <Button size="sm" variant="outline" className="h-9 text-xs font-semibold px-3 text-rose-600 hover:bg-rose-50 border-line-strong hover:border-rose-200 cursor-pointer" onClick={async () => {
                        await complaintService.takeAction(c.id, "dismissed");
                        qc.invalidateQueries({ queryKey: ["priv", sid] });
                        toast.info("Complaint dismissed.");
                      }}>Dismiss</Button>
                    </>
                  )}
                </div>
              </div>

              <p className="text-sm sm:text-base text-ink leading-relaxed pt-4 mt-1 whitespace-pre-line pl-2 border-l-2 border-line/30">
                {c.description}
              </p>
            </CardContent>
          </Card>
        ))}
        {list.data?.length === 0 && (
          <div className="py-12 text-center text-xs text-on-surface-variant border border-dashed border-line rounded-xl bg-white">
            No confidential reports logged against coordinators.
          </div>
        )}
      </div>
    </div>
  );
}

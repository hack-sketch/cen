import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { noticeService } from "@/services";
import { summarizeNotice } from "@/services/ai";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Sparkles, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/notices")({ component: Page });

function Page() {
  const { user } = useAuth();
  const sid = user!.societyId!;
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["notices", sid], queryFn: () => noticeService.list(sid) });
  const canDeleteAny = user!.role === "admin" || user!.role === "coordinator" || user!.isCoordinator;
  const postedToday = useQuery({ queryKey: ["notPosted", user!.id], queryFn: () => noticeService.hasPostedToday(user!.id) });
  const isResidentOnly = user!.role === "resident" && !user!.isCoordinator;
  const disablePost = isResidentOnly && !!postedToday.data;

  return (
    <div className="space-y-6 pb-12 animate-page-fade">
      <PageHeader 
        title="Notice Board" 
        description={isResidentOnly ? "Residents can post one notice per day." : "Post unlimited notices and moderate."} 
        action={<NewNoticeDialog disabled={disablePost} />} 
      />
      
      {disablePost && (
        <div className="rounded-xl border border-dashed border-orange-300 bg-orange-50/50 p-4 text-xs text-orange-800 leading-relaxed font-medium">
          You've already broadcasted a notice today. Roster constraints allow one resident post per 24-hour cycle.
        </div>
      )}
      
      <div className="space-y-4">
        {list.data?.map((n) => (
          <NoticeCard 
            key={n.id} 
            n={n} 
            canDelete={canDeleteAny || n.postedById === user!.id} 
            onDelete={async () => {
              await noticeService.delete(n.id); 
              qc.invalidateQueries({ queryKey: ["notices", sid] });
              toast.info("Notice deleted.");
            }} 
          />
        ))}
        {list.data?.length === 0 && (
          <div className="py-12 text-center text-xs text-on-surface-variant border border-dashed border-line rounded-xl bg-white">
            No notices broadcasted on the board yet.
          </div>
        )}
      </div>
    </div>
  );
}

function NoticeCard({ n, canDelete, onDelete }: { n: import("@/mocks/data").Notice; canDelete: boolean; onDelete: () => void }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  return (
    <Card className="border-line/60 shadow-[0_4px_20px_-4px_rgba(16,86,68,0.04)] hover:shadow-[0_12px_30px_-6px_rgba(16,86,68,0.1)] hover:-translate-y-0.5 transition-all duration-300 bg-white">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-deep-forest/5 text-deep-forest border border-deep-forest/15 flex items-center justify-center flex-shrink-0">
              <Megaphone className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="font-bold text-base sm:text-lg text-ink leading-snug">{n.title}</h3>
                <Badge className={cn(
                  "text-xs uppercase font-bold border px-2 py-0.5 pointer-events-none",
                  n.posterRole === "admin" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
                  n.posterRole === "coordinator" ? "bg-purple-50 border-purple-200 text-purple-800" :
                  "bg-slate-50 border-slate-200 text-slate-800"
                )}>
                  {n.posterRole}
                </Badge>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Broadcasted by <span className="font-semibold text-ink">{n.postedByName}</span> · {n.date}</p>
            </div>
          </div>
          {canDelete && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onDelete}
              className="text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 h-8 w-8 rounded-lg cursor-pointer transition-all active:scale-95"
              title="Delete Notice"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <p className="text-sm sm:text-base text-ink leading-relaxed whitespace-pre-line pl-2 border-l-2 border-line/30">
          {n.content}
        </p>

        {n.content.length > 120 && (
          <div className="pt-2">
            {summary ? (
              <div className="rounded-xl border border-soft-violet/20 bg-soft-violet/[0.02] p-4 text-sm text-on-surface-variant leading-relaxed shadow-inner">
                <div className="flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-soft-violet mb-1.5">
                  <Sparkles className="h-4 w-4 animate-pulse" /> AI Synthesis Summary
                </div>
                <p className="italic font-medium text-ink/90">"{summary}"</p>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                disabled={loadingAI}
                onClick={async () => {
                  setLoadingAI(true);
                  try {
                    setSummary(await summarizeNotice(n.content));
                  } catch {
                    toast.error("AI summarization failed.");
                  } finally {
                    setLoadingAI(false);
                  }
                }}
                className="text-xs font-semibold border-line-strong hover:bg-soft-violet/5 hover:border-soft-violet/40 cursor-pointer h-9 px-4 rounded-lg active:scale-98 transition-all"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-soft-violet animate-pulse" /> 
                {loadingAI ? "Synthesizing..." : "Summarize Content (AI)"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NewNoticeDialog({ disabled }: { disabled: boolean }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 px-4 rounded-lg shadow-sm cursor-pointer active:scale-98 transition-all">
          <Plus className="mr-1.5 h-4 w-4" /> Broadcast Notice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-line/60 rounded-2xl p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <DialogHeader className="pb-3 border-b border-line/35">
          <DialogTitle className="text-base font-bold text-ink">Broadcast Notice</DialogTitle>
          <span className="text-xs text-on-surface-variant">Post updates, reminders, or requests to the community.</span>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Notice Title</Label>
            <Input 
              value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })} 
              placeholder="e.g. Society Maintenance Shutdown"
              className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Content Body</Label>
            <Textarea 
              rows={5} 
              value={form.content} 
              onChange={(e) => setForm({ ...form, content: e.target.value })} 
              placeholder="Draft your announcement detail here..."
              className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs rounded-lg p-3"
            />
          </div>
          <Button 
            disabled={!form.title.trim() || !form.content.trim() || loading}
            onClick={async () => {
              setLoading(true);
              try {
                await noticeService.post({
                  postedById: user!.id, postedByName: user!.name, posterRole: user!.role,
                  title: form.title, content: form.content, societyId: user!.societyId!,
                });
                setOpen(false); 
                qc.invalidateQueries();
                setForm({ title: "", content: "" });
                toast.success("Notice broadcasted successfully!");
              } catch {
                toast.error("Failed to post notice.");
              } finally {
                setLoading(false);
              }
            }} 
            className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 rounded-lg shadow-sm cursor-pointer mt-2 active:scale-98 transition-all"
          >
            {loading ? "Publishing..." : "Publish Broadcast"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

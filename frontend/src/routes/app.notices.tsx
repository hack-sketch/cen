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
    <div>
      <PageHeader title="Notice Board" description={isResidentOnly ? "Residents can post one notice per day." : "Post unlimited notices and moderate."} action={
        <NewNoticeDialog disabled={disablePost} />
      } />
      {disablePost && <div className="mb-3 rounded-md border-l-4 border-orange-500 bg-orange-50 p-3 text-sm text-orange-800 dark:bg-orange-950/40 dark:text-orange-200">You've already posted today. Try again tomorrow.</div>}
      <div className="space-y-3">
        {list.data?.map((n) => (
          <NoticeCard key={n.id} n={n} canDelete={canDeleteAny || n.postedById === user!.id} onDelete={async () => {
            await noticeService.delete(n.id); qc.invalidateQueries({ queryKey: ["notices", sid] });
            toast.info("Deleted");
          }} />
        ))}
      </div>
    </div>
  );
}

function NoticeCard({ n, canDelete, onDelete }: { n: import("@/mocks/data").Notice; canDelete: boolean; onDelete: () => void }) {
  const [summary, setSummary] = useState<string | null>(null);
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2"><Megaphone className="h-4 w-4 text-primary" /><h3 className="font-semibold">{n.title}</h3><Badge variant="secondary" className="capitalize">{n.posterRole}</Badge></div>
            <div className="text-xs text-muted-foreground">{n.postedByName} · {n.date}</div>
          </div>
          {canDelete && <Button variant="ghost" size="icon" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>}
        </div>
        <p className="mt-2 text-sm whitespace-pre-line">{n.content}</p>
        {n.content.length > 100 && (
          <div className="mt-3">
            {summary ? (
              <div className="rounded-xl border border-soft-violet/30 bg-soft-violet/5 p-3 text-xs italic text-ink/80 leading-relaxed">
                <div className="flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-soft-violet mb-1">
                  <Sparkles className="h-3 w-3 animate-pulse" /> AI Summary
                </div>
                "{summary}"
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  setSummary(await summarizeNotice(n.content));
                }}
                className="text-[10px] font-bold border-line-strong/60 hover:bg-soft-violet/5 hover:border-soft-violet/40 cursor-pointer"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-soft-violet animate-pulse" /> Summarize (AI)
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
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button disabled={disabled}><Plus className="mr-1 h-4 w-4" /> Post notice</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Post a notice</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Content</Label><Textarea rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
          <Button className="w-full" onClick={async () => {
            await noticeService.post({
              postedById: user!.id, postedByName: user!.name, posterRole: user!.role,
              title: form.title, content: form.content, societyId: user!.societyId!,
            });
            setOpen(false); qc.invalidateQueries();
            toast.success("Notice posted");
          }}>Post</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { skillService, resourceService } from "@/services";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/app/coord/approvals")({ component: Page });

function Page() {
  const { user } = useAuth();
  const sid = user!.societyId!;
  const skills = useQuery({ queryKey: ["pSkills", sid], queryFn: () => skillService.listPending(sid) });
  const res = useQuery({ queryKey: ["pRes", sid], queryFn: () => resourceService.listPending(sid) });
  // Coordinator can never approve own submissions — filter them out.
  const skillsToReview = skills.data?.filter((s) => s.providerId !== user!.id) ?? [];
  const resToReview = res.data?.filter((r) => r.ownerId !== user!.id) ?? [];
  const mySkills = skills.data?.filter((s) => s.providerId === user!.id) ?? [];
  const myRes = res.data?.filter((r) => r.ownerId === user!.id) ?? [];
  return (
    <div>
      <PageHeader title="Approvals" description="Review submissions from residents and other coordinators. You cannot approve your own." />
      <Tabs defaultValue="skills">
        <TabsList>
          <TabsTrigger value="skills">Skills ({skillsToReview.length})</TabsTrigger>
          <TabsTrigger value="resources">Resources ({resToReview.length})</TabsTrigger>
          <TabsTrigger value="mine">My submissions</TabsTrigger>
        </TabsList>
        <TabsContent value="skills"><SkillsList items={skillsToReview} /></TabsContent>
        <TabsContent value="resources"><ResList items={resToReview} /></TabsContent>
        <TabsContent value="mine">
          <div className="rounded-md border-l-4 border-primary bg-primary/5 p-3 text-sm mb-3">
            Your own submissions are routed to a different coordinator.
          </div>
          <SkillsList items={mySkills} readonly />
          <div className="h-4" />
          <ResList items={myRes} readonly />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SkillsList({ items, readonly }: { items: import("@/mocks/data").Skill[]; readonly?: boolean }) {
  const qc = useQueryClient();
  return (
    <div className="space-y-2">
      {items.map((s) => (
        <Card key={s.id}><CardContent className="pt-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2"><h3 className="font-medium">{s.title}</h3><Badge variant="secondary">{s.category}</Badge><Badge>{s.credits} credits</Badge></div>
              <div className="text-xs text-muted-foreground">by {s.providerName}</div>
              <p className="mt-1 text-sm">{s.description}</p>
            </div>
            {!readonly && (
              <div className="flex gap-2">
                <Button size="sm" onClick={async () => { await skillService.approve(s.id); qc.invalidateQueries(); toast.success("Approved"); }}>Approve</Button>
                <Button size="sm" variant="outline" onClick={async () => { await skillService.reject(s.id); qc.invalidateQueries(); }}>Reject</Button>
              </div>
            )}
            {readonly && <Badge variant="secondary">Pending review</Badge>}
          </div>
        </CardContent></Card>
      ))}
      {items.length === 0 && <div className="text-sm text-muted-foreground">Nothing to review.</div>}
    </div>
  );
}

function ResList({ items, readonly }: { items: import("@/mocks/data").Resource[]; readonly?: boolean }) {
  const qc = useQueryClient();
  return (
    <div className="space-y-2">
      {items.map((r) => (
        <Card key={r.id}><CardContent className="pt-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2"><h3 className="font-medium">{r.name}</h3><Badge variant="secondary">{r.category}</Badge><Badge>{r.credits} credits</Badge></div>
              <div className="text-xs text-muted-foreground">by {r.ownerName}</div>
              <p className="mt-1 text-sm">{r.description}</p>
            </div>
            {!readonly && (
              <div className="flex gap-2">
                <Button size="sm" onClick={async () => { await resourceService.approve(r.id); qc.invalidateQueries(); toast.success("Approved"); }}>Approve</Button>
                <Button size="sm" variant="outline" onClick={async () => { await resourceService.reject(r.id); qc.invalidateQueries(); }}>Reject</Button>
              </div>
            )}
            {readonly && <Badge variant="secondary">Pending review</Badge>}
          </div>
        </CardContent></Card>
      ))}
      {items.length === 0 && <div className="text-sm text-muted-foreground">Nothing to review.</div>}
    </div>
  );
}

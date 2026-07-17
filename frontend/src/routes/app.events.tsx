import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { eventService } from "@/services";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Calendar, Users } from "lucide-react";

export const Route = createFileRoute("/app/events")({ component: Page });

function Page() {
  const { user } = useAuth();
  const sid = user!.societyId!;
  const qc = useQueryClient();
  const events = useQuery({ queryKey: ["ev", sid], queryFn: () => eventService.list(sid) });
  const vrs = useQuery({ queryKey: ["vr", sid], queryFn: () => eventService.listVolunteerRequests(sid) });
  const myInvites = vrs.data?.filter((v) => v.residentId === user!.id && v.type === "coordinator-invited" && v.status === "pending") ?? [];
  return (
    <div>
      <PageHeader title="Events" description="Volunteer or accept invitations." />
      {myInvites.length > 0 && (
        <div className="mb-4 rounded-md border-l-4 border-primary bg-primary/5 p-3">
          <div className="mb-2 text-sm font-medium">You have {myInvites.length} volunteer invitation(s):</div>
          {myInvites.map((v) => (
            <div key={v.id} className="flex items-center justify-between text-sm">
              <span>{v.eventTitle}</span>
              <div className="flex gap-2">
                <Button size="sm" onClick={async () => { await eventService.approveVolunteer(v.id); qc.invalidateQueries(); toast.success("Accepted"); }}>Accept</Button>
                <Button size="sm" variant="outline" onClick={async () => { await eventService.rejectVolunteer(v.id); qc.invalidateQueries(); }}>Decline</Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {events.data?.map((e) => {
          const iAmIn = e.volunteers.includes(user!.id);
          const mySelfReq = vrs.data?.find((v) => v.eventId === e.id && v.residentId === user!.id && v.type === "self-requested");
          return (
            <Card key={e.id}><CardContent className="pt-6">
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /><h3 className="font-semibold">{e.title}</h3></div>
              <div className="text-xs text-muted-foreground">{e.date} · {e.volunteers.length}/{e.volunteersNeeded} volunteers</div>
              <p className="mt-2 text-sm">{e.description}</p>
              <div className="mt-3">
                {iAmIn ? (
                  <Badge variant="default"><Users className="mr-1 h-3 w-3" /> You're volunteering</Badge>
                ) : mySelfReq ? (
                  <Badge variant="secondary">Request {mySelfReq.status}</Badge>
                ) : (
                  <Button size="sm" onClick={async () => {
                    await eventService.requestVolunteer(e.id, user!.id, user!.name, e.title);
                    qc.invalidateQueries();
                    toast.success("Volunteer request sent");
                  }}>Request to volunteer</Button>
                )}
              </div>
            </CardContent></Card>
          );
        })}
      </div>
    </div>
  );
}

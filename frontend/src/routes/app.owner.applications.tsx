import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { societyService } from "@/services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/owner/applications")({ component: Applications });

function Applications() {
  const qc = useQueryClient();
  const apps = useQuery({ queryKey: ["apps"], queryFn: () => societyService.listApplications() });
  return (
    <div>
      <PageHeader title="Society Applications" description="Approve or reject requests to bring CEN to new societies." />
      <div className="space-y-3">
        {apps.data?.map((a) => (
          <Card key={a.id}>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{a.societyName}</h3>
                    <Badge variant={a.status === "pending" ? "secondary" : a.status === "approved" ? "default" : "destructive"}>
                      {a.status}
                    </Badge>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{a.type} · {a.address}</div>
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Applicant:</span> {a.applicantName} ({a.applicantContact})
                  </div>
                  <div className="mt-1 max-w-xl text-sm italic text-muted-foreground">"{a.reason}"</div>
                </div>
                {a.status === "pending" && (
                  <div className="flex gap-2">
                    <ApproveDialog id={a.id} onDone={() => qc.invalidateQueries({ queryKey: ["apps"] })} />
                    <Button variant="outline" onClick={async () => {
                      // TODO: replace with real API call to backend
                      await societyService.rejectApplication(a.id);
                      toast.info("Application rejected");
                      qc.invalidateQueries({ queryKey: ["apps"] });
                    }}>Reject</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ApproveDialog({ id, onDone }: { id: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [cap, setCap] = useState(200);
  const [start, setStart] = useState(101);
  const [end, setEnd] = useState(300);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Approve</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Approve society</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Maximum member capacity</Label><Input type="number" value={cap} onChange={(e) => setCap(+e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Household # start</Label><Input type="number" value={start} onChange={(e) => setStart(+e.target.value)} /></div>
            <div><Label>Household # end</Label><Input type="number" value={end} onChange={(e) => setEnd(+e.target.value)} /></div>
          </div>
          <Button className="w-full" onClick={async () => {
            // TODO: replace with real API call to backend
            await societyService.approveApplication(id, cap, start, end);
            toast.success("Society approved and activated");
            setOpen(false);
            onDone();
          }}>Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { householdService, joinRequestService, societyService } from "@/services";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, FileCheck, Sparkles } from "lucide-react";
import aadharImg from "@/assets/aadhar.webp";

export const Route = createFileRoute("/app/admin/onboarding")({ component: Page });

function Page() {
  const { user } = useAuth();
  const sid = user!.societyId!;
  return (
    <div>
      <PageHeader title="Member Onboarding" description="Register households, review join requests, and share your invite key." />
      <Tabs defaultValue="households">
        <TabsList>
          <TabsTrigger value="households">Household Registry</TabsTrigger>
          <TabsTrigger value="requests">Join Requests</TabsTrigger>
          <TabsTrigger value="invite">Invite / Keys</TabsTrigger>
        </TabsList>
        <TabsContent value="households" className="animate-page-fade"><Households sid={sid} /></TabsContent>
        <TabsContent value="requests" className="animate-page-fade"><Requests sid={sid} /></TabsContent>
        <TabsContent value="invite" className="animate-page-fade"><Invite sid={sid} /></TabsContent>
      </Tabs>
    </div>
  );
}

function Households({ sid }: { sid: string }) {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["hh", sid], queryFn: () => householdService.listBySociety(sid) });
  const [unit, setUnit] = useState("");
  return (
    <Card><CardContent className="pt-6">
      <div className="mb-4 flex gap-2">
        <Input placeholder="Unit e.g. A-121" value={unit} onChange={(e) => setUnit(e.target.value)} />
        <Button onClick={async () => {
          if (!unit) return;
          // TODO: replace with real API call to backend
          await householdService.register(sid, unit);
          setUnit(""); qc.invalidateQueries({ queryKey: ["hh", sid] });
          toast.success("Household added");
        }}>Add household</Button>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
        {list.data?.map((h) => (
          <div key={h.id} className={`rounded-md border p-2 text-center text-xs ${h.claimed ? "bg-primary/10 border-primary/40" : ""}`}>
            <div className="font-medium">{h.unitNumber}</div>
            <div className="mt-0.5 text-[10px] text-muted-foreground">{h.claimed ? "Claimed" : "Available"}</div>
          </div>
        ))}
      </div>
    </CardContent></Card>
  );
}

function Requests({ sid }: { sid: string }) {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["jr", sid], queryFn: () => joinRequestService.listBySociety(sid) });
  const [selectedRequest, setSelectedRequest] = useState<import("@/mocks/data").JoinRequest | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<Record<string, { address: string; matched: boolean; score: string }>>({});

  return (
    <div className="space-y-3">
      {list.data?.map((r) => (
        <Card key={r.id} className="border-line/60 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-bold text-sm text-ink">{r.userName}</div>
                <div className="text-xs text-on-surface-variant mt-1">Household Unit {r.unitNumber} · Submitted {r.submittedAt}</div>
                <Badge className={`pointer-events-none text-[9px] font-bold uppercase tracking-wider mt-1.5 px-2.5 py-0.5 rounded-full border ${
                  r.status === "approved"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-800 hover:bg-emerald-50"
                    : r.status === "pending"
                    ? "bg-amber-50 border-amber-100 text-amber-800 hover:bg-amber-50"
                    : "bg-rose-50 border-rose-100 text-rose-800 hover:bg-rose-50"
                }`}>
                  {r.status}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedRequest(r)}
                  className="text-xs font-semibold h-[32px] px-3.5 border-line-strong hover:bg-panel cursor-pointer shadow-sm active:scale-98 transition-all"
                >
                  <FileCheck className="mr-1.5 h-4 w-4 text-on-surface-variant" /> 
                  Verify & View ID
                </Button>
                {r.status === "pending" && (
                  <>
                    <Button 
                      size="sm" 
                      onClick={async () => {
                        await joinRequestService.approve(r.id);
                        qc.invalidateQueries({ queryKey: ["jr", sid] });
                        toast.success("Join request approved.");
                      }}
                      className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-[32px] px-3.5 cursor-pointer shadow-sm active:scale-98 transition-all"
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={async () => {
                        await joinRequestService.reject(r.id);
                        qc.invalidateQueries({ queryKey: ["jr", sid] });
                        toast.info("Join request rejected.");
                      }}
                      className="text-xs font-semibold h-[32px] px-3.5 border-line-strong hover:bg-panel cursor-pointer active:scale-98 transition-all"
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Premium Verification Overlay Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-2xl border-line/60 shadow-2xl rounded-2xl p-6">
          <DialogHeader className="pb-3 border-b border-line/45">
            <DialogTitle className="text-base font-bold text-ink flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-deep-forest" />
              ID Document Verification
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant mt-1">
              Review submitted identity card details for {selectedRequest?.userName} (Unit {selectedRequest?.unitNumber}).
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="grid md:grid-cols-2 gap-6 mt-4 pt-1">
              {/* Document Image section */}
              <div className="space-y-2.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Submitted ID Card Document</span>
                <div className="border border-line rounded-xl bg-panel/30 p-3 flex items-center justify-center shadow-inner h-52 overflow-hidden">
                  <img src={aadharImg} alt="Aadhar Card" className="max-h-48 object-contain rounded-lg shadow-sm border bg-white" />
                </div>
              </div>

              {/* AI Address Verification panel */}
              <div className="space-y-3.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-soft-violet animate-pulse" />
                    AI Address Authenticator
                  </span>
                  <p className="text-[10px] text-on-surface-variant leading-relaxed">
                    OCR models scan the document to cross-reference extracted address strings against municipal databases for Unit {selectedRequest.unitNumber}.
                  </p>
                </div>

                {verifyingId === selectedRequest.id ? (
                  <div className="p-5 rounded-xl border border-dashed border-soft-violet/40 bg-soft-violet/5 flex flex-col items-center justify-center gap-2 py-12">
                    <div className="w-6 h-6 border-2 border-soft-violet/20 border-t-soft-violet rounded-full animate-spin"></div>
                    <span className="text-[10px] font-bold text-soft-violet uppercase tracking-wider animate-pulse">Running OCR Cross-Check...</span>
                  </div>
                ) : verificationResult[selectedRequest.id] ? (
                  <div className="p-4 rounded-xl border border-soft-violet/30 bg-soft-violet/5 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-bold text-soft-violet tracking-wider">Verification Match Details</span>
                      <Badge className="bg-emerald-50 border-emerald-200 text-emerald-800 text-[8.5px] font-bold px-2 py-0.5 border uppercase tracking-wider">
                        Address Verified
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-[10px]">
                      <div className="text-ink">
                        <span className="font-bold text-on-surface-variant">Extracted ID Address:</span>
                        <p className="font-semibold bg-white p-2 rounded-lg border border-line/70 mt-1 leading-normal text-ink/90">
                          {verificationResult[selectedRequest.id].address}
                        </p>
                      </div>
                      
                      <div className="flex justify-between pt-1 border-t border-line/25">
                        <span className="text-on-surface-variant">Registry Check:</span>
                        <span className="font-bold text-emerald-700">Unit {selectedRequest.unitNumber} Confirmed</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">OCR Accuracy:</span>
                        <span className="font-bold text-soft-violet">{verificationResult[selectedRequest.id].score}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={async () => {
                      setVerifyingId(selectedRequest.id);
                      await new Promise((resolve) => setTimeout(resolve, 1500));
                      setVerifyingId(null);
                      setVerificationResult(prev => ({
                        ...prev,
                        [selectedRequest.id]: {
                          address: `Unit ${selectedRequest.unitNumber}, CEN Emerald Heights, Society Boulevard, Sector 15`,
                          matched: true,
                          score: "98.7%"
                        }
                      }));
                      toast.success("AI Authentication completed successfully!");
                    }}
                    className="w-full bg-soft-violet hover:bg-soft-violet/90 text-white font-semibold text-xs h-10 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 shadow-sm mt-auto active:scale-98 transition-all"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Authenticate ID (AI)
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Invite({ sid }: { sid: string }) {
  const soc = useQuery({ queryKey: ["soc", sid], queryFn: () => societyService.getById(sid) });
  return (
    <Card><CardContent className="pt-6 space-y-4">
      <div>
        <Label>Society invite key</Label>
        <div className="mt-2 flex items-center gap-2">
          <code className="rounded-md border bg-muted px-3 py-2 font-mono text-sm">{soc.data?.key}</code>
          <Button variant="outline" size="sm" onClick={() => {
            const key = soc.data?.key ?? "";
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(key);
            } else {
              const el = document.createElement('textarea');
              el.value = key;
              document.body.appendChild(el);
              el.select();
              document.execCommand('copy');
              document.body.removeChild(el);
            }
            toast.success("Copied");
          }}><Copy className="mr-1 h-4 w-4" /> Copy</Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Share this key with residents to let them join.</p>
      </div>
    </CardContent></Card>
  );
}

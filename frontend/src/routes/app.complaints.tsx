import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { complaintService, disputeService, creditService, userService } from "@/services";
import { categorizeComplaint } from "@/services/ai";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, ShieldAlert, EyeOff, MessageSquare, CheckCircle2, Scale, Trash2, Edit3, AlertCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/complaints")({ component: Page });

function Page() {
  const { user } = useAuth();
  const sid = user!.societyId!;
  const qc = useQueryClient();

  const complaintsQuery = useQuery({ queryKey: ["complaints", sid], queryFn: () => complaintService.list(sid) });
  const disputesQuery = useQuery({ queryKey: ["myDisputes", sid], queryFn: () => disputeService.list(sid) });

  return (
    <div className="space-y-6 pb-12 animate-page-fade">
      <PageHeader
        title="Complaints & Trade Disputes"
        description="Raise issues with coordinators, log confidential reports, or mediate trade disputes."
        action={<NewComplaintDialog />}
      />

      <Tabs defaultValue="complaints" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
          <TabsList className="bg-panel border border-line p-1 rounded-xl w-full sm:w-auto flex">
            <TabsTrigger value="complaints" className="flex-1 sm:flex-initial text-xs font-semibold rounded-lg px-3 sm:px-4 py-2 transition-all">
              Public Complaints ({complaintsQuery.data?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="disputes" className="flex-1 sm:flex-initial text-xs font-semibold rounded-lg px-3 sm:px-4 py-2 transition-all">
              Trade Disputes ({disputesQuery.data?.length || 0})
            </TabsTrigger>
          </TabsList>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <FileTradeDisputeDialog />
            <PrivateComplaintDialog />
          </div>
        </div>

        <TabsContent value="complaints" className="space-y-4 mt-0">
          {complaintsQuery.data?.map((c) => (
            <ComplaintCard key={c.id} c={c} sid={sid} />
          ))}
          {complaintsQuery.data?.length === 0 && (
            <div className="py-12 text-center text-xs text-on-surface-variant border border-dashed border-line rounded-2xl bg-white/50 p-6">
              No public complaints filed yet.
            </div>
          )}
        </TabsContent>

        <TabsContent value="disputes" className="space-y-4 mt-0">
          {disputesQuery.data?.map((d: any) => (
            <TradeDisputeCard key={d.id} d={d} onChange={() => qc.invalidateQueries({ queryKey: ["myDisputes", sid] })} />
          ))}
          {disputesQuery.data?.length === 0 && (
            <div className="py-12 text-center text-xs text-on-surface-variant border border-dashed border-line rounded-2xl bg-white/50 p-6">
              No active trade disputes. Click "File Trade Dispute" above to initiate a dispute.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ComplaintCard({ c, sid }: { c: any; sid: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isFiler = user!.id === c.filedByUserId || user!.id === c.filed_by_user_id || c.filedByName === user!.name;
  const canDelete = isFiler || ["admin", "coordinator", "owner"].includes(user!.role);

  const statusColor = 
    c.status === "resolved" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
    c.status === "dismissed" ? "bg-slate-50 text-slate-700 border-slate-200" :
    c.status === "under_review" ? "bg-blue-50 text-blue-800 border-blue-200" :
    "bg-amber-50 text-amber-800 border-amber-200";

  const handleDelete = async () => {
    try {
      await complaintService.delete(c.id);
      toast.success("Complaint deleted successfully.");
      qc.invalidateQueries({ queryKey: ["complaints", sid] });
    } catch {
      toast.error("Failed to delete complaint.");
    }
  };

  return (
    <Card className="border-line/60 shadow-xs hover:shadow-md transition-shadow bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-4 sm:p-6 space-y-3.5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 pb-3 border-b border-line/20">
          <div className="space-y-1 w-full sm:w-auto">
            <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap">
              <h3 className="font-bold text-sm sm:text-base text-ink">{c.subject || c.title}</h3>
              <Badge variant="outline" className="text-[10px] uppercase font-bold px-2 py-0.5 border-line-strong">{c.category}</Badge>
            </div>
            <span className="text-[11px] text-on-surface-variant block">Filed by <span className="font-semibold text-ink">{c.filedByName}</span></span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
            <Badge className={cn("text-[11px] sm:text-xs uppercase font-bold border px-2.5 py-0.5 rounded-full shadow-2xs", statusColor)}>
              {c.status === "under_review" ? "Under Review" : c.status}
            </Badge>
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                title="Delete Complaint"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">{c.description}</p>

        {c.resolutionNotes && (
          <div className="p-3.5 bg-panel/60 rounded-xl border border-line/40 text-xs space-y-1">
            <span className="font-bold text-ink uppercase text-[10px] tracking-wider block">Coordinator Response & Note</span>
            <p className="text-on-surface-variant italic leading-normal">{c.resolutionNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TradeDisputeCard({ d, onChange }: { d: any; onChange: () => void }) {
  const { user } = useAuth();
  const isBuyer = user!.id === d.buyerId;
  const isOwner = user!.id === d.ownerId;
  const [editing, setEditing] = useState(false);
  const myCurrentNote = isBuyer ? d.buyerNote : isOwner ? d.ownerNote : "";
  const [note, setNote] = useState(myCurrentNote || "");
  const [loading, setLoading] = useState(false);

  const handleSaveNote = async () => {
    setLoading(true);
    try {
      await disputeService.updateNote(d.id, note.trim());
      toast.success("Statement note updated successfully!");
      setEditing(false);
      onChange();
    } catch {
      toast.error("Failed to update statement note.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await disputeService.delete(d.id);
      toast.success("Dispute removed.");
      onChange();
    } catch {
      toast.error("Failed to delete dispute.");
    }
  };

  return (
    <Card className="border-line/60 shadow-xs hover:shadow-md transition-shadow bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-line/25">
          <div className="space-y-1 w-full sm:w-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
                <Scale className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-ink">{d.itemTitle}</h3>
              <Badge variant="outline" className="text-[10px] uppercase font-bold px-2 py-0.5 border-line-strong text-ink bg-panel">
                {d.itemType}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-on-surface-variant pt-0.5">
              <span className="flex items-center gap-1 font-medium">
                <User className="h-3.5 w-3.5 text-deep-forest" /> Filer: <span className="font-bold text-ink">{d.filedByName || d.buyerName}</span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span>Buyer: <span className="font-semibold text-ink">{d.buyerName}</span></span>
              <span>vs</span>
              <span>Seller: <span className="font-semibold text-ink">{d.ownerName}</span></span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
            <Badge className={cn(
              "text-[11px] sm:text-xs uppercase font-bold border px-3 py-0.5 rounded-full shadow-2xs",
              d.status === "open" ? "bg-amber-50 border-amber-200 text-amber-900" :
              d.status === "under_review" ? "bg-blue-50 border-blue-200 text-blue-900" :
              "bg-emerald-50 border-emerald-200 text-emerald-900"
            )}>
              {d.status === "under_review" ? "Under Review" : d.status}
            </Badge>
            <Button size="sm" variant="outline" className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer rounded-lg px-2.5" onClick={handleDelete}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
            </Button>
          </div>
        </div>

        {/* Section 1: Prominent Filed Dispute Reason & Detailed Explanation */}
        <div className="p-3.5 sm:p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs uppercase tracking-wider">
            <AlertCircle className="h-4 w-4 text-amber-700 flex-shrink-0" />
            <span>Dispute Reason & Detailed Explanation</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed bg-white/70 p-3 rounded-lg border border-amber-200/50 whitespace-pre-wrap">
            {d.reason || "No detailed explanation provided."}
          </p>
        </div>

        {/* Section 2: Participant Statements */}
        <div className="space-y-2">
          <span className="text-[11px] uppercase font-bold tracking-wider text-on-surface-variant flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-deep-forest" /> Participant Statements & Claims
          </span>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 text-xs">
            <div className="p-3.5 rounded-xl border bg-slate-50/80 border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 uppercase text-[10px] block">Buyer ({d.buyerName}) Statement</span>
              <p className="text-slate-700 italic leading-normal">{d.buyerNote ? `"${d.buyerNote}"` : "No note added by buyer yet."}</p>
            </div>
            <div className="p-3.5 rounded-xl border bg-slate-50/80 border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 uppercase text-[10px] block">Seller ({d.ownerName}) Statement</span>
              <p className="text-slate-700 italic leading-normal">{d.ownerNote ? `"${d.ownerNote}"` : "No note added by seller yet."}</p>
            </div>
          </div>
        </div>

        {/* Section 3: Coordinator Mediation Notes */}
        {d.coordinatorNote && (
          <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 space-y-1">
            <span className="font-bold text-blue-900 uppercase text-[10px] flex items-center gap-1">
              <Scale className="h-3.5 w-3.5 text-blue-700" /> Coordinator Mediation Note
            </span>
            <p className="font-semibold text-blue-950 leading-relaxed">{d.coordinatorNote}</p>
          </div>
        )}

        {/* Section 4: Resolution Verdict */}
        {d.resolutionNotes && (
          <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <span className="font-bold text-emerald-900 uppercase text-[10px] flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" /> Resolution Verdict
            </span>
            <p className="font-semibold text-emerald-950 leading-relaxed">{d.resolutionNotes}</p>
          </div>
        )}

        {/* Section 5: My Statement Editor */}
        {(isBuyer || isOwner) && (
          <div className="pt-3 space-y-2 border-t border-line/20">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Edit3 className="h-3.5 w-3.5 text-deep-forest" /> Your Statement Note ({isBuyer ? "Buyer" : "Seller"})
              </span>
              {!editing && (
                <Button size="sm" variant="ghost" onClick={() => setEditing(true)} className="h-7 text-xs font-semibold text-deep-forest hover:bg-panel cursor-pointer self-start sm:self-auto">
                  {myCurrentNote ? "Edit My Note" : "+ Add Statement Note"}
                </Button>
              )}
            </div>
            {editing ? (
              <div className="space-y-2.5 pt-1">
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Explain your side of the trade dispute for coordinators..."
                  rows={3}
                  className="border-line-strong text-xs rounded-xl p-3 focus:ring-1 focus:ring-deep-forest/20"
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="h-8 text-xs rounded-lg">Cancel</Button>
                  <Button size="sm" disabled={loading} onClick={handleSaveNote} className="h-8 text-xs bg-deep-forest text-white rounded-lg px-4 font-semibold shadow-xs">
                    {loading ? "Saving..." : "Save Statement Note"}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant italic pl-3 py-1.5 border-l-2 border-deep-forest/40 bg-panel/20 rounded-r-lg">
                {myCurrentNote ? `"${myCurrentNote}"` : "You haven't written your statement note yet. Click 'Add Statement Note' to add one."}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NewComplaintDialog() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", category: "General" });
  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 px-4 rounded-lg shadow-sm cursor-pointer active:scale-98 transition-all w-full sm:w-auto">
          <Plus className="mr-1.5 h-4 w-4" /> File Complaint
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto border-line/60 rounded-2xl p-4 sm:p-6">
        <DialogHeader className="pb-3 border-b border-line/35">
          <DialogTitle className="text-base font-bold text-ink">File a General Complaint</DialogTitle>
          <span className="text-xs text-on-surface-variant">Submit local issues, noise complaints, or facility alerts to coordinators.</span>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">Subject</Label>
            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief title of the issue" className="border-line-strong text-xs h-10 rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="border-line-strong text-xs h-10 rounded-lg"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {["General", "Noise", "Facilities", "Safety", "Other"].map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">Detailed Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Please explain the details of your complaint..." rows={4} className="border-line-strong text-xs rounded-lg p-3" />
          </div>
          <div className="flex items-center gap-2.5 py-1.5 px-2 bg-panel/20 border border-dashed rounded-lg">
            <input
              type="checkbox"
              id="anon-check-normal"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4.5 w-4.5 rounded border-line-strong text-deep-forest cursor-pointer flex-shrink-0"
            />
            <Label htmlFor="anon-check-normal" className="text-xs font-semibold text-ink cursor-pointer select-none">
              File Anonymously
            </Label>
          </div>
          <Button 
            disabled={!form.subject.trim() || !form.description.trim() || loading} 
            className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 rounded-lg shadow-sm cursor-pointer mt-2 active:scale-98 transition-all" 
            onClick={async () => {
              setLoading(true);
              try {
                const { priority } = await categorizeComplaint(form.description);
                await complaintService.file({
                  filedById: user!.id, filedByName: isAnonymous ? "Anonymous" : user!.name, involvedUserIds: [],
                  subject: form.subject, description: form.description, category: form.category,
                  priority, societyId: user!.societyId!,
                });
                setOpen(false); 
                qc.invalidateQueries();
                setForm({ subject: "", description: "", category: "General" });
                setIsAnonymous(false);
                toast.success("Complaint filed successfully!");
              } catch {
                toast.error("Failed to file complaint.");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Filing..." : "Submit Complaint"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FileTradeDisputeDialog() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch actual Wallet Ledger transactions directly for the logged-in user
  const walletTxs = useQuery({
    queryKey: ["tx", user!.id],
    queryFn: () => creditService.getTransactions(user!.id),
  });

  const txs = Array.isArray(walletTxs.data) ? walletTxs.data : [];

  const availableTrades = txs.map((t: any) => {
    let otherPersonName = "Counterparty Resident";
    if (t.description.includes("(to ")) {
      otherPersonName = t.description.split("(to ")[1].replace(")", "").trim();
    } else if (t.description.includes("(from ")) {
      otherPersonName = t.description.split("(from ")[1].replace(")", "").trim();
    }

    const isSpent = t.type === "spent";

    return {
      id: t.id,
      description: t.description,
      type: t.type,
      amount: t.amount,
      date: t.date,
      otherPersonName,
      isSpent,
    };
  });

  const selectedTrade = availableTrades.find((t) => t.id === selectedTxId);

  const handleFileDispute = async () => {
    if (!selectedTrade || !reason.trim()) return;
    setLoading(true);
    try {
      await disputeService.file({
        bookingId: selectedTrade.id,
        itemTitle: selectedTrade.description,
        itemType: selectedTrade.isSpent ? "Spent Trade" : "Earned Trade",
        buyerId: selectedTrade.isSpent ? user!.id : "u-counterparty",
        buyerName: selectedTrade.isSpent ? user!.name : selectedTrade.otherPersonName,
        ownerId: !selectedTrade.isSpent ? user!.id : "u-counterparty",
        ownerName: !selectedTrade.isSpent ? user!.name : selectedTrade.otherPersonName,
        reason: reason.trim(),
      });
      toast.success("Trade dispute submitted successfully!");
      setOpen(false);
      setSelectedTxId("");
      setReason("");
      qc.invalidateQueries({ queryKey: ["myDisputes", user!.societyId] });
    } catch (err: any) {
      toast.error(err.message || "Failed to file trade dispute.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-xs font-semibold h-10 px-3.5 border-amber-300 text-amber-900 bg-amber-50/70 hover:bg-amber-100/70 cursor-pointer active:scale-98 transition-all shadow-xs flex-1 sm:flex-initial">
          <Scale className="mr-1.5 h-4 w-4 text-amber-700 flex-shrink-0" /> File Trade Dispute
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg w-[95vw] max-h-[90vh] flex flex-col border-line/60 rounded-2xl p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="pb-3 border-b border-line/35 flex-shrink-0">
          <DialogTitle className="text-base font-bold text-ink flex items-center gap-2">
            <Scale className="h-5 w-5 text-amber-600 flex-shrink-0" /> File Trade Dispute
          </DialogTitle>
          <span className="text-xs text-on-surface-variant">File a dispute directly on credit transactions recorded in your Wallet Ledger statement.</span>
        </DialogHeader>

        <div className="space-y-4 pt-4 overflow-y-auto flex-1 pr-1">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">
              Select Transaction from Wallet Ledger ({availableTrades.length})
            </Label>
            {availableTrades.length === 0 ? (
              <div className="p-4 bg-panel/40 border border-dashed border-line rounded-xl text-xs text-on-surface-variant text-center font-medium">
                No ledger transactions found in your credit wallet yet. Perform a credit trade or transfer to file a dispute.
              </div>
            ) : (
              <Select value={selectedTxId} onValueChange={setSelectedTxId}>
                <SelectTrigger className="w-full h-auto min-h-[42px] text-xs border-line-strong rounded-lg px-3 py-2 text-left flex justify-between items-center bg-white">
                  <SelectValue placeholder="Select a transaction from your ledger" />
                </SelectTrigger>
                <SelectContent className="max-w-[calc(100vw-2.5rem)] sm:max-w-md">
                  {availableTrades.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="text-xs py-2.5 cursor-pointer">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold flex-shrink-0">{t.isSpent ? "🔴 -" : "🟢 +"}{t.amount} Crd</span>
                        <span className="truncate max-w-[180px] sm:max-w-[320px] text-ink font-medium">{t.description}</span>
                        <span className="text-[10px] text-on-surface-variant flex-shrink-0">({t.date})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedTrade && (
            <div className="p-3.5 sm:p-4 bg-amber-50/80 rounded-xl border border-amber-200/90 text-xs space-y-2 shadow-xs transition-all">
              <div className="font-bold text-amber-950 uppercase tracking-wider text-[10px] flex justify-between items-center border-b border-amber-200/60 pb-1.5">
                <span>Wallet Ledger Transaction Details</span>
                <Badge variant="outline" className={selectedTrade.isSpent ? "bg-amber-100 text-amber-900 border-amber-300 font-bold text-[9px]" : "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-[9px]"}>
                  {selectedTrade.isSpent ? "Debited (Spent)" : "Credited (Earned)"}
                </Badge>
              </div>
              <div className="grid gap-1.5 text-amber-900 grid-cols-1 sm:grid-cols-2 pt-0.5">
                <div className="sm:col-span-2">
                  <span className="font-bold text-amber-950">Description:</span>{" "}
                  <span className="font-semibold text-ink break-words">{selectedTrade.description}</span>
                </div>
                <div>
                  <span className="font-bold text-amber-950">Transaction Date:</span> {selectedTrade.date}
                </div>
                <div>
                  <span className="font-bold text-amber-950">Amount:</span>{" "}
                  <span className="font-bold text-ink">{selectedTrade.amount} Credits</span>
                </div>
                <div className="sm:col-span-2 pt-1 border-t border-amber-200/40">
                  <span className="font-bold text-amber-950">Other Resident Involved:</span>{" "}
                  <span className="font-bold text-amber-950 underline">{selectedTrade.otherPersonName}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">Dispute Reason & Detailed Explanation</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the specific issue, disagreement, or dispute details regarding this wallet transaction..."
              rows={4}
              className="border-line-strong text-xs rounded-lg p-3 focus:ring-1 focus:ring-amber-500/20"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-line/35 flex-shrink-0 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)} className="h-9 text-xs font-semibold px-4">
            Cancel
          </Button>
          <Button
            disabled={!selectedTxId || !reason.trim() || loading}
            onClick={handleFileDispute}
            className="h-9 bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs px-5 rounded-lg shadow-sm cursor-pointer active:scale-98 transition-all"
          >
            {loading ? "Submitting..." : "Submit Trade Dispute"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PrivateComplaintDialog() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [form, setForm] = useState({ subject: "", description: "", targetCoordinatorId: "" });
  const [loading, setLoading] = useState(false);
  const coords = useQuery({ queryKey: ["coords", user!.societyId], queryFn: () => userService.listCoordinators(user!.societyId!) });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-xs font-semibold h-10 px-3.5 border-line-strong hover:bg-panel cursor-pointer active:scale-98 transition-all shadow-sm flex-1 sm:flex-initial">
          <ShieldAlert className="mr-1.5 h-4 w-4 text-orange-500 flex-shrink-0" /> Coordinator Conduct
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto border-line/60 rounded-2xl p-4 sm:p-6">
        <DialogHeader className="pb-3 border-b border-line/35">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-ink">
            <EyeOff className="h-4.5 w-4.5 text-deep-forest animate-pulse flex-shrink-0" /> Confidential Audit complaint
          </DialogTitle>
          <span className="text-xs text-on-surface-variant">Confidential channel sent to Admin. You can choose whether to reveal your identity.</span>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">Target Coordinator</Label>
            <Select value={form.targetCoordinatorId} onValueChange={(v) => setForm({ ...form, targetCoordinatorId: v })}>
              <SelectTrigger className="border-line-strong text-xs h-10 rounded-lg"><SelectValue placeholder="Select target coordinator" /></SelectTrigger>
              <SelectContent>{coords.data?.map((c) => <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">Subject</Label>
            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject of misconduct or issue" className="border-line-strong text-xs h-10 rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">Detailed Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Please explain the details of the misconduct privately..." rows={4} className="border-line-strong text-xs rounded-lg p-3" />
          </div>
          <div className="flex items-center gap-2.5 py-1.5 px-2 bg-panel/20 border border-dashed rounded-lg">
            <input
              type="checkbox"
              id="anon-check-private"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4.5 w-4.5 rounded border-line-strong text-deep-forest cursor-pointer flex-shrink-0"
            />
            <Label htmlFor="anon-check-private" className="text-xs font-semibold text-ink cursor-pointer select-none">
              File Anonymously (Hide your identity from Admin)
            </Label>
          </div>
          <Button 
            className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 rounded-lg shadow-sm cursor-pointer mt-2 active:scale-98 transition-all" 
            disabled={!form.targetCoordinatorId || !form.subject.trim() || !form.description.trim() || loading} 
            onClick={async () => {
              setLoading(true);
              try {
                await complaintService.fileAgainstCoordinator({
                  filedById: user!.id, filedByName: isAnonymous ? "Anonymous" : user!.name,
                  subject: form.subject, description: form.description,
                  category: "Coordinator Conduct", targetCoordinatorId: form.targetCoordinatorId,
                  societyId: user!.societyId!, priority: "high",
                });
                setOpen(false);
                qc.invalidateQueries({ queryKey: ["priv", user!.societyId] });
                setForm({ subject: "", description: "", targetCoordinatorId: "" });
                setIsAnonymous(true);
                toast.success("Confidential complaint filed with Admin");
              } catch {
                toast.error("Failed to file private complaint.");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Sending..." : "Send Private Complaint"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

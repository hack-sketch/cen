import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { ExchangeItemCard } from "@/components/layout/ExchangeItemCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { resourceService, bookingService } from "@/services";
import { autoTag, matchSkillResource, type MatchResult } from "@/services/ai";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Sparkles, Plus, Search, Filter, HelpCircle, Package, ArrowRight, Clock, CheckCircle2, XCircle, Trash2, RotateCw } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

export const Route = createFileRoute("/app/resources")({ component: Page });

const CAT_COLORS: Record<string, string> = {
  General: "bg-slate-50 border-slate-200 text-slate-800",
  Electronics: "bg-blue-50 border-blue-200 text-blue-800",
  Tools: "bg-teal-50 border-teal-200 text-teal-800",
  Vehicles: "bg-amber-50 border-amber-200 text-amber-800",
  Outdoor: "bg-emerald-50 border-emerald-200 text-emerald-800",
  Media: "bg-violet-50 border-violet-200 text-violet-800",
};

function Page() {
  const { user } = useAuth();
  const sid = user!.societyId!;
  const qc = useQueryClient();
  const all = useQuery({ queryKey: ["resAll", sid], queryFn: () => resourceService.list(sid) });
  const bookings = useQuery({ queryKey: ["userBookings"], queryFn: () => bookingService.listForUser() });
  
  const approved = all.data?.filter((r) => r.status === "approved") ?? [];
  const mine = all.data?.filter((r) => r.ownerId === user!.id) ?? [];
  const pendingReceived = bookings.data?.filter((b) => b.ownerId === user!.id && b.itemType === "resource" && b.status === "pending_owner_approval") ?? [];
  
  const [q, setQ] = useState("");
  const [aiInput, setAiInput] = useState("");
  const [ai, setAi] = useState<MatchResult[] | null>(null);
  const [searchingAI, setSearchingAI] = useState(false);

  const filtered = approved.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));

  const handleAISearch = async (customQuery?: string) => {
    const queryToRun = (customQuery || aiInput).trim();
    if (!queryToRun) return;
    setSearchingAI(true);
    try {
      const r = await matchSkillResource(queryToRun, sid);
      setAi(r);
      toast.success(`Found ${r.length} AI matches!`);
    } catch {
      toast.error("AI search failed.");
    } finally {
      setSearchingAI(false);
    }
  };


  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="Shared Resources" 
        description="Lend tools, items, or equipment you don't use, and borrow from your neighbors." 
        action={<NewResDialog />} 
      />

      {/* AI Search Panel */}
      <Card className="border-soft-violet/30 shadow-sm bg-gradient-to-br from-soft-violet/5 via-[#f8f7ff] to-transparent">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-xs font-bold text-ink">
              <Sparkles className="h-4.5 w-4.5 text-soft-violet animate-pulse" />
              AI Layman Search & Semantic Resource Summarizer
            </Label>
            <span className="text-[10px] text-on-surface-variant font-medium hidden sm:inline">Natural language & everyday equipment matching</span>
          </div>
          <div className="flex gap-2">
            <Input 
              placeholder='e.g., "I need a high-power drill kit for mounting shelves" or "tools to trim tall trees in backyard"...' 
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAISearch()}
              className="h-10 text-xs rounded-lg border-line-strong/60 focus:border-soft-violet focus:ring-1 focus:ring-soft-violet/20 bg-white"
            />
            <Button 
              onClick={() => handleAISearch()} 
              disabled={searchingAI}
              className="bg-soft-violet hover:bg-soft-violet/90 text-white font-semibold h-10 px-4 rounded-lg text-xs cursor-pointer shadow-sm active:scale-98 transition-all"
            >

              {searchingAI ? "Searching..." : "Search with AI"}
            </Button>
            {ai && (
              <Button 
                variant="outline" 
                onClick={() => { setAi(null); setAiInput(""); }}
                className="h-10 text-xs border-line-strong/60 cursor-pointer"
              >
                Clear
              </Button>
            )}
          </div>
          
          {ai && (
            <div className="mt-4 pt-4 border-t border-line/45 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[10.5px] uppercase font-extrabold tracking-wider text-soft-violet flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> AI Intent Matches & Summaries ({ai.length})
                </div>
                <span className="text-[10px] text-on-surface-variant">Ranked by semantic intent relevance</span>
              </div>
              <div className="grid gap-3.5 sm:grid-cols-2">
                {ai.map((m, i) => {
                  const title = "title" in m.item ? m.item.title : m.item.name;
                  const itemCategory = "category" in m.item ? m.item.category : "General";
                  const owner = "ownerName" in m.item ? m.item.ownerName : m.item.providerName;
                  const credits = m.item.credits || 0;
                  const isOwner = (m.item.ownerId || m.item.providerId) === user!.id;
                  
                  return (
                    <div key={i} className="rounded-xl border border-soft-violet/40 bg-white p-4 flex flex-col justify-between gap-2.5 shadow-xs hover:shadow-md transition-all">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-xs text-ink line-clamp-1">{title}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[8.5px] font-bold py-0.5 px-1.5 rounded">
                              {m.score}% Match
                            </Badge>
                            <Badge className="bg-soft-violet text-white text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded border-0">
                              {m.kind}
                            </Badge>
                          </div>
                        </div>

                        {/* AI Summary Banner */}
                        <div className="bg-soft-violet/10 border border-soft-violet/20 rounded-lg p-2.5 text-xs text-ink space-y-1">
                          <div className="text-[9.5px] font-extrabold text-soft-violet uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-soft-violet" /> AI Summary & Scope
                          </div>
                          <p className="text-[11px] text-slate-700 leading-relaxed italic">
                            "{m.summary || m.item.description}"
                          </p>
                        </div>

                        {/* Intent Matching Badges */}
                        {m.intentTags && m.intentTags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {m.intentTags.map((tag: string) => (
                              <Badge key={tag} className="bg-soft-violet/15 text-soft-violet text-[9px] font-semibold border-0 py-0.5 px-1.5">
                                ✦ {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="text-[10px] text-on-surface-variant flex items-center justify-between pt-1 border-t border-line/30">
                          <span>Lent by <strong className="text-ink">{owner}</strong> ({itemCategory})</span>
                          <strong className="text-deep-forest font-bold">{credits} Credits</strong>
                        </div>
                      </div>

                      {!isOwner && m.kind === "resource" && (
                        <Button
                          size="sm"
                          className="w-full h-8 text-xs font-semibold bg-deep-forest hover:bg-deep-forest/90 text-white cursor-pointer active:scale-98 transition-all shadow-xs mt-1"
                          onClick={async () => {
                            await bookingService.requestResource(m.item.id, m.item.ownerId);
                            qc.invalidateQueries();
                            toast.success(`Borrow request sent for "${title}"!`);
                          }}
                        >
                          Request to Borrow ({credits} Credits)
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Global Pending Requests Banner for Resource Owner */}
      {pendingReceived.length > 0 && (
        <Card className="border-amber-300 bg-amber-50/80 shadow-md mb-6 animate-pulse-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-extrabold text-amber-950 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-amber-700 animate-pulse" />
                Pending Resource Borrow Requests ({pendingReceived.length})
              </span>
              <Badge className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5">
                Requires Action
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-amber-900 font-medium">
              Residents are requesting to borrow your shared tools or equipment. You can view all requests below. Approving one request will automatically grant access to that resident and decline other pending requests for that item.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-1">
            {pendingReceived.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-amber-200 rounded-xl text-xs shadow-xs hover:border-amber-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs shrink-0 border border-amber-200">
                    {getInitials(b.buyerName)}
                  </div>
                  <div>
                    <div className="font-bold text-ink text-xs">
                      <span className="text-deep-forest font-extrabold">{b.buyerName}</span> requested to borrow <span className="font-bold text-ink">"{b.itemTitle}"</span>
                    </div>
                    <div className="text-[10.5px] text-on-surface-variant mt-0.5 flex items-center gap-2">
                      <span>Deposit: <strong className="text-amber-900 font-extrabold">{b.credits} Credits</strong></span>
                      <span>·</span>
                      <span>Requested on {b.createdAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-8 text-xs font-bold px-4 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-98 transition-all shadow-xs"
                    onClick={async () => {
                      await bookingService.approveBooking(b.id);
                      qc.invalidateQueries();
                      toast.success(`Approved borrow request from ${b.buyerName}! +${b.credits} Credits received.`);
                    }}
                  >
                    Approve & Lend (+{b.credits} Crd)
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold px-3 border-rose-200 text-rose-700 hover:bg-rose-50 cursor-pointer"
                    onClick={async () => {
                      await bookingService.declineBooking(b.id);
                      qc.invalidateQueries();
                      toast.info("Declined borrow request.");
                    }}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="browse" className="w-full">
        <div className="border-b border-line pb-px mb-6">
          <TabsList className="bg-panel/40 p-1 rounded-xl border border-line">
            <TabsTrigger 
              value="browse" 
              className="rounded-lg text-xs font-semibold px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Browse Items ({filtered.length})
            </TabsTrigger>
            <TabsTrigger 
              value="mine" 
              className="rounded-lg text-xs font-semibold px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5"
            >
              <span>My Shared Items ({mine.length})</span>
              {pendingReceived.length > 0 && (
                <Badge className="bg-amber-600 text-white text-[9px] font-extrabold px-1.5 py-0 rounded-full animate-pulse">
                  {pendingReceived.length} Pending
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="browse" className="space-y-6 animate-page-fade">
          <div className="space-y-2">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-on-surface-variant/75" />
              <Input 
                placeholder="Search shared items by name, tool, or description..." 
                value={q} 
                onChange={(e) => setQ(e.target.value)} 
                className="pl-9 h-10 text-xs rounded-lg border-line-strong/60 focus:border-deep-forest focus:ring-1 focus:ring-deep-forest/20" 
              />
            </div>

            {q.trim().length >= 3 && (
              <div className="flex items-center gap-2 pt-0.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAiInput(q.trim());
                    handleAISearch(q.trim());
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="h-7 text-[11px] font-semibold border-soft-violet/40 text-soft-violet bg-soft-violet/5 hover:bg-soft-violet/10 cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Sparkles className="h-3 w-3 text-soft-violet animate-pulse" />
                  Ask AI to analyze and summarize matches for "{q.trim()}"
                </Button>
              </div>
            )}
          </div>


          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-on-surface-variant border border-dashed border-line rounded-xl bg-white">
              No items listed for borrowing right now.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((r) => {
                const myPending = bookings.data?.find(
                  (b) => b.itemId === r.id && b.buyerId === user!.id && b.status === "pending_owner_approval"
                );
                return (
                  <ExchangeItemCard
                    key={r.id}
                    id={r.id}
                    title={r.name}
                    description={r.description}
                    category={r.category}
                    credits={r.credits}
                    providerName={r.ownerName}
                    providerId={r.ownerId}
                    available={r.available}
                    type="resource"
                    myPendingBookingId={myPending?.id}
                    onAction={async (id, userId) => {
                      await bookingService.requestResource(id, userId);
                      qc.invalidateQueries();
                    }}
                    onCancelRequest={async (bId) => {
                      await bookingService.cancelBooking(bId);
                      qc.invalidateQueries();
                    }}
                    categoryColors={CAT_COLORS}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mine" className="space-y-3 animate-page-fade">
          {mine.length === 0 ? (
            <div className="py-12 text-center text-xs text-on-surface-variant border border-dashed border-line rounded-xl bg-white">
              You haven't listed any resources to lend yet.
            </div>
          ) : (
            <div className="grid gap-3.5">
              {mine.map((r) => {                const itemRequests = pendingReceived.filter((b) => b.itemId === r.id);
                const isBorrowed = r.status === "borrowed";
                const isPending = r.status === "pending";
                const isRejected = r.status === "rejected";
                const isReturned = r.status === "returned";

                return (
                  <Card key={r.id} className="border-line/60 shadow-sm hover:bg-panel/40 transition-colors">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="min-w-0 space-y-1">
                          <div className="font-bold text-sm text-ink truncate">{r.name}</div>
                          <div className="text-xs text-on-surface-variant flex flex-wrap items-center gap-2">
                            <span className={cn("px-2 py-0.5 rounded border text-[9px] font-bold uppercase", CAT_COLORS[r.category] || "bg-slate-50")}>
                              {r.category}
                            </span>
                            <span>·</span>
                            <span className="font-semibold text-deep-forest">{r.credits} Credits</span>
                          </div>
                          {r.description && (
                            <p className="text-xs text-on-surface-variant/80 line-clamp-2 pt-0.5">{r.description}</p>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {isBorrowed ? (
                            <Badge className="bg-amber-50 border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1">
                              <Clock className="h-3 w-3 text-amber-600" /> Currently Borrowed
                            </Badge>
                          ) : isPending ? (
                            <Badge className="bg-amber-50 border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1">
                              <Clock className="h-3 w-3 text-amber-600" /> Pending Approval
                            </Badge>
                          ) : isRejected ? (
                            <Badge className="bg-rose-50 border-rose-200 text-rose-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1">
                              <XCircle className="h-3 w-3 text-rose-600" /> Rejected
                            </Badge>
                          ) : isReturned ? (
                            <Badge className="bg-blue-50 border-blue-200 text-blue-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-blue-600" /> Returned (Unlisted)
                            </Badge>
                          ) : r.status === "deleted" ? (
                            <Badge className="bg-slate-50 border-slate-200 text-slate-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1">
                              <XCircle className="h-3 w-3 text-slate-600" /> Deleted (Inactive)
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-50 border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active & Available
                            </Badge>
                          )}

                          {isBorrowed && (
                            <Button
                              size="sm"
                              className="h-8 text-xs font-bold px-3 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-98 transition-all shadow-xs flex items-center gap-1.5"
                              onClick={async () => {
                                try {
                                  await resourceService.markReturned(r.id);
                                  qc.invalidateQueries();
                                  toast.success(`"${r.name}" marked as returned! You can now relist it for coordinator approval or delete it.`);
                                } catch (err: any) {
                                  toast.error(err.message || "Failed to mark as returned.");
                                }
                              }}
                            >
                              <RotateCw className="h-3.5 w-3.5" /> Mark as Returned
                            </Button>
                          )}

                          {(isReturned || isRejected || r.status === "deleted" || (!r.available && !isBorrowed && !isPending)) && (
                            <Button
                              size="sm"
                              className="h-8 text-xs font-bold px-3 bg-soft-violet hover:bg-soft-violet/90 text-white cursor-pointer active:scale-98 transition-all shadow-xs flex items-center gap-1.5"
                              onClick={async () => {
                                try {
                                  await resourceService.relist(r.id);
                                  qc.invalidateQueries();
                                  toast.success(`Relisting request for "${r.name}" submitted! Waiting for coordinator approval.`);
                                } catch (err: any) {
                                  toast.error(err.message || "Failed to relist item.");
                                }
                              }}
                            >
                              <RotateCw className="h-3.5 w-3.5" /> Relist Item
                            </Button>
                          )}

                          {r.status !== "deleted" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isBorrowed}
                              title={isBorrowed ? "Cannot delete item while borrowed. Mark as returned first." : "Delete listing"}
                              className={cn(
                                "h-8 text-xs font-semibold px-3 flex items-center gap-1.5 transition-all",
                                isBorrowed
                                  ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-100"
                                  : "text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 cursor-pointer active:scale-98"
                              )}
                              onClick={async () => {
                                if (isBorrowed) {
                                  toast.error("Cannot delete listing while it is currently borrowed by a neighbor. Mark it as returned first.");
                                  return;
                                }
                                try {
                                  await resourceService.delete(r.id);
                                  qc.invalidateQueries();
                                  toast.success("Resource listing deleted successfully.");
                                } catch (err: any) {
                                  toast.error(err.message || "Failed to remove listing.");
                                }
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete Listing
                            </Button>
                          )}
                        </div>
                      </div>

                      {itemRequests.length > 0 && (
                        <div className="pt-2 border-t border-amber-200/60 bg-amber-50/40 -mx-4 -mb-4 p-3.5 rounded-b-xl space-y-2">
                          <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-amber-700 animate-pulse" />
                            Incoming Borrow Requests ({itemRequests.length})
                          </div>
                          <div className="space-y-2">
                            {itemRequests.map((req) => (
                              <div key={req.id} className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white border border-amber-200 rounded-lg text-xs">
                                <div>
                                  <span className="font-bold text-ink">{req.buyerName}</span> requested to borrow
                                  <div className="text-[10px] text-on-surface-variant">Offer: <span className="font-bold text-ink">{req.credits} Credits</span></div>
                                </div>
                                <div className="flex gap-1.5">
                                  <Button
                                    size="sm"
                                    className="h-7 text-[11px] font-semibold px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                    onClick={async () => {
                                      await bookingService.approveBooking(req.id);
                                      qc.invalidateQueries();
                                      toast.success(`Approved borrow request from ${req.buyerName}! Other pending requests cleared.`);
                                    }}
                                  >
                                    Approve & Lend
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-[11px] font-semibold px-2 border-rose-200 text-rose-700 hover:bg-rose-50 cursor-pointer"
                                    onClick={async () => {
                                      await bookingService.declineBooking(req.id);
                                      qc.invalidateQueries();
                                      toast.info("Declined request.");
                                    }}
                                  >
                                    Decline
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}


const resourceFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name is too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  credits: z.coerce.number().min(1, "Credits must be at least 1"),
});

type ResourceFormValues = z.infer<typeof resourceFormSchema>;

function NewResDialog() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [autotagging, setAutotagging] = useState(false);

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "General",
      credits: 2,
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form.reset]);

  const suggest = async () => {
    const name = form.getValues("name");
    const description = form.getValues("description");
    if (!name.trim() || !description.trim()) {
      return toast.warning("Please input both Name and Description before auto-tagging.");
    }
    setAutotagging(true);
    try {
      const { category } = await autoTag(`${name} ${description}`);
      form.setValue("category", category);
      toast.success("Suggestions applied!");
    } catch {
      toast.error("Auto tagging failed.");
    } finally {
      setAutotagging(false);
    }
  };

  const onSubmit = async (values: ResourceFormValues) => {
    await resourceService.create({
      name: values.name,
      description: values.description,
      category: values.category,
      credits: values.credits,
      available: true,
      ownerId: user!.id,
      ownerName: user!.name,
      societyId: user!.societyId!,
    });
    setOpen(false);
    qc.invalidateQueries();
    toast.success("Resource listing submitted for coordinator approval.");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold h-[38px] px-4 rounded-lg text-xs cursor-pointer shadow-sm">
          <Plus className="mr-1 h-4 w-4" /> Share an Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-ink">List a Shared Resource</DialogTitle>
          <CardDescription className="text-xs text-on-surface-variant">Lend equipment, tools, or appliances to your neighbors to collect exchange credits.</CardDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-ink">Resource Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Electric Lawn Mower (1200W)" 
                      {...field} 
                      className="text-xs rounded-lg border-line-strong/60"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] text-destructive" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-ink">Description & Rules</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the item condition, lending duration limit, and return guidelines..." 
                      {...field} 
                      className="text-xs rounded-lg border-line-strong/60 min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] text-destructive" />
                </FormItem>
              )}
            />

            <Button 
              variant="outline" 
              size="sm" 
              type="button" 
              onClick={suggest}
              disabled={autotagging}
              className="text-[10px] font-bold border-line-strong/60 hover:bg-soft-violet/5 hover:border-soft-violet/40 cursor-pointer"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-soft-violet animate-pulse" />
              {autotagging ? "Analyzing content..." : "Suggest Category (AI)"}
            </Button>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-ink">Category</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Tools, Electronics" 
                        {...field} 
                        className="h-9 text-xs rounded-lg border-line-strong/60"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] text-destructive" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="credits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-ink">Credits (Lending rate)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        className="h-9 text-xs rounded-lg border-line-strong/60"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] text-destructive" />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit"
              className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold h-10 rounded-lg text-xs cursor-pointer shadow-sm pt-0.5"
            >
              Submit Listing
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

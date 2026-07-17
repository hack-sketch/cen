import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { resourceService } from "@/services";
import { autoTag, matchSkillResource, type MatchResult } from "@/services/ai";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Plus, Search, Filter, HelpCircle, Package, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const all = useQuery({ queryKey: ["resAll", sid], queryFn: () => resourceService.list(sid) });
  
  const approved = all.data?.filter((r) => r.status === "approved") ?? [];
  const mine = all.data?.filter((r) => r.ownerId === user!.id) ?? [];
  
  const [q, setQ] = useState("");
  const [aiInput, setAiInput] = useState("");
  const [ai, setAi] = useState<MatchResult[] | null>(null);
  const [searchingAI, setSearchingAI] = useState(false);

  const filtered = approved.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));

  const handleAISearch = async () => {
    if (!aiInput.trim()) return;
    setSearchingAI(true);
    try {
      const r = await matchSkillResource(aiInput, sid);
      setAi(r);
      toast.success(`Found ${r.length} matches!`);
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
          <Label className="flex items-center gap-2 text-xs font-bold text-ink">
            <Sparkles className="h-4.5 w-4.5 text-soft-violet animate-pulse" />
            AI-Powered Resource Finder
          </Label>
          <div className="flex gap-2">
            <Input 
              placeholder='e.g., "I need a high-power drill kit for mounting shelves or a camera..."' 
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAISearch()}
              className="h-10 text-xs rounded-lg border-line-strong/60 focus:border-soft-violet focus:ring-1 focus:ring-soft-violet/20 bg-white"
            />
            <Button 
              onClick={handleAISearch} 
              disabled={searchingAI}
              className="bg-soft-violet hover:bg-soft-violet/90 text-white font-semibold h-10 px-4 rounded-lg text-xs cursor-pointer shadow-sm"
            >
              {searchingAI ? "Searching..." : "Ask AI"}
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
            <div className="mt-4 pt-4 border-t border-line/45 space-y-2.5">
              <div className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Recommended AI Matches ({ai.length})</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {ai.map((m, i) => {
                  const title = "title" in m.item ? m.item.title : m.item.name;
                  return (
                    <div key={i} className="rounded-xl border border-dashed border-soft-violet/50 bg-ai-bg/40 p-3.5 flex flex-col gap-1.5 shadow-sm">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-xs text-ink line-clamp-1">{title}</span>
                        <Badge className="bg-soft-violet text-white text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded border-0">
                          {m.kind}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-on-surface-variant leading-relaxed italic">
                        "{m.reason}"
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
              className="rounded-lg text-xs font-semibold px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              My Shared Items ({mine.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="browse" className="space-y-6 animate-page-fade">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-on-surface-variant/75" />
            <Input 
              placeholder="Search shared items..." 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              className="pl-9 h-10 text-xs rounded-lg border-line-strong/60 focus:border-deep-forest focus:ring-1 focus:ring-deep-forest/20" 
            />
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-on-surface-variant border border-dashed border-line rounded-xl bg-white">
              No items listed for borrowing right now.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((r) => (
                <ResCard key={r.id} r={r} />
              ))}
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
              {mine.map((r) => (
                <Card key={r.id} className="border-line/60 shadow-sm hover:bg-panel/40 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-ink truncate">{r.name}</div>
                      <div className="text-xs text-on-surface-variant mt-1 flex flex-wrap items-center gap-2">
                        <span className={cn("px-2 py-0.5 rounded border text-[9px] font-bold uppercase", CAT_COLORS[r.category] || "bg-slate-50")}>
                          {r.category}
                        </span>
                        <span>·</span>
                        <span className="font-semibold text-deep-forest">{r.credits} Credits</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={`text-[9.5px] font-bold uppercase border px-2.5 py-0.5 rounded-full ${
                        r.available 
                          ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                          : "bg-amber-50 border-amber-100 text-amber-800"
                      }`}>
                        {r.available ? "Available" : "Borrowed"}
                      </Badge>
                      <Badge className={`text-[9px] font-bold uppercase border px-2.5 py-0.5 rounded-full ${
                        r.status === "approved" 
                          ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                          : "bg-slate-50 border-slate-100 text-slate-800"
                      }`}>
                        {r.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ResCard({ r }: { r: import("@/mocks/data").Resource }) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const isOwner = r.ownerId === user!.id;
  const insCredits = user!.creditBalance < r.credits;

  return (
    <Card className="border-line/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden bg-white">
      <CardContent className="p-5 flex flex-col justify-between flex-1 space-y-4">
        <div className="space-y-2">
          {/* Card Category pill and Credit cost */}
          <div className="flex justify-between items-center">
            <span className={cn("px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wide", CAT_COLORS[r.category] || "bg-slate-50")}>
              {r.category}
            </span>
            <div className="inline-flex items-center gap-1 bg-deep-forest/5 text-deep-forest border border-deep-forest/15 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              {r.credits} Credits
            </div>
          </div>

          <h3 className="font-bold text-sm text-ink leading-snug line-clamp-1">{r.name}</h3>
          
          <div className="flex items-center gap-2 pt-1">
            <div className="w-6 h-6 rounded-full bg-deep-forest/5 text-deep-forest border border-deep-forest/15 flex items-center justify-center text-[9px] font-bold">
              {getInitials(r.ownerName)}
            </div>
            <span className="text-[10px] text-on-surface-variant font-medium">Lent by <span className="font-bold text-ink">{r.ownerName}</span></span>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2 pt-1">{r.description}</p>
        </div>

        <div className="space-y-3.5">
          {/* Availability badge */}
          <div>
            {r.available ? (
              <Badge className="bg-emerald-50 border-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-wider">
                Available to Borrow
              </Badge>
            ) : (
              <Badge className="bg-amber-50 border-amber-100 text-amber-800 text-[9px] font-bold uppercase tracking-wider">
                Currently Borrowed
              </Badge>
            )}
          </div>

          {/* Book button */}
          <Button
            disabled={!r.available || isOwner || insCredits}
            onClick={async () => {
              await resourceService.borrow(r.id, user!.id);
              qc.invalidateQueries();
              toast.success(`Request sent: Borrowed ${r.name}`);
            }}
            className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold h-9 rounded-lg text-xs cursor-pointer shadow-sm"
          >
            {isOwner ? "My Item" : !r.available ? "Out of Stock" : insCredits ? `Insufficient Credits (${r.credits} Crd needed)` : "Request to Borrow"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NewResDialog() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category: "General", credits: 2 });
  const [autotagging, setAutotagging] = useState(false);

  const suggest = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      return toast.warning("Please input both Name and Description before auto-tagging.");
    }
    setAutotagging(true);
    try {
      const { category } = await autoTag(`${form.name} ${form.description}`);
      setForm((f) => ({ ...f, category }));
      toast.success("Suggestions applied!");
    } catch {
      toast.error("Auto tagging failed.");
    } finally {
      setAutotagging(false);
    }
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
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-ink">Resource Name</Label>
            <Input 
              placeholder="e.g. Electric Lawn Mower (1200W)" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              className="text-xs rounded-lg border-line-strong/60"
            />
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs font-bold text-ink">Description & Rules</Label>
            <Textarea 
              placeholder="Describe the item condition, lending duration limit, and return guidelines..." 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              className="text-xs rounded-lg border-line-strong/60 min-h-[80px]"
            />
          </div>

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
            <div className="space-y-1">
              <Label className="text-xs font-bold text-ink">Category</Label>
              <Input 
                placeholder="e.g. Tools, Electronics" 
                value={form.category} 
                onChange={(e) => setForm({ ...form, category: e.target.value })} 
                className="h-9 text-xs rounded-lg border-line-strong/60"
              />
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs font-bold text-ink">Credits (Lending rate)</Label>
              <Input 
                type="number" 
                value={form.credits} 
                onChange={(e) => setForm({ ...form, credits: +e.target.value })} 
                className="h-9 text-xs rounded-lg border-line-strong/60"
              />
            </div>
          </div>

          <Button 
            onClick={async () => {
              await resourceService.create({
                ...form, available: true, ownerId: user!.id, ownerName: user!.name, societyId: user!.societyId!,
              });
              setOpen(false); 
              qc.invalidateQueries();
              toast.success("Resource listing submitted for coordinator approval.");
            }}
            className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold h-10 rounded-lg text-xs cursor-pointer shadow-sm pt-0.5"
          >
            Submit Listing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

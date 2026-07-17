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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { skillService } from "@/services";
import { autoTag, matchSkillResource, type MatchResult } from "@/services/ai";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Plus, Search, Filter, BookOpen, Layers, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/skills")({ component: Page });

const CATS = ["Repair", "Tutoring", "Wellness", "Music", "Electronics", "Tools", "General"];

const CAT_COLORS: Record<string, string> = {
  Repair: "bg-emerald-50 text-emerald-800 border-emerald-100",
  Tutoring: "bg-indigo-50 border-indigo-200 text-indigo-800",
  Wellness: "bg-violet-50 border-violet-200 text-violet-800",
  Music: "bg-amber-50 border-amber-200 text-amber-800",
  Electronics: "bg-blue-50 border-blue-200 text-blue-800",
  Tools: "bg-teal-50 border-teal-200 text-teal-800",
  General: "bg-slate-50 border-slate-200 text-slate-800",
};

function Page() {
  const { user } = useAuth();
  const sid = user!.societyId!;
  const all = useQuery({ queryKey: ["skillsAll", sid], queryFn: () => skillService.list(sid) });
  
  const approved = all.data?.filter((s) => s.status === "approved") ?? [];
  const mine = all.data?.filter((s) => s.providerId === user!.id) ?? [];
  
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [aiInput, setAiInput] = useState("");
  const [ai, setAi] = useState<MatchResult[] | null>(null);
  const [searchingAI, setSearchingAI] = useState(false);

  const filtered = approved.filter(
    (s) => (cat === "all" || s.category === cat) && s.title.toLowerCase().includes(q.toLowerCase()),
  );

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
        title="Skill Directory" 
        description="Share your expertise, list your services, and discover talents inside your society." 
        action={<NewSkillDialog />} 
      />

      {/* AI Semantic Search Box */}
      <Card className="border-soft-violet/30 shadow-sm bg-gradient-to-br from-soft-violet/5 via-[#f8f7ff] to-transparent">
        <CardContent className="p-5 space-y-3">
          <Label className="flex items-center gap-2 text-xs font-bold text-ink">
            <Sparkles className="h-4.5 w-4.5 text-soft-violet animate-pulse" />
            AI-Powered Semantic Finder
          </Label>
          <div className="flex gap-2">
            <Input 
              placeholder='e.g., "I need a tutoring session for Python basics or help landscaping my backyard..."' 
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
                  const itemCategory = "category" in m.item ? m.item.category : "Resource";
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

      {/* Tabs list directories */}
      <Tabs defaultValue="browse" className="w-full">
        <div className="border-b border-line pb-px mb-6 flex justify-between items-center">
          <TabsList className="bg-panel/40 p-1 rounded-xl border border-line">
            <TabsTrigger 
              value="browse" 
              className="rounded-lg text-xs font-semibold px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Browse Skills ({filtered.length})
            </TabsTrigger>
            <TabsTrigger 
              value="mine" 
              className="rounded-lg text-xs font-semibold px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              My Listings ({mine.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="browse" className="space-y-6 animate-page-fade">
          {/* Filtering bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-on-surface-variant/75" />
              <Input 
                placeholder="Search active listings..." 
                value={q} 
                onChange={(e) => setQ(e.target.value)} 
                className="pl-9 h-10 text-xs rounded-lg border-line-strong/60 focus:border-deep-forest focus:ring-1 focus:ring-deep-forest/20" 
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger className="w-48 h-10 text-xs border-line-strong/60 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-on-surface-variant" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {CATS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-on-surface-variant border border-dashed border-line rounded-xl bg-white">
              No skills found matching your search. Try adjusting the filters.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s) => (
                <SkillCard key={s.id} s={s} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mine" className="space-y-3 animate-page-fade">
          {mine.length === 0 ? (
            <div className="py-12 text-center text-xs text-on-surface-variant border border-dashed border-line rounded-xl bg-white">
              You haven't listed any skills yet. Share your expertise to earn credits!
            </div>
          ) : (
            <div className="grid gap-3.5">
              {mine.map((s) => (
                <Card key={s.id} className="border-line/60 shadow-sm hover:bg-panel/40 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-ink truncate">{s.title}</div>
                      <div className="text-xs text-on-surface-variant mt-1 flex flex-wrap items-center gap-2">
                        <span className={cn("px-2 py-0.5 rounded border text-[9px] font-bold uppercase", CAT_COLORS[s.category] || "bg-slate-50")}>
                          {s.category}
                        </span>
                        <span>·</span>
                        <span className="font-semibold text-deep-forest">{s.credits} Credits</span>
                      </div>
                    </div>
                    
                    <Badge className={`text-[9px] font-bold uppercase tracking-wider border px-2.5 py-0.5 rounded-full ${
                      s.status === "approved" 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                        : s.status === "pending" 
                        ? "bg-amber-50 border-amber-100 text-amber-800" 
                        : "bg-rose-50 border-rose-100 text-rose-800"
                    }`}>
                      {s.status}
                    </Badge>
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

function SkillCard({ s }: { s: import("@/mocks/data").Skill }) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const isOwner = s.providerId === user!.id;
  const insCredits = (user!.creditBalance ?? 0) < s.credits;

  return (
    <Card className="border-line/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden bg-white">
      <CardContent className="p-5 flex flex-col justify-between flex-1 space-y-4">
        <div className="space-y-2">
          {/* Card Category pill and Credit cost */}
          <div className="flex justify-between items-center">
            <span className={cn("px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wide", CAT_COLORS[s.category] || "bg-slate-50")}>
              {s.category}
            </span>
            <div className="inline-flex items-center gap-1 bg-deep-forest/5 text-deep-forest border border-deep-forest/15 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              {s.credits} Credits
            </div>
          </div>

          <h3 className="font-bold text-sm text-ink leading-snug line-clamp-1">{s.title}</h3>
          
          <div className="flex items-center gap-2 pt-1">
            <div className="w-6 h-6 rounded-full bg-deep-forest/5 text-deep-forest border border-deep-forest/15 flex items-center justify-center text-[9px] font-bold">
              {getInitials(s.providerName)}
            </div>
            <span className="text-[10px] text-on-surface-variant font-medium">Offered by <span className="font-bold text-ink">{s.providerName}</span></span>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2 pt-1">{s.description}</p>
        </div>

        <div className="space-y-3.5">
          {/* Tags list */}
          <div className="flex flex-wrap gap-1">
            {s.tags.map((t) => (
              <Badge key={t} variant="outline" className="text-[9px] border-line font-medium text-on-surface-variant bg-panel/30">
                #{t}
              </Badge>
            ))}
          </div>

          {/* Book button */}
          <Button
            disabled={isOwner || insCredits}
            onClick={async () => {
              await skillService.book(s.id, user!.id);
              qc.invalidateQueries();
              toast.success(`Booked ${s.title} (-${s.credits} credits)`);
            }}
            className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold h-9 rounded-lg text-xs cursor-pointer shadow-sm"
          >
            {isOwner ? "My Offered Skill" : insCredits ? `Insufficient Credits (${s.credits} Crd needed)` : `Book (${s.credits} Credits)`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NewSkillDialog() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "General", credits: 3, tags: "" });
  const [autotagging, setAutotagging] = useState(false);

  const suggest = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      return toast.warning("Please input both Title and Description before auto-tagging.");
    }
    setAutotagging(true);
    try {
      const { category, tags } = await autoTag(`${form.title} ${form.description}`);
      setForm((f) => ({ ...f, category, tags: tags.join(", ") }));
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
          <Plus className="mr-1 h-4 w-4" /> Offer a Skill
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-ink">Offer a New Skill</DialogTitle>
          <CardDescription className="text-xs text-on-surface-variant">Describe what you're offering and request coordinator review.</CardDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-ink">Skill Title</Label>
            <Input 
              placeholder="e.g. Mathematics Tutoring for Grade 6" 
              value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })} 
              className="text-xs rounded-lg border-line-strong/60"
            />
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs font-bold text-ink">Detailed Description</Label>
            <Textarea 
              placeholder="Describe what you can offer, session duration, and prerequisites..." 
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
            {autotagging ? "Analyzing content..." : "Suggest Category & Tags (AI)"}
          </Button>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-ink">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="h-9 text-xs border-line-strong/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs font-bold text-ink">Credits (Hourly Rate)</Label>
              <Input 
                type="number" 
                value={form.credits} 
                onChange={(e) => setForm({ ...form, credits: +e.target.value })} 
                className="h-9 text-xs rounded-lg border-line-strong/60"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-ink">Tags (comma separated)</Label>
            <Input 
              placeholder="e.g. math, algebra, highschool" 
              value={form.tags} 
              onChange={(e) => setForm({ ...form, tags: e.target.value })} 
              className="text-xs rounded-lg border-line-strong/60"
            />
          </div>

          <Button 
            onClick={async () => {
              await skillService.create({
                title: form.title, description: form.description, category: form.category,
                credits: form.credits, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
                providerId: user!.id, providerName: user!.name, societyId: user!.societyId!,
              });
              setOpen(false); 
              qc.invalidateQueries();
              toast.success("Skill listing submitted for coordinator approval.");
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

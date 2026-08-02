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
import { resourceService } from "@/services";
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
import { Sparkles, Plus, Search, Filter, HelpCircle, Package, ArrowRight } from "lucide-react";
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
                  onAction={(id, userId) => resourceService.borrow(id, userId)}
                  categoryColors={CAT_COLORS}
                />
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

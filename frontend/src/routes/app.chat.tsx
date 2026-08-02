import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chatService, userService } from "@/services";
import { chatbotQuery } from "@/services/ai";
import { useAuth } from "@/lib/auth";
import { useState, useEffect, useRef } from "react";
import { Bot, Send, User as UserIcon, Search, Sparkles, MessagesSquare } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

export const Route = createFileRoute("/app/chat")({ component: Page });

function Page() {
  const { user } = useAuth();
  const sid = user!.societyId!;
  const contacts = useQuery({ queryKey: ["allRes", sid], queryFn: () => userService.listBySociety(sid) });
  const [active, setActive] = useState<string>("chatbot");
  const [searchQuery, setSearchQuery] = useState("");
  
  const list = contacts.data?.filter((u) => u.id !== user!.id) ?? [];
  const filteredList = list.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));


  return (
    <div className="space-y-6 pb-6">
      <PageHeader title="Direct Messages" description="Connect with society residents or request AI helper search support." />
      
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        {/* Left column - Contacts directory */}
        <Card className="border-line/60 shadow-sm flex flex-col h-[74vh] overflow-hidden bg-white">
          <div className="p-4 border-b border-line/45 space-y-3">
            <div className="flex items-center gap-2 text-ink font-bold text-sm">
              <MessagesSquare className="h-4 w-4 text-deep-forest" />
              <span>Conversations</span>
            </div>
            
            {/* Search contacts bar */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant/70" />
              <Input 
                placeholder="Search neighbor..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-lg border-line-strong/60 focus:border-deep-forest focus:ring-1 focus:ring-deep-forest/20 bg-panel/30"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* AI Bot channel */}
            <button 
              onClick={() => setActive("chatbot")}
              className={cn(
                "flex w-full items-center justify-between rounded-xl p-3 text-left transition-all active:scale-[0.98] cursor-pointer group",
                active === "chatbot" 
                  ? "bg-deep-forest text-white shadow-sm font-bold" 
                  : "hover:bg-panel text-ink/80 hover:text-ink"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-inner",
                  active === "chatbot" ? "bg-white/15" : "bg-soft-violet/10 text-soft-violet"
                )}>
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold leading-tight truncate">CEN Assistant</div>
                  <div className={cn("text-[9px] truncate mt-0.5", active === "chatbot" ? "text-emerald-100" : "text-on-surface-variant")}>AI Society Guide</div>
                </div>
              </div>
              <span className={cn(
                "inline-block w-1.5 h-1.5 rounded-full flex-shrink-0",
                active === "chatbot" ? "bg-white" : "bg-soft-violet"
              )} />
            </button>

            <div className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest px-3 pt-3 pb-1 border-t border-line/45 mt-2">Neighbors</div>
            
            {filteredList.length === 0 ? (
              <div className="p-3 text-center text-[10px] text-on-surface-variant">No contacts found</div>
            ) : (
              filteredList.map((c) => {
                const isSelected = active === c.id;
                return (
                  <button 
                    key={c.id} 
                    onClick={() => setActive(c.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl p-3 text-left transition-all active:scale-[0.98] cursor-pointer group",
                      isSelected 
                        ? "bg-deep-forest text-white shadow-sm font-bold" 
                        : "hover:bg-panel text-ink/80 hover:text-ink"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 shadow-inner",
                      isSelected ? "bg-white/15 border border-white/20 text-white" : "bg-deep-forest/5 text-deep-forest border border-deep-forest/15"
                    )}>
                      {getInitials(c.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold leading-tight truncate">{c.name}</div>
                      <div className={cn("text-[9px] truncate mt-0.5", isSelected ? "text-emerald-100" : "text-on-surface-variant")}>Resident</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* Right column - Message view */}
        {active === "chatbot" ? (
          <ChatbotView />
        ) : (
          <PeerChatView 
            peerId={active} 
            peerName={list.find((c) => c.id === active)?.name ?? ""} 
            initials={getInitials(list.find((c) => c.id === active)?.name ?? "")}
          />
        )}
      </div>
    </div>
  );
}

function ChatbotView() {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<{ from: "me" | "bot"; text: string }[]>([
    { from: "bot", text: `Hi ${user!.name.split(" ")[0]}! Ask me anything about your society — wallet credits, notices, shared tools, or upcoming volunteering events…` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" }); 
  }, [msgs]);

  const send = async () => {
    if (!input.trim()) return;
    const q = input;
    const historySnapshot = msgs;
    setMsgs((m) => [...m, { from: "me", text: q }]);
    setInput(""); 
    setLoading(true);
    const r = await chatbotQuery(q, user!.id, historySnapshot);
    setMsgs((m) => [...m, { from: "bot", text: r }]);
    setLoading(false);
  };


  return (
    <Card className="flex h-[74vh] flex-col border-line/60 shadow-sm bg-white overflow-hidden">
      {/* Header chat descriptor */}
      <div className="flex items-center justify-between border-b border-line/45 p-4 bg-panel/30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-soft-violet/10 flex items-center justify-center text-soft-violet border border-soft-violet/20 shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-ink leading-none">CEN Assistant</div>
            <span className="text-[9px] text-on-surface-variant font-medium mt-1 inline-block">AI Guide · Instant help support</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-soft-violet/10 text-soft-violet text-[9px] font-bold px-2 py-0.5 rounded-full border border-soft-violet/20">
          <span className="w-1.5 h-1.5 rounded-full bg-soft-violet animate-pulse"></span>
          Ready
        </div>
      </div>

      {/* Bubble area */}
      <div ref={ref} className="flex-1 space-y-4 overflow-y-auto p-4 bg-panel/10">
        {msgs.map((m, i) => {
          const isMe = m.from === "me";
          return (
            <div key={i} className={cn("flex gap-2.5 items-start", isMe ? "justify-end" : "justify-start")}>
              {!isMe && (
                <div className="w-7 h-7 rounded-lg bg-soft-violet/10 flex items-center justify-center text-soft-violet border border-soft-violet/20 text-xs flex-shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div className={cn(
                "max-w-[75%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm",
                isMe 
                  ? "bg-deep-forest text-white rounded-tr-none font-medium" 
                  : "bg-white text-ink border border-line rounded-tl-none"
              )}>
                {m.text}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex gap-2.5 items-center">
            <div className="w-7 h-7 rounded-lg bg-soft-violet/10 flex items-center justify-center text-soft-violet border border-soft-violet/20 text-xs flex-shrink-0 animate-pulse">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 bg-white border border-line rounded-xl rounded-tl-none px-4 py-2 text-[10px] text-on-surface-variant font-semibold">
              <span className="w-1 h-1 bg-on-surface-variant rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-on-surface-variant rounded-full animate-bounce delay-75"></span>
              <span className="w-1 h-1 bg-on-surface-variant rounded-full animate-bounce delay-150"></span>
              Assistant is thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input controls */}
      <div className="flex gap-2 border-t border-line/45 p-4 bg-white">
        <Input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === "Enter" && send()} 
          placeholder="Ask about credits, notice board details, or listings..." 
          className="h-10 text-xs rounded-lg border-line-strong/60 focus:border-deep-forest focus:ring-1 focus:ring-deep-forest/20"
        />
        <Button 
          onClick={send}
          className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold h-10 w-10 p-0 flex items-center justify-center rounded-lg cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

function PeerChatView({ peerId, peerName, initials }: { peerId: string; peerName: string; initials: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const msgs = useQuery({ queryKey: ["chat", user!.id, peerId], queryFn: () => chatService.getMessages(user!.id, peerId) });
  const [input, setInput] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" }); 
  }, [msgs.data]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await chatService.sendMessage(user!.id, user!.name, peerId, input);
    setInput(""); 
    qc.invalidateQueries({ queryKey: ["chat", user!.id, peerId] });
  };

  return (
    <Card className="flex h-[74vh] flex-col border-line/60 shadow-sm bg-white overflow-hidden">
      {/* Header chat descriptor */}
      <div className="flex items-center justify-between border-b border-line/45 p-4 bg-panel/30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-deep-forest/5 flex items-center justify-center text-deep-forest border border-deep-forest/15 font-bold text-xs shadow-inner">
            {initials}
          </div>
          <div>
            <div className="text-xs font-bold text-ink leading-none">{peerName}</div>
            <span className="text-[9px] text-on-surface-variant font-medium mt-1 inline-block">Direct Conversation · Secured</span>
          </div>
        </div>
      </div>

      {/* Bubble area */}
      <div ref={ref} className="flex-1 space-y-4 overflow-y-auto p-4 bg-panel/10">
        {msgs.data?.length === 0 || !msgs.data ? (
          <div className="h-full flex items-center justify-center flex-col gap-2">
            <span className="material-symbols-outlined text-on-surface-variant/40 text-[40px]">forum</span>
            <div className="text-center text-xs text-on-surface-variant font-medium">No messages yet. Send a friendly greeting!</div>
          </div>
        ) : (
          msgs.data?.map((m) => {
            const isMe = m.senderId === user!.id;
            return (
              <div key={m.id} className={cn("flex gap-2.5 items-start", isMe ? "justify-end" : "justify-start")}>
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-deep-forest/5 flex items-center justify-center text-deep-forest border border-deep-forest/15 text-[10px] font-bold flex-shrink-0">
                    {initials}
                  </div>
                )}
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm",
                  isMe 
                    ? "bg-deep-forest text-white rounded-tr-none font-medium" 
                    : "bg-white text-ink border border-line rounded-tl-none"
                )}>
                  {m.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input controls */}
      <div className="flex gap-2 border-t border-line/45 p-4 bg-white">
        <Input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === "Enter" && handleSend()} 
          placeholder={`Message ${peerName}...`} 
          className="h-10 text-xs rounded-lg border-line-strong/60 focus:border-deep-forest focus:ring-1 focus:ring-deep-forest/20"
        />
        <Button 
          onClick={handleSend}
          className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold h-10 w-10 p-0 flex items-center justify-center rounded-lg cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

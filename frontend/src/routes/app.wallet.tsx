import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { creditService } from "@/services";
import { useAuth } from "@/lib/auth";
import { Wallet, ArrowUpRight, ArrowDownLeft, Calendar, HelpCircle, Activity } from "lucide-react";
import { getInitials } from "@/lib/utils";

export const Route = createFileRoute("/app/wallet")({ component: Page });

function Page() {
  const { user } = useAuth();
  const txs = useQuery({ 
    queryKey: ["tx", user!.id], 
    queryFn: () => creditService.getTransactions(user!.id) 
  });

  // Calculate quick stats from mock transaction logs
  const totalEarned = txs.data
    ?.filter(t => t.type === "earned")
    .reduce((sum, t) => sum + t.amount, 0) ?? 0;

  const totalSpent = txs.data
    ?.filter(t => t.type === "spent")
    .reduce((sum, t) => sum + t.amount, 0) ?? 0;


  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="My Credit Wallet" 
        description="Monitor credit transactions, earn listings, and check financial metrics." 
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Sleek Credit Card Mockup */}
        <div className="md:col-span-1 relative h-[210px] rounded-2xl bg-gradient-to-br from-deep-forest via-[#0b4838] to-[#04281e] p-6 text-white flex flex-col justify-between shadow-lg overflow-hidden group select-none">
          {/* Radial light glow */}
          <div className="absolute top-[-50%] right-[-30%] w-[180px] h-[180px] bg-emerald-400/20 rounded-full blur-[40px] pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
          
          <div className="flex justify-between items-start z-10">
            <div>
              <div className="text-[9px] uppercase tracking-widest font-bold text-emerald-200/70">Community Exchange</div>
              <div className="text-sm font-bold tracking-tight mt-1">CEN Timecard</div>
            </div>
            <div className="h-7 w-7 rounded bg-white/10 flex items-center justify-center border border-white/15 text-[10px] font-bold">
              {getInitials(user!.name)}
            </div>
          </div>

          <div className="z-10 my-auto">
            <div className="text-[10px] text-emerald-200/50 uppercase tracking-widest leading-none">Wallet Balance</div>
            <div className="text-3xl font-bold font-headline-lg mt-1 tracking-tight flex items-baseline gap-1.5">
              {user!.creditBalance} <span className="text-xs font-normal text-emerald-200">Credits</span>
            </div>
          </div>

          <div className="flex justify-between items-end z-10 border-t border-white/10 pt-3">
            <div>
              <div className="text-[8px] text-emerald-200/40 uppercase tracking-wider">Account holder</div>
              <div className="text-xs font-bold mt-0.5 truncate max-w-[140px]">{user!.name}</div>
            </div>
            <div className="text-right">
              <div className="text-[8px] text-emerald-200/40 uppercase tracking-wider">Account ID</div>
              <div className="text-[9px] font-mono mt-0.5 text-emerald-200/80">CEN-{user!.id.slice(0, 8).toUpperCase()}</div>
            </div>
          </div>
        </div>

        {/* Dynamic Analytics Summary Cards */}
        <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
          <Card className="border-line/60 shadow-sm flex flex-col justify-between">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Total Earned</div>
                <div className="text-2xl font-bold text-ink mt-0.5">{totalEarned} Credits</div>
                <span className="text-[9px] text-on-surface-variant/80 mt-1 block">Accumulated earnings on listings</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-line/60 shadow-sm flex flex-col justify-between">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Total Spent</div>
                <div className="text-2xl font-bold text-ink mt-0.5">{totalSpent} Credits</div>
                <span className="text-[9px] text-on-surface-variant/80 mt-1 block">Spent booking skills/tools</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Informational Tip Card */}
          <div className="sm:col-span-2 bg-gradient-to-r from-deep-forest/5 via-indigo-50/20 to-transparent border border-line/45 p-4 rounded-xl flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-deep-forest flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-ink">How do credits work?</div>
              <p className="text-[10px] text-on-surface-variant leading-normal mt-0.5">
                Credits represent help hours or resource shares. 1 Credit is roughly equivalent to 20 minutes of service. You can earn credits by offering your listed skills/tools to your neighbors.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Ledger Card */}
      <Card className="border-line/60 shadow-sm">
        <CardHeader className="pb-3 border-b border-line/45">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-panel flex items-center justify-center border border-line">
              <Activity className="h-4 w-4 text-ink" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-ink leading-tight">Ledger Statement</CardTitle>
              <CardDescription className="text-xs text-on-surface-variant mt-0.5">Comprehensive chronological log of credit trades.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-panel border-b border-line text-left">
                  <th className="p-3.5 font-bold uppercase tracking-wider text-on-surface-variant text-[10px]">Date</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-on-surface-variant text-[10px]">Description</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-on-surface-variant text-[10px]">Type</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-on-surface-variant text-[10px] text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/35">
                {!txs.data || txs.data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-on-surface-variant font-medium">
                      No transactions recorded in this wallet yet.
                    </td>
                  </tr>
                ) : (
                  txs.data?.slice().reverse().map((t) => (
                    <tr key={t.id} className="hover:bg-panel/40 transition-colors">
                      <td className="p-3.5 font-medium text-on-surface-variant/90">{t.date}</td>
                      <td className="p-3.5 font-bold text-ink">{t.description}</td>
                      <td className="p-3.5">
                        <Badge className={`text-[9px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full ${
                          t.type === "earned" 
                            ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                            : "bg-amber-50 border-amber-100 text-amber-800"
                        }`}>
                          {t.type}
                        </Badge>
                      </td>
                      <td className={`p-3.5 text-right font-bold text-sm ${
                        t.type === "earned" ? "text-emerald-700" : "text-amber-700"
                      }`}>
                        {t.type === "earned" ? "+" : "-"}{t.amount} Crd
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

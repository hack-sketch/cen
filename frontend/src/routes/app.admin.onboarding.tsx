import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { householdService, joinRequestService, societyService, userService } from "@/services";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, FileCheck, Sparkles, CheckCircle2, XCircle, Building2, Pencil, Trash2, Users, Home, Crown, ShieldAlert, UserX, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/app/admin/onboarding")({ component: Page });

function Page() {
  const { user } = useAuth();
  const sid = user!.societyId!;
  return (
    <div>
      <PageHeader title="Member Onboarding" description="Register households, review join requests, and share your invite key." />
      <Tabs defaultValue="households" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-panel/30 p-1 rounded-xl border border-line/50">
          <TabsTrigger value="households" className="rounded-lg text-xs font-semibold py-1.5">Household Registry</TabsTrigger>
          <TabsTrigger value="requests" className="rounded-lg text-xs font-semibold py-1.5">Join Requests</TabsTrigger>
          <TabsTrigger value="invite" className="rounded-lg text-xs font-semibold py-1.5">Invite / Keys</TabsTrigger>
        </TabsList>
        <TabsContent value="households" className="animate-page-fade mt-2"><Households sid={sid} /></TabsContent>
        <TabsContent value="requests" className="animate-page-fade"><Requests sid={sid} /></TabsContent>
        <TabsContent value="invite" className="animate-page-fade"><Invite sid={sid} /></TabsContent>
      </Tabs>
    </div>
  );
}

function Households({ sid }: { sid: string }) {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["hh", sid], queryFn: () => householdService.listBySociety(sid) });
  const socQuery = useQuery({ queryKey: ["society", sid], queryFn: () => societyService.getById(sid) });
  const allUsers = useQuery({ queryKey: ["allRes", sid], queryFn: () => userService.listBySociety(sid) });
  const [unit, setUnit] = useState("");

  const capacity = socQuery.data?.capacity || 100;
  const currentCount = list.data?.length || 0;
  const remainingSlots = capacity - currentCount;

  // Edit / Manage Household Modal State
  const [selectedHh, setSelectedHh] = useState<any | null>(null);
  const [editUnitNumber, setEditUnitNumber] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSingleDeleteConfirm, setShowSingleDeleteConfirm] = useState(false);

  // Pagination & custom range state
  const [currentPage, setCurrentPage] = useState(1);
  const [customFrom, setCustomFrom] = useState<number | string>(1);
  const [customTo, setCustomTo] = useState<number | string>(50);
  const [useCustomRange, setUseCustomRange] = useState(false);

  // Bulk generator state
  const [bulkOpen, setBulkOpen] = useState(false);
  const [blockInput, setBlockInput] = useState("A");
  const [startUnit, setStartUnit] = useState<number | string>(101);
  const [endUnit, setEndUnit] = useState<number | string>(105);
  const [formatPattern, setFormatPattern] = useState("{Block}-{Unit}");

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const startNum = Number(startUnit) || 1;
    const endNum = Number(endUnit) || 1;
    const rangeSize = endNum - startNum + 1;

    if (rangeSize <= 0) {
      return toast.error("Invalid range limits specified.");
    }
    if (remainingSlots <= 0) {
      return toast.warning("No remaining slots available in this society.");
    }

    const blocks = blockInput
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);
    const blockList = blocks.length > 0 ? blocks : [""];
    const totalNew = rangeSize * blockList.length;

    if (currentCount + totalNew > capacity) {
      return toast.error(`Adding ${totalNew} units exceeds the society's capacity of ${capacity} (current count: ${currentCount}, remaining slots: ${remainingSlots}).`);
    }

    try {
      await householdService.bulkGenerate(sid, blockList, startNum, endNum, formatPattern);
      toast.success("Households generated successfully!");
      setBulkOpen(false);
      qc.invalidateQueries({ queryKey: ["hh", sid] });
    } catch (err: any) {
      toast.error(err.message || "Failed to generate households");
    }
  };

  const handleManualAdd = async () => {
    if (!unit.trim()) return;
    if (currentCount + 1 > capacity) {
      return toast.error(`Cannot add household. Maximum capacity of ${capacity} units has been reached.`);
    }
    try {
      await householdService.register(sid, unit.trim());
      setUnit("");
      qc.invalidateQueries({ queryKey: ["hh", sid] });
      toast.success("Household unit added manually");
    } catch (err: any) {
      toast.error(err.message || "Failed to add household");
    }
  };

  const handleDeleteAll = () => {
    setShowClearConfirm(true);
  };

  const triggerDelete = () => {
    if (selectedHh?.claimed) {
      setShowSingleDeleteConfirm(true);
    } else {
      executeDelete();
    }
  };

  const executeDelete = async () => {
    if (!selectedHh) return;
    await householdService.deleteHousehold(selectedHh.id);
    toast.info("Household unit removed");
    setEditOpen(false);
    setSelectedHh(null);
    setShowSingleDeleteConfirm(false);
    qc.invalidateQueries({ queryKey: ["hh", sid] });
  };

  const renderBulkForm = (isDialog: boolean) => (
    <form onSubmit={async (e) => {
      await handleBulkGenerate(e);
      if (isDialog) setBulkOpen(false);
    }} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs font-bold text-ink">Tower / Block Name</Label>
          <Input 
            placeholder="e.g. A" 
            value={blockInput} 
            onChange={(e) => setBlockInput(e.target.value)}
            className="text-xs h-9 rounded-lg border-line-strong/60"
          />
          <span className="text-[9px] text-on-surface-variant block">Single tower block identifier.</span>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-bold text-ink">Address Format / Pattern</Label>
          <Input 
            placeholder="e.g. {Block}-{Unit}" 
            value={formatPattern} 
            onChange={(e) => setFormatPattern(e.target.value)}
            className="text-xs h-9 rounded-lg border-line-strong/60 font-mono"
          />
          <span className="text-[9px] text-on-surface-variant block">Use <code className="font-bold text-ink">{`{Block}`}</code> and <code className="font-bold text-ink">{`{Unit}`}</code> as wildcards.</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs font-bold text-ink">Unit # Start</Label>
          <Input 
            type="number" 
            value={startUnit} 
            onChange={(e) => setStartUnit(e.target.value === "" ? "" : Number(e.target.value))}
            className="text-xs h-9 rounded-lg border-line-strong/60"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-bold text-ink">Unit # End</Label>
          <Input 
            type="number" 
            value={endUnit} 
            onChange={(e) => setEndUnit(e.target.value === "" ? "" : Number(e.target.value))}
            className="text-xs h-9 rounded-lg border-line-strong/60"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-9 px-6 rounded-lg active:scale-98 transition-all cursor-pointer"
      >
        Bulk Generate Registry
      </Button>
    </form>
  );

  const handleOpenEdit = (hh: any) => {
    setSelectedHh(hh);
    setEditUnitNumber(hh.unitNumber);
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editUnitNumber || !selectedHh) return;
    await householdService.updateUnitNumber(selectedHh.id, editUnitNumber);
    toast.success("Household number updated");
    setEditOpen(false);
    setSelectedHh(null);
    qc.invalidateQueries({ queryKey: ["hh", sid] });
  };

  const handleToggleDeactivate = async (u: any) => {
    try {
      if (u.isActive !== false) {
        await userService.deactivateUser(u.id);
        toast.success(`Deactivated ${u.name}`);
      } else {
        await userService.reactivateUser(u.id);
        toast.success(`Reactivated ${u.name}`);
      }
      qc.invalidateQueries({ queryKey: ["allRes", sid] });
      qc.invalidateQueries({ queryKey: ["hh", sid] });
    } catch (err: any) {
      toast.error(err.message || "Failed to update user status");
    }
  };

  const handleDelete = async () => {
    await executeDelete();
  };

  const isEmpty = !list.data || list.data.length === 0;

  return (
    <div className="space-y-6">
      {isEmpty ? (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Option 1: Bulk initialization builder */}
          <Card className="md:col-span-2 border-line/65 shadow-md">
            <CardContent className="p-6 space-y-5">
              <div className="pb-3 border-b border-line/45 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-deep-forest/10 flex items-center justify-center text-deep-forest border border-deep-forest/15">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-ink">Initialize Household Registry</h3>
                  <p className="text-[10px] text-on-surface-variant">Auto-generate household structures using blocks and ranges.</p>
                </div>
              </div>
              
              {renderBulkForm(false)}
            </CardContent>
          </Card>

          {/* Option 2: Add individual registry unit */}
          <Card className="border-line/65 shadow-md">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-extrabold text-sm text-ink pb-3 border-b border-line/45">Manual Single Entry</h3>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                If you prefer to register your houses individually or have irregular unit names, add them manually below.
              </p>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-ink">Household Unit Identifier</Label>
                <Input 
                  placeholder="e.g. Penthouse-1" 
                  value={unit} 
                  onChange={(e) => setUnit(e.target.value)}
                  className="text-xs h-9 rounded-lg border-line-strong/60"
                />
              </div>
              <Button 
                onClick={handleManualAdd}
                className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-9 rounded-lg active:scale-98 transition-all cursor-pointer"
              >
                Add Manual Unit
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-line/65 shadow-md">
          <CardContent className="p-6 space-y-5">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-3 border-b border-line/45">
              <div>
                <h3 className="font-extrabold text-sm text-ink">Household Registry</h3>
                <p className="text-[10px] text-on-surface-variant">Manage and edit your registered society units (Capacity: {currentCount}/{capacity}).</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Input 
                    placeholder="Manual unit (e.g. Villa-2)" 
                    value={unit} 
                    onChange={(e) => setUnit(e.target.value)}
                    className="text-xs h-9 w-full sm:w-[150px] border-line-strong/65 rounded-lg"
                  />
                  <Button 
                    onClick={handleManualAdd}
                    className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-9 rounded-lg px-4 cursor-pointer shadow-sm active:scale-98 transition-all flex-shrink-0"
                  >
                    Add Unit
                  </Button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">

                {remainingSlots > 0 && (
                  <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="flex-1 sm:flex-initial bg-[#14b8a6] hover:bg-[#14b8a6]/90 text-white font-semibold text-xs h-9 rounded-lg px-4 cursor-pointer shadow-sm active:scale-98 transition-all flex-shrink-0"
                      >
                        Bulk Add Range
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md border-line/60 rounded-2xl p-6 bg-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                      <DialogHeader className="pb-3 border-b border-line/35">
                        <DialogTitle className="text-base font-bold text-ink">Bulk Generate Range</DialogTitle>
                        <DialogDescription className="text-xs text-on-surface-variant">Add a range of households for a specific block (Remaining slots: {remainingSlots}).</DialogDescription>
                      </DialogHeader>
                      <div className="pt-4">
                        {renderBulkForm(true)}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                <Button 
                  onClick={handleDeleteAll}
                  variant="outline"
                  className="flex-1 sm:flex-initial border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold text-xs h-9 rounded-lg px-4 cursor-pointer active:scale-98 transition-all flex-shrink-0"
                >
                  Clear Registry
                </Button>
              </div>
            </div>
          </div>

            {/* Pagination & Range Selector Control Bar */}
            {(() => {
              const totalUnits = list.data?.length || 0;
              if (totalUnits <= 50) return null;

              const startIdx = useCustomRange 
                ? Math.max(1, Math.min(Number(customFrom) || 1, totalUnits)) - 1
                : (currentPage - 1) * 50;
              const endIdx = useCustomRange
                ? Math.max(startIdx + 1, Math.min(Number(customTo) || 50, totalUnits))
                : Math.min(currentPage * 50, totalUnits);

              return (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl border border-line bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="customRangeToggle" 
                      checked={useCustomRange} 
                      onChange={(e) => setUseCustomRange(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-deep-forest focus:ring-deep-forest cursor-pointer"
                    />
                    <label htmlFor="customRangeToggle" className="text-xs font-bold text-ink cursor-pointer select-none">
                      Filter Custom Slice
                    </label>
                  </div>

                  {!useCustomRange ? (
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-xs text-on-surface-variant font-medium">
                        Showing {startIdx + 1}-{endIdx} of {totalUnits} units
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                          className="text-xs font-semibold px-2.5 h-8 border-line-strong hover:bg-panel cursor-pointer"
                        >
                          Prev
                        </Button>
                        <span className="text-xs text-ink font-bold px-1">
                          Page {currentPage} of {Math.ceil(totalUnits / 50)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === Math.ceil(totalUnits / 50)}
                          onClick={() => setCurrentPage(currentPage + 1)}
                          className="text-xs font-semibold px-2.5 h-8 border-line-strong hover:bg-panel cursor-pointer"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                      <span className="text-xs text-on-surface-variant font-medium">
                        Showing Custom Range:
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-on-surface-variant">From Unit #</span>
                          <Input 
                            type="number" 
                            min={1} 
                            max={totalUnits}
                            value={customFrom} 
                            onChange={(e) => setCustomFrom(e.target.value === "" ? "" : Number(e.target.value))}
                            className="w-16 h-8 text-xs px-2 rounded-lg border-line-strong/60"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-on-surface-variant">To Unit #</span>
                          <Input 
                            type="number" 
                            min={1} 
                            max={totalUnits}
                            value={customTo} 
                            onChange={(e) => setCustomTo(e.target.value === "" ? "" : Number(e.target.value))}
                            className="w-16 h-8 text-xs px-2 rounded-lg border-line-strong/60"
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-on-surface-variant font-medium">
                        (Total {totalUnits} slots)
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(() => {
                const totalUnits = list.data?.length || 0;
                const startIdx = totalUnits > 50 
                  ? (useCustomRange 
                      ? Math.max(1, Math.min(Number(customFrom) || 1, totalUnits)) - 1
                      : (currentPage - 1) * 50)
                  : 0;
                const endIdx = totalUnits > 50
                  ? (useCustomRange
                      ? Math.max(startIdx + 1, Math.min(Number(customTo) || 50, totalUnits))
                      : Math.min(currentPage * 50, totalUnits))
                  : totalUnits;

                return list.data?.slice(startIdx, endIdx).map((h) => {
                  const leadUser = allUsers.data?.find((u: any) => u.id === h.claimedByUserId || (u.householdId === h.id && u.isPrimaryResident));
                  const membersCount = allUsers.data?.filter((u: any) => u.householdId === h.id || u.householdId === h.unitNumber).length || (h.claimed ? 1 : 0);
                  const maxCap = h.maxMembers || 4;
                  const occPct = Math.min(100, Math.round((membersCount / maxCap) * 100));

                  return (
                    <Card
                      key={h.id}
                      onClick={() => handleOpenEdit(h)}
                      className={cn(
                        "group border shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 relative",
                        h.claimed
                          ? "bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/20 border-emerald-300/80 hover:border-emerald-500"
                          : "bg-white border-line/60 hover:border-deep-forest/40"
                      )}
                    >
                      <div className="p-4 space-y-3">
                        {/* Header: Unit Icon & Title + Status Pill */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-inner border",
                              h.claimed
                                ? "bg-emerald-500/15 text-emerald-900 border-emerald-300"
                                : "bg-panel text-on-surface-variant border-line/60"
                            )}>
                              <Building2 className="h-4 w-4 shrink-0" />
                            </div>
                            <span className="font-extrabold text-sm text-ink truncate group-hover:text-deep-forest transition-colors">
                              Unit {h.unitNumber}
                            </span>
                          </div>

                          <Badge className={cn(
                            "text-[9px] font-bold px-2 py-0.5 shrink-0 rounded-full border",
                            h.claimed
                              ? "bg-emerald-100/90 text-emerald-950 border-emerald-300"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          )}>
                            {h.claimed ? "Claimed" : "Vacant Slot"}
                          </Badge>
                        </div>

                        {/* Middle Section: Lead Resident Details */}
                        <div className="bg-panel/50 rounded-xl p-2.5 border border-line/40 space-y-1.5">
                          <div className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/80">
                            Primary Occupant
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-deep-forest/10 border border-deep-forest/20 text-deep-forest flex items-center justify-center font-bold text-[10px] shrink-0">
                              {leadUser ? leadUser.name.slice(0, 2).toUpperCase() : (h.claimed ? "RL" : "?")}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-xs text-ink truncate flex items-center gap-1">
                                <span>{leadUser?.name || (h.claimed ? "Resident Lead" : "Unassigned")}</span>
                                {h.claimed && <Crown className="h-3 w-3 fill-amber-400 text-amber-600 shrink-0" />}
                              </div>
                              <div className="text-[10px] text-on-surface-variant truncate">
                                {leadUser?.email || (h.claimed ? "Registered Resident" : "No resident assigned")}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Occupancy Progress Meter */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-semibold">
                            <span className="text-on-surface-variant flex items-center gap-1">
                              <Users className="h-3 w-3 text-on-surface-variant/80" />
                              Occupancy Ratio:
                            </span>
                            <span className={cn("font-bold text-xs", membersCount > 0 ? "text-emerald-800" : "text-on-surface-variant")}>
                              {membersCount} / {maxCap} Members
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-line/30">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-300",
                                occPct === 100 ? "bg-emerald-600" : occPct > 0 ? "bg-emerald-500" : "bg-slate-300"
                              )}
                              style={{ width: `${Math.max(5, occPct)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="bg-panel/60 border-t border-line/50 px-3 py-2 flex items-center justify-between text-xs">
                        <span className="text-[10px] font-semibold text-on-surface-variant group-hover:text-ink transition-colors">
                          Click card to manage
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(h);
                            }}
                            className="h-7 px-2 text-[11px] font-semibold text-ink hover:bg-white hover:shadow-xs rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            <Pencil className="h-3 w-3 text-on-surface-variant" />
                            <span>Edit</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                });
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Household & Occupants Inspector Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg border-line/60 rounded-2xl p-6 bg-white shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b border-line/35">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-deep-forest/10 border border-deep-forest/20 text-deep-forest flex items-center justify-center font-bold">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-ink">
                    Manage Unit {selectedHh?.unitNumber}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-on-surface-variant">
                    Inspect household occupants, manage unit details, or deactivate accounts.
                  </DialogDescription>
                </div>
              </div>
              <Badge className={selectedHh?.claimed ? "bg-emerald-100 text-emerald-950 border-emerald-300 font-bold" : "bg-slate-100 text-slate-700 border-slate-200"}>
                {selectedHh?.claimed ? "Claimed" : "Vacant Slot"}
              </Badge>
            </div>
          </DialogHeader>
          
          <div className="space-y-5 pt-3">
            {/* Occupants Roster Section */}
            {(() => {
              const occupants = allUsers.data?.filter((u: any) => u.householdId === selectedHh?.id || u.householdId === selectedHh?.unitNumber) || [];
              const isClaimed = selectedHh?.claimed || occupants.length > 0;

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-ink flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-deep-forest" />
                      Registered Occupants ({occupants.length} / {selectedHh?.maxMembers || 4})
                    </span>
                  </div>

                  {occupants.length > 0 ? (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {occupants.map((u: any) => (
                        <div
                          key={u.id}
                          className={cn(
                            "p-3 rounded-xl border flex items-center justify-between gap-3 shadow-2xs transition-all",
                            u.isActive === false ? "bg-rose-50/50 border-rose-200 opacity-80" : "bg-panel/50 border-line/60 hover:bg-panel"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={cn(
                              "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border shadow-inner",
                              u.isPrimaryResident ? "bg-amber-500/20 text-amber-950 border-amber-300" : "bg-deep-forest/10 text-deep-forest border-deep-forest/20"
                            )}>
                              {u.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-ink truncate flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {u.isPrimaryResident && (
                                  <Badge className="bg-amber-100 text-amber-950 border-amber-300 text-[8px] font-bold px-1.5 py-0">
                                    ⭐ Primary Lead
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[10px] text-on-surface-variant truncate">{u.email}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Badge className={u.isActive === false ? "bg-rose-100 text-rose-800 border-rose-300 text-[9px] font-bold" : "bg-emerald-100 text-emerald-950 border-emerald-300 text-[9px] font-bold"}>
                              {u.isActive === false ? "Deactivated" : "Active"}
                            </Badge>

                            <Button
                              size="sm"
                              variant={u.isActive === false ? "outline" : "ghost"}
                              onClick={() => handleToggleDeactivate(u)}
                              className={cn(
                                "h-7 text-[10px] font-bold px-2 rounded-lg cursor-pointer transition-all",
                                u.isActive === false
                                  ? "border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                                  : "text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              )}
                            >
                              {u.isActive === false ? (
                                <>
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Reactivate
                                </>
                              ) : (
                                <>
                                  <UserX className="h-3 w-3 mr-1" />
                                  Deactivate
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-line bg-slate-50/50 text-center space-y-1">
                      <div className="text-xs font-semibold text-on-surface-variant">No active residents in this household slot</div>
                      <div className="text-[10px] text-on-surface-variant/70">Occupants can claim this unit or apply via society join request.</div>
                    </div>
                  )}

                  {/* Deactivation & Deletion Governance Rule Notice */}
                  {isClaimed && (
                    <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-950 flex items-start gap-2.5">
                      <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="leading-snug">
                        <strong className="font-bold">Deletion Protection Active:</strong> Units with residing residents cannot be deleted. Deactivate residents above if account suspension is required.
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-bold text-ink">Household Unit Identifier</Label>
              <Input 
                value={editUnitNumber} 
                onChange={(e) => setEditUnitNumber(e.target.value)} 
                className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-lg"
              />
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <Button 
                onClick={handleSaveEdit}
                className="flex-1 bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 rounded-lg shadow-sm cursor-pointer active:scale-98 transition-all"
              >
                Save Unit Changes
              </Button>
              {(() => {
                const occupants = allUsers.data?.filter((u: any) => u.householdId === selectedHh?.id || u.householdId === selectedHh?.unitNumber) || [];
                const hasResidents = selectedHh?.claimed || occupants.length > 0;

                return (
                  <Button 
                    variant="outline"
                    disabled={hasResidents}
                    onClick={triggerDelete}
                    title={hasResidents ? "Cannot delete unit with active residents. Deactivate residents first." : "Delete vacant household unit"}
                    className={cn(
                      "font-semibold text-xs h-10 px-4 rounded-lg transition-all",
                      hasResidents
                        ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"
                        : "border-rose-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                    )}
                  >
                    Delete Vacant Unit
                  </Button>
                );
              })()}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear All Households Themed Warning Modal */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent className="bg-white border-line/60 rounded-2xl shadow-xl max-w-md p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-base font-bold text-ink flex items-center gap-2">
              <XCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
              Clear Household Registry
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-on-surface-variant leading-relaxed">
              WARNING: Are you sure you want to delete all households in this registry?
              <br /><br />
              This will disconnect all active residents and clear the unit grid completely. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5 flex gap-2">
            <AlertDialogCancel className="h-9 px-4 text-xs font-semibold rounded-lg border-line-strong hover:bg-panel cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                await householdService.deleteAll(sid);
                toast.info("All household records cleared");
                qc.invalidateQueries({ queryKey: ["hh", sid] });
                setShowClearConfirm(false);
              }}
              className="h-9 px-4 text-xs font-semibold rounded-lg text-white bg-rose-600 hover:bg-rose-700 cursor-pointer active:scale-98 transition-all"
            >
              Confirm Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single Household Occupied Deletion Themed Warning Modal */}
      <AlertDialog open={showSingleDeleteConfirm} onOpenChange={setShowSingleDeleteConfirm}>
        <AlertDialogContent className="bg-white border-line/60 rounded-2xl shadow-xl max-w-md p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-base font-bold text-ink flex items-center gap-2">
              <XCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
              Delete Occupied Household
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-on-surface-variant leading-relaxed">
              WARNING: This household unit ({selectedHh?.unitNumber}) is currently claimed/occupied by a resident.
              <br /><br />
              Deleting this unit will unlink their profile and disconnect them from the society network.
              <br /><br />
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5 flex gap-2">
            <AlertDialogCancel className="h-9 px-4 text-xs font-semibold rounded-lg border-line-strong hover:bg-panel cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeDelete}
              className="h-9 px-4 text-xs font-semibold rounded-lg text-white bg-rose-600 hover:bg-rose-700 cursor-pointer active:scale-98 transition-all"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Requests({ sid }: { sid: string }) {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["jr", sid], queryFn: () => joinRequestService.listBySociety(sid) });
  const socQuery = useQuery({ queryKey: ["society", sid], queryFn: () => societyService.getById(sid) });
  const initCredits = socQuery.data?.initialCredits ?? 10;
  const [selectedRequest, setSelectedRequest] = useState<import("@/mocks/data").JoinRequest | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<Record<string, { address: string; matched: boolean; score: string }>>({});
  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "reject";
    requestId: string;
    userName: string;
  } | null>(null);

  return (
    <div className="space-y-3">
      {list.data?.map((r) => (
        <Card key={r.id} className="border-line/60 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="font-bold text-base text-ink">{r.userName}</div>
                <div className="text-sm text-on-surface-variant mt-1">Household Unit {r.unitNumber} · Submitted {r.submittedAt}</div>
                <Badge className={`pointer-events-none text-xs font-bold uppercase tracking-wider mt-2 px-2.5 py-0.5 rounded-full border ${
                  r.status === "approved"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-800 hover:bg-emerald-50"
                    : r.status === "pending"
                    ? "bg-amber-50 border-amber-100 text-amber-800 hover:bg-amber-50"
                    : "bg-rose-50 border-rose-100 text-rose-800 hover:bg-rose-50"
                }`}>
                  {r.status}
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedRequest(r)}
                  className="text-xs font-semibold h-9 px-3.5 border-line-strong hover:bg-panel cursor-pointer shadow-sm active:scale-98 transition-all flex-shrink-0"
                >
                  <FileCheck className="mr-1.5 h-4 w-4 text-on-surface-variant" /> 
                  Verify & View ID
                </Button>
                {r.status === "pending" && (
                  <div className="flex gap-2 flex-1 sm:flex-initial">
                    <Button 
                      size="sm" 
                      onClick={() => setConfirmAction({ type: "approve", requestId: r.id, userName: r.userName })}
                      className="flex-1 sm:flex-initial bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-9 px-3.5 cursor-pointer shadow-sm active:scale-98 transition-all flex-shrink-0"
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setConfirmAction({ type: "reject", requestId: r.id, userName: r.userName })}
                      className="flex-1 sm:flex-initial text-xs font-semibold h-9 px-3.5 border-line-strong hover:bg-panel cursor-pointer active:scale-98 transition-all flex-shrink-0"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Manual Inspection Overlay Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-2xl border-line/60 shadow-2xl rounded-2xl p-6">
          <DialogHeader className="pb-3 border-b border-line/45">
            <DialogTitle className="text-base font-bold text-ink flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-deep-forest" />
              Identity Proof Manual Inspection
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant mt-1">
              Review submitted identity document for {selectedRequest?.userName} (Unit {selectedRequest?.unitNumber}).
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (() => {
            const isImage = selectedRequest.idProofUrl && (
              selectedRequest.idProofUrl.startsWith("data:") || 
              selectedRequest.idProofUrl.startsWith("http") || 
              selectedRequest.idProofUrl.startsWith("blob:")
            );
            const filename = selectedRequest.idProofUrl ? selectedRequest.idProofUrl.replace(/^mock:\/\//, "") : "Submitted_ID_Proof.pdf";

            return (
              <div className="grid md:grid-cols-2 gap-6 mt-4 pt-1">
                {/* Document Image section */}
                <div className="space-y-2.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Submitted Document Image</span>
                  <div className="border border-line rounded-xl bg-panel/30 p-3 flex flex-col items-center justify-center shadow-inner h-56 overflow-hidden relative">
                    {isImage ? (
                      <img src={selectedRequest.idProofUrl} alt="Uploaded ID Proof" className="max-h-52 w-full object-contain rounded-lg shadow-sm border bg-white" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center p-4 bg-white rounded-xl border border-line shadow-sm w-full max-w-xs">
                        <FileCheck className="h-10 w-10 text-deep-forest" />
                        <span className="text-xs font-bold text-ink truncate max-w-[200px]">{filename}</span>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px]">Direct Resident Upload</Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Manual Review Details & Action Panel */}
                <div className="space-y-3.5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">
                      Applicant Details
                    </span>

                    <div className="p-3.5 rounded-xl border border-line/60 bg-slate-50/50 space-y-2 text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-line/35">
                        <span className="text-on-surface-variant font-medium">Resident Name:</span>
                        <span className="font-bold text-ink">{selectedRequest.userName}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-line/35">
                        <span className="text-on-surface-variant font-medium">Requested Household:</span>
                        <span className="font-bold text-deep-forest">Unit {selectedRequest.unitNumber}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-line/35">
                        <span className="text-on-surface-variant font-medium">Submitted Date:</span>
                        <span className="font-semibold text-ink">{selectedRequest.submittedAt}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant font-medium">Current Status:</span>
                        <Badge className="bg-amber-50 border-amber-200 text-amber-800 text-[10px] font-bold px-2 py-0.5 border uppercase">
                          {selectedRequest.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {selectedRequest.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => {
                          const req = selectedRequest;
                          setSelectedRequest(null);
                          setConfirmAction({ type: "approve", requestId: req.id, userName: req.userName });
                        }}
                        className="flex-1 bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 rounded-lg cursor-pointer shadow-sm active:scale-98 transition-all"
                      >
                        Approve Request
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          const req = selectedRequest;
                          setSelectedRequest(null);
                          setConfirmAction({ type: "reject", requestId: req.id, userName: req.userName });
                        }}
                        className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs h-10 rounded-lg cursor-pointer active:scale-98 transition-all"
                      >
                        Reject Request
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent className="bg-white border-line/60 rounded-2xl shadow-xl max-w-sm p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-base font-bold text-ink flex items-center gap-2">
              {confirmAction?.type === "approve" ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  Approve Join Request
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
                  Reject Join Request
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-on-surface-variant leading-relaxed">
              {confirmAction?.type === "approve" 
                ? `Are you sure you want to approve ${confirmAction?.userName} to onboard? They will gain access to your society directory and automatically receive ${initCredits} initial welcome credits.`
                : `Are you sure you want to reject ${confirmAction?.userName}'s onboarding request?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5 flex gap-2">
            <AlertDialogCancel className="h-9 px-4 text-xs font-semibold rounded-lg border-line-strong hover:bg-panel cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                if (confirmAction) {
                  if (confirmAction.type === "approve") {
                    await joinRequestService.approve(confirmAction.requestId);
                    toast.success(`Approved ${confirmAction.userName} onboarding.`);
                  } else {
                    await joinRequestService.reject(confirmAction.requestId);
                    toast.info(`Rejected ${confirmAction.userName}'s onboarding request.`);
                  }
                  qc.invalidateQueries({ queryKey: ["jr", sid] });
                  setConfirmAction(null);
                }
              }}
              className={cn(
                "h-9 px-4 text-xs font-semibold rounded-lg text-white cursor-pointer active:scale-98 transition-all",
                confirmAction?.type === "approve" ? "bg-deep-forest hover:bg-deep-forest/90" : "bg-rose-600 hover:bg-rose-700"
              )}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

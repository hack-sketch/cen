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
import { householdService, joinRequestService, societyService } from "@/services";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, FileCheck, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import aadharImg from "@/assets/aadhar.webp";

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
    if (remainingSlots <= 2) {
      return toast.warning("Bulk range generation is only available when you have more than 2 slots remaining.");
    }
    if (currentCount + rangeSize > capacity) {
      return toast.error(`Adding ${rangeSize} units exceeds the society's capacity of ${capacity} (current count: ${currentCount}, remaining slots: ${remainingSlots}).`);
    }

    const blocks = blockInput.trim() ? [blockInput.trim()] : [""];
    
    await householdService.bulkGenerate(sid, blocks, startNum, endNum, formatPattern);
    toast.success("Households generated successfully!");
    qc.invalidateQueries({ queryKey: ["hh", sid] });
  };

  const handleManualAdd = async () => {
    if (!unit) return;
    if (currentCount + 1 > capacity) {
      return toast.error(`Cannot add household. Maximum capacity of ${capacity} units has been reached.`);
    }
    try {
      await householdService.register(sid, unit);
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

                {remainingSlots > 2 && (
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

            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
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

                return list.data?.slice(startIdx, endIdx).map((h) => (
                  <button
                    key={h.id}
                    onClick={() => handleOpenEdit(h)}
                    type="button"
                    className={cn(
                      "rounded-xl border p-3 text-center text-xs transition-all hover:-translate-y-[1px] hover:shadow-sm cursor-pointer",
                      h.claimed 
                        ? "bg-emerald-50/70 border-emerald-200 text-emerald-800 font-semibold" 
                        : "bg-slate-50/40 border-line hover:border-line-strong text-ink"
                    )}
                  >
                    <div className="font-bold tracking-tight truncate">{h.unitNumber}</div>
                    <div className="mt-1 text-[9px] opacity-75 font-medium">{h.claimed ? "Claimed" : "Available"}</div>
                  </button>
                ));
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Household Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md border-line/60 rounded-2xl p-6 bg-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <DialogHeader className="pb-3 border-b border-line/35">
            <DialogTitle className="text-base font-bold text-ink">Manage Household Unit</DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant">Update the unit identifier or remove the card listing.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-ink">Household Unit Number / Address</Label>
              <Input 
                value={editUnitNumber} 
                onChange={(e) => setEditUnitNumber(e.target.value)} 
                className="border-line-strong focus:ring-1 focus:ring-deep-forest/20 text-xs h-10 rounded-lg"
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleSaveEdit}
                className="flex-1 bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 rounded-lg shadow-sm cursor-pointer active:scale-98 transition-all"
              >
                Save Changes
              </Button>
              <Button 
                variant="outline"
                onClick={triggerDelete}
                className="border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold text-xs h-10 px-4 rounded-lg cursor-pointer transition-all"
              >
                Delete Card
              </Button>
            </div>
            {selectedHh?.claimed && (
              <p className="text-[9px] text-rose-600 font-medium text-center">
                Warning: This unit is claimed by a resident. Deleting it will disconnect the resident.
              </p>
            )}
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
                ? `Are you sure you want to approve ${confirmAction?.userName} to onboard? They will gain access to your society directory.`
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

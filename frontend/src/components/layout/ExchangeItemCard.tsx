import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
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
import { Sparkles, Package } from "lucide-react";
import { toast } from "sonner";

export interface ExchangeItemCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  credits: number;
  providerName: string;
  providerId: string;
  tags?: string[];
  available?: boolean;
  type: "skill" | "resource";
  myPendingBookingId?: string;
  onAction: (id: string, userId: string) => Promise<any>;
  onCancelRequest?: (bookingId: string) => Promise<any>;
  categoryColors?: Record<string, string>;
}

const DEFAULT_CAT_COLORS: Record<string, string> = {
  Repair: "bg-emerald-50 text-emerald-800 border-emerald-100",
  Tutoring: "bg-indigo-50 border-indigo-200 text-indigo-800",
  Wellness: "bg-violet-50 border-violet-200 text-violet-800",
  Music: "bg-amber-50 border-amber-200 text-amber-800",
  Electronics: "bg-blue-50 border-blue-200 text-blue-800",
  Tools: "bg-teal-50 border-teal-200 text-teal-800",
  General: "bg-slate-50 border-slate-200 text-slate-800",
  Vehicles: "bg-amber-50 border-amber-200 text-amber-800",
  Outdoor: "bg-emerald-50 border-emerald-200 text-emerald-800",
  Media: "bg-violet-50 border-violet-200 text-violet-800",
};

export function ExchangeItemCard({
  id,
  title,
  description,
  category,
  credits,
  providerName,
  providerId,
  tags = [],
  available = true,
  type,
  myPendingBookingId,
  onAction,
  onCancelRequest,
  categoryColors = DEFAULT_CAT_COLORS,
}: ExchangeItemCardProps) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const isOwner = providerId === user!.id;
  const insCredits = (user!.creditBalance ?? 0) < credits;

  const hasPendingRequest = Boolean(myPendingBookingId);

  // Determine dialog details based on type
  const isSkill = type === "skill";
  const dialogTitle = isSkill ? "Send Skill Purchase Request" : "Request to Borrow Resource";
  const dialogDescription = isSkill
    ? `Send a purchase request for "${title}" (${credits} Credits) to ${providerName}? Credits will only be transferred after ${providerName} approves your request.`
    : `Send a borrow request for "${title}" (${credits} Credits) to ${providerName}? Credits will only be transferred after ${providerName} approves your request.`;
  
  const successToast = isSkill
    ? `Request sent to ${providerName}! Awaiting owner approval.`
    : `Borrow request sent to ${providerName}! Awaiting owner approval.`;

  const ctaLabel = isSkill
    ? isOwner
      ? "My Offered Skill"
      : hasPendingRequest
      ? "Request Sent"
      : insCredits
      ? `Insufficient Credits (${credits} Crd needed)`
      : `Book (${credits} Credits)`
    : isOwner
    ? "My Item"
    : hasPendingRequest
    ? "Borrow Request Sent"
    : !available
    ? "Out of Stock"
    : insCredits
    ? `Insufficient Credits (${credits} Crd needed)`
    : "Request to Borrow";

  const isBtnDisabled = isSkill 
    ? (isOwner || insCredits || hasPendingRequest) 
    : (!available || isOwner || insCredits || hasPendingRequest);

  return (
    <>
      <Card className="border-line/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden bg-white">
        <CardContent className="p-5 flex flex-col justify-between flex-1 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className={cn("px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wide", categoryColors[category] || "bg-slate-50")}>
                {category}
              </span>
              <div className="inline-flex items-center gap-1 bg-deep-forest/5 text-deep-forest border border-deep-forest/15 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                {credits} Credits
              </div>
            </div>

            <h3 className="font-bold text-sm text-ink leading-snug line-clamp-1">{title}</h3>
            
            <div className="flex items-center gap-2 pt-1">
              <div className="w-6 h-6 rounded-full bg-deep-forest/5 text-deep-forest border border-deep-forest/15 flex items-center justify-center text-[9px] font-bold">
                {getInitials(providerName)}
              </div>
              <span className="text-[10px] text-on-surface-variant font-medium">
                {isSkill ? "Offered by" : "Lent by"} <span className="font-bold text-ink">{providerName}</span>
              </span>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2 pt-1">{description}</p>
          </div>

          <div className="space-y-3.5">
            {isSkill ? (
              tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((t) => (
                    <Badge key={t} variant="outline" className="text-[9px] border-line font-medium text-on-surface-variant bg-panel/30">
                      #{t}
                    </Badge>
                  ))}
                </div>
              )
            ) : (
              <div>
                {available ? (
                  <Badge className="bg-emerald-50 border-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-wider">
                    Available to Borrow
                  </Badge>
                ) : (
                  <Badge className="bg-amber-50 border-amber-100 text-amber-800 text-[9px] font-bold uppercase tracking-wider">
                    Currently Borrowed
                  </Badge>
                )}
              </div>
            )}

            {hasPendingRequest ? (
              <div className="space-y-2">
                <Badge className="w-full bg-blue-50 border-blue-200 text-blue-800 text-xs font-semibold py-1.5 justify-center border flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                  Request Sent (Awaiting Owner Approval)
                </Badge>
                {onCancelRequest && myPendingBookingId && (
                  <Button
                    variant="outline"
                    disabled={cancelling}
                    onClick={async () => {
                      setCancelling(true);
                      try {
                        await onCancelRequest(myPendingBookingId);
                        qc.invalidateQueries();
                        toast.info("Your request has been cancelled.");
                      } catch (err: any) {
                        toast.error(err.message || "Failed to cancel request.");
                      } finally {
                        setCancelling(false);
                      }
                    }}
                    className="w-full h-8 text-xs font-semibold border-rose-200 text-rose-700 hover:bg-rose-50 cursor-pointer"
                  >
                    Cancel My Request
                  </Button>
                )}
              </div>
            ) : (
              <Button
                disabled={isBtnDisabled}
                onClick={() => setShowConfirm(true)}
                className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold h-9 rounded-lg text-xs cursor-pointer shadow-sm"
              >
                {ctaLabel}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-white border-line/60 rounded-2xl shadow-xl max-w-sm p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-base font-bold text-ink flex items-center gap-2">
              {isSkill ? <Sparkles className="h-5 w-5 text-deep-forest flex-shrink-0" /> : <Package className="h-5 w-5 text-deep-forest flex-shrink-0" />}
              {dialogTitle}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-on-surface-variant leading-relaxed">
              {dialogDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5 flex gap-2">
            <AlertDialogCancel className="h-9 px-4 text-xs font-semibold rounded-lg border-line-strong hover:bg-panel cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                await onAction(id, user!.id);
                qc.invalidateQueries();
                toast.success(successToast);
                setShowConfirm(false);
              }}
              className="h-9 px-4 text-xs font-semibold rounded-lg bg-deep-forest hover:bg-deep-forest/90 text-white cursor-pointer active:scale-98 transition-all"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

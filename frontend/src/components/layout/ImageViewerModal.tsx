import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl?: string | null;
  title: string;
  subtitle?: string;
  category?: string;
  credits?: number;
  description?: string;
  actions?: React.ReactNode;
}

export function ImageViewerModal({
  open,
  onOpenChange,
  imageUrl,
  title,
  subtitle,
  category,
  credits,
  description,
  actions,
}: ImageViewerModalProps) {
  if (!imageUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] bg-white border-line/60 rounded-2xl p-0 overflow-hidden shadow-2xl flex flex-col">
        <DialogHeader className="p-4 pb-2 border-b border-line/40 flex flex-row items-center justify-between">
          <div className="space-y-0.5 pr-6">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-sm font-bold text-ink truncate max-w-md">
                {title}
              </DialogTitle>
              {category && (
                <Badge variant="outline" className="text-[9px] uppercase font-bold text-on-surface-variant bg-panel/60">
                  {category}
                </Badge>
              )}
              {credits !== undefined && (
                <Badge className="bg-deep-forest/10 border border-deep-forest/20 text-deep-forest text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  {credits} Credits
                </Badge>
              )}
            </div>
            {subtitle && (
              <DialogDescription className="text-xs text-on-surface-variant">
                {subtitle}
              </DialogDescription>
            )}
          </div>
        </DialogHeader>

        {/* Full Image Container */}
        <div className="relative flex-1 min-h-[260px] max-h-[60vh] bg-slate-950 flex items-center justify-center overflow-hidden p-2">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[58vh] max-w-full object-contain rounded-lg transition-all duration-200"
          />
        </div>

        {/* Details & Actions Footer */}
        {(description || actions) && (
          <div className="p-4 bg-panel/30 border-t border-line/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {description ? (
              <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed max-w-lg">
                {description}
              </p>
            ) : <div />}
            {actions && (
              <div className="flex items-center gap-2 shrink-0">
                {actions}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

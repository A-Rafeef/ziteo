import type { ReactNode } from "react";
import { ArrowLeft, Maximize2, Minimize2, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ContextualDockOption {
  id: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClick: () => void;
}

export function ContextualDock({
  panelTitle,
  panelVisible,
  expandable = false,
  expanded = false,
  onToggleExpand,
  onClosePanel,
  panelContent,
  backLabel,
  onBack,
  barOptions,
}: {
  panelTitle?: string;
  panelVisible: boolean;
  expandable?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  onClosePanel?: () => void;
  panelContent?: ReactNode;
  backLabel?: string;
  onBack?: () => void;
  barOptions: ContextualDockOption[];
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center gap-2 pointer-events-none p-3 pb-safe">
      {panelVisible && panelContent && (
        <div
          className={cn(
            "animate-slide-up pointer-events-auto flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-surface/95 shadow-[0_12px_40px_rgb(0,0,0,0.14)] backdrop-blur-xl transition-all duration-200",
            expanded ? "max-h-[56dvh]" : "max-h-[36dvh]",
          )}
        >
          {(panelTitle || onClosePanel || expandable) && (
            <div className="flex shrink-0 items-center justify-between border-b border-line-soft/80 px-4 py-2.5">
              <span className="text-xs font-bold tracking-wide text-ink uppercase">
                {panelTitle}
              </span>
              <div className="flex items-center gap-1">
                {expandable && onToggleExpand && (
                  <button
                    type="button"
                    aria-label={expanded ? "Collapse panel" : "Expand panel"}
                    title={expanded ? "Compact view" : "Expand"}
                    onClick={onToggleExpand}
                    className="tap-smooth inline-flex size-7 items-center justify-center rounded-full text-muted hover:bg-fill hover:text-ink transition-colors"
                  >
                    {expanded ? (
                      <Minimize2 className="size-3.5" strokeWidth={2} />
                    ) : (
                      <Maximize2 className="size-3.5" strokeWidth={2} />
                    )}
                  </button>
                )}
                {onClosePanel && (
                  <button
                    type="button"
                    aria-label="Close controls"
                    onClick={onClosePanel}
                    className="tap-smooth inline-flex size-7 items-center justify-center rounded-full text-muted hover:bg-fill hover:text-ink transition-colors"
                  >
                    <X className="size-3.5" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar p-3.5">
            {panelContent}
          </div>
        </div>
      )}

      <div className="pointer-events-auto flex items-center justify-center max-w-full">
        <div className="flex items-center gap-1 sm:gap-1.5 rounded-3xl border border-slate-200/90 bg-surface/95 px-2 py-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl overflow-x-auto max-w-[calc(100vw-24px)] no-scrollbar">
          {backLabel && onBack && (
            <>
              <button
                type="button"
                onClick={onBack}
                aria-label={`Back from ${backLabel}`}
                className="tap-smooth flex h-12 shrink-0 items-center gap-1.5 rounded-2xl bg-fill px-3 text-ink hover:bg-line-soft/70 transition-colors"
              >
                <ArrowLeft className="size-4 stroke-[2]" />
                <span className="text-[11px] font-bold leading-none whitespace-nowrap">
                  {backLabel}
                </span>
              </button>
              <div className="h-7 w-px shrink-0 bg-line-soft mx-0.5" />
            </>
          )}

          {barOptions.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={cn(
                  "tap-smooth flex h-12 sm:h-14 min-w-14 sm:min-w-16 px-2 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-150",
                  item.active
                    ? "bg-accent/12 text-accent ring-1 ring-accent/25"
                    : "text-ink hover:bg-fill hover:-translate-y-0.5 active:translate-y-0",
                )}
              >
                <Icon className="size-4.5 sm:size-5 stroke-[1.75]" />
                <span className="text-[11px] font-semibold leading-none whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Check,
  ChevronDown,
  Component,
  Download,
  Eye,
  Home,
  Layers,
  Menu,
  Minus,
  Monitor,
  PanelBottom,
  PanelTop,
  Plus,
  Redo2,
  RotateCcw,
  Share2,
  ShoppingBag,
  Smartphone,
  Tablet,
  Undo2,
  Upload,
} from "lucide-react";
import { useEditor } from "@/lib/editor/store";
import type { Device, PageId } from "@/lib/editor/types";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/editor/ui";

const DEVICES: { id: Device; label: string; icon: typeof Smartphone }[] = [
  { id: "mobile", label: "Mobile", icon: Smartphone },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "desktop", label: "Desktop", icon: Monitor },
];

export function DeviceSwitch({ className }: { className?: string }) {
  const device = useEditor((s) => s.device);
  return (
    <div className={cn("flex items-center rounded-full bg-fill p-1", className)}>
      {DEVICES.map((item) => {
        const Icon = item.icon;
        const active = device === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-label={item.label}
            title={item.label}
            onClick={() => useEditor.getState().setDevice(item.id)}
            className={cn(
              "tap-smooth inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-all duration-200",
              active ? "bg-surface text-ink shadow-float scale-[1.02]" : "text-muted hover:text-ink",
            )}
          >
            <Icon className="size-4" strokeWidth={1.75} />
            <span className="hidden lg:inline">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ZoomControl() {
  const zoom = useEditor((s) => s.zoom);
  return (
    <div className="flex items-center rounded-full bg-fill p-1">
      <button
        type="button"
        aria-label="Zoom out"
        onClick={() => useEditor.getState().nudgeZoom(-10)}
        className="tap-smooth inline-flex size-9 items-center justify-center rounded-full text-ink hover:bg-surface/60 transition-colors"
      >
        <Minus className="size-4" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onDoubleClick={() => useEditor.getState().resetZoom()}
        className="tap-smooth w-12 text-center text-xs font-medium tabular-nums hover:text-accent transition-colors"
        title="Double-click to reset"
      >
        {zoom}%
      </button>
      <button
        type="button"
        aria-label="Zoom in"
        onClick={() => useEditor.getState().nudgeZoom(10)}
        className="tap-smooth inline-flex size-9 items-center justify-center rounded-full text-ink hover:bg-surface/60 transition-colors"
      >
        <Plus className="size-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}

export function TopBar() {
  const pageId = useEditor((s) => s.pageId);
  const pages = useEditor((s) => s.pages);
  const device = useEditor((s) => s.device);
  const preview = useEditor((s) => s.preview);
  const canUndo = useEditor((s) => s.past.length > 0);
  const canRedo = useEditor((s) => s.future.length > 0);
  const selectedId = useEditor((s) => s.selectedId);
  const [pageOpen, setPageOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (pageRef.current && !pageRef.current.contains(target)) setPageOpen(false);
      if (moreRef.current && !moreRef.current.contains(target)) setMoreOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, []);

  const go = (id: PageId) => {
    useEditor.getState().switchPage(id);
    useEditor.getState().deselect();
    setPageOpen(false);
  };

  const selectHeader = () => {
    setPageOpen(false);
    if (useEditor.getState().preview) useEditor.getState().togglePreview(false);
    useEditor.getState().select("navbar");
    const el = document.querySelector('[data-section-id="navbar"]');
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectFooter = () => {
    setPageOpen(false);
    if (useEditor.getState().preview) useEditor.getState().togglePreview(false);
    useEditor.getState().select("footer");
    const el = document.querySelector('[data-section-id="footer"]');
    el?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  const selectProductCard = () => {
    setPageOpen(false);
    if (useEditor.getState().preview) useEditor.getState().togglePreview(false);
    const state = useEditor.getState();
    const secId =
      state.pageId === "home" ? "grid" :
      state.pageId === "product" ? "product-view" :
      "catalog";
    state.select(secId);
    setTimeout(() => {
      const el = document.querySelector(`[data-section-id="${secId}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  };

  return (
    <header className="z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-200/90 bg-surface/95 px-3 sm:px-6 shadow-2xs backdrop-blur-xl">
      {/* Left: Home outline icon + Undo/Redo arrows */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <button
          type="button"
          title="Home / Projects"
          aria-label="Home"
          onClick={() => useEditor.getState().switchPage("home")}
          className="tap-smooth flex size-9 items-center justify-center rounded-xl text-[#53389E] hover:bg-purple-50 transition-all active:scale-95"
        >
          <Home className="size-5 stroke-[2]" />
        </button>

        <div className="hidden h-4 w-[1px] bg-slate-200 sm:block" />

        <button
          type="button"
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
          disabled={!canUndo}
          onClick={() => useEditor.getState().undo()}
          className="tap-smooth flex size-9 items-center justify-center rounded-xl text-slate-400 disabled:opacity-30 hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-95"
        >
          <Undo2 className="size-5 stroke-[2]" />
        </button>

        <button
          type="button"
          title="Redo (Ctrl+Y)"
          aria-label="Redo"
          disabled={!canRedo}
          onClick={() => useEditor.getState().redo()}
          className="tap-smooth flex size-9 items-center justify-center rounded-xl text-slate-400 disabled:opacity-30 hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-95"
        >
          <Redo2 className="size-5 stroke-[2]" />
        </button>
      </div>

      {/* Center: Page Selector Pill + Desktop Device Switcher + Zoom */}
      <div className="flex min-w-0 flex-1 items-center justify-center gap-2 sm:gap-4 px-2">
        <div ref={pageRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setPageOpen((open) => !open);
              setMoreOpen(false);
            }}
            className="tap-smooth-sm flex items-center gap-2 rounded-full border border-[#D5DEFF] bg-[#EEF2FF] px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-tight text-slate-800 shadow-2xs hover:bg-[#E0E7FF] transition-all active:scale-98"
          >
            <Layers className="size-4 text-[#53389E]" strokeWidth={2} />
            <span className="truncate">{pages[pageId].title}</span>
            <ChevronDown
              className="size-3.5 text-slate-500 transition-transform duration-200"
              style={{ transform: pageOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              strokeWidth={2}
            />
          </button>

          {pageOpen && (
            <div className="animate-scale-in absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-2xl">
              <div className="px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Switch Page
              </div>
              {(Object.keys(pages) as PageId[]).map((id) => {
                const Icon = id === "home" ? Home : id === "shop" ? ShoppingBag : Box;
                const active = id === pageId;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => go(id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-purple-50 hover:text-[#53389E]",
                      active ? "bg-purple-50/70 text-[#53389E]" : "text-slate-800",
                    )}
                  >
                    <Icon className={cn("size-4", active ? "text-[#53389E]" : "text-slate-400")} strokeWidth={1.75} />
                    <span>{pages[id].title}</span>
                    {active && <Check className="ml-auto size-3.5 text-[#53389E]" strokeWidth={2.5} />}
                  </button>
                );
              })}

              <div className="my-1.5 border-t border-slate-100" />

              <div className="px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Global Elements
              </div>
              {[
                {
                  id: "product-card",
                  label: "Product card",
                  icon: Component,
                  active: selectedId === "catalog" || selectedId === "product-view" || selectedId === "grid",
                  action: selectProductCard,
                },
                {
                  id: "header",
                  label: "Header",
                  icon: PanelTop,
                  active: selectedId === "navbar",
                  action: selectHeader,
                },
                {
                  id: "footer",
                  label: "Footer",
                  icon: PanelBottom,
                  active: selectedId === "footer",
                  action: selectFooter,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-purple-50 hover:text-[#53389E]",
                      item.active ? "bg-purple-50/70 text-[#53389E]" : "text-slate-800",
                    )}
                  >
                    <Icon className={cn("size-4", item.active ? "text-[#53389E]" : "text-slate-400")} strokeWidth={1.75} />
                    <span>{item.label}</span>
                    {item.active && <Check className="ml-auto size-3.5 text-[#53389E]" strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="hidden shrink-0 md:block">
          <DeviceSwitch />
        </div>
        <div className="hidden shrink-0 lg:block">
          <ZoomControl />
        </div>
      </div>

      {/* Right: Preview (desktop) + Publish (desktop) + Hamburger Menu */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => useEditor.getState().togglePreview()}
          className={cn(
            "tap-smooth hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-all",
            preview ? "bg-slate-800 text-white" : "text-slate-700 hover:bg-slate-100",
          )}
        >
          <Eye className="size-4" strokeWidth={1.75} />
          <span>{preview ? "Done" : "Preview"}</span>
        </button>

        <button
          type="button"
          onClick={() => useEditor.getState().openPublish()}
          className="tap-smooth hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#53389E] hover:bg-purple-800 px-3.5 text-xs font-semibold text-white shadow-xs shadow-purple-600/25 transition-all"
        >
          <Upload className="size-3.5" strokeWidth={2} />
          <span>Publish</span>
        </button>

        <div ref={moreRef} className="relative">
          <button
            type="button"
            aria-label="Menu"
            title="Menu"
            onClick={() => {
              setMoreOpen((open) => !open);
              setPageOpen(false);
            }}
            className="tap-smooth flex size-9 items-center justify-center rounded-xl text-slate-800 hover:bg-slate-100 hover:text-slate-950 transition-all active:scale-95"
          >
            <Menu className="size-5 stroke-[2]" />
          </button>

          {moreOpen && (
            <div className="animate-scale-in absolute top-full right-0 mt-2 z-50 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-2xl">
              {/* Device Mode Switcher */}
              <div className="border-b border-slate-100 px-3 py-2">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                  Device View
                </div>
                <div className="flex items-center rounded-xl bg-slate-100/90 p-1 gap-1">
                  {DEVICES.map((item) => {
                    const Icon = item.icon;
                    const active = device === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          useEditor.getState().setDevice(item.id);
                        }}
                        className={cn(
                          "tap-smooth flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                          active
                            ? "bg-white text-[#53389E] shadow-xs"
                            : "text-slate-500 hover:text-slate-800",
                        )}
                        title={item.label}
                      >
                        <Icon className="size-3.5" strokeWidth={2} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* On mobile, allow toggling Preview & Publish from the menu */}
              <div className="block sm:hidden border-b border-slate-100 pb-1 mb-1">
                <MenuRow
                  icon={Eye}
                  label={preview ? "Done Previewing" : "Preview Site"}
                  onClick={() => {
                    setMoreOpen(false);
                    useEditor.getState().togglePreview();
                  }}
                />
                <MenuRow
                  icon={Upload}
                  label="Publish Site"
                  onClick={() => {
                    setMoreOpen(false);
                    useEditor.getState().openPublish();
                  }}
                />
              </div>

              <MenuRow
                icon={Share2}
                label="Share Link"
                onClick={() => {
                  setMoreOpen(false);
                  useEditor.getState().openPublish();
                }}
              />
              <MenuRow
                icon={Download}
                label="Download HTML"
                onClick={() => {
                  setMoreOpen(false);
                  useEditor.getState().exportHtml();
                }}
              />
              <MenuRow
                icon={RotateCcw}
                label="Reset Template"
                onClick={() => {
                  setMoreOpen(false);
                  if (window.confirm("Restore the original template?")) useEditor.getState().reset();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuRow({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Share2;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-fill"
    >
      <Icon className="size-4" strokeWidth={1.75} />
      {label}
    </button>
  );
}

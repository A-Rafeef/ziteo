import { useEffect, useState } from "react";
import { Dock } from "@/components/editor/dock";
import { Overlays } from "@/components/editor/overlays";
import { PageSectionsSidebar } from "@/components/editor/page-sections-panel";
import { Sheet } from "@/components/editor/sheet";
import { SiteFrame } from "@/components/editor/site";
import { TopBar } from "@/components/editor/top-bar";
import { isSavedEditor, STORAGE_KEY, useEditor } from "@/lib/editor/store";
import { cn } from "@/lib/cn";

const ONBOARDING_KEY = "ziteo-onboarding-dismissed";

export function Editor() {
  const device = useEditor((s) => s.device);
  const zoom = useEditor((s) => s.zoom);
  const preview = useEditor((s) => s.preview);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(ONBOARDING_KEY) !== "1") {
        setShowOnboarding(true);
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    try {
      localStorage.setItem(ONBOARDING_KEY, "1");
    } catch {
      // Ignore storage errors
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isSavedEditor(parsed)) useEditor.getState().hydrate(parsed);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    let prevPages = useEditor.getState().pages;
    let prevPageId = useEditor.getState().pageId;
    let prevCart = useEditor.getState().cart;
    return useEditor.subscribe((state) => {
      if (state.pages === prevPages && state.pageId === prevPageId && state.cart === prevCart) {
        return;
      }
      prevPages = state.pages;
      prevPageId = state.pageId;
      prevCart = state.cart;
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ pages: state.pages, pageId: state.pageId, cart: state.cart }),
        );
        if (state.saveStatus !== "published" && state.saveStatus !== "publishing") {
          useEditor.getState().setSaveStatus(state.hasUnpublishedChanges ? "unpublished" : "draft_saved");
        }
      } catch {
        useEditor.getState().setSaveStatus("save_failed", "Could not save draft locally.");
      }
    });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) useEditor.getState().redo();
        else useEditor.getState().undo();
        return;
      }
      if (event.key === "Escape") {
        const state = useEditor.getState();
        state.closeSheet();
        state.closeCart();
        state.closeSearch();
        state.closePublish();
        state.setMenuOpen(false);
        state.deselect();
        if (state.preview) state.togglePreview(false);
        return;
      }
      if (typing) return;
      if (event.key === "1") useEditor.getState().setDevice("mobile");
      if (event.key === "2") useEditor.getState().setDevice("tablet");
      if (event.key === "3") useEditor.getState().setDevice("desktop");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const frame =
    device === "desktop" ? "frame-desktop" : device === "tablet" ? "frame-tablet" : "frame-mobile";

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-canvas text-ink">
      <TopBar />
      <div className="flex min-h-0 flex-1 overflow-hidden relative">
        {!preview && <PageSectionsSidebar />}
        {!preview && (
          <button
            type="button"
            aria-label="Sections"
            onClick={() => useEditor.getState().openSheet("arrange")}
            className="md:hidden fixed left-3 bottom-22 z-30 inline-flex h-11 items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/95 px-3.5 text-xs font-semibold text-ink shadow-lg backdrop-blur-md active:scale-95 cursor-pointer"
          >
            <span>Sections</span>
          </button>
        )}
        <main
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden md:overflow-auto"
          onClick={() => {
            if (!useEditor.getState().preview) useEditor.getState().deselect();
          }}
        >
          <div className="flex h-full min-h-full justify-center px-1 sm:px-3 py-1 sm:py-3">
            <div
              style={
                zoom !== 100 && zoom <= 100
                  ? {
                      width: Math.round((device === "desktop" ? 1152 : device === "tablet" ? 768 : 384) * (zoom / 100)),
                      height: "100%",
                    }
                  : { height: "100%" }
              }
              className="flex justify-center shrink-0"
            >
              <div
                className={cn("h-full shrink-0 device-frame", frame)}
                style={
                  zoom === 100
                    ? undefined
                    : { transform: `scale(${zoom / 100})`, transformOrigin: "top center" }
                }
                onClick={(event) => event.stopPropagation()}
              >
                <SiteFrame />
              </div>
            </div>
          </div>
        </main>
      </div>
      {!preview && showOnboarding && (
        <div className="pointer-events-none fixed inset-x-0 top-15 z-30 flex justify-center px-3">
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 rounded-full border border-slate-200/90 bg-white/95 px-3.5 py-1.5 text-xs text-slate-700 shadow-lg backdrop-blur-md">
            <span className="font-medium">
              1. Tap any section to style &nbsp;·&nbsp; 2. Reorder or add blocks &nbsp;·&nbsp; 3. Preview &amp; Publish
            </span>
            <button
              type="button"
              onClick={dismissOnboarding}
              className="rounded-full bg-[#53389E] px-2.5 py-0.5 text-[11px] font-semibold text-white hover:bg-purple-800 transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
      {!preview && <Dock />}
      <Sheet />
      <Overlays />
    </div>
  );
}

import { useEffect } from "react";
import { Dock } from "@/components/editor/dock";
import { Overlays } from "@/components/editor/overlays";
import { Sheet } from "@/components/editor/sheet";
import { SiteFrame } from "@/components/editor/site";
import { TopBar } from "@/components/editor/top-bar";
import { isSavedEditor, STORAGE_KEY, useEditor } from "@/lib/editor/store";
import { cn } from "@/lib/cn";

export function Editor() {
  const device = useEditor((s) => s.device);
  const zoom = useEditor((s) => s.zoom);
  const preview = useEditor((s) => s.preview);

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
    return useEditor.subscribe((state) => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ pages: state.pages, pageId: state.pageId, cart: state.cart }),
      );
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
      <main
        className="min-h-0 flex-1 overflow-auto"
        onClick={() => {
          if (!useEditor.getState().preview) useEditor.getState().deselect();
        }}
      >
        <div className="flex h-full min-h-full justify-center px-3 py-3">
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
      </main>
      {!preview && <Dock />}
      <Sheet />
      <Overlays />
    </div>
  );
}

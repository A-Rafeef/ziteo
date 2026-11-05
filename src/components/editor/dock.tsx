import {
  Droplet,
  Eye,
  Image,
  LayoutGrid,
  LayoutTemplate,
  Palette,
  Pencil,
  Pin,
  PlusCircle,
  SlidersHorizontal,
  Type,
} from "lucide-react";
import { selectedSection, useEditor } from "@/lib/editor/store";
import type { SheetKind } from "@/lib/editor/types";
import { cn } from "@/lib/cn";

interface DockItem {
  id: string;
  label: string;
  icon: typeof Palette;
  action: () => void;
}

export function Dock() {
  const section = useEditor((s) => selectedSection(s));

  const items: DockItem[] = (() => {
    const open = (sheet: SheetKind) => () => useEditor.getState().openSheet(sheet);
    if (!section) {
      return [
        { id: "template", label: "Template", icon: LayoutTemplate, action: open("themes") },
        { id: "add", label: "Add", icon: PlusCircle, action: open("add") },
        { id: "background", label: "Background", icon: Palette, action: open("page-color") },
        {
          id: "preview",
          label: "Preview",
          icon: Eye,
          action: () => useEditor.getState().togglePreview(true),
        },
      ];
    }
    switch (section.type) {
      case "navbar":
        return [
          { id: "template", label: "Template", icon: LayoutTemplate, action: open("navbar-style") },
          { id: "background", label: "Background", icon: Palette, action: open("section-color") },
          { id: "color", label: "Color", icon: Droplet, action: open("navbar-color") },
          { id: "sticky", label: "Sticky", icon: Pin, action: open("navbar-sticky") },
          { id: "elements", label: "Elements", icon: SlidersHorizontal, action: open("navbar-elements") },
        ];
      case "hero":
        return [
          { id: "template", label: "Template", icon: LayoutTemplate, action: open("hero-layout") },
        ];
      case "intro":
        return [
          { id: "template", label: "Template", icon: LayoutTemplate, action: open("intro-template") },
          { id: "edit", label: "Edit", icon: Pencil, action: open("intro-text") },
          { id: "accent", label: "Accent", icon: Palette, action: open("kicker-color") },
          { id: "color", label: "Color", icon: Palette, action: open("section-color") },
        ];
      case "grid":
        return [
          { id: "template", label: "Template", icon: LayoutTemplate, action: open("grid-layout") },
          { id: "items", label: "Items", icon: Pencil, action: open("grid-items") },
          { id: "color", label: "Color", icon: Palette, action: open("section-color") },
        ];
      case "catalog":
        return [
          { id: "template", label: "Template", icon: LayoutTemplate, action: open("catalog-template") },
          { id: "edit", label: "Edit", icon: Pencil, action: open("catalog-text") },
          { id: "color", label: "Color", icon: Palette, action: open("section-color") },
        ];
      case "product":
        return [
          { id: "template", label: "Template", icon: LayoutTemplate, action: open("product-template") },
          { id: "edit", label: "Edit", icon: Pencil, action: open("product-text") },
          { id: "color", label: "Color", icon: Palette, action: open("section-color") },
        ];
      case "footer":
        return [
          { id: "template", label: "Template", icon: LayoutTemplate, action: open("footer-style") },
          { id: "color", label: "Color", icon: Palette, action: open("section-color") },
        ];
      case "block":
        return [
          { id: "template", label: "Template", icon: LayoutTemplate, action: open("block-template") },
          { id: "edit", label: "Edit", icon: Pencil, action: open("block-text") },
          { id: "color", label: "Color", icon: Palette, action: open("section-color") },
        ];
      default:
        return [];
    }
  })();

  return (
    <div className="shrink-0 px-3 pt-2 pb-3">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-2">
        <div className="flex items-stretch justify-around rounded-3xl border border-line-soft bg-surface px-1 py-1 shadow-float">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                className={cn(
                  "tap-smooth flex h-14 min-w-12 sm:min-w-16 px-1 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-ink transition-all duration-150 hover:bg-fill hover:-translate-y-0.5 active:translate-y-0",
                )}
              >
                <Icon className="size-5 shrink-0" strokeWidth={1.5} />
                <span className="text-[11px] sm:text-xs font-medium text-muted truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import {
  ArrowUpDown,
  Compass,
  Eye,
  Film,
  Image,
  Layers,
  LayoutTemplate,
  Maximize2,
  MessageCircle,
  Palette,
  Pin,
  PlusCircle,
  RectangleHorizontal,
  SlidersHorizontal,
  Square,
  Tag,
  Type,
} from "lucide-react";
import { selectedSection, useEditor } from "@/lib/editor/store";
import { cn } from "@/lib/cn";
import type { SheetKind } from "@/lib/editor/types";

export function Dock() {
  const selectedId = useEditor((s) => s.selectedId);
  const section = useEditor((s) => selectedSection(s));

  const items = (() => {
    const open = (sheet: SheetKind) => () => useEditor.getState().openSheet(sheet);
    if (!selectedId || !section) {
      return [
        { id: "arrange", label: "Arrange", icon: ArrowUpDown, action: open("arrange") },
        { id: "add", label: "Add", icon: PlusCircle, action: open("add") },
        { id: "color", label: "Background", icon: Palette, action: open("page-color") },
        {
          id: "preview",
          label: "Preview",
          icon: Eye,
          action: () => useEditor.getState().togglePreview(),
        },
      ];
    }
    if (selectedId === "product-card") {
      return [
        { id: "box", label: "Card Frame", icon: Square, action: open("product-card-box") },
        { id: "image", label: "Image", icon: Image, action: open("product-card-image") },
        { id: "details", label: "Content", icon: Tag, action: open("product-card-details") },
        { id: "color", label: "Colors", icon: Palette, action: open("product-card-color") },
        { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, action: open("product-card-cta") },
      ];
    }
    switch (section.type) {
      case "navbar":
        return [
          { id: "template", label: "Template", icon: LayoutTemplate, action: open("navbar-style") },
          { id: "colors", label: "Colors", icon: Palette, action: open("navbar-color") },
          { id: "elements", label: "Elements", icon: SlidersHorizontal, action: open("navbar-elements") },
          { id: "layout", label: "Layout", icon: Maximize2, action: open("navbar-layout") },
          { id: "effects", label: "Effects", icon: Layers, action: open("navbar-effects") },
          { id: "fonts", label: "Fonts", icon: Type, action: open("navbar-typography") },
          { id: "links", label: "Links", icon: Compass, action: open("navbar-links") },
          { id: "sticky", label: "Sticky", icon: Pin, action: open("navbar-sticky") },
        ];
      case "hero":
        return [
          { id: "background", label: "Background", icon: Palette, action: open("hero-background") },
          { id: "ratio", label: "Ratio", icon: RectangleHorizontal, action: open("hero-ratio") },
          { id: "padding", label: "Padding", icon: SlidersHorizontal, action: open("hero-padding") },
          { id: "curve", label: "Curve", icon: Square, action: open("hero-radius") },
          { id: "animation", label: "Animation", icon: Film, action: open("hero-animation") },
          { id: "images", label: "Images", icon: Image, action: open("hero-media") },
        ];
      case "grid":
        return [
          { id: "template", label: "Template", icon: LayoutTemplate, action: open("grid-layout") },
          { id: "style", label: "Style", icon: SlidersHorizontal, action: open("product-card-style") },
          { id: "badges", label: "Badges", icon: Tag, action: open("product-card-badges") },
          { id: "color", label: "Color", icon: Palette, action: open("section-color") },
        ];
      case "product-card":
        return [
          { id: "box", label: "Card Frame", icon: Square, action: open("product-card-box") },
          { id: "image", label: "Image", icon: Image, action: open("product-card-image") },
          { id: "details", label: "Content", icon: Layers, action: open("product-card-details") },
          { id: "color", label: "Colors", icon: Palette, action: open("product-card-color") },
          { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, action: open("product-card-cta") },
        ];
      case "featured":
        return [
          { id: "template", label: "Template", icon: LayoutTemplate, action: open("featured-template") },
          { id: "style", label: "Card Style", icon: SlidersHorizontal, action: open("product-card-style") },
          { id: "badges", label: "Elements", icon: Tag, action: open("product-card-badges") },
          { id: "color", label: "Color", icon: Palette, action: open("section-color") },
        ];
      case "categories":
        return [
          { id: "template", label: "Template", icon: LayoutTemplate, action: open("categories-template") },
          { id: "color", label: "Color", icon: Palette, action: open("section-color") },
        ];
      case "brands":
        return [
          { id: "template", label: "Template", icon: LayoutTemplate, action: open("brands-template") },
          { id: "color", label: "Color", icon: Palette, action: open("section-color") },
        ];
      case "about":
        return [
          { id: "template", label: "Template", icon: LayoutTemplate, action: open("about-template") },
          { id: "color", label: "Color", icon: Palette, action: open("section-color") },
        ];
      case "filter-sort":
        return [
          { id: "filtersort", label: "Filter & Sort", icon: SlidersHorizontal, action: open("catalog-filter-sort") },
          { id: "color", label: "Color", icon: Palette, action: open("section-color") },
          { id: "arrange", label: "Arrange", icon: ArrowUpDown, action: open("arrange") },
        ];
      case "catalog":
        return [
          { id: "template", label: "Template", icon: LayoutTemplate, action: open("catalog-template") },
          { id: "style", label: "Style", icon: SlidersHorizontal, action: open("product-card-style") },
          { id: "badges", label: "Badges", icon: Tag, action: open("product-card-badges") },
          { id: "color", label: "Color", icon: Palette, action: open("section-color") },
        ];
      case "product":
        return [
          { id: "template", label: "Layout", icon: LayoutTemplate, action: open("product-template") },
          { id: "gallery", label: "Gallery", icon: RectangleHorizontal, action: open("product-gallery") },
          { id: "elements", label: "Elements", icon: SlidersHorizontal, action: open("product-elements") },
          { id: "cta", label: "WhatsApp", icon: MessageCircle, action: open("product-cta") },
          { id: "color", label: "Colors", icon: Palette, action: open("product-color") },
          { id: "typography", label: "Typography", icon: Type, action: open("product-typography") },
        ];
      case "footer":
        return [
          { id: "template", label: "Template", icon: LayoutTemplate, action: open("footer-style") },
          { id: "color", label: "Color", icon: Palette, action: open("section-color") },
        ];
      default:
        return [];
    }
  })();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none p-3 pb-safe">
      <div className="pointer-events-auto flex items-center justify-center max-w-full">
        <div className="flex items-center gap-1 sm:gap-1.5 rounded-3xl border border-slate-200/90 bg-surface/95 px-2 py-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl overflow-x-auto max-w-[calc(100vw-24px)] no-scrollbar">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                className={cn(
                  "tap-smooth flex h-14 min-w-14 sm:min-w-16 px-1.5 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl text-ink transition-all duration-150 hover:bg-fill hover:-translate-y-0.5 active:translate-y-0",
                )}
              >
                <Icon className="size-5 stroke-[1.75]" />
                <span className="text-[11px] font-medium leading-none whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

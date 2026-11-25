import {
  ArrowUpDown,
  ChevronLeft,
  Eye,
  Film,
  Image,
  Layers,
  LayoutTemplate,
  Link2,
  MessageCircle,
  Palette,
  Plus,
  PlusCircle,
  RectangleHorizontal,
  SlidersHorizontal,
  Square,
  Tag,
  Type,
} from "lucide-react";
import { selectedSection, useEditor } from "@/lib/editor/store";
import { HeaderEditor } from "@/components/editor/header-editor";
import { cn } from "@/lib/cn";
import type { SheetKind } from "@/lib/editor/types";

export function Dock() {
  const selectedId = useEditor((s) => s.selectedId);
  const section = useEditor((s) => selectedSection(s));

  if (section?.type === "navbar") {
    return <HeaderEditor section={section} />;
  }

  const items: { id: string; label: string; icon: typeof Image; thumb?: string; mobileOnly?: boolean; desktopOnly?: boolean; action: () => void }[] = (() => {
    const open = (sheet: SheetKind) => () => useEditor.getState().openSheet(sheet);
    if (!selectedId || !section) {
      return [
        { id: "add", label: "+ Add", icon: PlusCircle, action: () => useEditor.getState().openAddAt(null) },
        { id: "themes", label: "Template", icon: Layers, action: open("themes") },
        { id: "color", label: "Page settings", icon: Palette, action: open("page-color") },
      ];
    }
    if (selectedId === "product-card") {
      // Order: show price, badge & WhatsApp toggles -> image shape -> text layout -> colors -> border & corners
      return [
        { id: "badges", label: "Visibility", icon: Tag, action: open("product-card-badges") },
        { id: "image", label: "Image shape", icon: Image, action: open("product-card-image") },
        { id: "details", label: "Text layout", icon: Layers, action: open("product-card-details") },
        { id: "color", label: "Colors", icon: Palette, action: open("product-card-color") },
        { id: "box", label: "Corners & border", icon: Square, action: open("product-card-box") },
      ];
    }
    switch (section.type) {
      case "hero": {
        const currentThumb = section.slides[section.active] ?? section.slides[0];
        const heroItems: { id: string; label: string; icon: typeof Image; thumb?: string; action: () => void }[] = [
          {
            id: "replace-image",
            label: "Replace image",
            icon: Image,
            thumb: currentThumb,
            action: open("hero-media"),
          },
          { id: "link", label: "Link", icon: Link2, action: open("hero-link") },
          { id: "appearance", label: "Appearance", icon: SlidersHorizontal, action: open("hero-appearance") },
        ];
        if (section.slides.length > 1) {
          heroItems.push({ id: "slideshow", label: "Slideshow", icon: Film, action: open("hero-animation") });
        }
        return heroItems;
      }
      case "grid":
        return [
          { id: "template", label: "Layout", icon: LayoutTemplate, action: open("grid-layout") },
          { id: "style", label: "Shared card style", icon: SlidersHorizontal, action: open("product-card-style") },
          { id: "badges", label: "Toggles", icon: Tag, action: open("product-card-badges") },
          { id: "color", label: "Appearance", icon: Palette, action: open("section-color") },
        ];
      case "product-card":
        return [
          { id: "badges", label: "Visibility", icon: Tag, action: open("product-card-badges") },
          { id: "image", label: "Image shape", icon: Image, action: open("product-card-image") },
          { id: "details", label: "Text layout", icon: Layers, action: open("product-card-details") },
          { id: "color", label: "Colors", icon: Palette, action: open("product-card-color") },
          { id: "box", label: "Corners & border", icon: Square, action: open("product-card-box") },
        ];
      case "featured":
        // Order: choose products -> heading -> quantity -> layout -> shared card style -> appearance
        return [
          { id: "template", label: "Content & Layout", icon: LayoutTemplate, action: open("featured-template") },
          { id: "style", label: "Shared card style", icon: SlidersHorizontal, action: open("product-card-style") },
          { id: "color", label: "Appearance", icon: Palette, action: open("section-color") },
        ];
      case "categories":
        return [
          { id: "template", label: "Items & Layout", icon: LayoutTemplate, action: open("categories-template") },
          { id: "color", label: "Appearance", icon: Palette, action: open("section-color") },
        ];
      case "brands":
        return [
          { id: "items", label: "Items & Reorder", icon: Tag, action: open("brands-items") },
          { id: "template", label: "Layout", icon: LayoutTemplate, action: open("brands-template") },
          { id: "style", label: "Appearance", icon: SlidersHorizontal, action: open("brands-style") },
          { id: "color", label: "Background", icon: Palette, action: open("section-color") },
        ];
      case "about":
        return [
          { id: "template", label: "Text & Layout", icon: LayoutTemplate, action: open("about-template") },
          { id: "color", label: "Appearance", icon: Palette, action: open("section-color") },
        ];
      case "filter-sort":
        return [
          { id: "filtersort", label: "Filters & Sort", icon: SlidersHorizontal, action: open("catalog-filter-sort") },
          { id: "color", label: "Appearance", icon: Palette, action: open("section-color") },
          { id: "arrange", label: "Arrange", icon: ArrowUpDown, action: open("arrange") },
        ];
      case "catalog":
        return [
          { id: "template", label: "Grid & Layout", icon: LayoutTemplate, action: open("catalog-template") },
          { id: "filtersort", label: "Filters & Sort", icon: SlidersHorizontal, action: open("catalog-filter-sort") },
          { id: "style", label: "Shared card style", icon: Tag, action: open("product-card-style") },
          { id: "color", label: "Appearance", icon: Palette, action: open("section-color") },
        ];
      case "product": {
        return [
          { id: "elements", label: "Display", icon: SlidersHorizontal, action: open("product-elements") },
          { id: "gallery", label: "Gallery", icon: RectangleHorizontal, action: open("product-gallery") },
          { id: "cta", label: "Order button", icon: MessageCircle, action: open("product-cta") },
          { id: "template", label: "Appearance", icon: LayoutTemplate, action: open("product-template") },
          { id: "color", label: "Colors", icon: Palette, action: open("product-color") },
          { id: "typography", label: "Typography", icon: Type, action: open("product-typography") },
        ];
      }
      case "footer":
        return [
          { id: "template", label: "Details & Layout", icon: LayoutTemplate, action: open("footer-style") },
          { id: "color", label: "Appearance", icon: Palette, action: open("section-color") },
        ];
      default:
        return [];
    }
  })();

  const activeSectionLabel =
    selectedId === "product-card"
      ? "Product Card"
      : section
        ? section.name
        : null;

  return (
    <div
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none px-3 pt-2"
    >
      <div className="pointer-events-auto flex flex-col items-center gap-1.5 max-w-full">
        {activeSectionLabel && (
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-surface/95 px-2.5 py-1 text-xs font-semibold text-ink shadow-md backdrop-blur-xl">
            <button
              type="button"
              onClick={() => useEditor.getState().deselect()}
              aria-label="Back to sections"
              className="inline-flex min-h-8 items-center gap-0.5 rounded-full pr-1.5 text-muted hover:text-ink cursor-pointer"
            >
              <ChevronLeft className="size-3.5" />
              <span>Back</span>
            </button>
            <span className="h-3 w-px bg-line-soft" />
            <span className="max-w-44 truncate">{activeSectionLabel}</span>
          </div>
        )}
        <div className="flex items-center gap-1 sm:gap-1.5 rounded-3xl border border-slate-200/90 bg-surface/95 px-2 py-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl overflow-x-auto max-w-[calc(100vw-24px)] no-scrollbar">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                className={cn(
                  "tap-smooth flex h-12 sm:h-14 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl text-ink transition-all duration-150 hover:bg-fill hover:-translate-y-0.5 active:translate-y-0 cursor-pointer",
                  item.thumb ? "px-2.5 min-w-20" : "px-3 min-w-16",
                )}
              >
                {item.thumb ? (
                  <img
                    src={item.thumb}
                    alt=""
                    className="h-5 w-8 rounded-md object-cover border border-line-soft shadow-2xs"
                  />
                ) : (
                  <Icon className="size-5 stroke-[1.75]" />
                )}
                <span className="text-[11px] font-medium leading-none whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

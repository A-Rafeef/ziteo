import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  GripVertical,
  Image,
  Layers,
  LayoutGrid,
  Menu,
  PanelBottom,
  PanelTop,
  Pin,
  Plus,
  Search,
  Shield,
  ShoppingBag,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { HERO_PHOTOS, PAGE_COLORS, TEXT_COLORS, isDark } from "@/lib/editor/defaults";
import { selectedSection, useEditor } from "@/lib/editor/store";
import { cn } from "@/lib/cn";
import type {
  CatalogFilterConfig,
  CatalogLayoutConfig,
  CatalogSection,
  FilterSortSection,
  CatalogSortConfig,
  CatalogSortOption,
  HeroAnimation,
  HeroPadding,
  HeroRatio,
  HeroSection,
  HeroWidth,
  NavbarLink,
  NavbarSection,
  NavbarTemplate,
  ProductCardDetailsLayout,
  ProductCardShadow,
  ProductCardTextAlign,
  ProductImageRatio,
  ProductSection,
  ProductTypography,
  Section,
  SheetKind,
} from "@/lib/editor/types";
import { Field, PrimaryButton, TextArea, TextInput } from "@/components/editor/ui";

const TITLES: Record<SheetKind, { title: string; subtitle: string }> = {
  arrange: { title: "Arrange Sections", subtitle: "Drag & drop or use arrows to reorder sections. Header is fixed at top." },
  themes: { title: "Template", subtitle: "" },
  add: { title: "Add section", subtitle: "Place it above the footer." },
  "page-color": { title: "Background", subtitle: "The canvas behind every section." },
  "navbar-style": { title: "Template", subtitle: "" },
  "navbar-name": { title: "Name", subtitle: "Used in the bar and the footer." },
  "navbar-color": { title: "Colors", subtitle: "Background, text & icon colors." },
  "navbar-sticky": { title: "Sticky header", subtitle: "Pin header to top while scrolling." },
  "navbar-elements": { title: "Elements", subtitle: "Toggle brand, menu, search & icons." },
  "navbar-layout": { title: "Layout", subtitle: "Full-width or floating pill, height & radius." },
  "navbar-effects": { title: "Effects", subtitle: "Border styles, shadows & frosted blur." },
  "navbar-typography": { title: "Typography", subtitle: "Font size, weight, spacing & casing." },
  "navbar-links": { title: "Links", subtitle: "Manage store navigation menu items." },
  "navbar-more": { title: "Edit More", subtitle: "Layout, borders, typography & behavior." },
  "hero-width": { title: "Banner Width", subtitle: "Full-width or spaced margins." },
  "hero-background": { title: "Background", subtitle: "Color behind banner (default transparent)." },
  "hero-ratio": { title: "Aspect Ratio", subtitle: "Image height & proportions." },
  "hero-padding": { title: "Padding", subtitle: "Vertical and side spacing." },
  "hero-radius": { title: "Corner Curve", subtitle: "Corner rounding & curvature." },
  "hero-animation": { title: "Animation", subtitle: "Slide transitions & autoplay." },
  "hero-media": { title: "Banner Images", subtitle: "Manage hero slides in Dashboard." },
  "hero-layout": { title: "Template", subtitle: "" },
  "hero-photo": { title: "Photo", subtitle: "Replaces the current slide." },
  "hero-text": { title: "Hero text", subtitle: "The line under the photograph." },
  "grid-layout": { title: "Template", subtitle: "" },
  "grid-items": { title: "Items", subtitle: "" },
  "catalog-template": { title: "Template", subtitle: "" },
  "catalog-filter-sort": { title: "Filter & Sort", subtitle: "Configure customer sorting & filter controls." },
  "catalog-text": { title: "Catalog", subtitle: "" },
  "product-template": { title: "Product Layout", subtitle: "Stacked, split or editorial grid." },
  "product-gallery": { title: "Gallery & Ratio", subtitle: "Aspect ratio, radius & thumbnails." },
  "product-elements": { title: "Elements", subtitle: "Toggle badges, ratings, colors & sizes." },
  "product-cta": { title: "WhatsApp CTA", subtitle: "Phone number, button text & styling." },
  "product-color": { title: "Product Colors", subtitle: "Background & price styling." },
  "product-typography": { title: "Typography", subtitle: "Title sizing & font weights." },
  "product-text": { title: "Product", subtitle: "" },
  "footer-style": { title: "Template", subtitle: "" },
  "section-color": { title: "Color", subtitle: "Background of this section." },
  "product-card-box": { title: "Card Frame", subtitle: "Borders, shadows, curves & card background." },
  "product-card-image": { title: "Image Style", subtitle: "Full-width vs inset, image curves & ratio." },
  "product-card-details": { title: "Card Content", subtitle: "Layout, alignment, badges & buttons." },
  "product-card-style": { title: "Card Style", subtitle: "Image aspect ratio, corner curve & typography." },
  "product-card-badges": { title: "Card Elements", subtitle: "Toggle badges, price, and WhatsApp button." },
  "product-card-color": { title: "Card Colors", subtitle: "Price color and WhatsApp button styling." },
  "product-card-cta": { title: "WhatsApp & Currency", subtitle: "Seller WhatsApp number and store currency." },
  "categories-template": { title: "Template", subtitle: "" },
  "brands-template": { title: "Template", subtitle: "" },
  "about-template": { title: "Template", subtitle: "" },
  "featured-template": { title: "Template", subtitle: "" },
};

export function Sheet() {
  const sheet = useEditor((s) => s.sheet);
  if (!sheet) return null;
  const meta = TITLES[sheet];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      <button
        type="button"
        aria-label="Close"
        className="animate-fade-in pointer-events-auto absolute inset-0 bg-transparent transition-opacity"
        onClick={() => useEditor.getState().closeSheet()}
      />
      <div className="animate-slide-up sheet-max pointer-events-auto relative flex w-full max-w-lg flex-col overflow-hidden rounded-t-4xl border-t border-slate-200/90 bg-surface shadow-[0_-14px_45px_rgba(0,0,0,0.18)]">
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-line" />
        </div>
        <div className="flex items-start justify-between px-5 py-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight">{meta.title}</h2>
            {meta.subtitle ? <p className="text-xs text-muted">{meta.subtitle}</p> : null}
          </div>
          <button
            type="button"
            aria-label="Close panel"
            onClick={() => useEditor.getState().closeSheet()}
            className="tap-smooth inline-flex size-11 items-center justify-center rounded-full bg-fill text-ink hover:bg-line-soft transition-colors"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
          <SheetBody kind={sheet} />
        </div>
      </div>
    </div>
  );
}

function SheetBody({ kind }: { kind: SheetKind }) {
  const section = useEditor((s) => selectedSection(s));
  switch (kind) {
    case "arrange":
      return <ArrangeSectionsSheet />;
    case "themes":
      return <Themes />;
    case "add":
      return <AddList />;
    case "page-color":
    case "section-color":
      return <ColorList target={kind} />;
    case "navbar-style":
      return section?.type === "navbar" ? <NavbarStyles sec={section} /> : null;
    case "navbar-name":
      return section?.type === "navbar" ? <NameForm logo={section.logo} text={section.text} /> : null;
    case "navbar-color":
      return section?.type === "navbar" ? <NavbarColor sec={section} /> : null;
    case "navbar-sticky":
      return section?.type === "navbar" ? <NavbarSticky current={section.sticky ?? true} /> : null;
    case "navbar-elements":
      return section?.type === "navbar" ? <NavbarElements sec={section} /> : null;
    case "navbar-layout":
      return section?.type === "navbar" ? <NavbarLayout sec={section} /> : null;
    case "navbar-effects":
      return section?.type === "navbar" ? <NavbarEffects sec={section} /> : null;
    case "navbar-typography":
      return section?.type === "navbar" ? <NavbarTypography sec={section} /> : null;
    case "navbar-links":
      return section?.type === "navbar" ? <NavbarLinks sec={section} /> : null;
    case "navbar-more":
      return section?.type === "navbar" ? <NavbarMore sec={section} /> : null;
    case "hero-width":
      return section?.type === "hero" ? <HeroWidthSheet hero={section} /> : null;
    case "hero-background":
      return section?.type === "hero" ? <HeroBackgroundSheet hero={section} /> : null;
    case "hero-ratio":
      return section?.type === "hero" ? <HeroRatioSheet hero={section} /> : null;
    case "hero-padding":
      return section?.type === "hero" ? <HeroPaddingSheet hero={section} /> : null;
    case "hero-radius":
      return section?.type === "hero" ? <HeroRadiusSheet hero={section} /> : null;
    case "hero-animation":
      return section?.type === "hero" ? <HeroAnimationSheet hero={section} /> : null;
    case "hero-media":
      return section?.type === "hero" ? <HeroMediaSheet /> : null;
    case "hero-layout":
      return section?.type === "hero" ? <HeroLayouts hero={section} /> : null;
    case "hero-photo":
      return section?.type === "hero" ? <HeroPhotos hero={section} /> : null;
    case "hero-text":
      return section?.type === "hero" ? <HeroText hero={section} /> : null;
    case "grid-layout":
      return section?.type === "grid" ? <GridLayouts current={section.template} /> : null;
    case "catalog-template":
      return section?.type === "catalog" ? <CatalogTemplate current={section.template} /> : null;
    case "catalog-filter-sort":
      return section?.type === "filter-sort" || section?.type === "catalog"
        ? <CatalogFilterSortSheet sec={section as FilterSortSection | CatalogSection} />
        : null;
    case "product-template":
      return section?.type === "product" ? <ProductTemplate current={section.template} /> : null;
    case "product-gallery":
      return section?.type === "product" ? <ProductGallerySheet sec={section} /> : null;
    case "product-elements":
      return section?.type === "product" ? <ProductElementsSheet sec={section} /> : null;
    case "product-cta":
      return section?.type === "product" ? <ProductCtaSheet sec={section} /> : null;
    case "product-color":
      return section?.type === "product" ? <ProductColorSheet sec={section} /> : null;
    case "product-typography":
      return section?.type === "product" ? <ProductTypographySheet sec={section} /> : null;
    case "product-card-box":
      return <ProductCardBoxSheet />;
    case "product-card-image":
      return <ProductCardImageSheet />;
    case "product-card-details":
      return <ProductCardDetailsSheet />;
    case "product-card-style":
      return <ProductCardStyle />;
    case "product-card-badges":
      return <ProductCardBadges />;
    case "product-card-color":
      return <ProductCardColor />;
    case "product-card-cta":
      return <ProductCardCta />;
    case "categories-template":
      return section?.type === "categories" ? <CategoriesTemplate current={section.template} /> : null;
    case "brands-template":
      return section?.type === "brands" ? <BrandsTemplate current={section.template} /> : null;
    case "about-template":
      return section?.type === "about" ? <AboutTemplate current={section.template} /> : null;
    case "featured-template":
      return section?.type === "featured" ? <FeaturedTemplate current={section.template} /> : null;
    case "footer-style":
      return section?.type === "footer" ? (
        <FooterStyles current={section.template} text={section.text} />
      ) : null;
    default:
      return null;
  }
}

function TemplateCard({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "tap-smooth flex w-full items-center gap-3.5 rounded-2xl border p-3 text-left transition-all duration-200 active:scale-[0.99]",
        active
          ? "border-[#53389E] bg-[#EEF2FF]/60 shadow-xs ring-2 ring-[#53389E]/25"
          : "border-line-soft bg-surface hover:bg-fill/70 hover:border-line"
      )}
    >
      <div className="flex-1 min-w-0">{children}</div>
      <div className="pr-1.5 shrink-0">
        {active ? (
          <div className="flex size-6 items-center justify-center rounded-full bg-[#53389E] text-white shadow-xs">
            <Check className="size-3.5 stroke-[2.5]" />
          </div>
        ) : (
          <div className="size-6 rounded-full border-2 border-slate-300/80" />
        )}
      </div>
    </button>
  );
}

function ArrangeSectionsSheet() {
  const page = useEditor((s) => s.pages[s.pageId]);
  const selectedId = useEditor((s) => s.selectedId);
  const sections = page?.sections || [];

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const touchActiveId = useRef<string | null>(null);
  const touchOverIndex = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const getSectionMeta = (sec: Section) => {
    switch (sec.type) {
      case "navbar":
        return { label: "Header (Navigation)", desc: "Logo, search, menu & bag", icon: PanelTop };
      case "hero":
        return { label: "Hero Banner", desc: "Main hero showcase & slides", icon: Image };
      case "grid":
        return { label: "Product Grid", desc: "Mosaic or editorial product layout", icon: LayoutGrid };
      case "filter-sort":
        return { label: "Filter & Sort Grid", desc: "Customer sorting & faceted filters", icon: SlidersHorizontal };
      case "catalog":
        return { label: "Catalog Grid", desc: "Product catalog grid", icon: ShoppingBag };
      case "featured":
        return { label: sec.title || "Featured Products", desc: "Curated product recommendations", icon: Sparkles };
      case "categories":
        return { label: sec.title || "Categories", desc: "Category cards and shortcuts", icon: Tag };
      case "brands":
        return { label: sec.title || "Brands Showcase", desc: "Partner brands and logos", icon: Sparkles };
      case "about":
        return { label: sec.title || "Trust & Guarantees", desc: "Store guarantees and story", icon: Shield };
      case "product":
        return { label: "Product Details", desc: "Hero view, gallery & buy CTA", icon: ShoppingBag };
      case "footer":
        return { label: "Footer", desc: "Store brand, copyright & links", icon: PanelBottom };
      default:
        return { label: "Store Section", desc: "Storefront section", icon: Layers };
    }
  };

  const hasFooter = sections.length > 0 && sections[sections.length - 1].type === "footer";
  const lastMoveableIndex = hasFooter ? sections.length - 2 : sections.length - 1;

  // Touch Drag Handlers (for mobile/tablet touch screens)
  const handleTouchStart = (secId: string, startIndex: number, e: React.TouchEvent) => {
    e.stopPropagation();
    touchActiveId.current = secId;
    touchOverIndex.current = startIndex;
    touchStartY.current = e.touches[0].clientY;
    setDraggingId(secId);
    setDragOverIndex(startIndex);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchActiveId.current) return;
    e.stopPropagation();
    const touch = e.touches[0];
    if (!touch) return;
    const clientY = touch.clientY;

    // Scan through registered DOM elements
    for (const el of itemRefs.current.values()) {
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (clientY >= rect.top && clientY <= rect.bottom) {
        const targetIdx = Number(el.getAttribute("data-index"));
        if (!isNaN(targetIdx) && targetIdx >= 1 && targetIdx <= lastMoveableIndex) {
          touchOverIndex.current = targetIdx;
          setDragOverIndex(targetIdx);
        }
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    const activeId = touchActiveId.current;
    const targetIdx = touchOverIndex.current;
    if (activeId && targetIdx !== null && targetIdx >= 1 && targetIdx <= lastMoveableIndex) {
      useEditor.getState().reorderSection(activeId, targetIdx);
    }
    touchActiveId.current = null;
    touchOverIndex.current = null;
    touchStartY.current = null;
    setDraggingId(null);
    setDragOverIndex(null);
  };

  const handleTouchCancel = (e: React.TouchEvent) => {
    e.stopPropagation();
    touchActiveId.current = null;
    touchOverIndex.current = null;
    touchStartY.current = null;
    setDraggingId(null);
    setDragOverIndex(null);
  };

  // HTML5 Drag & Drop (for desktop mouse)
  const handleDragStart = (secId: string, e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", secId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(secId);
  };

  const handleDragOver = (idx: number, isFixed: boolean, e: React.DragEvent) => {
    e.preventDefault();
    if (isFixed || idx < 1 || idx > lastMoveableIndex) return;
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(idx);
  };

  const handleDrop = (targetIdx: number, isFixed: boolean, e: React.DragEvent) => {
    e.preventDefault();
    const srcId = e.dataTransfer.getData("text/plain") || draggingId;
    if (srcId && !isFixed && targetIdx >= 1 && targetIdx <= lastMoveableIndex) {
      useEditor.getState().reorderSection(srcId, targetIdx);
    }
    setDraggingId(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverIndex(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Information Header Pill */}
      <div className="flex items-center gap-2 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/80 dark:bg-purple-950/40 p-3 text-xs text-purple-900 dark:text-purple-200 shadow-2xs">
        <Pin className="size-4 text-purple-600 shrink-0" />
        <span className="leading-snug">
          <strong>Header is fixed</strong> at the top. Drag the handle (⋮⋮) or use the up/down arrows to arrange sections.
        </span>
      </div>

      {/* Sections List */}
      <div className="flex flex-col gap-2">
        {sections.map((sec, index) => {
          const meta = getSectionMeta(sec);
          const Icon = meta.icon;
          const isHeader = sec.type === "navbar";
          const isFooter = sec.type === "footer";
          const isFixed = isHeader || isFooter;
          const canMoveUp = !isFixed && index > 1;
          const canMoveDown = !isFixed && index < lastMoveableIndex;
          const isSelected = selectedId === sec.id;
          const isBeingDragged = draggingId === sec.id;
          const isDropTarget = !isFixed && dragOverIndex === index && draggingId !== null && draggingId !== sec.id;

          return (
            <div
              key={sec.id}
              ref={(el) => {
                if (el) itemRefs.current.set(sec.id, el);
                else itemRefs.current.delete(sec.id);
              }}
              data-index={index}
              data-arrange-item={sec.id}
              draggable={!isFixed}
              onDragStart={(e) => !isFixed && handleDragStart(sec.id, e)}
              onDragOver={(e) => handleDragOver(index, isFixed, e)}
              onDrop={(e) => handleDrop(index, isFixed, e)}
              onDragEnd={handleDragEnd}
              onClick={() => {
                if (!isFixed && !draggingId) {
                  useEditor.getState().select(sec.id);
                }
              }}
              className={cn(
                "group relative flex items-center justify-between gap-2.5 rounded-2xl border p-3 sm:p-3.5 transition-all select-none",
                isBeingDragged
                  ? "opacity-50 scale-[0.98] border-purple-500 bg-purple-50/70 dark:bg-purple-950/70 shadow-md ring-2 ring-purple-500/50"
                  : isDropTarget
                    ? "border-purple-600 bg-purple-100/60 dark:bg-purple-900/50 shadow-md ring-2 ring-purple-500"
                    : isHeader
                      ? "border-purple-300 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/30 shadow-2xs"
                      : isFooter
                        ? "border-slate-300/80 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40"
                        : isSelected
                          ? "border-purple-600 bg-purple-50/60 dark:bg-purple-950/50 shadow-xs ring-1 ring-purple-500"
                          : "border-line-soft bg-surface hover:border-slate-300 dark:hover:border-slate-700 hover:bg-fill/40 shadow-2xs"
              )}
            >
              {/* Left Side: Drag Handle + Index Badge + Icon + Label */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {/* Drag Handle or Fixed Pin */}
                {!isFixed ? (
                  <div
                    role="button"
                    tabIndex={0}
                    title="Drag to reorder"
                    aria-label={`Drag ${meta.label} to reorder`}
                    onTouchStart={(e) => handleTouchStart(sec.id, index, e)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchCancel}
                    className="tap-smooth flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-100/80 dark:hover:bg-purple-900/60 cursor-grab active:cursor-grabbing touch-none select-none transition-colors"
                  >
                    <GripVertical className="size-4.5" />
                  </div>
                ) : (
                  <div className="flex size-8 shrink-0 items-center justify-center text-slate-300 dark:text-slate-600">
                    <Pin className="size-3.5" />
                  </div>
                )}

                {/* Index Pill */}
                <span
                  className={cn(
                    "flex size-6 sm:size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                    isHeader
                      ? "bg-purple-600 text-white"
                      : isFooter
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  )}
                >
                  {index + 1}
                </span>

                {/* Section Icon */}
                <div className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <Icon className="size-4 sm:size-4.5" />
                </div>

                {/* Label & Description */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-semibold text-ink truncate">{meta.label}</h4>
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted truncate">{meta.desc}</p>
                </div>
              </div>

              {/* Right Side: Fixed Badges or Move Buttons */}
              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                {isHeader ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 dark:border-purple-800 bg-purple-100/70 dark:bg-purple-900/60 px-2 sm:px-2.5 py-1 text-[9px] sm:text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider shadow-2xs">
                    <Pin className="size-3" />
                    <span>Fixed Top</span>
                  </span>
                ) : isFooter ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-200/70 dark:bg-slate-800 px-2 sm:px-2.5 py-1 text-[9px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider shadow-2xs">
                    <Pin className="size-3" />
                    <span>Fixed Bottom</span>
                  </span>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={!canMoveUp}
                      onClick={() => useEditor.getState().moveSection(sec.id, -1)}
                      title="Move section up"
                      aria-label={`Move ${meta.label} up`}
                      className={cn(
                        "tap-smooth flex size-7 sm:size-8 items-center justify-center rounded-lg border transition-all",
                        !canMoveUp
                          ? "border-transparent text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-30"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 shadow-2xs cursor-pointer active:scale-90"
                      )}
                    >
                      <ChevronUp className="size-4" strokeWidth={2.5} />
                    </button>

                    <button
                      type="button"
                      disabled={!canMoveDown}
                      onClick={() => useEditor.getState().moveSection(sec.id, 1)}
                      title="Move section down"
                      aria-label={`Move ${meta.label} down`}
                      className={cn(
                        "tap-smooth flex size-7 sm:size-8 items-center justify-center rounded-lg border transition-all",
                        !canMoveDown
                          ? "border-transparent text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-30"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 shadow-2xs cursor-pointer active:scale-90"
                      )}
                    >
                      <ChevronDown className="size-4" strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Themes() {
  const currentTheme = useEditor((s) => (s.pages.home.background === "#0b0b0d" ? "ink" : "light"));
  return (
    <div className="flex flex-col gap-3">
      <TemplateCard
        active={currentTheme === "light"}
        onClick={() => useEditor.getState().applyTheme("light")}
      >
        <div className="overflow-hidden rounded-xl border border-line-soft bg-surface p-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold tracking-widest text-slate-800">
            ZITEO
          </div>
          <div className="mt-1.5 h-10 rounded-md bg-slate-100" />
          <div className="mt-2 h-2 w-2/3 rounded-full bg-slate-200" />
        </div>
      </TemplateCard>
      <TemplateCard
        active={currentTheme === "ink"}
        onClick={() => useEditor.getState().applyTheme("ink")}
      >
        <div className="overflow-hidden rounded-xl bg-ink p-2 text-on-ink shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold tracking-widest text-white">
            ZITEO
          </div>
          <div className="mt-1.5 h-10 rounded-md bg-white/10" />
          <div className="mt-2 h-2 w-2/3 rounded-full bg-white/20" />
        </div>
      </TemplateCard>
    </div>
  );
}

function AddList() {
  const pageId = useEditor((s) => s.pageId);

  type AddItem = {
    kind: "hero" | "featured" | "categories" | "brands" | "about" | "catalog" | "product";
    title: string;
    desc: string;
    badge?: string;
  };

  const homeItems: AddItem[] = [
    { kind: "hero", title: "Hero Banner", desc: "High-impact visual banner with photo & headline." },
    { kind: "categories", title: "Categories", desc: "Visual navigation tiles for product categories." },
    { kind: "featured", title: "Featured Products", desc: "Curated drops with direct WhatsApp checkout.", badge: "POPULAR" },
    { kind: "brands", title: "Brands", desc: "Authorized partner brands and logos." },
  ];

  const shopItems: AddItem[] = [
    { kind: "catalog", title: "Catalog Grid", desc: "Full product catalog with category filter & search.", badge: "CORE" },
  ];

  const productItems: AddItem[] = [
    { kind: "product", title: "Product Details", desc: "Main product view with gallery & WhatsApp checkout.", badge: "CORE" },
    { kind: "featured", title: "Related Products", desc: "You May Also Like - curated recommendations." },
    { kind: "about", title: "Trust & Guarantees", desc: "100% authentic, fast delivery & warranty guarantees." },
  ];

  const items = pageId === "home" ? homeItems : pageId === "shop" ? shopItems : productItems;
  const pageLabel = pageId === "home" ? "Home Page" : pageId === "shop" ? "Shop Page" : "Product Page";

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between pb-1 px-1">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider">
          Sections for {pageLabel}
        </span>
        <span className="text-[11px] font-medium text-accent">
          {items.length} available
        </span>
      </div>
      {items.map((item) => (
        <button
          key={item.kind}
          type="button"
          onClick={() => {
            useEditor.getState().insertSection(item.kind);
            useEditor.getState().closeSheet();
          }}
          className="tap-smooth flex w-full items-center justify-between rounded-2xl border border-line-soft bg-surface p-3.5 text-left hover:bg-fill/70 transition-all hover:border-line group"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink group-hover:text-accent transition-colors">{item.title}</span>
              {item.badge && (
                <span className="rounded-md bg-purple-500/15 px-1.5 py-0.5 text-[9px] font-bold text-purple-700 uppercase">
                  {item.badge}
                </span>
              )}
            </div>
            <div className="text-xs text-muted mt-0.5">{item.desc}</div>
          </div>
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-fill text-ink group-hover:bg-accent group-hover:text-white transition-all">
            +
          </div>
        </button>
      ))}
    </div>
  );
}

function ColorList({ target }: { target: "page-color" | "section-color" }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {PAGE_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => {
            if (target === "page-color") useEditor.getState().setPageColor(color.value);
            else useEditor.getState().patchSelected({ background: color.value });
          }}
          className="tap-smooth group flex flex-col items-center gap-2"
        >
          <span
            className="size-11 rounded-full border border-line shadow-xs transition-transform duration-200 group-hover:scale-110"
            style={{ background: color.value }}
          />
          <span className="text-xs text-muted group-hover:text-ink transition-colors">{color.name}</span>
        </button>
      ))}
    </div>
  );
}

function TextSwatches({ onPick }: { onPick: (value: string) => void }) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-medium text-muted">Text</p>
      <div className="flex gap-2">
        {TEXT_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            aria-label={color.name}
            onClick={() => onPick(color.value)}
            className="size-11 rounded-full border border-line"
            style={{ background: color.value }}
          />
        ))}
      </div>
    </div>
  );
}

const NAV_STYLES: NavbarTemplate[] = ["centered", "left", "minimal", "float", "expanded"];

function NavbarStyles({ sec }: { sec: NavbarSection }) {
  const current = sec.template;
  const count = useEditor((s) => s.cart.reduce((sum, item) => sum + item.qty, 0));
  const logo = sec.logo || "STORE";
  const iconColor = sec.iconColor || sec.text;

  const renderPreview = (id: NavbarTemplate) => {
    if (id === "minimal") {
      return (
        <div
          className="flex items-center justify-between rounded-xl border border-line-soft/80 px-3 py-2.5 text-xs shadow-2xs"
          style={{ background: sec.background, color: sec.text }}
        >
          <div className="font-bold tracking-widest text-[11px] uppercase truncate pr-2">
            {logo}
          </div>
          <div className="flex items-center gap-1 shrink-0" style={{ color: iconColor }}>
            <ShoppingBag className="size-3.5" strokeWidth={1.75} />
            <span className="text-[10px] font-semibold">{count}</span>
          </div>
        </div>
      );
    }

    if (id === "float") {
      return (
        <div className="rounded-xl border border-line-soft/50 bg-fill/40 p-1.5">
          <div
            className="relative flex items-center justify-between rounded-full border border-line-soft px-3 py-1.5 text-xs shadow-xs"
            style={{ background: sec.background, color: sec.text }}
          >
            <Menu className="size-3.5 shrink-0 opacity-80" strokeWidth={1.75} style={{ color: iconColor }} />
            <div className="font-bold tracking-widest text-[11px] uppercase truncate px-2">
              {logo}
            </div>
            <div className="flex items-center gap-1.5 shrink-0" style={{ color: iconColor }}>
              <Search className="size-3.5" strokeWidth={1.75} />
              <div className="flex items-center gap-0.5">
                <ShoppingBag className="size-3.5" strokeWidth={1.75} />
                <span className="text-[10px] font-semibold">{count}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (id === "left") {
      return (
        <div
          className="flex items-center justify-between rounded-xl border border-line-soft/80 px-3 py-2 text-xs shadow-2xs"
          style={{ background: sec.background, color: sec.text }}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <Menu className="size-3.5 shrink-0 opacity-80" strokeWidth={1.75} style={{ color: iconColor }} />
            <div className="font-bold tracking-widest text-[11px] uppercase truncate">
              {logo}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0" style={{ color: iconColor }}>
            <Search className="size-3.5" strokeWidth={1.75} />
            <div className="flex items-center gap-0.5">
              <ShoppingBag className="size-3.5" strokeWidth={1.75} />
              <span className="text-[10px] font-semibold">{count}</span>
            </div>
          </div>
        </div>
      );
    }

    if (id === "expanded") {
      return (
        <div
          className="flex items-center justify-between gap-2 rounded-xl border border-line-soft/80 px-3 py-2 text-xs shadow-2xs"
          style={{ background: sec.background, color: sec.text }}
        >
          <div className="font-bold tracking-widest text-[11px] uppercase truncate shrink-0">
            {logo}
          </div>
          <div className="flex-1 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-white/10 text-[9px] text-muted truncate border border-line-soft/40">
            <Search className="size-2.5 shrink-0" strokeWidth={1.75} style={{ color: iconColor }} />
            <span className="truncate">Search...</span>
          </div>
          <div className="flex items-center gap-1 shrink-0" style={{ color: iconColor }}>
            <ShoppingBag className="size-3.5" strokeWidth={1.75} />
            <span className="text-[10px] font-semibold">{count}</span>
          </div>
        </div>
      );
    }

    // Centered
    return (
      <div
        className="relative flex items-center justify-between rounded-xl border border-line-soft/80 px-3 py-2 text-xs shadow-2xs"
        style={{ background: sec.background, color: sec.text }}
      >
        <Menu className="size-3.5 shrink-0 opacity-80" strokeWidth={1.75} style={{ color: iconColor }} />
        <div className="font-bold tracking-widest text-[11px] uppercase truncate px-2">
          {logo}
        </div>
        <div className="flex items-center gap-1.5 shrink-0" style={{ color: iconColor }}>
          <Search className="size-3.5" strokeWidth={1.75} />
          <div className="flex items-center gap-0.5">
            <ShoppingBag className="size-3.5" strokeWidth={1.75} />
            <span className="text-[10px] font-semibold">{count}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {NAV_STYLES.map((id) => (
        <TemplateCard
          key={id}
          active={current === id}
          onClick={() => useEditor.getState().patchSelected({ template: id })}
        >
          {renderPreview(id)}
        </TemplateCard>
      ))}
    </div>
  );
}

function NameForm({ logo, text }: { logo: string; text: string }) {
  const [value, setValue] = useState(logo);
  return (
    <div className="flex flex-col gap-3">
      <Field label="Brand">
        <TextInput value={value} onChange={(event) => setValue(event.target.value)} />
      </Field>
      <PrimaryButton onClick={() => useEditor.getState().setLogo(value)}>Save name</PrimaryButton>
      <TextSwatches
        onPick={(color) => {
          if (color !== text) useEditor.getState().patchSelected({ text: color });
        }}
      />
    </div>
  );
}

function CatalogTemplate({ current }: { current?: "grid" | "list" }) {
  const active = current ?? "grid";
  return (
    <div className="flex flex-col gap-3">
      <TemplateCard
        active={active === "grid"}
        onClick={() => useEditor.getState().patchSelected({ template: "grid" })}
      >
        <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-line-soft bg-fill/30 p-2.5">
          <div className="flex flex-col gap-1.5 rounded-lg border border-line-soft bg-surface p-2">
            <div className="aspect-square w-full rounded-md bg-slate-200" />
            <div className="h-2 w-3/4 rounded-full bg-slate-800" />
            <div className="h-2 w-1/2 rounded-full bg-slate-400" />
          </div>
          <div className="flex flex-col gap-1.5 rounded-lg border border-line-soft bg-surface p-2">
            <div className="aspect-square w-full rounded-md bg-slate-200" />
            <div className="h-2 w-3/4 rounded-full bg-slate-800" />
            <div className="h-2 w-1/2 rounded-full bg-slate-400" />
          </div>
        </div>
      </TemplateCard>
      <TemplateCard
        active={active === "list"}
        onClick={() => useEditor.getState().patchSelected({ template: "list" })}
      >
        <div className="flex flex-col gap-2 rounded-xl border border-line-soft bg-fill/30 p-2.5">
          <div className="flex items-center gap-2.5 rounded-lg border border-line-soft bg-surface p-2">
            <div className="size-9 rounded-md bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-2 w-2/3 rounded-full bg-slate-800" />
              <div className="h-1.5 w-1/3 rounded-full bg-slate-400" />
            </div>
            <div className="h-3 w-8 rounded-full bg-emerald-500/80 shrink-0" />
          </div>
          <div className="flex items-center gap-2.5 rounded-lg border border-line-soft bg-surface p-2">
            <div className="size-9 rounded-md bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-2 w-2/3 rounded-full bg-slate-800" />
              <div className="h-1.5 w-1/3 rounded-full bg-slate-400" />
            </div>
            <div className="h-3 w-8 rounded-full bg-emerald-500/80 shrink-0" />
          </div>
        </div>
      </TemplateCard>
    </div>
  );
}

function CatalogFilterSortSheet({ sec }: { sec: FilterSortSection | CatalogSection }) {
  const [tab, setTab] = useState<"sort" | "filter" | "layout">("sort");

  const sortConfig = sec.sortConfig || {
    enabled: true,
    defaultSort: "featured",
    allowedSorts: ["featured", "price_asc", "price_desc", "discount_desc", "newest", "name_asc"],
  };

  const filterConfig = sec.filterConfig || {
    showCategories: true,
    showBrands: true,
    showPrice: true,
    showStock: true,
    autoHideOutOfStock: false,
  };

  const layoutConfig = sec.layoutConfig || {
    style: "hybrid",
    sticky: true,
    showItemCount: true,
  };

  const sortOptions: { id: CatalogSortOption; label: string; desc: string }[] = [
    { id: "featured", label: "Featured (Curated)", desc: "Storefront order as defined in catalog" },
    { id: "price_asc", label: "Price: Low to High", desc: "Cheapest products first" },
    { id: "price_desc", label: "Price: High to Low", desc: "Premium products first" },
    { id: "discount_desc", label: "Biggest Discount (% OFF)", desc: "Highest percentage savings first" },
    { id: "newest", label: "Newest Drops First", desc: "Recently added items or marked NEW" },
    { id: "name_asc", label: "Alphabetical (A to Z)", desc: "Sort product names alphabetically" },
  ];

  const patchSort = (patch: Partial<CatalogSortConfig>) => {
    useEditor.getState().patchSelected({
      sortConfig: { ...sortConfig, ...patch },
    });
  };

  const patchFilter = (patch: Partial<CatalogFilterConfig>) => {
    useEditor.getState().patchSelected({
      filterConfig: { ...filterConfig, ...patch },
    });
  };

  const patchLayout = (patch: Partial<CatalogLayoutConfig>) => {
    useEditor.getState().patchSelected({
      layoutConfig: { ...layoutConfig, ...patch },
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Tab Switcher */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-zinc-800 p-1">
        <button
          type="button"
          onClick={() => setTab("sort")}
          className={cn(
            "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
            tab === "sort"
              ? "bg-white dark:bg-zinc-900 text-ink shadow-2xs"
              : "text-muted hover:text-ink"
          )}
        >
          Sort By
        </button>
        <button
          type="button"
          onClick={() => setTab("filter")}
          className={cn(
            "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
            tab === "filter"
              ? "bg-white dark:bg-zinc-900 text-ink shadow-2xs"
              : "text-muted hover:text-ink"
          )}
        >
          Filters
        </button>
        <button
          type="button"
          onClick={() => setTab("layout")}
          className={cn(
            "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
            tab === "layout"
              ? "bg-white dark:bg-zinc-900 text-ink shadow-2xs"
              : "text-muted hover:text-ink"
          )}
        >
          Layout & Style
        </button>
      </div>

      {tab === "sort" && (
        <div className="flex flex-col gap-4">
          {/* Enable Sorting Master Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-line-soft bg-surface shadow-2xs">
            <div>
              <div className="text-sm font-semibold text-ink">Enable Customer Sorting</div>
              <div className="text-xs text-muted">Show Sort By button on storefront</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={sortConfig.enabled}
              onClick={() => patchSort({ enabled: !sortConfig.enabled })}
              className={cn(
                "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                sortConfig.enabled ? "bg-accent" : "bg-slate-200 dark:bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                  sortConfig.enabled ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {sortConfig.enabled && (
            <>
              {/* Default Sort Order */}
              <div>
                <p className="mb-2 text-xs font-semibold tracking-wider text-muted uppercase">Default Sort Order</p>
                <div className="grid grid-cols-1 gap-2">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => patchSort({ defaultSort: opt.id })}
                      className={cn(
                        "tap-smooth flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer",
                        sortConfig.defaultSort === opt.id
                          ? "border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 ring-1 ring-purple-600/30"
                          : "border-line-soft bg-surface hover:bg-fill/70"
                      )}
                    >
                      <div>
                        <div className="text-xs font-semibold text-ink">{opt.label}</div>
                        <div className="text-[11px] text-muted">{opt.desc}</div>
                      </div>
                      <div
                        className={cn(
                          "size-4 rounded-full border flex items-center justify-center shrink-0",
                          sortConfig.defaultSort === opt.id
                            ? "border-purple-600 bg-purple-600 text-white"
                            : "border-slate-300 dark:border-zinc-700"
                        )}
                      >
                        {sortConfig.defaultSort === opt.id && <div className="size-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Allowed Sort Options for Buyers */}
              <div>
                <p className="mb-2 text-xs font-semibold tracking-wider text-muted uppercase">Allowed Sort Options For Buyers</p>
                <div className="divide-y divide-line-soft rounded-2xl border border-line-soft bg-surface overflow-hidden shadow-2xs">
                  {sortOptions.map((opt) => {
                    const isChecked = sortConfig.allowedSorts.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-fill/50 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-medium text-ink">{opt.label}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const next = isChecked
                              ? sortConfig.allowedSorts.filter((s) => s !== opt.id)
                              : [...sortConfig.allowedSorts, opt.id];
                            if (next.length > 0) patchSort({ allowedSorts: next });
                          }}
                          className="size-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "filter" && (
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold tracking-wider text-muted uppercase">Filter Facets Visibility</p>
          <div className="divide-y divide-line-soft overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-2xs">
            {/* Category tabs */}
            <div className="flex items-center justify-between p-3.5">
              <div>
                <div className="text-sm font-medium">Category Pill Tabs</div>
                <div className="text-xs text-muted">Show category tabs at top of store</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={filterConfig.showCategories}
                onClick={() => patchFilter({ showCategories: !filterConfig.showCategories })}
                className={cn(
                  "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                  filterConfig.showCategories ? "bg-accent" : "bg-slate-200 dark:bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                    filterConfig.showCategories ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Brand filter */}
            <div className="flex items-center justify-between p-3.5">
              <div>
                <div className="text-sm font-medium">Brand Filter</div>
                <div className="text-xs text-muted">Allow buyers to filter by brand (Nike, Adidas...)</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={filterConfig.showBrands}
                onClick={() => patchFilter({ showBrands: !filterConfig.showBrands })}
                className={cn(
                  "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                  filterConfig.showBrands ? "bg-accent" : "bg-slate-200 dark:bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                    filterConfig.showBrands ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Price filter */}
            <div className="flex items-center justify-between p-3.5">
              <div>
                <div className="text-sm font-medium">Price Range Filter</div>
                <div className="text-xs text-muted">Filter by price brackets (Under $100, $100-$150...)</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={filterConfig.showPrice}
                onClick={() => patchFilter({ showPrice: !filterConfig.showPrice })}
                className={cn(
                  "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                  filterConfig.showPrice ? "bg-accent" : "bg-slate-200 dark:bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                    filterConfig.showPrice ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* In-Stock filter */}
            <div className="flex items-center justify-between p-3.5">
              <div>
                <div className="text-sm font-medium">In-Stock Only Filter</div>
                <div className="text-xs text-muted">Allow buyers to hide out-of-stock items</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={filterConfig.showStock}
                onClick={() => patchFilter({ showStock: !filterConfig.showStock })}
                className={cn(
                  "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                  filterConfig.showStock ? "bg-accent" : "bg-slate-200 dark:bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                    filterConfig.showStock ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Auto-Hide Sold Out */}
            <div className="flex items-center justify-between p-3.5">
              <div>
                <div className="text-sm font-medium">Auto-Hide Sold Out Products</div>
                <div className="text-xs text-muted">Always hide sold out items from store</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={filterConfig.autoHideOutOfStock}
                onClick={() => patchFilter({ autoHideOutOfStock: !filterConfig.autoHideOutOfStock })}
                className={cn(
                  "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                  filterConfig.autoHideOutOfStock ? "bg-accent" : "bg-slate-200 dark:bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                    filterConfig.autoHideOutOfStock ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "layout" && (
        <div className="flex flex-col gap-5">
          {/* Presets */}
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wider text-muted uppercase">Filter Presentation Style</p>
            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => patchLayout({ style: "hybrid" })}
                className={cn(
                  "tap-smooth p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5",
                  layoutConfig.style === "hybrid"
                    ? "border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 ring-1 ring-purple-600/30"
                    : "border-line-soft bg-surface hover:bg-fill/70"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">Hybrid (Pills + Utility Bar)</span>
                  <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">Recommended</span>
                </div>
                <p className="text-[11px] text-muted">Category pills on top for 1-tap switching, plus compact Sort & Filter utility bar above product grid.</p>
              </button>

              <button
                type="button"
                onClick={() => patchLayout({ style: "minimal" })}
                className={cn(
                  "tap-smooth p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5",
                  layoutConfig.style === "minimal"
                    ? "border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 ring-1 ring-purple-600/30"
                    : "border-line-soft bg-surface hover:bg-fill/70"
                )}
              >
                <span className="text-xs font-bold text-ink">Minimal (Utility Bar Only)</span>
                <p className="text-[11px] text-muted">Hides horizontal category pills. All category, brand and price filters open from the Filter drawer.</p>
              </button>

              <button
                type="button"
                onClick={() => patchLayout({ style: "pills_only" })}
                className={cn(
                  "tap-smooth p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5",
                  layoutConfig.style === "pills_only"
                    ? "border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 ring-1 ring-purple-600/30"
                    : "border-line-soft bg-surface hover:bg-fill/70"
                )}
              >
                <span className="text-xs font-bold text-ink">Pills Only</span>
                <p className="text-[11px] text-muted">Clean single row of category tabs. Disables the multi-facet filter & sort bar.</p>
              </button>
            </div>
          </div>

          {/* Sticky Bar & Count Toggles */}
          <div className="divide-y divide-line-soft overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-2xs">
            <div className="flex items-center justify-between p-3.5">
              <div>
                <div className="text-sm font-medium">Sticky Filter Bar</div>
                <div className="text-xs text-muted">Keep Sort & Filter bar fixed at top while scrolling</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={layoutConfig.sticky}
                onClick={() => patchLayout({ sticky: !layoutConfig.sticky })}
                className={cn(
                  "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                  layoutConfig.sticky ? "bg-accent" : "bg-slate-200 dark:bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                    layoutConfig.sticky ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5">
              <div>
                <div className="text-sm font-medium">Product Count Counter</div>
                <div className="text-xs text-muted">Display number of matching products (e.g. '8 Products')</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={layoutConfig.showItemCount}
                onClick={() => patchLayout({ showItemCount: !layoutConfig.showItemCount })}
                className={cn(
                  "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                  layoutConfig.showItemCount ? "bg-accent" : "bg-slate-200 dark:bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                    layoutConfig.showItemCount ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductTemplate({ current }: { current?: "stacked" | "split" | "grid" }) {
  const active = current ?? "stacked";
  return (
    <div className="flex flex-col gap-3">
      <TemplateCard
        active={active === "stacked"}
        onClick={() => useEditor.getState().patchSelected({ template: "stacked" })}
      >
        <div className="flex items-center gap-3.5 w-full">
          <div className="w-24 shrink-0 flex flex-col gap-1.5 rounded-xl border border-line-soft bg-fill/40 p-2">
            <div className="h-10 w-full rounded-md bg-slate-300 dark:bg-zinc-600" />
            <div className="space-y-1">
              <div className="h-1.5 w-3/4 rounded-full bg-slate-800 dark:bg-zinc-200" />
              <div className="h-1.5 w-1/2 rounded-full bg-slate-400 dark:bg-zinc-400" />
              <div className="h-3 w-full rounded-full bg-emerald-500" />
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-ink">Stacked Classic</div>
            <div className="text-xs text-muted">Full-width photo gallery on top with details & CTA below. Best for mobile conversions.</div>
          </div>
        </div>
      </TemplateCard>

      <TemplateCard
        active={active === "split"}
        onClick={() => useEditor.getState().patchSelected({ template: "split" })}
      >
        <div className="flex items-center gap-3.5 w-full">
          <div className="w-24 shrink-0 grid grid-cols-2 gap-1 rounded-xl border border-line-soft bg-fill/40 p-1.5">
            <div className="aspect-square w-full rounded-md bg-slate-300 dark:bg-zinc-600" />
            <div className="flex flex-col justify-center space-y-1">
              <div className="h-1.5 w-full rounded-full bg-slate-800 dark:bg-zinc-200" />
              <div className="h-1.5 w-3/4 rounded-full bg-slate-400 dark:bg-zinc-400" />
              <div className="h-2.5 w-full rounded-full bg-emerald-500" />
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-ink">Split Balanced</div>
            <div className="text-xs text-muted">50/50 side-by-side gallery and product details. Balanced, desktop and tablet friendly.</div>
          </div>
        </div>
      </TemplateCard>

      <TemplateCard
        active={active === "grid"}
        onClick={() => useEditor.getState().patchSelected({ template: "grid" })}
      >
        <div className="flex items-center gap-3.5 w-full">
          <div className="w-24 shrink-0 grid grid-cols-2 gap-1 rounded-xl border border-line-soft bg-fill/40 p-1.5">
            <div className="aspect-square w-full rounded-md bg-slate-300 dark:bg-zinc-600" />
            <div className="aspect-square w-full rounded-md bg-slate-200 dark:bg-zinc-700" />
            <div className="aspect-square w-full rounded-md bg-slate-200 dark:bg-zinc-700" />
            <div className="aspect-square w-full rounded-md bg-slate-300 dark:bg-zinc-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-ink">Editorial Multi-Photo</div>
            <div className="text-xs text-muted">Multi-photo gallery with a sticky purchase column. Premium boutique catalog look.</div>
          </div>
        </div>
      </TemplateCard>
    </div>
  );
}

function ProductGallerySheet({ sec }: { sec: ProductSection }) {
  const currentRatio = sec.imageRatio ?? "1:1";
  const currentRadius = sec.borderRadius ?? 24;
  const currentStyle = sec.galleryStyle ?? "strip";

  const ratios: { label: string; ratio: ProductImageRatio; icon: string; desc: string }[] = [
    { label: "1:1 Square", ratio: "1:1", icon: "aspect-square", desc: "Balanced standard" },
    { label: "3:4 Portrait", ratio: "3:4", icon: "aspect-[3/4]", desc: "Fashion & clothing" },
    { label: "16:9 Wide", ratio: "16:9", icon: "aspect-video", desc: "Cinematic wide" },
  ];

  const presets = [
    { label: "Sharp", value: 0 },
    { label: "Subtle", value: 8 },
    { label: "Rounded", value: 16 },
    { label: "Curved", value: 24 },
    { label: "Extra", value: 32 },
  ];

  const galleryStyles: { id: "strip" | "dots" | "grid"; label: string; desc: string }[] = [
    { id: "strip", label: "Horizontal Strip", desc: "Scrollable thumbnail strip under photo" },
    { id: "dots", label: "Pagination Dots", desc: "Minimalist dot indicator" },
    { id: "grid", label: "Thumbnail Grid", desc: "4-column compact photo grid" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Aspect Ratio */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">
          Aspect Ratio
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ratios.map((item) => (
            <button
              key={item.ratio}
              type="button"
              onClick={() => useEditor.getState().patchSelected({ imageRatio: item.ratio })}
              className={cn(
                "tap-smooth flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center",
                currentRatio === item.ratio
                  ? "border-[#53389E] bg-[#EEF2FF]/60 text-ink ring-2 ring-[#53389E]/25 shadow-xs"
                  : "border-line-soft bg-surface text-ink hover:bg-fill"
              )}
            >
              <div className={cn("w-8 rounded border border-line mb-2 bg-fill/80", item.icon)} />
              <span className="text-xs font-semibold">{item.label}</span>
              <span className="text-[10px] text-muted">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Corner Curve / Radius */}
      <div className="flex flex-col gap-3 rounded-2xl border border-line-soft bg-surface p-4 shadow-2xs">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
            Corner Curve
          </span>
          <span className="text-xs font-bold text-accent font-mono bg-accent/10 px-2.5 py-1 rounded-lg">
            {currentRadius}px
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={32}
          step={2}
          value={currentRadius}
          onChange={(e) =>
            useEditor.getState().patchSelected({ borderRadius: Number(e.target.value) })
          }
          className="w-full accent-accent cursor-pointer"
        />
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {presets.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => useEditor.getState().patchSelected({ borderRadius: p.value })}
              className={cn(
                "tap-smooth py-1 px-1 rounded-xl text-center text-xs font-medium border transition-all",
                currentRadius === p.value
                  ? "border-accent bg-accent/10 text-accent font-semibold"
                  : "border-line-soft bg-fill/40 text-muted hover:text-ink"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Thumbnail Navigation Style */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">
          Thumbnail Style
        </label>
        <div className="divide-y divide-line-soft overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-2xs">
          {galleryStyles.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => useEditor.getState().patchSelected({ galleryStyle: item.id })}
              className={cn(
                "tap-smooth flex w-full items-center justify-between p-3.5 text-left transition-all",
                currentStyle === item.id
                  ? "bg-accent/10 text-accent font-semibold"
                  : "text-ink hover:bg-fill"
              )}
            >
              <div>
                <div className="text-sm font-semibold">{item.label}</div>
                <div className="text-xs text-muted">{item.desc}</div>
              </div>
              {currentStyle === item.id && <Check className="size-4 text-accent" strokeWidth={2.5} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductElementsSheet({ sec }: { sec: ProductSection }) {
  const [badgeVal, setBadgeVal] = useState(sec.badgeText || "POPULAR");

  const toggles = [
    {
      key: "showBadge",
      label: "Highlight Badge",
      detail: "Badge label on top corner of product photo",
      enabled: sec.showBadge !== false,
    },
    {
      key: "showDescription",
      label: "Product Description",
      detail: "Product summary paragraph and details",
      enabled: sec.showDescription !== false,
    },
    {
      key: "showColors",
      label: "Color Swatches Selector",
      detail: "Color variant swatches selector",
      enabled: sec.showColors !== false,
    },
    {
      key: "showSizes",
      label: "Size Selector Pills",
      detail: "Size option selector buttons (S, M, L, XL)",
      enabled: sec.showSizes !== false,
    },
    {
      key: "showTrustBadges",
      label: "Trust & Delivery Guarantees",
      detail: "Instant confirmation & delivery guarantee badges",
      enabled: sec.showTrustBadges !== false,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      {/* Badge Text Input */}
      {sec.showBadge !== false && (
        <div className="flex flex-col gap-2 rounded-2xl border border-line-soft bg-surface p-3.5 shadow-2xs">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider">
            Badge Text
          </label>
          <input
            type="text"
            value={badgeVal}
            onChange={(e) => {
              setBadgeVal(e.target.value);
              useEditor.getState().patchSelected({ badgeText: e.target.value });
            }}
            placeholder="e.g. POPULAR, NEW, BESTSELLER, 20% OFF"
            className="rounded-xl border border-line-soft bg-fill/50 px-3 py-2 text-sm font-medium text-ink focus:border-accent focus:bg-surface focus:outline-hidden"
          />
        </div>
      )}

      {/* Elements Visibility Toggles */}
      <div>
        <p className="mb-2 text-xs font-semibold text-muted uppercase tracking-wider">
          Visible Elements
        </p>
        <div className="divide-y divide-line-soft overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-2xs">
          {toggles.map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3.5">
              <div className="pr-3">
                <div className="text-sm font-semibold text-ink">{item.label}</div>
                <div className="text-xs text-muted">{item.detail}</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={item.enabled}
                onClick={() =>
                  useEditor.getState().patchSelected({ [item.key]: !item.enabled })
                }
                className={cn(
                  "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                  item.enabled ? "bg-accent" : "bg-slate-200 dark:bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                    item.enabled ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductCtaSheet({ sec }: { sec: ProductSection }) {
  const [phone, setPhone] = useState(sec.whatsappNumber || "919876543210");
  const [btnText, setBtnText] = useState(sec.buttonText || "Buy on WhatsApp");
  const currentColor = sec.buttonColor || "#25D366";
  const sticky = sec.stickyButton ?? false;

  const colorPresets = [
    { name: "WhatsApp Green", value: "#25D366" },
    { name: "Luxe Black", value: "#111827" },
    { name: "Brand Purple", value: "#53389E" },
    { name: "Apple Blue", value: "#0071E3" },
    { name: "Crimson Red", value: "#DC2626" },
    { name: "Warm Amber", value: "#D97706" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* WhatsApp Phone Number */}
      <div className="flex flex-col gap-2 rounded-2xl border border-line-soft bg-surface p-3.5 shadow-2xs">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">
          WhatsApp Phone Number
        </label>
        <input
          type="text"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            useEditor.getState().patchSelected({ whatsappNumber: e.target.value });
          }}
          placeholder="e.g. 919876543210"
          className="rounded-xl border border-line-soft bg-fill/50 px-3 py-2 text-sm font-medium text-ink focus:border-accent focus:bg-surface focus:outline-hidden"
        />
        <p className="text-[11px] text-muted">Include country code without + or spaces (e.g. 919876543210).</p>
      </div>

      {/* Button Label */}
      <div className="flex flex-col gap-2 rounded-2xl border border-line-soft bg-surface p-3.5 shadow-2xs">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">
          Button Label
        </label>
        <input
          type="text"
          value={btnText}
          onChange={(e) => {
            setBtnText(e.target.value);
            useEditor.getState().patchSelected({ buttonText: e.target.value });
          }}
          placeholder="Buy on WhatsApp"
          className="rounded-xl border border-line-soft bg-fill/50 px-3 py-2 text-sm font-medium text-ink focus:border-accent focus:bg-surface focus:outline-hidden"
        />
      </div>

      {/* Button Color */}
      <div className="flex flex-col gap-3 rounded-2xl border border-line-soft bg-surface p-3.5 shadow-2xs">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">
          Button Color
        </label>
        <div className="grid grid-cols-6 gap-2">
          {colorPresets.map((c) => (
            <button
              key={c.value}
              type="button"
              aria-label={c.name}
              onClick={() => useEditor.getState().patchSelected({ buttonColor: c.value })}
              className={cn(
                "tap-smooth size-10 rounded-xl border flex items-center justify-center transition-all",
                currentColor === c.value
                  ? "ring-2 ring-accent scale-105 border-white shadow-xs"
                  : "border-black/10 hover:scale-105"
              )}
              style={{ backgroundColor: c.value }}
            >
              {currentColor === c.value && <Check className="size-4 text-white" strokeWidth={2.5} />}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <label className="relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-line overflow-hidden">
            <input
              type="color"
              value={currentColor.startsWith("#") ? currentColor : "#25D366"}
              onChange={(e) => useEditor.getState().patchSelected({ buttonColor: e.target.value })}
              className="absolute inset-0 size-full opacity-0 cursor-pointer"
            />
            <span className="size-full" style={{ background: currentColor }} />
          </label>
          <span className="text-xs font-mono text-muted uppercase">{currentColor}</span>
        </div>
      </div>

      {/* Sticky Mobile CTA Bar Toggle */}
      <div className="flex items-center justify-between rounded-2xl border border-line-soft bg-surface p-3.5 shadow-2xs">
        <div className="pr-3">
          <div className="text-sm font-semibold text-ink">Sticky Mobile CTA Bar</div>
          <div className="text-xs text-muted">Fixed WhatsApp quick-order bar at bottom of mobile screens while scrolling</div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={sticky}
          onClick={() => useEditor.getState().patchSelected({ stickyButton: !sticky })}
          className={cn(
            "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
            sticky ? "bg-accent" : "bg-slate-200 dark:bg-zinc-700"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
              sticky ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>
    </div>
  );
}

function ProductColorSheet({ sec }: { sec: ProductSection }) {
  const currentBg = sec.background || "transparent";
  const isTransparent = currentBg === "transparent";
  const currentPriceColor = sec.priceColor || "#059669";

  const bgPalettes = [
    { name: "Clean White", value: "#ffffff" },
    { name: "Soft Gray", value: "#f8fafc" },
    { name: "Warm Linen", value: "#fbfbfd" },
    { name: "Dark Ink", value: "#0b0b0d" },
    { name: "Midnight", value: "#0f172a" },
    { name: "Deep Cream", value: "#fdfbf7" },
  ];

  const pricePalettes = [
    { name: "Emerald", value: "#059669" },
    { name: "Pure Ink", value: "#111827" },
    { name: "Indigo", value: "#4f46e5" },
    { name: "Rose", value: "#e11d48" },
    { name: "Amber", value: "#d97706" },
    { name: "Royal Blue", value: "#2563eb" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Background Color */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">
          Section Background
        </label>

        {/* Transparent Toggle */}
        <button
          type="button"
          onClick={() => useEditor.getState().patchSelected({ background: "transparent" })}
          className={cn(
            "tap-smooth flex items-center justify-between p-3 rounded-2xl border transition-all",
            isTransparent
              ? "border-accent bg-accent/10 text-accent font-semibold ring-2 ring-accent/20"
              : "border-line-soft bg-surface text-ink hover:bg-fill"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-full border border-dashed border-slate-400 bg-linear-to-tr from-slate-200 to-transparent flex items-center justify-center">
              <span className="text-[10px] font-bold text-muted">∅</span>
            </div>
            <div className="text-sm font-semibold">Transparent (Default Store Canvas)</div>
          </div>
          {isTransparent && <Check className="size-4 text-accent" strokeWidth={2.5} />}
        </button>

        {/* Preset Palette */}
        <div className="grid grid-cols-6 gap-2">
          {bgPalettes.map((c) => (
            <button
              key={c.value}
              type="button"
              aria-label={c.name}
              onClick={() => useEditor.getState().patchSelected({ background: c.value })}
              className={cn(
                "tap-smooth size-10 rounded-xl border flex items-center justify-center transition-all",
                currentBg === c.value
                  ? "ring-2 ring-accent scale-105 border-slate-900 shadow-xs"
                  : "border-black/10 hover:scale-105"
              )}
              style={{ backgroundColor: c.value }}
            >
              {currentBg === c.value && (
                <Check
                  className={cn("size-4", isDark(c.value) ? "text-white" : "text-slate-900")}
                  strokeWidth={2.5}
                />
              )}
            </button>
          ))}
        </div>

        {/* Custom Color Input */}
        <div className="flex items-center gap-3 p-3 rounded-2xl border border-line-soft bg-surface shadow-2xs">
          <label className="relative flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line overflow-hidden">
            <input
              type="color"
              value={currentBg.startsWith("#") ? currentBg : "#ffffff"}
              onChange={(e) => useEditor.getState().patchSelected({ background: e.target.value })}
              className="absolute inset-0 size-full opacity-0 cursor-pointer"
            />
            <span className="size-full" style={{ background: isTransparent ? "transparent" : currentBg }} />
          </label>
          <div className="flex-1">
            <span className="text-xs font-semibold text-ink">Custom Background Color</span>
            <div className="text-[11px] text-muted font-mono">{isTransparent ? "transparent" : currentBg}</div>
          </div>
        </div>
      </div>

      {/* Price Color */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">
          Price Text Color
        </label>
        <div className="grid grid-cols-6 gap-2">
          {pricePalettes.map((c) => (
            <button
              key={c.value}
              type="button"
              aria-label={c.name}
              onClick={() => useEditor.getState().patchSelected({ priceColor: c.value })}
              className={cn(
                "tap-smooth size-10 rounded-xl border flex items-center justify-center transition-all",
                currentPriceColor === c.value
                  ? "ring-2 ring-accent scale-105 border-slate-900 shadow-xs"
                  : "border-black/10 hover:scale-105"
              )}
              style={{ backgroundColor: c.value }}
            >
              {currentPriceColor === c.value && (
                <Check className="size-4 text-white" strokeWidth={2.5} />
              )}
            </button>
          ))}
        </div>

        {/* Custom Price Color Input */}
        <div className="flex items-center gap-3 p-3 rounded-2xl border border-line-soft bg-surface shadow-2xs">
          <label className="relative flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line overflow-hidden">
            <input
              type="color"
              value={currentPriceColor.startsWith("#") ? currentPriceColor : "#059669"}
              onChange={(e) => useEditor.getState().patchSelected({ priceColor: e.target.value })}
              className="absolute inset-0 size-full opacity-0 cursor-pointer"
            />
            <span className="size-full" style={{ background: currentPriceColor }} />
          </label>
          <div className="flex-1">
            <span className="text-xs font-semibold text-ink">Custom Price Color</span>
            <div className="text-[11px] text-muted font-mono">{currentPriceColor}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductTypographySheet({ sec }: { sec: ProductSection }) {
  const currentSize =
    sec.titleFontSize ?? (sec.typography === "sm" ? "sm" : sec.typography === "lg" ? "xl" : "base");
  const currentWeight = sec.titleFontWeight ?? "semibold";

  const sizes: { id: "sm" | "base" | "lg" | "xl"; label: string; desc: string }[] = [
    { id: "sm", label: "Compact", desc: "20px - 24px tight title" },
    { id: "base", label: "Regular", desc: "24px - 28px standard title" },
    { id: "lg", label: "Large", desc: "28px - 34px prominent title" },
    { id: "xl", label: "Display", desc: "32px - 44px bold hero title" },
  ];

  const weights: { id: "normal" | "medium" | "semibold" | "bold"; label: string; desc: string }[] = [
    { id: "normal", label: "Regular", desc: "400 normal weight" },
    { id: "medium", label: "Medium", desc: "500 balanced weight" },
    { id: "semibold", label: "Semi-Bold", desc: "600 refined emphasis" },
    { id: "bold", label: "Bold", desc: "700 high impact" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Title Font Size */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">
          Product Title Size
        </label>
        <div className="grid grid-cols-2 gap-2">
          {sizes.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() =>
                useEditor.getState().patchSelected({ titleFontSize: s.id })
              }
              className={cn(
                "tap-smooth flex flex-col p-3 rounded-2xl border text-left transition-all",
                currentSize === s.id
                  ? "border-accent bg-accent/10 text-accent font-semibold ring-2 ring-accent/20"
                  : "border-line-soft bg-surface text-ink hover:bg-fill"
              )}
            >
              <span className="text-sm font-semibold">{s.label}</span>
              <span className="text-xs text-muted mt-0.5">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Title Font Weight */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">
          Title Font Weight
        </label>
        <div className="grid grid-cols-2 gap-2">
          {weights.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() =>
                useEditor.getState().patchSelected({ titleFontWeight: w.id })
              }
              className={cn(
                "tap-smooth flex flex-col p-3 rounded-2xl border text-left transition-all",
                currentWeight === w.id
                  ? "border-accent bg-accent/10 text-accent font-semibold ring-2 ring-accent/20"
                  : "border-line-soft bg-surface text-ink hover:bg-fill"
              )}
            >
              <span className="text-sm font-semibold">{w.label}</span>
              <span className="text-xs text-muted mt-0.5">{w.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductCardBoxSheet() {
  const section = useEditor((s) => selectedSection(s));
  const borderEnabled = section && "borderEnabled" in section ? section.borderEnabled !== false : true;
  const borderWidth = (section && "borderWidth" in section && section.borderWidth) || 1;
  const borderColor = (section && "borderColor" in section && section.borderColor) || "#e2e8f0";
  const shadowEnabled = section && "shadowEnabled" in section ? Boolean(section.shadowEnabled) : false;
  const shadowStyle = (section && "shadowStyle" in section && (section.shadowStyle as ProductCardShadow)) || "soft";
  const borderRadius = (section && "borderRadius" in section && section.borderRadius !== undefined) ? section.borderRadius : 16;
  const cardBackground = (section && "cardBackground" in section && section.cardBackground) || "#ffffff";

  const borderWidths = [
    { label: "1px Hairline", value: 1 },
    { label: "2px Medium", value: 2 },
    { label: "3px Bold", value: 3 },
    { label: "4px Thick", value: 4 },
  ];

  const borderColors = [
    { label: "Light Slate", value: "#e2e8f0" },
    { label: "Neutral Zinc", value: "#d4d4d8" },
    { label: "Border Soft", value: "#cbd5e1" },
    { label: "Dark Slate", value: "#334155" },
    { label: "Ink Black", value: "#000000" },
    { label: "Emerald", value: "#10b981" },
    { label: "Purple", value: "#8b5cf6" },
    { label: "Rose", value: "#f43f5e" },
  ];

  const shadowStyles: { id: ProductCardShadow; label: string; desc: string }[] = [
    { id: "soft", label: "Soft Glow", desc: "Subtle clean outline" },
    { id: "smooth", label: "Smooth", desc: "Gentle natural elevation" },
    { id: "float", label: "Floating 3D", desc: "Raised off canvas" },
    { id: "deep", label: "Deep Shadow", desc: "Bold dramatic depth" },
  ];

  const radiusPresets = [
    { label: "Sharp", value: 0 },
    { label: "Subtle", value: 8 },
    { label: "Rounded", value: 16 },
    { label: "Curved", value: 24 },
    { label: "Pill", value: 32 },
  ];

  const bgColors = [
    { label: "White", value: "#ffffff" },
    { label: "Cream", value: "#fafaf9" },
    { label: "Soft Grey", value: "#f8fafc" },
    { label: "Dark Slate", value: "#1e293b" },
    { label: "Charcoal", value: "#18181b" },
    { label: "Midnight", value: "#09090b" },
    { label: "Transparent", value: "transparent" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Card Border */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-xs font-semibold tracking-wider text-muted uppercase">Card Border</p>
          <button
            type="button"
            role="switch"
            aria-checked={borderEnabled}
            onClick={() => useEditor.getState().patchSelected({ borderEnabled: !borderEnabled })}
            className={cn(
              "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
              borderEnabled ? "bg-accent" : "bg-slate-200"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                borderEnabled ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {borderEnabled && (
          <div className="animate-fade-in flex flex-col gap-3 rounded-2xl border border-line-soft bg-surface p-3.5 shadow-2xs">
            <div>
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-2">Border Width</span>
              <div className="grid grid-cols-4 gap-1.5">
                {borderWidths.map((w) => (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => useEditor.getState().patchSelected({ borderWidth: w.value })}
                    className={cn(
                      "tap-smooth py-1.5 px-2 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer",
                      borderWidth === w.value
                        ? "border-[#53389E] bg-[#EEF2FF]/60 text-[#53389E] font-semibold ring-2 ring-[#53389E]/20"
                        : "border-line-soft bg-surface hover:bg-fill text-ink"
                    )}
                  >
                    {w.value}px
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-2">Border Color</span>
              <div className="flex flex-wrap items-center gap-2">
                {borderColors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.label}
                    onClick={() => useEditor.getState().patchSelected({ borderColor: c.value })}
                    className={cn(
                      "size-7 rounded-full border-2 transition-all cursor-pointer hover:scale-110",
                      borderColor.toLowerCase() === c.value.toLowerCase()
                        ? "border-[#53389E] ring-2 ring-[#53389E]/30 scale-105"
                        : "border-slate-300 dark:border-slate-700"
                    )}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
                <div className="flex items-center gap-1.5 ml-auto">
                  <input
                    type="color"
                    value={borderColor.startsWith("#") ? borderColor : "#e2e8f0"}
                    onChange={(e) => useEditor.getState().patchSelected({ borderColor: e.target.value })}
                    className="size-7 rounded-lg border border-line-soft cursor-pointer bg-transparent p-0.5"
                    title="Custom color"
                  />
                  <span className="text-xs font-mono text-muted">{borderColor}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Card Shadow */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-xs font-semibold tracking-wider text-muted uppercase">Card Shadow</p>
          <button
            type="button"
            role="switch"
            aria-checked={shadowEnabled}
            onClick={() => useEditor.getState().patchSelected({ shadowEnabled: !shadowEnabled })}
            className={cn(
              "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
              shadowEnabled ? "bg-accent" : "bg-slate-200"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                shadowEnabled ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {shadowEnabled && (
          <div className="animate-fade-in grid grid-cols-2 gap-2">
            {shadowStyles.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => useEditor.getState().patchSelected({ shadowStyle: s.id })}
                className={cn(
                  "tap-smooth flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all cursor-pointer",
                  shadowStyle === s.id
                    ? "border-[#53389E] bg-[#EEF2FF]/60 text-ink ring-2 ring-[#53389E]/20"
                    : "border-line-soft bg-surface hover:bg-fill text-muted"
                )}
              >
                <span className="text-xs font-semibold text-ink">{s.label}</span>
                <span className="text-[11px] text-muted">{s.desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Outer Corner Curve */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-xs font-semibold tracking-wider text-muted uppercase">Outer Corner Curve</p>
          <span className="text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-200">{borderRadius}px</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 mb-3">
          {radiusPresets.map((preset) => {
            const active = borderRadius === preset.value;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => useEditor.getState().patchSelected({ borderRadius: preset.value })}
                className={cn(
                  "tap-smooth flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition-all cursor-pointer",
                  active
                    ? "border-[#53389E] bg-[#EEF2FF]/60 shadow-xs ring-2 ring-[#53389E]/25"
                    : "border-line-soft bg-surface hover:bg-fill/70"
                )}
              >
                <div
                  className="size-6 border-2 border-slate-400 bg-slate-200/60"
                  style={{ borderRadius: `${preset.value / 2}px` }}
                />
                <span className="text-[10px] font-medium text-ink">{preset.label}</span>
              </button>
            );
          })}
        </div>
        <input
          type="range"
          min="0"
          max="40"
          step="2"
          value={borderRadius}
          onChange={(e) => useEditor.getState().patchSelected({ borderRadius: Number(e.target.value) })}
          className="w-full accent-[#53389E] cursor-pointer"
        />
      </div>

      {/* 4. Card Background */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-xs font-semibold tracking-wider text-muted uppercase">Card Background</p>
          <span className="text-xs font-mono text-muted">{cardBackground}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {bgColors.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => useEditor.getState().patchSelected({ cardBackground: c.value })}
              className={cn(
                "tap-smooth px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer",
                cardBackground.toLowerCase() === c.value.toLowerCase()
                  ? "border-[#53389E] bg-[#EEF2FF]/60 text-[#53389E] font-semibold ring-2 ring-[#53389E]/20"
                  : "border-line-soft bg-surface text-ink hover:bg-fill"
              )}
            >
              <span
                className="size-3.5 rounded-full border border-slate-300 dark:border-slate-600 inline-block"
                style={{ backgroundColor: c.value === "transparent" ? undefined : c.value }}
              />
              <span>{c.label}</span>
            </button>
          ))}
          <input
            type="color"
            value={cardBackground.startsWith("#") ? cardBackground : "#ffffff"}
            onChange={(e) => useEditor.getState().patchSelected({ cardBackground: e.target.value })}
            className="size-8 rounded-lg border border-line-soft cursor-pointer bg-transparent p-0.5 ml-auto"
            title="Custom background color"
          />
        </div>
      </div>
    </div>
  );
}

function ProductCardImageSheet() {
  const section = useEditor((s) => selectedSection(s));
  const imageRatio = (section && "imageRatio" in section && section.imageRatio) || "1:1";
  const imageInset = section && "imageInset" in section ? Boolean(section.imageInset) : false;
  const imageRadius = (section && "imageRadius" in section && section.imageRadius !== undefined) ? section.imageRadius : 12;

  const ratios: { id: ProductImageRatio; label: string; aspect: string }[] = [
    { id: "1:1", label: "1:1 Square", aspect: "aspect-square" },
    { id: "3:4", label: "3:4 Portrait", aspect: "aspect-[3/4]" },
    { id: "16:9", label: "16:9 Wide", aspect: "aspect-video" },
  ];

  const imageRadiusPresets = [
    { label: "Sharp", value: 0 },
    { label: "Subtle", value: 6 },
    { label: "Curved", value: 12 },
    { label: "Round", value: 18 },
    { label: "Max", value: 24 },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Image Width Mode: Flush vs Inset */}
      <div>
        <p className="mb-2.5 text-xs font-semibold tracking-wider text-muted uppercase">Image Width & Padding</p>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => useEditor.getState().patchSelected({ imageInset: false })}
            className={cn(
              "tap-smooth flex flex-col items-center gap-2 rounded-2xl border p-3.5 text-center transition-all cursor-pointer",
              !imageInset
                ? "border-[#53389E] bg-[#EEF2FF]/60 shadow-xs ring-2 ring-[#53389E]/25"
                : "border-line-soft bg-surface hover:bg-fill/70"
            )}
          >
            <div className="h-16 w-full rounded-lg bg-slate-200/60 p-1 flex items-center justify-center">
              <div className="h-full w-full rounded bg-slate-400" />
            </div>
            <div>
              <div className="text-xs font-semibold text-ink">Full-Width Flush</div>
              <div className="text-[10px] text-muted">Edge-to-edge with card frame</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => useEditor.getState().patchSelected({ imageInset: true })}
            className={cn(
              "tap-smooth flex flex-col items-center gap-2 rounded-2xl border p-3.5 text-center transition-all cursor-pointer",
              imageInset
                ? "border-[#53389E] bg-[#EEF2FF]/60 shadow-xs ring-2 ring-[#53389E]/25"
                : "border-line-soft bg-surface hover:bg-fill/70"
            )}
          >
            <div className="h-16 w-full rounded-lg bg-slate-200/60 p-2.5 flex items-center justify-center">
              <div className="h-full w-full rounded-lg bg-slate-400" />
            </div>
            <div>
              <div className="text-xs font-semibold text-ink">Inset with Margin</div>
              <div className="text-[10px] text-muted">Surrounded by padding gap</div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Image Corner Curve (when inset) */}
      {imageInset && (
        <div className="animate-fade-in">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wider text-muted uppercase">Image Corner Curve</p>
            <span className="text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-200">{imageRadius}px</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 mb-3">
            {imageRadiusPresets.map((preset) => {
              const active = imageRadius === preset.value;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => useEditor.getState().patchSelected({ imageRadius: preset.value })}
                  className={cn(
                    "tap-smooth flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition-all cursor-pointer",
                    active
                      ? "border-[#53389E] bg-[#EEF2FF]/60 shadow-xs ring-2 ring-[#53389E]/25"
                      : "border-line-soft bg-surface hover:bg-fill/70"
                  )}
                >
                  <div
                    className="size-6 border-2 border-slate-400 bg-slate-200/60"
                    style={{ borderRadius: `${preset.value / 2}px` }}
                  />
                  <span className="text-[10px] font-medium text-ink">{preset.label}</span>
                </button>
              );
            })}
          </div>
          <input
            type="range"
            min="0"
            max="32"
            step="2"
            value={imageRadius}
            onChange={(e) => useEditor.getState().patchSelected({ imageRadius: Number(e.target.value) })}
            className="w-full accent-[#53389E] cursor-pointer"
          />
        </div>
      )}

      {/* 3. Image Aspect Ratio */}
      <div>
        <p className="mb-2.5 text-xs font-semibold tracking-wider text-muted uppercase">Image Aspect Ratio</p>
        <div className="grid grid-cols-3 gap-2.5">
          {ratios.map((r) => {
            const active = imageRatio === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => useEditor.getState().patchSelected({ imageRatio: r.id })}
                className={cn(
                  "tap-smooth flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all cursor-pointer",
                  active
                    ? "border-[#53389E] bg-[#EEF2FF]/60 shadow-xs ring-2 ring-[#53389E]/25"
                    : "border-line-soft bg-surface hover:bg-fill/70"
                )}
              >
                <div className="flex h-16 w-full items-center justify-center rounded-lg bg-fill/80 p-1">
                  <div className={cn("max-h-full max-w-full rounded-sm bg-slate-400/80 shadow-2xs", r.aspect, r.id === "16:9" ? "w-full" : "h-14")} />
                </div>
                <span className="text-xs font-medium text-ink">{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProductCardDetailsSheet() {
  const section = useEditor((s) => selectedSection(s));
  const detailsLayout = (section && "detailsLayout" in section && (section.detailsLayout as ProductCardDetailsLayout)) || "outer";
  const textAlign = (section && "textAlign" in section && (section.textAlign as ProductCardTextAlign)) || "left";
  const showBadge = section && "showBadge" in section ? section.showBadge !== false : true;
  const showPrice = section && "showPrice" in section ? section.showPrice !== false : true;
  const showButton = section && "showButton" in section ? section.showButton !== false : true;
  const showBrand = section && "showBrand" in section ? section.showBrand !== false : true;
  const showDiscountBadge = section && "showDiscountBadge" in section ? section.showDiscountBadge !== false : true;
  const showStockStatus = section && "showStockStatus" in section ? section.showStockStatus !== false : true;
  const typography = (section && "typography" in section && section.typography) || "base";

  const scales: { id: ProductTypography; label: string; sample: string }[] = [
    { id: "sm", label: "Compact", sample: "text-xs" },
    { id: "base", label: "Standard", sample: "text-sm font-medium" },
    { id: "lg", label: "Editorial", sample: "text-base font-semibold" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Placement: Outer vs Inner */}
      <div>
        <p className="mb-2.5 text-xs font-semibold tracking-wider text-muted uppercase">Details Layout</p>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => useEditor.getState().patchSelected({ detailsLayout: "outer" })}
            className={cn(
              "tap-smooth flex flex-col items-center gap-2 rounded-2xl border p-3.5 text-center transition-all cursor-pointer",
              detailsLayout === "outer"
                ? "border-[#53389E] bg-[#EEF2FF]/60 shadow-xs ring-2 ring-[#53389E]/25"
                : "border-line-soft bg-surface hover:bg-fill/70"
            )}
          >
            <div className="flex flex-col h-16 w-full rounded-lg bg-slate-100 dark:bg-slate-800 p-1.5 overflow-hidden">
              <div className="h-9 w-full rounded bg-slate-300 dark:bg-slate-600 mb-1" />
              <div className="h-2 w-3/4 rounded bg-slate-400 mb-0.5" />
              <div className="h-2 w-1/2 rounded bg-emerald-500" />
            </div>
            <div>
              <div className="text-xs font-semibold text-ink">Outer (Below Image)</div>
              <div className="text-[10px] text-muted">Standard storefront style</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => useEditor.getState().patchSelected({ detailsLayout: "inner" })}
            className={cn(
              "tap-smooth flex flex-col items-center gap-2 rounded-2xl border p-3.5 text-center transition-all cursor-pointer",
              detailsLayout === "inner"
                ? "border-[#53389E] bg-[#EEF2FF]/60 shadow-xs ring-2 ring-[#53389E]/25"
                : "border-line-soft bg-surface hover:bg-fill/70"
            )}
          >
            <div className="relative h-16 w-full rounded-lg bg-slate-400 overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent">
                <div className="h-2 w-3/4 rounded bg-white mb-0.5" />
                <div className="h-2 w-1/2 rounded bg-emerald-400" />
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-ink">Inner (Overlay)</div>
              <div className="text-[10px] text-muted">Floating on photo gradient</div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Text Alignment: Left vs Center */}
      <div>
        <p className="mb-2.5 text-xs font-semibold tracking-wider text-muted uppercase">Text Alignment</p>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => useEditor.getState().patchSelected({ textAlign: "left" })}
            className={cn(
              "tap-smooth py-2.5 px-4 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer",
              textAlign === "left"
                ? "border-[#53389E] bg-[#EEF2FF]/60 text-[#53389E] font-semibold ring-2 ring-[#53389E]/20"
                : "border-line-soft bg-surface hover:bg-fill text-ink"
            )}
          >
            Left Aligned
          </button>
          <button
            type="button"
            onClick={() => useEditor.getState().patchSelected({ textAlign: "center" })}
            className={cn(
              "tap-smooth py-2.5 px-4 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer",
              textAlign === "center"
                ? "border-[#53389E] bg-[#EEF2FF]/60 text-[#53389E] font-semibold ring-2 ring-[#53389E]/20"
                : "border-line-soft bg-surface hover:bg-fill text-ink"
            )}
          >
            Centered
          </button>
        </div>
      </div>

      {/* 3. Elements Toggle */}
      <div>
        <p className="mb-2.5 text-xs font-semibold tracking-wider text-muted uppercase">Card Elements Visibility</p>
        <div className="divide-y divide-line-soft overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-2xs">
          {/* Badge toggle */}
          <div className="flex items-center justify-between p-3.5">
            <div>
              <div className="text-sm font-medium">Product Badges</div>
              <div className="text-xs text-muted">Show 'SALE', 'NEW', 'HOT' tags</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showBadge}
              onClick={() => useEditor.getState().patchSelected({ showBadge: !showBadge })}
              className={cn(
                "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                showBadge ? "bg-accent" : "bg-slate-200"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                  showBadge ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Price toggle */}
          <div className="flex items-center justify-between p-3.5">
            <div>
              <div className="text-sm font-medium">Price Tag</div>
              <div className="text-xs text-muted">Display product price</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showPrice}
              onClick={() => useEditor.getState().patchSelected({ showPrice: !showPrice })}
              className={cn(
                "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                showPrice ? "bg-accent" : "bg-slate-200"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                  showPrice ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* WhatsApp Quick Buy button toggle */}
          <div className="flex items-center justify-between p-3.5">
            <div>
              <div className="text-sm font-medium">Quick WhatsApp Buy Button</div>
              <div className="text-xs text-muted">One-tap order via WhatsApp icon</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showButton}
              onClick={() => useEditor.getState().patchSelected({ showButton: !showButton })}
              className={cn(
                "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                showButton ? "bg-accent" : "bg-slate-200"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                  showButton ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Brand Name toggle */}
          <div className="flex items-center justify-between p-3.5">
            <div>
              <div className="text-sm font-medium">Brand Name</div>
              <div className="text-xs text-muted">Show brand kicker above title</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showBrand}
              onClick={() => useEditor.getState().patchSelected({ showBrand: !showBrand })}
              className={cn(
                "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                showBrand ? "bg-accent" : "bg-slate-200"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                  showBrand ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Discount Badge toggle */}
          <div className="flex items-center justify-between p-3.5">
            <div>
              <div className="text-sm font-medium">Discount % Badge</div>
              <div className="text-xs text-muted">Auto-compute & show '% OFF' badge</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showDiscountBadge}
              onClick={() => useEditor.getState().patchSelected({ showDiscountBadge: !showDiscountBadge })}
              className={cn(
                "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                showDiscountBadge ? "bg-accent" : "bg-slate-200"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                  showDiscountBadge ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Stock Status toggle */}
          <div className="flex items-center justify-between p-3.5">
            <div>
              <div className="text-sm font-medium">Stock Status Badge</div>
              <div className="text-xs text-muted">Show 'Sold Out' or 'Only X Left' tag</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showStockStatus}
              onClick={() => useEditor.getState().patchSelected({ showStockStatus: !showStockStatus })}
              className={cn(
                "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                showStockStatus ? "bg-accent" : "bg-slate-200"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                  showStockStatus ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Typography Scale */}
      <div>
        <p className="mb-2.5 text-xs font-semibold tracking-wider text-muted uppercase">Typography Scale</p>
        <div className="grid grid-cols-3 gap-2.5">
          {scales.map((s) => {
            const active = typography === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => useEditor.getState().patchSelected({ typography: s.id })}
                className={cn(
                  "tap-smooth flex flex-col items-center justify-between gap-2 rounded-2xl border p-3 text-center transition-all cursor-pointer",
                  active
                    ? "border-[#53389E] bg-[#EEF2FF]/60 shadow-xs ring-2 ring-[#53389E]/25"
                    : "border-line-soft bg-surface hover:bg-fill/70"
                )}
              >
                <div className="flex h-12 w-full items-center justify-center">
                  <span className={cn("truncate text-ink", s.sample)}>Air Retro</span>
                </div>
                <span className="text-xs font-medium text-muted">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


function ProductCardStyle() {
  const section = useEditor((s) => selectedSection(s));
  const imageRatio = (section && "imageRatio" in section && section.imageRatio) || "1:1";
  const typography = (section && "typography" in section && section.typography) || "base";
  const borderRadius = (section && "borderRadius" in section && section.borderRadius !== undefined) ? section.borderRadius : 16;

  const ratios: { id: ProductImageRatio; label: string; aspect: string }[] = [
    { id: "1:1", label: "1:1 Square", aspect: "aspect-square" },
    { id: "3:4", label: "3:4 Portrait", aspect: "aspect-[3/4]" },
    { id: "16:9", label: "16:9 Wide", aspect: "aspect-video" },
  ];

  const scales: { id: ProductTypography; label: string; sample: string }[] = [
    { id: "sm", label: "Compact", sample: "text-xs" },
    { id: "base", label: "Standard", sample: "text-sm font-medium" },
    { id: "lg", label: "Editorial", sample: "text-base font-semibold" },
  ];

  const radiusPresets = [
    { label: "Sharp", value: 0 },
    { label: "Subtle", value: 8 },
    { label: "Rounded", value: 16 },
    { label: "Curved", value: 24 },
    { label: "Extra", value: 32 },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Corner Curve */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-xs font-semibold tracking-wider text-muted uppercase">Corner Radius</p>
          <span className="text-xs font-semibold tabular-nums text-slate-700">{borderRadius}px</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 mb-3">
          {radiusPresets.map((preset) => {
            const active = borderRadius === preset.value;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => useEditor.getState().patchSelected({ borderRadius: preset.value })}
                className={cn(
                  "tap-smooth flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition-all",
                  active
                    ? "border-[#53389E] bg-[#EEF2FF]/60 shadow-xs ring-2 ring-[#53389E]/25"
                    : "border-line-soft bg-surface hover:bg-fill/70"
                )}
              >
                <div
                  className="size-6 border-2 border-slate-400 bg-slate-200/60"
                  style={{ borderRadius: `${preset.value / 2}px` }}
                />
                <span className="text-[10px] font-medium text-ink">{preset.label}</span>
              </button>
            );
          })}
        </div>
        <input
          type="range"
          min="0"
          max="32"
          step="2"
          value={borderRadius}
          onChange={(e) => useEditor.getState().patchSelected({ borderRadius: Number(e.target.value) })}
          className="w-full accent-[#53389E] cursor-pointer"
        />
      </div>

      {/* Image Ratio */}
      <div>
        <p className="mb-2.5 text-xs font-semibold tracking-wider text-muted uppercase">Image Aspect Ratio</p>
        <div className="grid grid-cols-3 gap-2.5">
          {ratios.map((r) => {
            const active = imageRatio === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => useEditor.getState().patchSelected({ imageRatio: r.id })}
                className={cn(
                  "tap-smooth flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all",
                  active
                    ? "border-[#53389E] bg-[#EEF2FF]/60 shadow-xs ring-2 ring-[#53389E]/25"
                    : "border-line-soft bg-surface hover:bg-fill/70"
                )}
              >
                <div className="flex h-16 w-full items-center justify-center rounded-lg bg-fill/80 p-1">
                  <div className={cn("max-h-full max-w-full rounded-sm bg-slate-400/80 shadow-2xs", r.aspect, r.id === "16:9" ? "w-full" : "h-14")} />
                </div>
                <span className="text-xs font-medium text-ink">{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Typography */}
      <div>
        <p className="mb-2.5 text-xs font-semibold tracking-wider text-muted uppercase">Typography Scale</p>
        <div className="grid grid-cols-3 gap-2.5">
          {scales.map((s) => {
            const active = typography === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => useEditor.getState().patchSelected({ typography: s.id })}
                className={cn(
                  "tap-smooth flex flex-col items-center justify-between gap-2 rounded-2xl border p-3 text-center transition-all",
                  active
                    ? "border-[#53389E] bg-[#EEF2FF]/60 shadow-xs ring-2 ring-[#53389E]/25"
                    : "border-line-soft bg-surface hover:bg-fill/70"
                )}
              >
                <div className="flex h-12 w-full items-center justify-center">
                  <span className={cn("truncate text-ink", s.sample)}>Air Retro</span>
                </div>
                <span className="text-xs font-medium text-muted">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProductCardBadges() {
  const section = useEditor((s) => selectedSection(s));
  const showBadge = section && "showBadge" in section ? section.showBadge !== false : true;
  const showPrice = section && "showPrice" in section ? section.showPrice !== false : true;
  const showButton = section && "showButton" in section ? section.showButton !== false : true;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2.5 text-xs font-semibold tracking-wider text-muted uppercase">Card Elements Visibility</p>
        <div className="divide-y divide-line-soft overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-2xs">
          {/* Badge toggle */}
          <div className="flex items-center justify-between p-3.5">
            <div>
              <div className="text-sm font-medium">Product Badges</div>
              <div className="text-xs text-muted">Show 'SALE', 'NEW', 'HOT' tags on card</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showBadge}
              onClick={() => useEditor.getState().patchSelected({ showBadge: !showBadge })}
              className={cn(
                "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                showBadge ? "bg-accent" : "bg-slate-200"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                  showBadge ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Price toggle */}
          <div className="flex items-center justify-between p-3.5">
            <div>
              <div className="text-sm font-medium">Price Display</div>
              <div className="text-xs text-muted">Show pricing on product cards</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showPrice}
              onClick={() => useEditor.getState().patchSelected({ showPrice: !showPrice })}
              className={cn(
                "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                showPrice ? "bg-accent" : "bg-slate-200"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                  showPrice ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Quick Buy Button toggle */}
          <div className="flex items-center justify-between p-3.5">
            <div>
              <div className="text-sm font-medium">Quick WhatsApp Button</div>
              <div className="text-xs text-muted">Show direct WhatsApp Buy button on card</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showButton}
              onClick={() => useEditor.getState().patchSelected({ showButton: !showButton })}
              className={cn(
                "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                showButton ? "bg-accent" : "bg-slate-200"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                  showButton ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCardColor() {
  const section = useEditor((s) => selectedSection(s));
  const priceColor = (section && "priceColor" in section && section.priceColor) || "#059669";
  const buttonColor = (section && "buttonColor" in section && section.buttonColor) || "#25D366";

  const pricePresets = [
    { label: "Emerald", value: "#059669" },
    { label: "Slate", value: "#0F172A" },
    { label: "Purple", value: "#7C3AED" },
    { label: "Blue", value: "#2563EB" },
    { label: "Red", value: "#DC2626" },
    { label: "Amber", value: "#D97706" },
    { label: "Rose", value: "#E11D48" },
    { label: "Black", value: "#000000" },
  ];

  const buttonPresets = [
    { label: "WhatsApp", value: "#25D366" },
    { label: "Emerald", value: "#059669" },
    { label: "Dark", value: "#111827" },
    { label: "Purple", value: "#53389E" },
    { label: "Royal", value: "#2563EB" },
    { label: "Orange", value: "#F97316" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Price Color */}
      <div>
        <p className="mb-2.5 text-xs font-semibold tracking-wider text-muted uppercase">Price Text Color</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {pricePresets.map((p) => {
            const active = priceColor.toLowerCase() === p.value.toLowerCase();
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => useEditor.getState().patchSelected({ priceColor: p.value })}
                className={cn(
                  "tap-smooth flex items-center gap-2 rounded-xl border p-2 text-left transition-all",
                  active
                    ? "border-[#53389E] bg-[#EEF2FF]/60 shadow-xs ring-2 ring-[#53389E]/25"
                    : "border-line-soft bg-surface hover:bg-fill/70"
                )}
              >
                <span className="size-4 shrink-0 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: p.value }} />
                <span className="truncate text-xs font-medium text-ink">{p.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-line-soft bg-surface p-2 shadow-2xs">
          <input
            type="color"
            value={priceColor}
            onChange={(e) => useEditor.getState().patchSelected({ priceColor: e.target.value })}
            className="size-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
          />
          <input
            type="text"
            value={priceColor}
            onChange={(e) => useEditor.getState().patchSelected({ priceColor: e.target.value })}
            className="flex-1 bg-transparent text-xs font-mono font-medium text-ink focus:outline-none uppercase"
          />
        </div>
      </div>

      {/* Button Color */}
      <div>
        <p className="mb-2.5 text-xs font-semibold tracking-wider text-muted uppercase">WhatsApp Button Color</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {buttonPresets.map((b) => {
            const active = buttonColor.toLowerCase() === b.value.toLowerCase();
            return (
              <button
                key={b.value}
                type="button"
                onClick={() => useEditor.getState().patchSelected({ buttonColor: b.value })}
                className={cn(
                  "tap-smooth flex items-center gap-2 rounded-xl border p-2 text-left transition-all",
                  active
                    ? "border-[#53389E] bg-[#EEF2FF]/60 shadow-xs ring-2 ring-[#53389E]/25"
                    : "border-line-soft bg-surface hover:bg-fill/70"
                )}
              >
                <span className="size-4 shrink-0 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: b.value }} />
                <span className="truncate text-xs font-medium text-ink">{b.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-line-soft bg-surface p-2 shadow-2xs">
          <input
            type="color"
            value={buttonColor}
            onChange={(e) => useEditor.getState().patchSelected({ buttonColor: e.target.value })}
            className="size-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
          />
          <input
            type="text"
            value={buttonColor}
            onChange={(e) => useEditor.getState().patchSelected({ buttonColor: e.target.value })}
            className="flex-1 bg-transparent text-xs font-mono font-medium text-ink focus:outline-none uppercase"
          />
        </div>
      </div>
    </div>
  );
}

const CURRENCY_PRESETS = [
  { code: "₹", label: "₹ INR (India)" },
  { code: "$", label: "$ USD (Global)" },
  { code: "AED", label: "AED (UAE)" },
  { code: "SAR", label: "SAR (Saudi)" },
  { code: "£", label: "£ GBP (UK)" },
  { code: "€", label: "€ EUR (Europe)" },
  { code: "QAR", label: "QAR (Qatar)" },
  { code: "KWD", label: "KWD (Kuwait)" },
];

function ProductCardCta() {
  const section = useEditor((s) => selectedSection(s));
  const rawNumber =
    (section && "whatsappNumber" in section && section.whatsappNumber) || "919876543210";
  const rawCurrency =
    (section && "currency" in section && section.currency) || "$";

  const [phone, setPhone] = useState(rawNumber);
  const [currency, setCurrency] = useState(rawCurrency);

  useEffect(() => {
    setPhone(rawNumber);
  }, [rawNumber]);

  useEffect(() => {
    setCurrency(rawCurrency);
  }, [rawCurrency]);

  const handleSave = () => {
    useEditor.getState().patchSelected({
      whatsappNumber: phone,
      currency,
    });
    useEditor.getState().showToast("Store WhatsApp & Currency synced to all pages.");
  };

  return (
    <div className="flex flex-col gap-5">
      {/* WhatsApp Number Section */}
      <div>
        <p className="mb-2.5 text-xs font-semibold tracking-wider text-muted uppercase">Seller WhatsApp Number</p>
        <div className="rounded-2xl border border-line-soft bg-surface p-4 shadow-2xs">
          <Field label="Phone number with country code (e.g. 919876543210)">
            <TextInput
              value={phone}
              placeholder="919876543210"
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-50/60 p-3 text-xs leading-relaxed text-emerald-950">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>Direct WhatsApp Ordering</span>
            </div>
            <p className="mt-1 text-emerald-800/80">
              When shoppers tap the WhatsApp button on any product card, an instant pre-filled order message opens directly with the product details and price.
            </p>
          </div>
        </div>
      </div>

      {/* Currency Section */}
      <div>
        <p className="mb-2.5 text-xs font-semibold tracking-wider text-muted uppercase">Store Currency</p>
        <div className="rounded-2xl border border-line-soft bg-surface p-4 shadow-2xs">
          <div className="mb-3 grid grid-cols-2 gap-2">
            {CURRENCY_PRESETS.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setCurrency(c.code);
                  useEditor.getState().patchSelected({ currency: c.code });
                }}
                className={cn(
                  "tap-smooth flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-medium transition-all cursor-pointer",
                  currency === c.code
                    ? "border-purple-600 bg-purple-50 text-purple-900 font-semibold shadow-2xs"
                    : "border-line-soft bg-surface hover:bg-fill/60 text-ink"
                )}
              >
                <span>{c.label}</span>
                <span className="font-bold text-sm text-purple-700">{c.code}</span>
              </button>
            ))}
          </div>

          <Field label="Custom Currency Symbol or Code">
            <TextInput
              value={currency}
              placeholder="e.g. ₹, $, AED, SAR"
              onChange={(e) => {
                setCurrency(e.target.value);
                useEditor.getState().patchSelected({ currency: e.target.value });
              }}
            />
          </Field>

          <p className="mt-2.5 text-[11px] text-muted">
            Changing store currency dynamically updates all prices across Home, Shop, Product Details, and Card Studio.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <PrimaryButton onClick={handleSave}>
          Save Store Details
        </PrimaryButton>
      </div>
    </div>
  );
}

function NavbarSticky({ current }: { current: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <TemplateCard
        active={current}
        onClick={() => useEditor.getState().patchSelected({ sticky: true })}
      >
        <div className="flex items-center justify-between rounded-xl border border-line-soft bg-fill/40 p-2.5">
          <div className="text-xs font-semibold text-slate-800">Sticky (Pinned to top)</div>
          <div className="h-1.5 w-12 rounded-full bg-accent" />
        </div>
      </TemplateCard>
      <TemplateCard
        active={!current}
        onClick={() => useEditor.getState().patchSelected({ sticky: false })}
      >
        <div className="flex items-center justify-between rounded-xl border border-line-soft bg-fill/40 p-2.5">
          <div className="text-xs font-semibold text-slate-800">Static (Scrollable)</div>
          <div className="h-1.5 w-12 rounded-full bg-slate-300" />
        </div>
      </TemplateCard>
    </div>
  );
}

function NavbarColor({ sec, text }: { sec?: NavbarSection; text?: string }) {
  const [tab, setTab] = useState<"background" | "text" | "iconColor">("background");
  const currentSec = sec || { background: "#ffffff", text: text || "#1d1d1f", iconColor: text || "#1d1d1f" };

  const currentColor =
    tab === "background"
      ? (currentSec.background || "#ffffff")
      : tab === "text"
      ? (currentSec.text || "#1d1d1f")
      : (currentSec.iconColor || currentSec.text || "#1d1d1f");

  const bgPalettes = [
    { name: "Clean White", value: "#ffffff" },
    { name: "Soft Cream", value: "#fbfbfd" },
    { name: "Warm Linen", value: "#f7f4ed" },
    { name: "Cool Mist", value: "#f1f5f9" },
    { name: "Pure Ink", value: "#0b0b0d" },
    { name: "Midnight", value: "#0f172a" },
    { name: "Deep Navy", value: "#0a192f" },
    { name: "Forest", value: "#064e3b" },
    { name: "Royal Violet", value: "#2e1065" },
    { name: "Wine Rose", value: "#4c0519" },
  ];

  const textPalettes = [
    { name: "Jet Black", value: "#111827" },
    { name: "Slate Dark", value: "#334155" },
    { name: "Muted Gray", value: "#64748b" },
    { name: "Pure White", value: "#ffffff" },
    { name: "Royal Purple", value: "#53389e" },
    { name: "Vibrant Blue", value: "#0071e3" },
    { name: "Emerald Green", value: "#16a34a" },
    { name: "Crimson Red", value: "#dc2626" },
    { name: "Warm Amber", value: "#d97706" },
    { name: "Rose Pink", value: "#e11d48" },
  ];

  const palettes = tab === "background" ? bgPalettes : textPalettes;

  const setColor = (val: string) => {
    useEditor.getState().patchSelected({ [tab]: val });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 3 Tabs: Background, Text, Icons */}
      <div className="flex rounded-2xl bg-fill p-1 border border-line-soft">
        {(["background", "text", "iconColor"] as const).map((t) => {
          const active = tab === t;
          const label = t === "background" ? "Background" : t === "text" ? "Text" : "Icons";
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-150",
                active ? "bg-surface text-ink shadow-xs border border-line/60" : "text-muted hover:text-ink"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Interactive Color Picker & Live Hex Input */}
      <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-line-soft bg-surface shadow-2xs">
        <label className="relative flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-2xl border-2 border-line shadow-xs overflow-hidden transition-transform active:scale-95">
          <input
            type="color"
            value={currentColor.startsWith("#") && currentColor.length === 7 ? currentColor : "#ffffff"}
            onChange={(e) => setColor(e.target.value)}
            className="absolute inset-0 size-full opacity-0 cursor-pointer"
          />
          <span
            className="size-full"
            style={{ background: currentColor }}
          />
        </label>
        <div className="flex-1 min-w-0">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {tab === "background" ? "Background Color" : tab === "text" ? "Text Color" : "Icon Color"}
          </label>
          <div className="relative mt-1 flex items-center">
            <span className="absolute left-3 text-xs font-mono text-muted">#</span>
            <input
              type="text"
              value={currentColor.replace(/^#/, "")}
              onChange={(e) => {
                const hex = `#${e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 8)}`;
                setColor(hex);
              }}
              placeholder="1d1d1f"
              className="w-full rounded-xl border border-line-soft bg-fill/50 pl-7 pr-3 py-1.5 text-xs font-mono uppercase tracking-wider text-ink focus:border-accent focus:bg-surface focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Preset Swatches Palette */}
      <div>
        <p className="mb-2 text-xs font-semibold text-muted uppercase tracking-wider">
          Curated Palettes
        </p>
        <div className="grid grid-cols-5 gap-2">
          {palettes.map((c) => {
            const active = currentColor.toLowerCase() === c.value.toLowerCase();
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className="tap-smooth group flex flex-col items-center gap-1.5 p-2 rounded-2xl border border-line-soft hover:bg-fill/70 transition-all"
              >
                <span
                  className={cn(
                    "size-8 rounded-full border border-line shadow-xs transition-transform group-hover:scale-105 flex items-center justify-center",
                    active && "ring-2 ring-accent ring-offset-2"
                  )}
                  style={{ background: c.value }}
                >
                  {active && (
                    <Check
                      className={cn(
                        "size-3.5 stroke-[2.5]",
                        c.value === "#ffffff" || c.value === "#fbfbfd" || c.value === "#f7f4ed" || c.value === "#f1f5f9"
                          ? "text-slate-900"
                          : "text-white"
                      )}
                    />
                  )}
                </span>
                <span className="text-[10px] font-medium text-muted truncate max-w-full group-hover:text-ink">
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NavbarElements({ sec }: { sec: NavbarSection }) {
  const [logoVal, setLogoVal] = useState(sec.logo);

  const toggles = [
    {
      key: "showLogo",
      label: "Brand Logo",
      detail: "Show logo image or monogram mark",
      enabled: sec.showLogo ?? true,
    },
    {
      key: "showBrandName",
      label: "Brand Name Text",
      detail: "Display store name in navbar",
      enabled: sec.showBrandName ?? true,
    },
    {
      key: "showMenu",
      label: "Mobile Menu Button",
      detail: "Display hamburger drawer button on mobile",
      enabled: sec.showMenu ?? true,
    },
    {
      key: "showSearch",
      label: "Search Action",
      detail: "Display search icon or search bar",
      enabled: sec.showSearch ?? true,
    },
    {
      key: "showCart",
      label: "WhatsApp / Bag Icon",
      detail: "Direct order action or cart icon",
      enabled: sec.showCart ?? true,
    },
    {
      key: "showLinks",
      label: "Page Navigation Links",
      detail: "Show Home, Shop & Product links",
      enabled: sec.showLinks ?? true,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      {/* Brand Name Input */}
      <div className="flex flex-col gap-2 rounded-2xl border border-line-soft bg-surface p-3.5 shadow-2xs">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">
          Brand Name
        </label>
        <input
          type="text"
          value={logoVal}
          onChange={(e) => {
            setLogoVal(e.target.value);
            useEditor.getState().patchSelected({ logo: e.target.value });
          }}
          placeholder="Store Name"
          className="rounded-xl border border-line-soft bg-fill/50 px-3 py-2 text-sm font-medium text-ink focus:border-accent focus:bg-surface focus:outline-hidden"
        />
      </div>

      {/* Elements Visibility Toggles */}
      <div>
        <p className="mb-2 text-xs font-semibold text-muted uppercase tracking-wider">
          Header Elements
        </p>
        <div className="divide-y divide-line-soft overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-2xs">
          {toggles.map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3.5">
              <div className="pr-3">
                <div className="text-sm font-semibold text-ink">{item.label}</div>
                <div className="text-xs text-muted">{item.detail}</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={item.enabled}
                onClick={() =>
                  useEditor.getState().patchSelected({ [item.key]: !item.enabled })
                }
                className={cn(
                  "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                  item.enabled ? "bg-accent" : "bg-slate-200 dark:bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                    item.enabled ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NavbarMore({ sec }: { sec: NavbarSection }) {
  const [openSection, setOpenSection] = useState<string | null>("layout");

  const toggle = (id: string) => {
    setOpenSection((cur) => (cur === id ? null : id));
  };

  const defaultLinks: NavbarLink[] = [
    { id: "1", label: "Home", url: "home" },
    { id: "2", label: "Shop", url: "shop" },
    { id: "3", label: "Product", url: "product" },
  ];

  const currentLinks = sec.links && sec.links.length > 0 ? sec.links : defaultLinks;

  return (
    <div className="flex flex-col gap-3">
      {/* 1. Layout & Shape */}
      <div className="overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-2xs">
        <button
          type="button"
          onClick={() => toggle("layout")}
          className="flex w-full items-center justify-between p-3.5 text-left transition-colors hover:bg-fill/60"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-xl bg-fill text-ink">
              <Sliders className="size-4" />
            </div>
            <span className="text-sm font-semibold text-ink">Layout & Shape</span>
          </div>
          <ChevronDown
            className={cn("size-4 text-muted transition-transform duration-200", openSection === "layout" && "rotate-180")}
          />
        </button>
        {openSection === "layout" && (
          <div className="border-t border-line-soft p-3.5 space-y-4">
            {/* Full-width vs Floating Pill */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">Layout Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => useEditor.getState().patchSelected({ isFloating: false })}
                  className={cn(
                    "py-2 text-xs font-semibold rounded-xl border text-center transition-all",
                    !sec.isFloating
                      ? "border-accent bg-accent/10 text-accent font-bold"
                      : "border-line-soft bg-surface text-ink hover:bg-fill"
                  )}
                >
                  Full Width
                </button>
                <button
                  type="button"
                  onClick={() => useEditor.getState().patchSelected({ isFloating: true })}
                  className={cn(
                    "py-2 text-xs font-semibold rounded-xl border text-center transition-all",
                    sec.isFloating
                      ? "border-accent bg-accent/10 text-accent font-bold"
                      : "border-line-soft bg-surface text-ink hover:bg-fill"
                  )}
                >
                  Floating Pill
                </button>
              </div>
            </div>

            {/* Height Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted">Bar Height</span>
                <span className="font-semibold text-ink">{sec.height || 56}px</span>
              </div>
              <input
                type="range"
                min={48}
                max={80}
                step={2}
                value={sec.height || 56}
                onChange={(e) => useEditor.getState().patchSelected({ height: Number(e.target.value) })}
                className="accent-accent w-full cursor-pointer"
              />
            </div>

            {/* Corner Radius Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted">Corner Radius</span>
                <span className="font-semibold text-ink">
                  {sec.borderRadius === 9999 ? "Full Pill" : `${sec.borderRadius ?? (sec.isFloating ? 9999 : 0)}px`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={40}
                  step={2}
                  value={sec.borderRadius === 9999 ? 40 : (sec.borderRadius ?? (sec.isFloating ? 40 : 0))}
                  onChange={(e) => useEditor.getState().patchSelected({ borderRadius: Number(e.target.value) })}
                  className="accent-accent flex-1 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => useEditor.getState().patchSelected({ borderRadius: 9999 })}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-fill hover:bg-line-soft text-ink shrink-0"
                >
                  Pill
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Borders & Effects */}
      <div className="overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-2xs">
        <button
          type="button"
          onClick={() => toggle("borders")}
          className="flex w-full items-center justify-between p-3.5 text-left transition-colors hover:bg-fill/60"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-xl bg-fill text-ink">
              <Layers className="size-4" />
            </div>
            <span className="text-sm font-semibold text-ink">Borders & Effects</span>
          </div>
          <ChevronDown
            className={cn("size-4 text-muted transition-transform duration-200", openSection === "borders" && "rotate-180")}
          />
        </button>
        {openSection === "borders" && (
          <div className="border-t border-line-soft p-3.5 space-y-4">
            {/* Border Style */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">Border Style</label>
              <div className="grid grid-cols-3 gap-2">
                {(["none", "subtle", "solid"] as const).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => useEditor.getState().patchSelected({ borderStyle: b })}
                    className={cn(
                      "py-1.5 text-xs font-semibold rounded-xl border capitalize transition-all",
                      (sec.borderStyle || "subtle") === b
                        ? "border-accent bg-accent/10 text-accent font-bold"
                        : "border-line-soft bg-surface text-ink hover:bg-fill"
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Shadow */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">Shadow Effect</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(["none", "subtle", "float", "glass"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => useEditor.getState().patchSelected({ shadow: s })}
                    className={cn(
                      "py-1.5 text-xs font-semibold rounded-xl border capitalize transition-all",
                      (sec.shadow || "none") === s
                        ? "border-accent bg-accent/10 text-accent font-bold"
                        : "border-line-soft bg-surface text-ink hover:bg-fill"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Backdrop Blur toggle */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-xs font-semibold text-ink">Backdrop Blur</div>
                <div className="text-[11px] text-muted">Frosted glass behind navbar</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={sec.backdropBlur !== false}
                onClick={() => useEditor.getState().patchSelected({ backdropBlur: sec.backdropBlur === false ? true : false })}
                className={cn(
                  "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                  sec.backdropBlur !== false ? "bg-accent" : "bg-slate-200 dark:bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200",
                    sec.backdropBlur !== false ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Typography */}
      <div className="overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-2xs">
        <button
          type="button"
          onClick={() => toggle("typography")}
          className="flex w-full items-center justify-between p-3.5 text-left transition-colors hover:bg-fill/60"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-xl bg-fill text-ink">
              <Type className="size-4" />
            </div>
            <span className="text-sm font-semibold text-ink">Typography</span>
          </div>
          <ChevronDown
            className={cn("size-4 text-muted transition-transform duration-200", openSection === "typography" && "rotate-180")}
          />
        </button>
        {openSection === "typography" && (
          <div className="border-t border-line-soft p-3.5 space-y-4">
            {/* Font size */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">Brand & Link Size</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(["sm", "base", "lg", "xl"] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => useEditor.getState().patchSelected({ fontSize: sz })}
                    className={cn(
                      "py-1.5 text-xs font-semibold rounded-xl border uppercase transition-all",
                      (sec.fontSize || "base") === sz
                        ? "border-accent bg-accent/10 text-accent font-bold"
                        : "border-line-soft bg-surface text-ink hover:bg-fill"
                    )}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Font weight */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">Font Weight</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(["normal", "medium", "semibold", "bold"] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => useEditor.getState().patchSelected({ fontWeight: w })}
                    className={cn(
                      "py-1.5 text-xs font-semibold rounded-xl border capitalize transition-all",
                      (sec.fontWeight || "semibold") === w
                        ? "border-accent bg-accent/10 text-accent font-bold"
                        : "border-line-soft bg-surface text-ink hover:bg-fill"
                    )}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Letter spacing */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">Letter Spacing</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(["tight", "normal", "wide", "widest"] as const).map((ls) => (
                  <button
                    key={ls}
                    type="button"
                    onClick={() => useEditor.getState().patchSelected({ letterSpacing: ls })}
                    className={cn(
                      "py-1.5 text-xs font-semibold rounded-xl border capitalize transition-all",
                      (sec.letterSpacing || "normal") === ls
                        ? "border-accent bg-accent/10 text-accent font-bold"
                        : "border-line-soft bg-surface text-ink hover:bg-fill"
                    )}
                  >
                    {ls}
                  </button>
                ))}
              </div>
            </div>

            {/* Uppercase toggle */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-xs font-semibold text-ink">Uppercase Brand & Links</div>
                <div className="text-[11px] text-muted">Display text in ALL CAPS</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={sec.uppercase !== false}
                onClick={() => useEditor.getState().patchSelected({ uppercase: sec.uppercase === false ? true : false })}
                className={cn(
                  "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                  sec.uppercase !== false ? "bg-accent" : "bg-slate-200 dark:bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200",
                    sec.uppercase !== false ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Menu Customization */}
      <div className="overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-2xs">
        <button
          type="button"
          onClick={() => toggle("menu")}
          className="flex w-full items-center justify-between p-3.5 text-left transition-colors hover:bg-fill/60"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-xl bg-fill text-ink">
              <Compass className="size-4" />
            </div>
            <span className="text-sm font-semibold text-ink">Menu Customization</span>
          </div>
          <ChevronDown
            className={cn("size-4 text-muted transition-transform duration-200", openSection === "menu" && "rotate-180")}
          />
        </button>
        {openSection === "menu" && (
          <div className="border-t border-line-soft p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">Menu Links</label>
              <button
                type="button"
                onClick={() => {
                  const newLink: NavbarLink = {
                    id: Date.now().toString(),
                    label: "New Link",
                    url: "shop",
                  };
                  useEditor.getState().patchSelected({ links: [...currentLinks, newLink] });
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
              >
                <Plus className="size-3.5" />
                <span>Add Link</span>
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {currentLinks.map((link, idx) => (
                <div key={link.id} className="flex items-center gap-2 p-2 rounded-xl border border-line-soft bg-fill/40">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => {
                      const updated = [...currentLinks];
                      updated[idx] = { ...link, label: e.target.value };
                      useEditor.getState().patchSelected({ links: updated });
                    }}
                    placeholder="Label"
                    className="flex-1 rounded-lg border border-line-soft bg-surface px-2.5 py-1 text-xs font-medium text-ink focus:border-accent focus:outline-hidden"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => {
                      const updated = [...currentLinks];
                      updated[idx] = { ...link, url: e.target.value };
                      useEditor.getState().patchSelected({ links: updated });
                    }}
                    placeholder="URL / Page"
                    className="w-24 rounded-lg border border-line-soft bg-surface px-2 py-1 text-xs font-mono text-muted focus:border-accent focus:outline-hidden"
                  />
                  <button
                    type="button"
                    aria-label="Remove link"
                    onClick={() => {
                      const updated = currentLinks.filter((_, i) => i !== idx);
                      useEditor.getState().patchSelected({ links: updated });
                    }}
                    className="p-1 text-muted hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Behavior */}
      <div className="overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-2xs">
        <button
          type="button"
          onClick={() => toggle("behavior")}
          className="flex w-full items-center justify-between p-3.5 text-left transition-colors hover:bg-fill/60"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-xl bg-fill text-ink">
              <Shield className="size-4" />
            </div>
            <span className="text-sm font-semibold text-ink">Behavior</span>
          </div>
          <ChevronDown
            className={cn("size-4 text-muted transition-transform duration-200", openSection === "behavior" && "rotate-180")}
          />
        </button>
        {openSection === "behavior" && (
          <div className="border-t border-line-soft p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-ink">Sticky Navigation</div>
                <div className="text-xs text-muted">Keep header pinned to top when scrolling</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={sec.sticky ?? true}
                onClick={() => useEditor.getState().patchSelected({ sticky: !(sec.sticky ?? true) })}
                className={cn(
                  "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                  (sec.sticky ?? true) ? "bg-accent" : "bg-slate-200 dark:bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200",
                    (sec.sticky ?? true) ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NavbarLayout({ sec }: { sec: NavbarSection }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Full-width vs Floating Pill */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">Layout Mode</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => useEditor.getState().patchSelected({ isFloating: false })}
            className={cn(
              "py-2.5 text-xs font-semibold rounded-xl border text-center transition-all",
              !sec.isFloating
                ? "border-accent bg-accent/10 text-accent font-bold ring-2 ring-accent/20"
                : "border-line-soft bg-surface text-ink hover:bg-fill"
            )}
          >
            Full Width
          </button>
          <button
            type="button"
            onClick={() => useEditor.getState().patchSelected({ isFloating: true })}
            className={cn(
              "py-2.5 text-xs font-semibold rounded-xl border text-center transition-all",
              sec.isFloating
                ? "border-accent bg-accent/10 text-accent font-bold ring-2 ring-accent/20"
                : "border-line-soft bg-surface text-ink hover:bg-fill"
            )}
          >
            Floating Pill
          </button>
        </div>
      </div>

      {/* Height Slider */}
      <div className="flex flex-col gap-2 rounded-2xl border border-line-soft bg-surface p-3.5 shadow-2xs">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Bar Height</span>
          <span className="text-xs font-bold text-accent font-mono bg-accent/10 px-2 py-0.5 rounded-md">
            {sec.height || 56}px
          </span>
        </div>
        <input
          type="range"
          min={48}
          max={80}
          step={2}
          value={sec.height || 56}
          onChange={(e) => useEditor.getState().patchSelected({ height: Number(e.target.value) })}
          className="accent-accent w-full cursor-pointer h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-muted font-mono">
          <span>Compact (48px)</span>
          <span>Standard (56px)</span>
          <span>Roomy (80px)</span>
        </div>
      </div>

      {/* Corner Radius Slider */}
      <div className="flex flex-col gap-2 rounded-2xl border border-line-soft bg-surface p-3.5 shadow-2xs">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Corner Radius</span>
          <span className="text-xs font-bold text-accent font-mono bg-accent/10 px-2 py-0.5 rounded-md">
            {sec.borderRadius === 9999 ? "Full Pill (9999px)" : `${sec.borderRadius ?? (sec.isFloating ? 9999 : 0)}px`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={40}
            step={2}
            value={sec.borderRadius === 9999 ? 40 : (sec.borderRadius ?? (sec.isFloating ? 40 : 0))}
            onChange={(e) => useEditor.getState().patchSelected({ borderRadius: Number(e.target.value) })}
            className="accent-accent flex-1 cursor-pointer h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg"
          />
          <button
            type="button"
            onClick={() => useEditor.getState().patchSelected({ borderRadius: 9999 })}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-xl border shrink-0 transition-all",
              sec.borderRadius === 9999
                ? "border-accent bg-accent text-white"
                : "border-line-soft bg-fill hover:bg-line-soft text-ink"
            )}
          >
            Pill
          </button>
        </div>
      </div>
    </div>
  );
}

function NavbarEffects({ sec }: { sec: NavbarSection }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Border Style */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">Border Style</label>
        <div className="grid grid-cols-3 gap-2">
          {(["none", "subtle", "solid"] as const).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => useEditor.getState().patchSelected({ borderStyle: b })}
              className={cn(
                "py-2 text-xs font-semibold rounded-xl border capitalize transition-all",
                (sec.borderStyle || "subtle") === b
                  ? "border-accent bg-accent/10 text-accent font-bold ring-2 ring-accent/20"
                  : "border-line-soft bg-surface text-ink hover:bg-fill"
              )}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Shadow Effect */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">Shadow Effect</label>
        <div className="grid grid-cols-4 gap-1.5">
          {(["none", "subtle", "float", "glass"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => useEditor.getState().patchSelected({ shadow: s })}
              className={cn(
                "py-2 text-xs font-semibold rounded-xl border capitalize transition-all",
                (sec.shadow || "none") === s
                  ? "border-accent bg-accent/10 text-accent font-bold ring-2 ring-accent/20"
                  : "border-line-soft bg-surface text-ink hover:bg-fill"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Backdrop Blur toggle */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl border border-line-soft bg-surface shadow-2xs">
        <div>
          <div className="text-sm font-semibold text-ink">Backdrop Blur</div>
          <div className="text-xs text-muted">Frosted glass effect behind header</div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={sec.backdropBlur !== false}
          onClick={() => useEditor.getState().patchSelected({ backdropBlur: sec.backdropBlur === false ? true : false })}
          className={cn(
            "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
            sec.backdropBlur !== false ? "bg-accent" : "bg-slate-200 dark:bg-zinc-700"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200",
              sec.backdropBlur !== false ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>
    </div>
  );
}

function NavbarTypography({ sec }: { sec: NavbarSection }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Font size */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">Brand & Link Size</label>
        <div className="grid grid-cols-4 gap-1.5">
          {(["sm", "base", "lg", "xl"] as const).map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => useEditor.getState().patchSelected({ fontSize: sz })}
              className={cn(
                "py-2 text-xs font-semibold rounded-xl border uppercase transition-all",
                (sec.fontSize || "base") === sz
                  ? "border-accent bg-accent/10 text-accent font-bold ring-2 ring-accent/20"
                  : "border-line-soft bg-surface text-ink hover:bg-fill"
              )}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Font weight */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">Font Weight</label>
        <div className="grid grid-cols-4 gap-1.5">
          {(["normal", "medium", "semibold", "bold"] as const).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => useEditor.getState().patchSelected({ fontWeight: w })}
              className={cn(
                "py-2 text-xs font-semibold rounded-xl border capitalize transition-all",
                (sec.fontWeight || "semibold") === w
                  ? "border-accent bg-accent/10 text-accent font-bold ring-2 ring-accent/20"
                  : "border-line-soft bg-surface text-ink hover:bg-fill"
              )}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Letter spacing */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">Letter Spacing</label>
        <div className="grid grid-cols-4 gap-1.5">
          {(["tight", "normal", "wide", "widest"] as const).map((ls) => (
            <button
              key={ls}
              type="button"
              onClick={() => useEditor.getState().patchSelected({ letterSpacing: ls })}
              className={cn(
                "py-2 text-xs font-semibold rounded-xl border capitalize transition-all",
                (sec.letterSpacing || "normal") === ls
                  ? "border-accent bg-accent/10 text-accent font-bold ring-2 ring-accent/20"
                  : "border-line-soft bg-surface text-ink hover:bg-fill"
              )}
            >
              {ls}
            </button>
          ))}
        </div>
      </div>

      {/* Uppercase toggle */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl border border-line-soft bg-surface shadow-2xs">
        <div>
          <div className="text-sm font-semibold text-ink">Uppercase Brand & Links</div>
          <div className="text-xs text-muted">Display brand name & links in ALL CAPS</div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={sec.uppercase !== false}
          onClick={() => useEditor.getState().patchSelected({ uppercase: sec.uppercase === false ? true : false })}
          className={cn(
            "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
            sec.uppercase !== false ? "bg-accent" : "bg-slate-200 dark:bg-zinc-700"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200",
              sec.uppercase !== false ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>
    </div>
  );
}

function NavbarLinks({ sec }: { sec: NavbarSection }) {
  const defaultLinks: NavbarLink[] = [
    { id: "1", label: "Home", url: "home" },
    { id: "2", label: "Shop", url: "shop" },
    { id: "3", label: "Product", url: "product" },
  ];

  const currentLinks = sec.links && sec.links.length > 0 ? sec.links : defaultLinks;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">Navigation Links</label>
        <button
          type="button"
          onClick={() => {
            const newLink: NavbarLink = {
              id: Date.now().toString(),
              label: "New Link",
              url: "shop",
            };
            useEditor.getState().patchSelected({ links: [...currentLinks, newLink] });
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
        >
          <Plus className="size-3.5" />
          <span>Add Link</span>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {currentLinks.map((link, idx) => (
          <div key={link.id} className="flex items-center gap-2 p-2.5 rounded-2xl border border-line-soft bg-surface shadow-2xs">
            <input
              type="text"
              value={link.label}
              onChange={(e) => {
                const updated = [...currentLinks];
                updated[idx] = { ...link, label: e.target.value };
                useEditor.getState().patchSelected({ links: updated });
              }}
              placeholder="Label"
              className="flex-1 rounded-xl border border-line-soft bg-fill/50 px-3 py-1.5 text-xs font-medium text-ink focus:border-accent focus:bg-surface focus:outline-hidden"
            />
            <input
              type="text"
              value={link.url}
              onChange={(e) => {
                const updated = [...currentLinks];
                updated[idx] = { ...link, url: e.target.value };
                useEditor.getState().patchSelected({ links: updated });
              }}
              placeholder="URL / Page"
              className="w-28 rounded-xl border border-line-soft bg-fill/50 px-3 py-1.5 text-xs font-mono text-muted focus:border-accent focus:bg-surface focus:outline-hidden"
            />
            <button
              type="button"
              aria-label="Remove link"
              onClick={() => {
                const updated = currentLinks.filter((_, i) => i !== idx);
                useEditor.getState().patchSelected({ links: updated });
              }}
              className="p-1.5 text-muted hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const RATIOS: { id: HeroRatio; title: string; detail: string; aspect: string }[] = [
  { id: "16:9", title: "16:9 Widescreen", detail: "Standard modern widescreen banner.", aspect: "16 / 9" },
  { id: "21:9", title: "21:9 Cinematic", detail: "Ultra-wide panoramic showcase.", aspect: "21 / 9" },
  { id: "4:3", title: "4:3 Classic", detail: "Taller classic photo format.", aspect: "4 / 3" },
  { id: "3:2", title: "3:2 Standard", detail: "Classic 35mm landscape format.", aspect: "3 / 2" },
  { id: "1:1", title: "1:1 Square", detail: "Compact square product showcase.", aspect: "1 / 1" },
  { id: "auto", title: "Auto Responsive", detail: "Natural height adapting to content.", aspect: "auto" },
];

function HeroWidthSheet({ hero }: { hero: HeroSection }) {
  const current = hero.widthMode ?? "full";
  const options: { id: HeroWidth; title: string; subtitle: string; visual: string }[] = [
    { id: "full", title: "Full Width", subtitle: "Edge-to-edge bleed, 0 side gap", visual: "w-full" },
    { id: "gap-sm", title: "Small Gap", subtitle: "Sleek inset with subtle side margin", visual: "w-11/12 mx-auto" },
    { id: "gap-md", title: "Medium Gap", subtitle: "Centered container with balanced gap", visual: "w-4/5 mx-auto" },
    { id: "gap-lg", title: "Large Gap", subtitle: "Compact card layout with spacious margins", visual: "w-3/5 mx-auto" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => (
        <TemplateCard
          key={opt.id}
          active={current === opt.id}
          onClick={() => useEditor.getState().patchSelected({ widthMode: opt.id })}
        >
          <div className="flex items-center gap-3">
            <div className="w-20 h-10 rounded-xl bg-fill/80 border border-line-soft flex items-center justify-center p-1.5 shrink-0">
              <div className={cn("h-full rounded-md bg-accent/70 transition-all", opt.visual)} />
            </div>
            <div>
              <div className="text-sm font-semibold text-ink">{opt.title}</div>
              <div className="text-xs text-muted">{opt.subtitle}</div>
            </div>
          </div>
        </TemplateCard>
      ))}
    </div>
  );
}

function HeroBackgroundSheet({ hero }: { hero: HeroSection }) {
  const current = hero.background || "transparent";
  const isTransparent = current === "transparent";

  const palettes = [
    { name: "Clean White", value: "#ffffff" },
    { name: "Soft Cream", value: "#fbfbfd" },
    { name: "Warm Linen", value: "#f7f4ed" },
    { name: "Pure Ink", value: "#0b0b0d" },
    { name: "Midnight", value: "#0f172a" },
    { name: "Deep Slate", value: "#1e293b" },
    { name: "Royal Violet", value: "#2e1065" },
    { name: "Deep Navy", value: "#0a192f" },
    { name: "Forest", value: "#064e3b" },
    { name: "Warm Amber", value: "#d97706" },
  ];

  const setColor = (val: string) => {
    useEditor.getState().patchSelected({ background: val });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Quick Transparent Button (Default) */}
      <button
        type="button"
        onClick={() => setColor("transparent")}
        className={cn(
          "tap-smooth flex items-center justify-between p-3.5 rounded-2xl border transition-all",
          isTransparent
            ? "border-accent bg-accent/10 text-accent font-semibold ring-2 ring-accent/20"
            : "border-line-soft bg-surface text-ink hover:bg-fill"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full border border-dashed border-slate-400 bg-linear-to-tr from-slate-200 to-transparent flex items-center justify-center">
            <span className="text-[10px] font-bold text-muted">∅</span>
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold">Transparent (Default)</div>
            <div className="text-xs text-muted">Shows underlying store canvas</div>
          </div>
        </div>
        {isTransparent && <Check className="size-4 text-accent" strokeWidth={2.5} />}
      </button>

      {/* Interactive Custom Color Picker */}
      <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-line-soft bg-surface shadow-2xs">
        <label className="relative flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-2xl border-2 border-line shadow-xs overflow-hidden transition-transform active:scale-95">
          <input
            type="color"
            value={current.startsWith("#") && current.length === 7 ? current : "#ffffff"}
            onChange={(e) => setColor(e.target.value)}
            className="absolute inset-0 size-full opacity-0 cursor-pointer"
          />
          <span
            className="size-full"
            style={{ background: isTransparent ? "transparent" : current }}
          />
        </label>
        <div className="flex-1 min-w-0">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Custom Background Color
          </label>
          <div className="relative mt-1 flex items-center">
            <span className="absolute left-3 text-xs font-mono text-muted">#</span>
            <input
              type="text"
              value={isTransparent ? "" : current.replace(/^#/, "")}
              onChange={(e) => {
                const hex = `#${e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 8)}`;
                setColor(hex);
              }}
              placeholder="transparent"
              className="w-full rounded-xl border border-line-soft bg-fill/50 pl-7 pr-3 py-1.5 text-xs font-mono uppercase tracking-wider text-ink focus:border-accent focus:bg-surface focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Preset Swatches Palette */}
      <div>
        <p className="mb-2 text-xs font-semibold text-muted uppercase tracking-wider">
          Curated Palettes
        </p>
        <div className="grid grid-cols-5 gap-2">
          {palettes.map((c) => {
            const active = !isTransparent && current.toLowerCase() === c.value.toLowerCase();
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className="tap-smooth group flex flex-col items-center gap-1.5 p-2 rounded-2xl border border-line-soft hover:bg-fill/70 transition-all"
              >
                <span
                  className={cn(
                    "size-8 rounded-full border border-line shadow-xs transition-transform group-hover:scale-105 flex items-center justify-center",
                    active && "ring-2 ring-accent ring-offset-2"
                  )}
                  style={{ background: c.value }}
                >
                  {active && (
                    <Check
                      className={cn(
                        "size-3.5 stroke-[2.5]",
                        c.value === "#ffffff" || c.value === "#fbfbfd" || c.value === "#f7f4ed"
                          ? "text-slate-900"
                          : "text-white"
                      )}
                    />
                  )}
                </span>
                <span className="text-[10px] font-medium text-muted truncate max-w-full group-hover:text-ink">
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HeroRatioSheet({ hero }: { hero: HeroSection }) {
  const current = hero.ratio ?? "16:9";
  const ratios: { id: HeroRatio; title: string; subtitle: string; aspectBox: string }[] = [
    { id: "16:9", title: "16:9 Widescreen", subtitle: "Standard modern widescreen banner", aspectBox: "aspect-video" },
    { id: "21:9", title: "21:9 Cinematic", subtitle: "Ultra-wide panoramic showcase", aspectBox: "aspect-[21/9]" },
    { id: "4:3", title: "4:3 Classic", subtitle: "Taller classic photo format", aspectBox: "aspect-[4/3]" },
    { id: "3:2", title: "3:2 Standard", subtitle: "Classic 35mm landscape format", aspectBox: "aspect-[3/2]" },
    { id: "1:1", title: "1:1 Square", subtitle: "Compact square product showcase", aspectBox: "aspect-square" },
    { id: "auto", title: "Auto Responsive", subtitle: "Natural height adapting to content", aspectBox: "aspect-auto" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {ratios.map((item) => (
        <TemplateCard
          key={item.id}
          active={current === item.id}
          onClick={() => useEditor.getState().patchSelected({ ratio: item.id })}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-10 rounded-xl bg-fill/80 border border-line-soft flex items-center justify-center p-1 shrink-0">
              <div className={cn("w-full max-h-full bg-accent/70 rounded-md", item.aspectBox)} />
            </div>
            <div>
              <div className="text-sm font-semibold text-ink">{item.title}</div>
              <div className="text-xs text-muted">{item.subtitle}</div>
            </div>
          </div>
        </TemplateCard>
      ))}
    </div>
  );
}

function HeroPaddingSheet({ hero }: { hero: HeroSection }) {
  const paddingY = hero.paddingY ?? "none";
  const paddingX = hero.paddingX ?? "none";

  const pyOptions: { id: HeroPadding; label: string; desc: string }[] = [
    { id: "none", label: "None (0px)", desc: "Flush border" },
    { id: "sm", label: "Compact (12px)", desc: "Subtle breathing room" },
    { id: "md", label: "Standard (24px)", desc: "Balanced spacing" },
    { id: "lg", label: "Spacious (40px)", desc: "Roomy luxury layout" },
  ];

  const pxOptions: { id: HeroPadding; label: string; desc: string }[] = [
    { id: "none", label: "None (0px)", desc: "Edge-to-edge" },
    { id: "sm", label: "Compact (8px)", desc: "Subtle inset" },
    { id: "md", label: "Standard (16px)", desc: "Balanced side margin" },
    { id: "lg", label: "Roomy (32px)", desc: "Framed card" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">
          Vertical Spacing (Top & Bottom)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {pyOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => useEditor.getState().patchSelected({ paddingY: opt.id })}
              className={cn(
                "p-3 rounded-2xl border text-left transition-all",
                paddingY === opt.id
                  ? "border-accent bg-accent/10 ring-2 ring-accent/20"
                  : "border-line-soft bg-surface hover:bg-fill"
              )}
            >
              <div className="text-xs font-semibold text-ink">{opt.label}</div>
              <div className="text-[11px] text-muted">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">
          Side Spacing (Left & Right)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {pxOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => useEditor.getState().patchSelected({ paddingX: opt.id })}
              className={cn(
                "p-3 rounded-2xl border text-left transition-all",
                paddingX === opt.id
                  ? "border-accent bg-accent/10 ring-2 ring-accent/20"
                  : "border-line-soft bg-surface hover:bg-fill"
              )}
            >
              <div className="text-xs font-semibold text-ink">{opt.label}</div>
              <div className="text-[11px] text-muted">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroRadiusSheet({ hero }: { hero: HeroSection }) {
  const current = hero.borderRadius ?? 0;
  const presets = [
    { label: "Sharp", value: 0 },
    { label: "Subtle", value: 8 },
    { label: "Rounded", value: 16 },
    { label: "Curved", value: 24 },
    { label: "Extra", value: 36 },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-line-soft bg-surface p-4 shadow-2xs">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Corner Curvature</span>
          <span className="text-xs font-bold text-accent font-mono bg-accent/10 px-2.5 py-1 rounded-lg">
            {current}px
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={48}
          step={2}
          value={current}
          onChange={(e) => useEditor.getState().patchSelected({ borderRadius: Number(e.target.value) })}
          className="accent-accent w-full cursor-pointer h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-muted font-mono">
          <span>0px (Sharp)</span>
          <span>24px (Medium)</span>
          <span>48px (Pill)</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">Quick Presets</label>
        <div className="grid grid-cols-5 gap-2">
          {presets.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => useEditor.getState().patchSelected({ borderRadius: p.value })}
              className={cn(
                "py-2.5 text-xs font-semibold rounded-xl border text-center transition-all",
                current === p.value
                  ? "border-accent bg-accent text-white"
                  : "border-line-soft bg-surface hover:bg-fill text-ink"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroAnimationSheet({ hero }: { hero: HeroSection }) {
  const currentEffect = hero.animationEffect ?? "slide";
  const autoplay = hero.autoplay !== false;
  const speed = hero.autoplaySpeed ?? 4500;

  const effects: { id: HeroAnimation; label: string; desc: string }[] = [
    { id: "slide", label: "Slide Transition", desc: "Classic smooth horizontal slide" },
    { id: "fade", label: "Gentle Fade", desc: "Soft crossfade between banner slides" },
    { id: "zoom", label: "Ken Burns Zoom", desc: "Subtle elegant zoom animation" },
    { id: "none", label: "Static / None", desc: "Instant banner image switch" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Autoplay Toggle */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl border border-line-soft bg-surface shadow-2xs">
        <div>
          <div className="text-sm font-semibold text-ink">Autoplay Slideshow</div>
          <div className="text-xs text-muted">Automatically cycle through hero images</div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={autoplay}
          onClick={() => useEditor.getState().patchSelected({ autoplay: !autoplay })}
          className={cn(
            "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
            autoplay ? "bg-accent" : "bg-slate-200 dark:bg-zinc-700"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200",
              autoplay ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>

      {/* Slide Speed */}
      {autoplay && (
        <div className="flex flex-col gap-2 rounded-2xl border border-line-soft bg-surface p-3.5 shadow-2xs">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider">
            Slide Interval Speed
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Fast (2.5s)", val: 2500 },
              { label: "Normal (4.5s)", val: 4500 },
              { label: "Relaxed (7s)", val: 7000 },
            ].map((s) => (
              <button
                key={s.val}
                type="button"
                onClick={() => useEditor.getState().patchSelected({ autoplaySpeed: s.val })}
                className={cn(
                  "py-2 text-xs font-semibold rounded-xl border text-center transition-all",
                  speed === s.val
                    ? "border-accent bg-accent/10 text-accent font-bold ring-2 ring-accent/20"
                    : "border-line-soft bg-surface hover:bg-fill text-ink"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Transition Style */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">
          Transition Style
        </label>
        <div className="flex flex-col gap-2">
          {effects.map((eff) => (
            <TemplateCard
              key={eff.id}
              active={currentEffect === eff.id}
              onClick={() => useEditor.getState().patchSelected({ animationEffect: eff.id })}
            >
              <div>
                <div className="text-sm font-semibold text-ink">{eff.label}</div>
                <div className="text-xs text-muted">{eff.desc}</div>
              </div>
            </TemplateCard>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroMediaSheet() {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="flex flex-col gap-4 text-center py-2">
      <div className="mx-auto flex size-14 items-center justify-center rounded-3xl bg-accent/10 text-accent">
        <Image className="size-7" />
      </div>

      <div>
        <h3 className="text-base font-bold text-ink">Manage Banner Images</h3>
        <p className="mt-1 text-xs text-muted leading-relaxed max-w-sm mx-auto">
          Hero banner images and slides are managed in the <strong>Dashboard</strong>. Would you like to switch to the Dashboard to update and arrange your banner media?
        </p>
      </div>

      {confirmed ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          ✓ Dashboard redirection ready. You will be able to upload, crop, and reorder hero banners in the Media Dashboard.
        </div>
      ) : (
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={() => setConfirmed(true)}
            className="w-full py-3 rounded-2xl bg-accent text-white text-sm font-semibold shadow-xs hover:bg-accent/90 transition-all active:scale-[0.99]"
          >
            Yes, Go to Dashboard
          </button>
          <button
            type="button"
            onClick={() => useEditor.getState().closeSheet()}
            className="w-full py-2.5 rounded-2xl border border-line-soft bg-surface text-ink text-xs font-medium hover:bg-fill transition-all"
          >
            Stay in Designer
          </button>
        </div>
      )}
    </div>
  );
}

function HeroLayouts({ hero }: { hero: HeroSection }) {
  const currentRatio = hero.ratio ?? "16:9";
  const currentImg = hero.slides[hero.active] ?? hero.slides[0];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        {RATIOS.map((item) => (
          <TemplateCard
            key={item.id}
            active={currentRatio === item.id}
            onClick={() => useEditor.getState().patchSelected({ ratio: item.id })}
          >
            <div className="flex items-center gap-3">
              <div className="w-24 overflow-hidden rounded-lg border border-line-soft bg-fill/40 shrink-0">
                <div
                  className="w-full bg-cover bg-center"
                  style={{
                    aspectRatio: item.aspect,
                    backgroundImage: `url(${currentImg})`,
                  }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-800">{item.title}</span>
            </div>
          </TemplateCard>
        ))}
      </div>

      <div>
        <p className="mb-2.5 text-xs font-medium text-muted">Slide Photos</p>
        <div className="grid grid-cols-4 gap-2">
          {hero.slides.map((url, idx) => (
            <button
              key={url + idx}
              type="button"
              onClick={() => useEditor.getState().setHeroSlide(idx)}
              className={cn(
                "tap-smooth relative aspect-video overflow-hidden rounded-xl border-2 transition-all",
                idx === hero.active ? "border-accent ring-2 ring-accent/30 scale-102" : "border-line opacity-75 hover:opacity-100"
              )}
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroPhotos({ hero }: { hero: HeroSection }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {HERO_PHOTOS.map((photo) => (
        <button
          key={photo.url}
          type="button"
          onClick={() => {
            const slides = [...hero.slides];
            slides[hero.active] = photo.url;
            useEditor.getState().patchSelected({ slides });
          }}
          className="tap-smooth group overflow-hidden rounded-2xl text-left"
        >
          <div className="overflow-hidden rounded-xl">
            <img src={photo.url} alt={photo.name} className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          </div>
          <span className="mt-2 block text-xs font-medium text-ink transition-colors group-hover:text-accent">{photo.name}</span>
        </button>
      ))}
    </div>
  );
}

function HeroText({ hero }: { hero: HeroSection }) {
  const [kicker, setKicker] = useState(hero.kicker);
  const [title, setTitle] = useState(hero.title);
  const [body, setBody] = useState(hero.body);
  return (
    <div className="flex flex-col gap-3">
      <Field label="Label">
        <TextInput value={kicker} onChange={(event) => setKicker(event.target.value)} />
      </Field>
      <Field label="Headline">
        <TextInput value={title} onChange={(event) => setTitle(event.target.value)} />
      </Field>
      <Field label="Supporting line">
        <TextArea rows={3} value={body} onChange={(event) => setBody(event.target.value)} />
      </Field>
      <PrimaryButton
        onClick={() => {
          useEditor.getState().patchSelected({ kicker, title, body });
          useEditor.getState().closeSheet();
        }}
      >
        Save
      </PrimaryButton>
    </div>
  );
}

function GridLayouts({ current }: { current: "mosaic" | "editorial" }) {
  return (
    <div className="flex flex-col gap-3">
      <TemplateCard
        active={current === "mosaic"}
        onClick={() => useEditor.getState().patchSelected({ template: "mosaic" })}
      >
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-line-soft bg-fill/30 p-2.5">
          <div className="aspect-square rounded-md bg-slate-300" />
          <div className="aspect-square rounded-md bg-slate-300" />
          <div className="aspect-square rounded-md bg-slate-300" />
          <div className="aspect-square rounded-md bg-slate-300" />
        </div>
      </TemplateCard>
      <TemplateCard
        active={current === "editorial"}
        onClick={() => useEditor.getState().patchSelected({ template: "editorial" })}
      >
        <div className="flex flex-col gap-2 rounded-xl border border-line-soft bg-fill/30 p-2.5">
          <div className="h-10 w-full rounded-md bg-slate-300" />
          <div className="h-10 w-full rounded-md bg-slate-300" />
        </div>
      </TemplateCard>
    </div>
  );
}

function FooterStyles({
  current,
  text,
}: {
  current: "minimal" | "columns";
  text: string;
}) {
  return (
    <div>
      <div className="flex flex-col gap-3">
        <TemplateCard
          active={current === "minimal"}
          onClick={() => useEditor.getState().patchSelected({ template: "minimal" })}
        >
          <div className="flex items-center justify-between rounded-xl border border-line-soft bg-fill/40 p-3">
            <div className="h-2 w-16 rounded-full bg-slate-800" />
            <div className="h-2 w-24 rounded-full bg-slate-400" />
          </div>
        </TemplateCard>
        <TemplateCard
          active={current === "columns"}
          onClick={() => useEditor.getState().patchSelected({ template: "columns" })}
        >
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-line-soft bg-fill/40 p-3">
            <div className="space-y-1">
              <div className="h-2 w-3/4 rounded-full bg-slate-800" />
              <div className="h-1.5 w-1/2 rounded-full bg-slate-400" />
            </div>
            <div className="space-y-1">
              <div className="h-2 w-3/4 rounded-full bg-slate-800" />
              <div className="h-1.5 w-1/2 rounded-full bg-slate-400" />
            </div>
            <div className="space-y-1">
              <div className="h-2 w-3/4 rounded-full bg-slate-800" />
              <div className="h-1.5 w-1/2 rounded-full bg-slate-400" />
            </div>
          </div>
        </TemplateCard>
      </div>
      <TextSwatches
        onPick={(color) => {
          if (color !== text) useEditor.getState().patchSelected({ text: color });
        }}
      />
    </div>
  );
}

function CategoriesTemplate({ current }: { current?: "cards" | "pills" | "grid" }) {
  const active = current ?? "cards";
  return (
    <div className="flex flex-col gap-3">
      <TemplateCard
        active={active === "cards"}
        onClick={() => useEditor.getState().patchSelected({ template: "cards" })}
      >
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-line-soft bg-fill/30 p-2.5">
          <div className="aspect-[4/3] rounded-lg bg-slate-300 relative overflow-hidden flex items-end p-1.5">
            <div className="h-2 w-10 rounded-full bg-slate-800" />
          </div>
          <div className="aspect-[4/3] rounded-lg bg-slate-300 relative overflow-hidden flex items-end p-1.5">
            <div className="h-2 w-10 rounded-full bg-slate-800" />
          </div>
        </div>
      </TemplateCard>
      <TemplateCard
        active={active === "pills"}
        onClick={() => useEditor.getState().patchSelected({ template: "pills" })}
      >
        <div className="flex gap-2 rounded-xl border border-line-soft bg-fill/30 p-2.5">
          <div className="h-7 w-20 rounded-full bg-slate-300 flex items-center px-1.5 gap-1">
            <div className="size-4 rounded-full bg-slate-400" />
            <div className="h-1.5 w-8 rounded-full bg-slate-700" />
          </div>
          <div className="h-7 w-20 rounded-full bg-slate-200 flex items-center px-1.5 gap-1">
            <div className="size-4 rounded-full bg-slate-300" />
            <div className="h-1.5 w-8 rounded-full bg-slate-500" />
          </div>
        </div>
      </TemplateCard>
      <TemplateCard
        active={active === "grid"}
        onClick={() => useEditor.getState().patchSelected({ template: "grid" })}
      >
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-line-soft bg-fill/30 p-2.5">
          <div className="flex flex-col items-center gap-1.5 rounded-lg bg-surface p-2">
            <div className="size-8 rounded-full bg-slate-300" />
            <div className="h-1.5 w-10 rounded-full bg-slate-700" />
          </div>
          <div className="flex flex-col items-center gap-1.5 rounded-lg bg-surface p-2">
            <div className="size-8 rounded-full bg-slate-300" />
            <div className="h-1.5 w-10 rounded-full bg-slate-700" />
          </div>
        </div>
      </TemplateCard>
    </div>
  );
}

function BrandsTemplate({ current }: { current?: "row" | "grid" }) {
  const active = current ?? "row";
  return (
    <div className="flex flex-col gap-3">
      <TemplateCard
        active={active === "row"}
        onClick={() => useEditor.getState().patchSelected({ template: "row" })}
      >
        <div className="flex items-center justify-center gap-2 rounded-xl border border-line-soft bg-fill/30 p-3">
          <div className="h-6 w-14 rounded-lg bg-slate-300" />
          <div className="h-6 w-14 rounded-lg bg-slate-300" />
          <div className="h-6 w-14 rounded-lg bg-slate-300" />
        </div>
      </TemplateCard>
      <TemplateCard
        active={active === "grid"}
        onClick={() => useEditor.getState().patchSelected({ template: "grid" })}
      >
        <div className="grid grid-cols-3 gap-2 rounded-xl border border-line-soft bg-fill/30 p-3">
          <div className="h-7 rounded-lg bg-slate-300" />
          <div className="h-7 rounded-lg bg-slate-300" />
          <div className="h-7 rounded-lg bg-slate-300" />
          <div className="h-7 rounded-lg bg-slate-200" />
          <div className="h-7 rounded-lg bg-slate-200" />
          <div className="h-7 rounded-lg bg-slate-200" />
        </div>
      </TemplateCard>
    </div>
  );
}

function AboutTemplate({ current }: { current?: "split" | "story" | "cards" }) {
  const active = current ?? "split";
  return (
    <div className="flex flex-col gap-3">
      <TemplateCard
        active={active === "split"}
        onClick={() => useEditor.getState().patchSelected({ template: "split" })}
      >
        <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-line-soft bg-fill/40 p-2.5">
          <div className="h-16 rounded-lg bg-slate-300" />
          <div className="flex flex-col justify-center space-y-1.5">
            <div className="h-2 w-10 rounded-full bg-slate-400" />
            <div className="h-2.5 w-20 rounded-full bg-slate-800" />
            <div className="h-1.5 w-16 rounded-full bg-slate-400" />
          </div>
        </div>
      </TemplateCard>
      <TemplateCard
        active={active === "story"}
        onClick={() => useEditor.getState().patchSelected({ template: "story" })}
      >
        <div className="rounded-xl border border-line-soft bg-fill/40 p-3 flex flex-col items-center gap-1.5 text-center">
          <div className="h-2 w-12 rounded-full bg-slate-400" />
          <div className="h-2.5 w-32 rounded-full bg-slate-800" />
          <div className="h-1.5 w-24 rounded-full bg-slate-400" />
        </div>
      </TemplateCard>
      <TemplateCard
        active={active === "cards"}
        onClick={() => useEditor.getState().patchSelected({ template: "cards" })}
      >
        <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-line-soft bg-fill/40 p-2.5">
          <div className="rounded-lg bg-surface p-1.5 border border-line-soft space-y-1">
            <div className="size-3 rounded-full bg-emerald-500" />
            <div className="h-1.5 w-8 rounded-full bg-slate-800" />
          </div>
          <div className="rounded-lg bg-surface p-1.5 border border-line-soft space-y-1">
            <div className="size-3 rounded-full bg-emerald-500" />
            <div className="h-1.5 w-8 rounded-full bg-slate-800" />
          </div>
          <div className="rounded-lg bg-surface p-1.5 border border-line-soft space-y-1">
            <div className="size-3 rounded-full bg-emerald-500" />
            <div className="h-1.5 w-8 rounded-full bg-slate-800" />
          </div>
        </div>
      </TemplateCard>
    </div>
  );
}

function FeaturedTemplate({ current }: { current?: "grid" | "carousel" }) {
  const active = current ?? "grid";
  return (
    <div className="flex flex-col gap-3">
      <TemplateCard
        active={active === "grid"}
        onClick={() => useEditor.getState().patchSelected({ template: "grid" })}
      >
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-line-soft bg-fill/30 p-2.5">
          <div className="flex flex-col gap-1 rounded-lg border border-line-soft bg-surface p-1.5">
            <div className="aspect-square w-full rounded-md bg-slate-200" />
            <div className="h-2 w-10 rounded-full bg-slate-800" />
          </div>
          <div className="flex flex-col gap-1 rounded-lg border border-line-soft bg-surface p-1.5">
            <div className="aspect-square w-full rounded-md bg-slate-200" />
            <div className="h-2 w-10 rounded-full bg-slate-800" />
          </div>
        </div>
      </TemplateCard>
      <TemplateCard
        active={active === "carousel"}
        onClick={() => useEditor.getState().patchSelected({ template: "carousel" })}
      >
        <div className="flex gap-2 rounded-xl border border-line-soft bg-fill/30 p-2.5 overflow-hidden">
          <div className="w-16 shrink-0 flex flex-col gap-1 rounded-lg border border-line-soft bg-surface p-1.5">
            <div className="aspect-square w-full rounded-md bg-slate-200" />
            <div className="h-2 w-10 rounded-full bg-slate-800" />
          </div>
          <div className="w-16 shrink-0 flex flex-col gap-1 rounded-lg border border-line-soft bg-surface p-1.5">
            <div className="aspect-square w-full rounded-md bg-slate-200" />
            <div className="h-2 w-10 rounded-full bg-slate-800" />
          </div>
          <div className="w-16 shrink-0 flex flex-col gap-1 rounded-lg border border-line-soft bg-surface p-1.5">
            <div className="aspect-square w-full rounded-md bg-slate-200" />
            <div className="h-2 w-10 rounded-full bg-slate-800" />
          </div>
        </div>
      </TemplateCard>
    </div>
  );
}

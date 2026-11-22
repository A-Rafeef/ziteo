import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Columns2,
  Menu,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { isDark, money, PHOTOS } from "@/lib/editor/defaults";
import { selectedSection, useEditor } from "@/lib/editor/store";
import type {
  CatalogFilterConfig,
  CatalogFilterState,
  Product,
  CatalogSection,
  CatalogSortOption,
  FilterSortSection,
  Device,
  NavbarLink,
  NavbarSection,
  PageId,
  ProductCardDetailsLayout,
  ProductCardShadow,
  ProductCardTextAlign,
  ProductImageRatio,
  ProductTypography,
  Section,
} from "@/lib/editor/types";
import { cn } from "@/lib/cn";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      stroke="currentColor"
      strokeWidth="0"
      fill="currentColor"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

function solid(dark: boolean) {
  return cn(
    "inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium",
    dark ? "bg-on-ink text-ink" : "bg-ink text-on-ink",
  );
}

function titleSize(device: Device) {
  if (device === "desktop") return "text-5xl";
  if (device === "tablet") return "text-4xl";
  return "text-3xl";
}

function gutter(device: Device) {
  return device === "mobile" ? "px-5" : "px-10";
}

function priceNumber(price: string) {
  const value = Number(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(value) ? value : 0;
}

function SelectionChip({ id }: { id: string }) {
  const sections = useEditor((s) => s.pages[s.pageId].sections);
  const selectedId = useEditor((s) => s.selectedId);
  const isGlobalCard = selectedId === "product-card";
  const index = sections.findIndex((sec) => sec.id === id);
  const sec = sections[index];
  const [placement, setPlacement] = useState<"below" | "above">(
    sec?.type === "navbar" ? "below" : "below",
  );

  useEffect(() => {
    if (!sec) return;
    if (sec.type === "navbar") {
      setPlacement("below");
      return;
    }

    const updatePlacement = () => {
      const sectionEl = document.querySelector(`[data-section-id="${id}"]`) as HTMLElement | null;
      if (!sectionEl) return;
      const container = (sectionEl.closest(".overflow-y-auto") as HTMLElement | null) || document.documentElement;
      const containerRect = container.getBoundingClientRect();
      const sectionRect = sectionEl.getBoundingClientRect();

      const spaceAbove = sectionRect.top - containerRect.top;
      const spaceBelow = containerRect.bottom - sectionRect.bottom;

      // If space above is at least 48px and greater than below, or space below is too tight:
      if (spaceAbove >= 48 && (spaceAbove >= spaceBelow || spaceBelow < 44)) {
        setPlacement("above");
      } else {
        setPlacement("below");
      }
    };

    updatePlacement();
    window.addEventListener("scroll", updatePlacement, true);
    window.addEventListener("resize", updatePlacement);
    return () => {
      window.removeEventListener("scroll", updatePlacement, true);
      window.removeEventListener("resize", updatePlacement);
    };
  }, [id, sec]);

  if (!sec) return null;

  const isFixed = isGlobalCard || sec.type === "navbar" || sec.type === "footer";

  const displayName =
    isGlobalCard
      ? "Product Card"
      : sec.type === "navbar"
        ? "Header"
        : sec.type === "footer"
          ? "Footer"
          : sec.name || sec.type;

  const positionClass =
    placement === "below"
      ? "top-full mt-2.5 left-4"
      : "-top-10 left-4";

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "animate-scale-in absolute z-30 flex h-8 items-center gap-1 rounded-full border border-slate-800/80 bg-slate-900/95 px-2.5 py-1 text-xs text-white shadow-xl shadow-black/25 backdrop-blur-md select-none transition-all duration-200",
        positionClass,
      )}
    >
      <span className="flex items-center gap-1.5 pr-1.5 text-[10px] font-bold tracking-wider text-purple-300 uppercase">
        <span className="size-1.5 rounded-full bg-purple-400" />
        <span>{displayName}</span>
        {isFixed && (
          <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[8px] font-extrabold tracking-normal text-emerald-300">
            GLOBAL
          </span>
        )}
      </span>

      {!isFixed && (
        <>
          <div className="h-3 w-[1px] bg-slate-700/80" />

          <button
            type="button"
            title="Move up"
            aria-label="Move up"
            disabled={index <= 1}
            onClick={(event) => {
              event.stopPropagation();
              useEditor.getState().moveSection(id, -1);
            }}
            className="tap-smooth flex size-6 items-center justify-center rounded-full text-slate-300 hover:bg-white/15 hover:text-white disabled:opacity-20 transition-all active:scale-90"
          >
            <ChevronUp className="size-3.5 stroke-[2.5]" />
          </button>

          <button
            type="button"
            title="Move down"
            aria-label="Move down"
            disabled={index >= sections.length - 2}
            onClick={(event) => {
              event.stopPropagation();
              useEditor.getState().moveSection(id, 1);
            }}
            className="tap-smooth flex size-6 items-center justify-center rounded-full text-slate-300 hover:bg-white/15 hover:text-white disabled:opacity-20 transition-all active:scale-90"
          >
            <ChevronDown className="size-3.5 stroke-[2.5]" />
          </button>

          <div className="h-3 w-[1px] bg-slate-700/80" />

          <button
            type="button"
            title="Delete section"
            aria-label="Delete section"
            onClick={(event) => {
              event.stopPropagation();
              useEditor.getState().deleteSection(id);
            }}
            className="tap-smooth flex size-6 items-center justify-center rounded-full text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all active:scale-90"
          >
            <Trash2 className="size-3.5 stroke-[2]" />
          </button>
        </>
      )}

      <div className="h-3 w-[1px] bg-slate-700/80" />

      <button
        type="button"
        title="Deselect"
        aria-label="Deselect"
        onClick={(event) => {
          event.stopPropagation();
          useEditor.getState().deselect();
        }}
        className="tap-smooth flex size-6 items-center justify-center rounded-full text-slate-400 hover:bg-white/15 hover:text-white transition-all active:scale-90"
      >
        <X className="size-3.5 stroke-[2]" />
      </button>
    </div>
  );
}

function SectionShell({
  section,
  background,
  color,
  className,
  children,
}: {
  section: Section;
  background?: string;
  color?: string;
  className?: string;
  children: ReactNode;
}) {
  const preview = useEditor((s) => s.preview);
  const isCardSec = section.type === "catalog" || section.type === "featured" || section.type === "grid";
  const selected = useEditor((s) => !s.preview && (s.selectedId === section.id || (s.selectedId === "product-card" && isCardSec)));

  return (
    <section
      data-section-id={section.id}
      style={{ background, color }}
      onClick={(event) => {
        if (preview) return;
        event.stopPropagation();
        if (selected) {
          useEditor.getState().deselect();
        } else {
          useEditor.getState().select(section.id);
        }
      }}
      className={cn(
        "relative transition-[box-shadow,background-color] duration-200",
        selected && "ring-2 ring-accent ring-inset z-20",
        !preview && !selected && "hover:ring-1 hover:ring-line hover:ring-inset",
        className,
      )}
    >
      {selected && <SelectionChip id={section.id} />}
      {children}
    </section>
  );
}

function LogoButton({
  logo,
  showBrandName = true,
  showLogoImage = true,
  logoImage,
  className,
}: {
  logo: string;
  showBrandName?: boolean;
  showLogoImage?: boolean;
  logoImage?: string;
  className?: string;
}) {
  const preview = useEditor((s) => s.preview);
  return (
    <button
      type="button"
      onClick={(event) => {
        if (!preview) return;
        event.stopPropagation();
        useEditor.getState().switchPage("home");
      }}
      className={cn("tap-smooth inline-flex items-center gap-2 hover:opacity-80 transition-opacity", className)}
    >
      {showLogoImage && logoImage ? (
        <img src={logoImage} alt={logo} className="size-7 rounded-full object-cover" />
      ) : showLogoImage && !showBrandName ? (
        <span className="flex size-7 items-center justify-center rounded-lg bg-current/10 font-black text-xs">
          {logo.charAt(0) || "Z"}
        </span>
      ) : null}
      {showBrandName && <span>{logo}</span>}
    </button>
  );
}

function BagButton({ count, color }: { count: number; color?: string }) {
  const preview = useEditor((s) => s.preview);
  return (
    <button
      type="button"
      aria-label="Open bag"
      style={color ? { color } : undefined}
      onClick={(event) => {
        if (!preview) return;
        event.stopPropagation();
        useEditor.getState().openCart();
      }}
      className="tap-smooth inline-flex h-11 items-center gap-1 rounded-full px-2 hover:bg-fill/60 transition-colors"
    >
      <ShoppingBag className="size-5" strokeWidth={1.5} />
      <span className="text-xs tabular-nums font-medium">{count}</span>
    </button>
  );
}

function SearchButton({ roomy, color }: { roomy: boolean; color?: string }) {
  const preview = useEditor((s) => s.preview);
  return (
    <button
      type="button"
      aria-label="Search"
      style={color ? { color } : undefined}
      onClick={(event) => {
        if (!preview) return;
        event.stopPropagation();
        useEditor.getState().openSearch();
      }}
      className={cn(
        "tap-smooth inline-flex items-center gap-2 rounded-full transition-colors",
        roomy ? "h-9 bg-fill px-3 text-sm text-muted hover:bg-line-soft/80" : "size-11 justify-center hover:bg-fill/60",
      )}
    >
      <Search className="size-4" strokeWidth={1.75} />
      {roomy && <span>Search</span>}
    </button>
  );
}

function PageLinks({
  current,
  links,
  caseClass,
  color,
}: {
  current: PageId;
  links?: NavbarLink[];
  caseClass?: string;
  color?: string;
}) {
  const preview = useEditor((s) => s.preview);
  const defaultLinks: NavbarLink[] = [
    { id: "home", label: "Home", url: "home" },
    { id: "shop", label: "Shop", url: "shop" },
    { id: "product", label: "Product", url: "product" },
  ];
  const items = links && links.length > 0 ? links : defaultLinks;

  return (
    <nav className="flex items-center gap-6">
      {items.map((link) => {
        const isCurrent = link.url === current;
        return (
          <button
            key={link.id}
            type="button"
            onClick={(event) => {
              if (!preview) return;
              event.stopPropagation();
              if (link.url === "home" || link.url === "shop" || link.url === "product") {
                useEditor.getState().switchPage(link.url);
              }
            }}
            className={cn(
              "tap-smooth text-sm transition-opacity duration-150 hover:opacity-100",
              caseClass,
              isCurrent ? "font-semibold opacity-100" : "opacity-60"
            )}
            style={color ? { color } : undefined}
          >
            {link.label}
          </button>
        );
      })}
    </nav>
  );
}

function NavbarView({ sec, device }: { sec: NavbarSection; device: Device }) {
  const pageId = useEditor((s) => s.pageId);
  const preview = useEditor((s) => s.preview);
  const count = useEditor((s) => s.cart.reduce((sum, item) => sum + item.qty, 0));
  const roomy = device !== "mobile";

  const showLogo = sec.showLogo ?? true;
  const showBrandName = sec.showBrandName ?? true;
  const showSearch = sec.showSearch ?? true;
  const showCart = sec.showCart ?? true;
  const showMenu = sec.showMenu ?? true;
  const showLinks = sec.showLinks ?? true;
  const isSticky = sec.sticky ?? true;
  const iconColor = sec.iconColor || sec.text;
  const isFloating = sec.isFloating ?? (sec.template === "float");

  const heightStyle = sec.height ? { minHeight: `${sec.height}px` } : { minHeight: "56px" };
  const radius =
    sec.borderRadius !== undefined
      ? sec.borderRadius === 9999
        ? "9999px"
        : `${sec.borderRadius}px`
      : isFloating
      ? "9999px"
      : undefined;

  const shadowClass =
    sec.shadow === "none"
      ? ""
      : sec.shadow === "subtle"
      ? "shadow-xs"
      : sec.shadow === "glass"
      ? "shadow-lg backdrop-blur-xl"
      : isFloating || sec.shadow === "float"
      ? "shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
      : "";

  const blurClass = sec.backdropBlur !== false ? "backdrop-blur-md" : "";

  const borderClass =
    sec.borderStyle === "none"
      ? "border-0"
      : sec.borderStyle === "solid"
      ? "border-2 border-current/20"
      : "border border-line-soft";

  // Typography styling
  const fontClass =
    sec.fontSize === "sm"
      ? "text-xs"
      : sec.fontSize === "lg"
      ? "text-base"
      : sec.fontSize === "xl"
      ? "text-lg"
      : "text-sm";

  const weightClass =
    sec.fontWeight === "normal"
      ? "font-normal"
      : sec.fontWeight === "medium"
      ? "font-medium"
      : sec.fontWeight === "bold"
      ? "font-bold"
      : "font-semibold";

  const trackingClass =
    sec.letterSpacing === "tight"
      ? "tracking-tight"
      : sec.letterSpacing === "wide"
      ? "tracking-wide"
      : sec.letterSpacing === "widest"
      ? "tracking-widest"
      : "tracking-widest";

  const caseClass = sec.uppercase !== false ? "uppercase" : "normal-case";

  const brandEl = (showLogo || showBrandName) ? (
    <LogoButton
      logo={sec.logo}
      showBrandName={showBrandName}
      showLogoImage={showLogo}
      logoImage={sec.logoImage}
      className={cn(fontClass, weightClass, trackingClass, caseClass)}
    />
  ) : <div />;

  const menuButton = showMenu ? (
    <button
      type="button"
      aria-label="Menu"
      style={{ color: iconColor }}
      onClick={(event) => {
        if (!preview) return;
        event.stopPropagation();
        useEditor.getState().setMenuOpen(true);
      }}
      className="inline-flex size-11 items-center justify-center tap-smooth hover:opacity-80 transition-opacity"
    >
      <Menu className="size-5" strokeWidth={1.5} />
    </button>
  ) : (
    <div className="size-11" />
  );

  const actionIcons = (
    <div className="flex items-center gap-0.5">
      {showSearch && <SearchButton roomy={false} color={iconColor} />}
      {showCart && <BagButton count={count} color={iconColor} />}
    </div>
  );

  let bar: React.ReactNode;

  if (sec.template === "minimal") {
    bar = (
      <div className={cn("flex items-center justify-between py-2", gutter(device))} style={heightStyle}>
        {brandEl}
        {actionIcons}
      </div>
    );
  } else if (sec.template === "expanded") {
    bar = (
      <div className={cn("flex items-center justify-between gap-4 py-2", gutter(device))} style={heightStyle}>
        <div className="shrink-0">{brandEl}</div>
        <div className="flex-1 max-w-sm hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-fill/70 border border-line-soft text-muted text-xs">
          <Search className="size-3.5 shrink-0" style={{ color: iconColor }} />
          <span className="truncate">Search products...</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {showSearch && <SearchButton roomy={false} color={iconColor} />}
          {showCart && <BagButton count={count} color={iconColor} />}
          {!roomy && showMenu && menuButton}
        </div>
      </div>
    );
  } else if (roomy) {
    if (sec.template === "left") {
      bar = (
        <div className="flex items-center justify-between gap-6 px-6 py-2" style={heightStyle}>
          <div className="flex items-center gap-8">
            {brandEl}
            {showLinks && (
              <PageLinks
                current={pageId}
                links={sec.links}
                caseClass={caseClass}
                color={sec.text}
              />
            )}
          </div>
          <div className="flex items-center gap-1">
            {showSearch && <SearchButton roomy color={iconColor} />}
            {showCart && <BagButton count={count} color={iconColor} />}
          </div>
        </div>
      );
    } else {
      // centered & float desktop
      bar = (
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-2" style={heightStyle}>
          <div className="justify-self-start">
            {showLinks && (
              <PageLinks
                current={pageId}
                links={sec.links}
                caseClass={caseClass}
                color={sec.text}
              />
            )}
          </div>
          <div className="justify-self-center">{brandEl}</div>
          <div className="flex items-center justify-end gap-1">
            {showSearch && <SearchButton roomy color={iconColor} />}
            {showCart && <BagButton count={count} color={iconColor} />}
          </div>
        </div>
      );
    }
  } else {
    // Mobile layout
    bar = (
      <div className="relative flex items-center justify-between px-2 py-1" style={heightStyle}>
        {sec.template === "left" ? (
          <div className="flex items-center gap-2">
            {showMenu && menuButton}
            {brandEl}
          </div>
        ) : (
          <>
            {menuButton}
            <div className="pointer-events-auto absolute left-1/2 -translate-x-1/2">
              {brandEl}
            </div>
          </>
        )}
        {actionIcons}
      </div>
    );
  }

  if (isFloating) {
    return (
      <SectionShell
        section={sec}
        background="transparent"
        color={sec.text}
        className={cn(isSticky && "sticky top-0 z-20")}
      >
        <div className="px-3 pt-3 pb-1">
          <div
            className={cn(
              "overflow-hidden transition-all duration-200",
              borderClass,
              shadowClass,
              blurClass
            )}
            style={{
              background: sec.background,
              color: sec.text,
              borderRadius: radius || "9999px",
              borderColor: sec.borderColor,
            }}
          >
            {bar}
          </div>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell
      section={sec}
      background={sec.background}
      color={sec.text}
      className={cn(isSticky && "sticky top-0 z-20", blurClass)}
    >
      <div
        className={cn("transition-all duration-200 border-b", borderClass, shadowClass)}
        style={{
          borderRadius: radius,
          borderColor: sec.borderColor,
        }}
      >
        {bar}
      </div>
    </SectionShell>
  );
}

function HeroView({
  sec,
}: {
  sec: Extract<Section, { type: "hero" }>;
  device: Device;
}) {
  const image = sec.slides[sec.active] ?? sec.slides[0];
  const ratio = sec.ratio ?? "16:9";
  const aspect = ratio === "auto" ? undefined : ratio.replace(":", " / ");

  const autoplay = sec.autoplay !== false;
  const speed = sec.autoplaySpeed ?? 4500;

  useEffect(() => {
    if (!autoplay || sec.slides.length <= 1) return;
    const timer = setInterval(() => {
      useEditor.getState().setHeroSlide((sec.active + 1) % sec.slides.length);
    }, speed);
    return () => clearInterval(timer);
  }, [autoplay, sec.active, sec.slides.length, speed]);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = (sec.active - 1 + sec.slides.length) % sec.slides.length;
    useEditor.getState().setHeroSlide(nextIdx);
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = (sec.active + 1) % sec.slides.length;
    useEditor.getState().setHeroSlide(nextIdx);
  };

  // Width mode container
  const widthClass =
    sec.widthMode === "gap-sm"
      ? "max-w-7xl mx-auto px-3 sm:px-6"
      : sec.widthMode === "gap-md"
      ? "max-w-5xl mx-auto px-5 sm:px-10"
      : sec.widthMode === "gap-lg"
      ? "max-w-4xl mx-auto px-6 sm:px-16"
      : "w-full px-0";

  // Vertical padding
  const paddingYClass =
    sec.paddingY === "sm"
      ? "py-2 sm:py-3"
      : sec.paddingY === "md"
      ? "py-4 sm:py-6"
      : sec.paddingY === "lg"
      ? "py-6 sm:py-10"
      : "py-0";

  const paddingXClass =
    sec.paddingX === "sm"
      ? "px-2"
      : sec.paddingX === "md"
      ? "px-4"
      : sec.paddingX === "lg"
      ? "px-8"
      : "px-0";

  // Corner radius
  const radius = sec.borderRadius ?? 0;

  // Animation styling
  const animClass =
    sec.animationEffect === "fade"
      ? "animate-fade-in duration-500"
      : sec.animationEffect === "zoom"
      ? "scale-100 hover:scale-105 transition-transform duration-700 ease-out"
      : sec.animationEffect === "none"
      ? ""
      : "animate-fade-in transition-transform duration-700 ease-out";

  return (
    <SectionShell section={sec} background={sec.background || "transparent"}>
      <div className={cn("transition-all duration-300", widthClass, paddingYClass, paddingXClass)}>
        <div
          className="relative w-full overflow-hidden transition-all duration-300 shadow-xs"
          style={{
            aspectRatio: aspect,
            borderRadius: radius > 0 ? `${radius}px` : undefined,
          }}
        >
          {image && (
            <img
              key={image + sec.active}
              src={image}
              alt=""
              className={cn("h-full w-full object-cover", animClass)}
            />
          )}

          {/* Previous & Next Arrow Controls */}
          {sec.slides.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={prev}
                className="tap-smooth absolute left-3 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-all opacity-80 hover:opacity-100"
              >
                <ChevronLeft className="size-4" strokeWidth={2.25} />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={next}
                className="tap-smooth absolute right-3 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-all opacity-80 hover:opacity-100"
              >
                <ChevronRight className="size-4" strokeWidth={2.25} />
              </button>
            </>
          )}

          {/* Dynamic Pagination Dots */}
          {sec.slides.length > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-md shadow-xs">
              {sec.slides.map((slide, index) => (
                <button
                  key={slide + index}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    useEditor.getState().setHeroSlide(index);
                  }}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300 ease-out",
                    index === sec.active
                      ? "w-5 bg-white opacity-100"
                      : "w-1.5 bg-white/60 opacity-60 hover:opacity-90",
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </SectionShell>
  );
}

function GridView({
  sec,
  device,
}: {
  sec: Extract<Section, { type: "grid" }>;
  device: Device;
}) {
  const dark = isDark(sec.background);
  const preview = useEditor((s) => s.preview);
  const cols =
    sec.template === "editorial"
      ? "grid-cols-1"
      : device === "desktop"
        ? "grid-cols-4"
        : "grid-cols-2";

  const openItem = (item: (typeof sec.items)[number]) => {
    if (preview) {
      useEditor.getState().openProduct({
        id: item.id,
        name: item.title,
        price: item.salePrice || priceNumber(item.price),
        regularPrice: item.regularPrice || priceNumber(item.price),
        salePrice: item.salePrice,
        discountPercentage: item.discountPercentage,
        stock: item.stock ?? 10,
        brand: item.brand,
        category: item.category || item.tag,
        description: item.description,
        gallery: item.gallery && item.gallery.length > 0 ? item.gallery : [item.image],
        img: item.image,
        variants: item.variants,
        badge: item.badge,
      });
    } else {
      useEditor.getState().select(sec.id);
    }
  };

  const buyDirectOnWhatsApp = (event: React.MouseEvent, item: (typeof sec.items)[number]) => {
    if (!preview) {
      useEditor.getState().select(sec.id);
      return;
    }
    event.stopPropagation();
    const origin = typeof window !== "undefined" ? window.location.origin : "https://ziteo.site";
    const productUrl = `${origin}/product?name=${encodeURIComponent(item.title)}`;
    const phone = (sec.whatsappNumber || "919876543210").replace(/[^0-9]/g, "");
    const message =
      `Hi! I'd like to order from Ziteo:\n\n` +
      `📦 *Product:* ${item.title}\n` +
      `💰 *Price:* ${item.price}\n` +
      `🔗 *Link:* ${productUrl}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <SectionShell section={sec} background={sec.background}>
      <div className={cn("grid gap-x-4 gap-y-8 pb-10", gutter(device), cols)}>
        {sec.items.map((item) => (
          <StoreProductCard
            key={item.id}
            id={item.id}
            title={item.title}
            price={item.price}
            regularPrice={item.regularPrice}
            salePrice={item.salePrice}
            discountPercentage={item.discountPercentage}
            stock={item.stock}
            brand={item.brand}
            image={item.image}
            badge={item.badge}
            dark={dark}
            imageRatio={sec.imageRatio}
            borderRadius={sec.borderRadius ?? 16}
            typography={sec.typography}
            showBadge={sec.showBadge !== false}
            showPrice={sec.showPrice !== false}
            showButton={sec.showButton !== false}
            priceColor={sec.priceColor || (dark ? "#34d399" : "#059669")}
            buttonColor={sec.buttonColor || "#25D366"}
            currency={sec.currency || "$"}
            borderEnabled={sec.borderEnabled}
            borderWidth={sec.borderWidth}
            borderColor={sec.borderColor}
            shadowEnabled={sec.shadowEnabled}
            shadowStyle={sec.shadowStyle}
            cardBackground={sec.cardBackground}
            imageInset={sec.imageInset}
            imageRadius={sec.imageRadius}
            detailsLayout={sec.detailsLayout}
            textAlign={sec.textAlign}
            onCardClick={() => openItem(item)}
            onWhatsAppClick={(e) => buyDirectOnWhatsApp(e, item)}
          />
        ))}
      </div>
    </SectionShell>
  );
}

const CARD_SHADOW_MAP: Record<ProductCardShadow, string> = {
  none: "none",
  soft: "0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 1px 4px -1px rgba(0, 0, 0, 0.04)",
  smooth: "0 10px 25px -5px rgba(0, 0, 0, 0.10), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
  float: "0 20px 30px -10px rgba(0, 0, 0, 0.16), 0 10px 15px -5px rgba(0, 0, 0, 0.08)",
  deep: "0 25px 50px -12px rgba(0, 0, 0, 0.32)",
};

interface StoreProductCardProps {
  id: string;
  title: string;
  price: string | number;
  regularPrice?: number;
  salePrice?: number;
  discountPercentage?: number;
  stock?: number;
  brand?: string;
  category?: string;
  image: string;
  badge?: string;
  rating?: string;
  dark?: boolean;
  imageRatio?: ProductImageRatio;
  borderRadius?: number;
  typography?: ProductTypography;
  showBadge?: boolean;
  showRating?: boolean;
  showPrice?: boolean;
  showButton?: boolean;
  showBrand?: boolean;
  showDiscountBadge?: boolean;
  showStockStatus?: boolean;
  priceColor?: string;
  buttonColor?: string;
  isList?: boolean;
  isCarousel?: boolean;
  borderEnabled?: boolean;
  borderWidth?: number;
  borderColor?: string;
  shadowEnabled?: boolean;
  shadowStyle?: ProductCardShadow;
  cardBackground?: string;
  imageInset?: boolean;
  imageRadius?: number;
  detailsLayout?: ProductCardDetailsLayout;
  textAlign?: ProductCardTextAlign;
  currency?: string;
  onCardClick: () => void;
  onWhatsAppClick: (e: React.MouseEvent) => void;
}

function StoreProductCard({
  id,
  title,
  price,
  regularPrice,
  salePrice,
  discountPercentage,
  stock,
  brand,
  image,
  badge,
  dark = false,
  imageRatio = "1:1",
  borderRadius = 16,
  typography = "base",
  showBadge = true,
  showPrice = true,
  showButton = true,
  showBrand = true,
  showDiscountBadge = true,
  showStockStatus = true,
  priceColor = "#059669",
  buttonColor = "#25D366",
  currency = "$",
  isList = false,
  isCarousel = false,
  borderEnabled = true,
  borderWidth = 1,
  borderColor = "#e2e8f0",
  shadowEnabled = false,
  shadowStyle = "soft",
  cardBackground = "#ffffff",
  imageInset = false,
  imageRadius,
  detailsLayout = "outer",
  textAlign = "left",
  onCardClick,
  onWhatsAppClick,
}: StoreProductCardProps) {
  const ratioClass =
    imageRatio === "3:4"
      ? "aspect-[3/4]"
      : imageRatio === "16:9"
        ? "aspect-video"
        : "aspect-square";

  const titleClass =
    typography === "sm"
      ? "text-xs"
      : typography === "lg"
        ? "text-base font-semibold"
        : "text-sm font-medium";

  const effRegularPrice =
    regularPrice !== undefined
      ? regularPrice
      : typeof price === "number"
        ? price
        : priceNumber(price);

  const effSalePrice =
    salePrice !== undefined && salePrice < effRegularPrice ? salePrice : undefined;

  const hasDiscount = effSalePrice !== undefined;
  const activePrice = hasDiscount ? effSalePrice : effRegularPrice;

  const effDiscountPct =
    discountPercentage !== undefined && discountPercentage > 0
      ? discountPercentage
      : hasDiscount && effRegularPrice > 0
        ? Math.round(((effRegularPrice - effSalePrice) / effRegularPrice) * 100)
        : 0;

  const formattedActivePrice = money(activePrice, currency);
  const formattedRegularPrice = money(effRegularPrice, currency);

  const shadowValue = shadowEnabled && shadowStyle ? CARD_SHADOW_MAP[shadowStyle] : "none";
  const borderValue = borderEnabled ? `${borderWidth ?? 1}px solid ${borderColor || "#e2e8f0"}` : "none";
  const bgValue = cardBackground || (dark ? "#18181b" : "#ffffff");
  const effImageRadius = imageRadius !== undefined ? imageRadius : Math.max(0, borderRadius - (imageInset ? 6 : 0));

  const stockBadge =
    showStockStatus && stock !== undefined && stock <= 0 ? (
      <span className="rounded-md bg-slate-900/90 text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-xs shadow-xs">
        Sold Out
      </span>
    ) : showStockStatus && stock !== undefined && stock <= 3 ? (
      <span className="rounded-md bg-amber-500 text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-xs">
        Only {stock} Left
      </span>
    ) : null;

  if (isList) {
    return (
      <article
        id={id}
        className="group relative transition-all flex items-center justify-between gap-4 p-3.5"
        style={{
          borderRadius: `${borderRadius}px`,
          border: borderValue,
          boxShadow: shadowValue,
          backgroundColor: bgValue,
        }}
      >
        <button
          type="button"
          className="tap-smooth-sm flex items-center gap-3.5 flex-1 min-w-0 text-left cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onCardClick();
          }}
        >
          <div
            className="size-20 sm:size-24 shrink-0 relative overflow-hidden bg-fill/50"
            style={{ borderRadius: `${effImageRadius}px` }}
          >
            <div className="absolute top-1.5 left-1.5 z-10 flex flex-col gap-1 items-start">
              {showDiscountBadge && hasDiscount && effDiscountPct > 0 && showBadge && (
                <span className="rounded-md bg-rose-600 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-white uppercase shadow-xs">
                  {effDiscountPct}% OFF
                </span>
              )}
              {showBadge && badge && (!hasDiscount || !showDiscountBadge) && (
                <span className="rounded-md bg-ink/90 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-on-ink uppercase backdrop-blur-xs shadow-xs">
                  {badge}
                </span>
              )}
              {stockBadge}
            </div>
            <img
              src={image}
              alt=""
              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </div>

          <div className="min-w-0 flex-1">
            {showBrand && brand && (
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase truncate block">
                {brand}
              </span>
            )}
            <h3 className={cn("transition-colors group-hover:text-accent truncate", titleClass, dark ? "text-on-ink" : "text-ink")}>
              {title}
            </h3>
            {showPrice && (
              <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                <span className="text-sm font-semibold" style={{ color: priceColor }}>
                  {formattedActivePrice}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-slate-400 dark:text-slate-500 line-through font-normal">
                    {formattedRegularPrice}
                  </span>
                )}
              </div>
            )}
          </div>
        </button>

        {showButton && (
          <button
            type="button"
            title="Buy on WhatsApp"
            aria-label={`Buy ${title} on WhatsApp`}
            onClick={(e) => {
              e.stopPropagation();
              onWhatsAppClick(e);
            }}
            className="tap-smooth inline-flex size-9 items-center justify-center rounded-full text-white hover:scale-105 transition-all shadow-xs shrink-0 cursor-pointer"
            style={{ backgroundColor: buttonColor }}
          >
            <WhatsAppIcon className="size-4 fill-white" />
          </button>
        )}
      </article>
    );
  }

  // Standard or Carousel Card
  return (
    <article
      id={id}
      className={cn(
        "group relative transition-all overflow-hidden",
        isCarousel ? "w-44 sm:w-56 shrink-0 snap-start" : "w-full",
        imageInset ? "p-2.5 sm:p-3" : ""
      )}
      style={{
        borderRadius: `${borderRadius}px`,
        border: borderValue,
        boxShadow: shadowValue,
        backgroundColor: bgValue,
      }}
    >
      <div
        className={cn("relative overflow-hidden bg-fill/50 transition-all cursor-pointer", isList ? "size-20 shrink-0" : "w-full")}
        style={{
          borderRadius: imageInset
            ? `${effImageRadius}px`
            : detailsLayout === "inner"
              ? `${borderRadius}px`
              : `${borderRadius}px ${borderRadius}px 0 0`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onCardClick();
        }}
      >
        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          {showDiscountBadge && hasDiscount && effDiscountPct > 0 && showBadge && (
            <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-white uppercase shadow-sm">
              {effDiscountPct}% OFF
            </span>
          )}
          {showBadge && badge && (!hasDiscount || !showDiscountBadge) && (
            <span className="rounded-md bg-ink/90 px-2 py-0.5 text-[10px] font-bold tracking-wider text-on-ink uppercase backdrop-blur-xs shadow-xs">
              {badge}
            </span>
          )}
          {stockBadge}
        </div>

        <img
          src={image}
          alt=""
          className={cn(
            "w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105",
            ratioClass
          )}
        />

        {/* Inner Details Layout (Overlay on Image) */}
        {detailsLayout === "inner" && (
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 z-10 p-3.5 pt-8 bg-gradient-to-t from-black/85 via-black/55 to-transparent text-white flex flex-col pointer-events-auto",
              textAlign === "center" ? "items-center text-center" : "items-start text-left"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onCardClick();
            }}
          >
            {showBrand && brand && (
              <span className="text-[10px] font-bold tracking-wider text-slate-300 uppercase truncate block">
                {brand}
              </span>
            )}
            <h3 className={cn("transition-colors font-medium truncate text-white w-full", titleClass)}>
              {title}
            </h3>
            <div className={cn("mt-2 flex items-center gap-2", textAlign === "center" ? "justify-center" : "justify-between w-full")}>
              {showPrice && (
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-sm font-bold text-white drop-shadow-xs">
                    {formattedActivePrice}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-slate-300 line-through font-normal drop-shadow-xs">
                      {formattedRegularPrice}
                    </span>
                  )}
                </div>
              )}
              {showButton && (
                <button
                  type="button"
                  title="Buy on WhatsApp"
                  aria-label={`Buy ${title} on WhatsApp`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onWhatsAppClick(e);
                  }}
                  className="tap-smooth inline-flex size-8 items-center justify-center rounded-full text-white hover:scale-105 transition-all shadow-md shrink-0 cursor-pointer"
                  style={{ backgroundColor: buttonColor }}
                >
                  <WhatsAppIcon className="size-3.5 fill-white" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Outer Details Layout (Below Image) */}
      {detailsLayout === "outer" && (
        <div
          className={cn(
            "flex flex-col",
            imageInset ? "pt-2 px-0.5 pb-0.5" : "p-3 sm:p-3.5",
            textAlign === "center" ? "items-center text-center" : "items-start text-left"
          )}
        >
          <button
            type="button"
            className={cn("w-full tap-smooth-sm cursor-pointer", textAlign === "center" ? "text-center" : "text-left")}
            onClick={(e) => {
              e.stopPropagation();
              onCardClick();
            }}
          >
            {showBrand && brand && (
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase truncate block mb-0.5">
                {brand}
              </span>
            )}
            <h3 className={cn("transition-colors group-hover:text-accent truncate", titleClass, dark ? "text-on-ink" : "text-ink")}>
              {title}
            </h3>
          </button>

          <div className={cn("mt-2 sm:mt-2.5 flex items-center w-full", textAlign === "center" ? "justify-center gap-3" : "justify-between")}>
            {showPrice ? (
              <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                <span className="text-sm sm:text-base font-bold truncate" style={{ color: priceColor }}>
                  {formattedActivePrice}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-slate-400 dark:text-slate-500 line-through font-normal shrink-0">
                    {formattedRegularPrice}
                  </span>
                )}
              </div>
            ) : <span />}

            {showButton && (
              <button
                type="button"
                title="Buy on WhatsApp"
                aria-label={`Buy ${title} on WhatsApp`}
                onClick={(e) => {
                  e.stopPropagation();
                  onWhatsAppClick(e);
                }}
                className="tap-smooth inline-flex size-7.5 sm:size-8 items-center justify-center rounded-full text-white hover:scale-105 transition-all shadow-xs shrink-0 cursor-pointer"
                style={{ backgroundColor: buttonColor }}
              >
                <WhatsAppIcon className="size-3.5 fill-white" />
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

const SORT_DETAILS: { id: CatalogSortOption; label: string; desc: string }[] = [
  { id: "featured", label: "Featured (Curated)", desc: "Storefront order as defined in catalog" },
  { id: "price_asc", label: "Price: Low to High", desc: "Cheapest products first" },
  { id: "price_desc", label: "Price: High to Low", desc: "Premium products first" },
  { id: "discount_desc", label: "Biggest Discount (% OFF)", desc: "Highest percentage savings first" },
  { id: "newest", label: "Newest Drops First", desc: "Recently added items or marked NEW" },
  { id: "name_asc", label: "Alphabetical (A to Z)", desc: "Sort product names alphabetically" },
];

function CatalogSortDrawer({
  isOpen,
  onClose,
  allowedSorts,
  activeSort,
  onSelectSort,
}: {
  isOpen: boolean;
  onClose: () => void;
  allowedSorts: CatalogSortOption[];
  activeSort: CatalogSortOption;
  onSelectSort: (sort: CatalogSortOption) => void;
}) {
  if (!isOpen) return null;

  const visibleOptions = SORT_DETAILS.filter((opt) => allowedSorts.includes(opt.id));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      <button
        type="button"
        aria-label="Close"
        className="animate-fade-in pointer-events-auto absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="animate-slide-up pointer-events-auto relative flex w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border-t border-line-soft bg-surface shadow-2xl">
        <div className="flex justify-center pt-3">
          <div className="h-1.5 w-10 rounded-full bg-line" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-line-soft">
          <div>
            <h3 className="text-base font-bold text-ink">Sort By</h3>
            <p className="text-xs text-muted">Choose how products are ordered</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-fill text-muted hover:text-ink cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="p-4 space-y-2 max-h-[70vh] overflow-y-auto">
          {visibleOptions.map((opt) => {
            const isSelected = activeSort === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onSelectSort(opt.id);
                  onClose();
                }}
                className={cn(
                  "tap-smooth w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer",
                  isSelected
                    ? "border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 ring-1 ring-purple-600/30"
                    : "border-line-soft bg-surface hover:bg-fill/60"
                )}
              >
                <div>
                  <div className={cn("text-xs font-bold", isSelected ? "text-purple-700 dark:text-purple-300" : "text-ink")}>
                    {opt.label}
                  </div>
                  <div className="text-[11px] text-muted">{opt.desc}</div>
                </div>
                <div
                  className={cn(
                    "size-5 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                    isSelected
                      ? "border-purple-600 bg-purple-600 text-white"
                      : "border-slate-300 dark:border-zinc-700"
                  )}
                >
                  {isSelected && <Check className="size-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CatalogFilterDrawer({
  isOpen,
  onClose,
  filterConfig,
  categories,
  activeCategory,
  onSelectCategory,
  brands,
  selectedBrands,
  onToggleBrand,
  priceBracket,
  onSelectPriceBracket,
  inStockOnly,
  onToggleInStockOnly,
  onResetAll,
  filteredCount,
}: {
  isOpen: boolean;
  onClose: () => void;
  filterConfig: CatalogFilterConfig;
  categories: string[];
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  brands: string[];
  selectedBrands: string[];
  onToggleBrand: (brand: string) => void;
  priceBracket: "all" | "under_100" | "100_150" | "above_150";
  onSelectPriceBracket: (bracket: "all" | "under_100" | "100_150" | "above_150") => void;
  inStockOnly: boolean;
  onToggleInStockOnly: () => void;
  onResetAll: () => void;
  filteredCount: number;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      <button
        type="button"
        aria-label="Close"
        className="animate-fade-in pointer-events-auto absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="animate-slide-up pointer-events-auto relative flex w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border-t border-line-soft bg-surface shadow-2xl max-h-[85vh]">
        <div className="flex justify-center pt-3">
          <div className="h-1.5 w-10 rounded-full bg-line" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-line-soft">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-purple-600" />
            <h3 className="text-base font-bold text-ink">Filters</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onResetAll}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 px-2 py-1 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer"
            >
              Reset All
            </button>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full bg-fill text-muted hover:text-ink cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto flex-1 min-h-0">
          {/* Categories */}
          {filterConfig.showCategories && categories.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2.5">Category</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isSelected = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      data-filter-category={cat}
                      onClick={() => onSelectCategory(cat)}
                      className={cn(
                        "tap-smooth px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                        isSelected
                          ? "bg-purple-600 text-white shadow-xs"
                          : "border border-line-soft bg-surface text-ink hover:bg-fill"
                      )}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Brands */}
          {filterConfig.showBrands && brands.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2.5">Brand</p>
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => {
                  const isSelected = selectedBrands.includes(brand);
                  return (
                    <button
                      key={brand}
                      type="button"
                      data-filter-brand={brand}
                      onClick={() => onToggleBrand(brand)}
                      className={cn(
                        "tap-smooth inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                        isSelected
                          ? "border-purple-600 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 ring-1 ring-purple-600/30"
                          : "border-line-soft bg-surface text-ink hover:bg-fill"
                      )}
                    >
                      <span>{brand}</span>
                      {isSelected && <Check className="size-3 text-purple-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price Range */}
          {filterConfig.showPrice && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2.5">Price Range</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "all", label: "All Prices" },
                  { id: "under_100", label: "Under $100" },
                  { id: "100_150", label: "$100 - $150" },
                  { id: "above_150", label: "Over $150" },
                ].map((bracket) => {
                  const isSelected = priceBracket === bracket.id;
                  return (
                    <button
                      key={bracket.id}
                      type="button"
                      data-filter-price={bracket.id}
                      onClick={() => onSelectPriceBracket(bracket.id as typeof priceBracket)}
                      className={cn(
                        "tap-smooth py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer",
                        isSelected
                          ? "border-purple-600 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 ring-1 ring-purple-600/30"
                          : "border-line-soft bg-surface text-ink hover:bg-fill"
                      )}
                    >
                      {bracket.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* In Stock Only */}
          {filterConfig.showStock && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl border border-line-soft bg-surface shadow-2xs">
              <div>
                <div className="text-xs font-bold text-ink">In Stock Only</div>
                <div className="text-[11px] text-muted">Exclude sold out products</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={inStockOnly}
                data-testid="instock-switch"
                onClick={onToggleInStockOnly}
                className={cn(
                  "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                  inStockOnly ? "bg-purple-600" : "bg-slate-200 dark:bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                    inStockOnly ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-4 border-t border-line-soft bg-surface shrink-0">
          <button
            type="button"
            data-testid="filter-submit-btn"
            onClick={onClose}
            className="tap-smooth w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer text-center"
          >
            Show {filteredCount} {filteredCount === 1 ? "Product" : "Products"}
          </button>
        </div>
      </div>
    </div>
  );
}

function getEffectivePrice(p: Product) {
  if (typeof p.salePrice === "number" && p.salePrice > 0) return p.salePrice;
  if (typeof p.price === "number") return p.price;
  return typeof p.price === "string" ? priceNumber(p.price) : 0;
}

function applyCatalogFilters(
  products: Product[],
  filterState: CatalogFilterState,
  autoHideOutOfStock?: boolean
) {
  let filtered = products;

  if (autoHideOutOfStock) {
    filtered = filtered.filter((p) => (p.stock ?? 1) > 0);
  }

  if (filterState.activeCategory && filterState.activeCategory !== "All") {
    filtered = filtered.filter((p) => p.category === filterState.activeCategory);
  }

  if (filterState.selectedBrands && filterState.selectedBrands.length > 0) {
    filtered = filtered.filter((p) => p.brand && filterState.selectedBrands.includes(p.brand));
  }

  if (filterState.priceBracket && filterState.priceBracket !== "all") {
    filtered = filtered.filter((p) => {
      const price = getEffectivePrice(p);
      if (filterState.priceBracket === "under_100") return price < 100;
      if (filterState.priceBracket === "100_150") return price >= 100 && price <= 150;
      if (filterState.priceBracket === "above_150") return price > 150;
      return true;
    });
  }

  if (filterState.inStockOnly) {
    filtered = filtered.filter((p) => (p.stock ?? 1) > 0);
  }

  const sorted = [...filtered].sort((a, b) => {
    const priceA = getEffectivePrice(a);
    const priceB = getEffectivePrice(b);
    const discA = a.discountPercentage ?? 0;
    const discB = b.discountPercentage ?? 0;

    switch (filterState.activeSort) {
      case "price_asc":
        return priceA - priceB;
      case "price_desc":
        return priceB - priceA;
      case "discount_desc":
        return discB - discA;
      case "newest": {
        const isNewA = a.badge === "NEW" ? 1 : 0;
        const isNewB = b.badge === "NEW" ? 1 : 0;
        if (isNewA !== isNewB) return isNewB - isNewA;
        return (b.id || "").localeCompare(a.id || "");
      }
      case "name_asc":
        return (a.name || "").localeCompare(b.name || "");
      case "featured":
      default:
        return 0;
    }
  });

  return sorted;
}

function FilterSortView({
  sec,
  device,
}: {
  sec: FilterSortSection;
  device: Device;
}) {
  const dark = isDark(sec.background);
  const filterState = useEditor((s) => s.catalogFilterState);
  const shopCatalog = useEditor((s) => s.pages.shop.sections.find((x) => x.type === "catalog") as CatalogSection | undefined);
  const products = shopCatalog?.products || [];

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

  const [isSortDrawerOpen, setIsSortDrawerOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const availableBrands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean))) as string[];
  const dynamicCategories = ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[]];

  const sorted = applyCatalogFilters(products, filterState, filterConfig.autoHideOutOfStock);

  const activeFilterCount =
    (filterState.activeCategory !== "All" ? 1 : 0) +
    filterState.selectedBrands.length +
    (filterState.priceBracket !== "all" ? 1 : 0) +
    (filterState.inStockOnly ? 1 : 0);

  const sortLabels: Record<CatalogSortOption, string> = {
    featured: "Featured",
    price_asc: "Price: Low to High",
    price_desc: "Price: High to Low",
    discount_desc: "Biggest Discount",
    newest: "Newest Drops",
    name_asc: "Name: A to Z",
  };

  return (
    <SectionShell section={sec} background={sec.background} color={dark ? "#f5f5f7" : "#1d1d1f"}>
      <div className={cn("pt-4 pb-2", gutter(device))}>
        {/* Tier 2: Utility Bar (Sort & Filters) */}
        <div
          className={cn(
            "flex items-center justify-between gap-3 py-2.5 transition-all",
            layoutConfig.sticky
              ? "sticky top-14 z-20 backdrop-blur-md bg-surface/90 border-y border-line-soft/60 px-1 -mx-1"
              : ""
          )}
        >
          {/* Product Count */}
          <div>
            {layoutConfig.showItemCount && (
              <span className="text-xs font-semibold text-muted tracking-tight">
                {sorted.length} {sorted.length === 1 ? "Product" : "Products"}
              </span>
            )}
          </div>

          {/* Actions: Sort By & Filter Drawers */}
          <div className="flex items-center gap-2">
            {sortConfig.enabled && (
              <button
                type="button"
                onClick={() => setIsSortDrawerOpen(true)}
                className="tap-smooth inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line-soft bg-surface text-xs font-semibold text-ink shadow-2xs hover:bg-fill transition-colors cursor-pointer"
              >
                <ArrowUpDown className="size-3.5 text-muted" />
                <span className="text-muted font-normal">Sort:</span>
                <span>{sortLabels[filterState.activeSort] || "Featured"}</span>
                <ChevronDown className="size-3 text-muted ml-0.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className={cn(
                "tap-smooth inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs transition-colors cursor-pointer",
                activeFilterCount > 0
                  ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold ring-1 ring-purple-600/30"
                  : "border-line-soft bg-surface text-ink hover:bg-fill"
              )}
            >
              <SlidersHorizontal className="size-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center size-4 rounded-full bg-purple-600 text-[10px] text-white font-extrabold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {activeFilterCount > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {filterState.activeCategory !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-fill border border-line-soft text-xs text-ink">
                <span>{filterState.activeCategory}</span>
                <button
                  type="button"
                  onClick={() => useEditor.getState().setCatalogCategory("All")}
                  className="text-muted hover:text-ink cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

            {filterState.selectedBrands.map((brand) => (
              <span
                key={brand}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-fill border border-line-soft text-xs text-ink"
              >
                <span>{brand}</span>
                <button
                  type="button"
                  onClick={() => useEditor.getState().toggleCatalogBrand(brand)}
                  className="text-muted hover:text-ink cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}

            {filterState.priceBracket !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-fill border border-line-soft text-xs text-ink">
                <span>
                  {filterState.priceBracket === "under_100"
                    ? "Under $100"
                    : filterState.priceBracket === "100_150"
                      ? "$100 - $150"
                      : "Over $150"}
                </span>
                <button
                  type="button"
                  onClick={() => useEditor.getState().setCatalogPriceBracket("all")}
                  className="text-muted hover:text-ink cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

            {filterState.inStockOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-fill border border-line-soft text-xs text-ink">
                <span>In Stock Only</span>
                <button
                  type="button"
                  onClick={() => useEditor.getState().toggleCatalogInStockOnly()}
                  className="text-muted hover:text-ink cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={() => useEditor.getState().resetCatalogFilters()}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 ml-1 cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Tier 3: Mobile Drawers */}
      <CatalogSortDrawer
        isOpen={isSortDrawerOpen}
        onClose={() => setIsSortDrawerOpen(false)}
        allowedSorts={sortConfig.allowedSorts || ["featured", "price_asc", "price_desc", "discount_desc", "newest", "name_asc"]}
        activeSort={filterState.activeSort}
        onSelectSort={(s) => useEditor.getState().setCatalogSort(s)}
      />

      <CatalogFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filterConfig={filterConfig}
        categories={dynamicCategories}
        activeCategory={filterState.activeCategory}
        onSelectCategory={(c) => useEditor.getState().setCatalogCategory(c)}
        brands={availableBrands}
        selectedBrands={filterState.selectedBrands}
        onToggleBrand={(b) => useEditor.getState().toggleCatalogBrand(b)}
        priceBracket={filterState.priceBracket}
        onSelectPriceBracket={(p) => useEditor.getState().setCatalogPriceBracket(p)}
        inStockOnly={filterState.inStockOnly}
        onToggleInStockOnly={() => useEditor.getState().toggleCatalogInStockOnly()}
        onResetAll={() => useEditor.getState().resetCatalogFilters()}
        filteredCount={sorted.length}
      />
    </SectionShell>
  );
}

function CatalogView({
  sec,
  device,
}: {
  sec: Extract<Section, { type: "catalog" }>;
  device: Device;
}) {
  const dark = isDark(sec.background);
  const preview = useEditor((s) => s.preview);
  const filterState = useEditor((s) => s.catalogFilterState);
  const isList = sec.template === "list";
  const cols = isList
    ? "grid-cols-1 max-w-xl mx-auto"
    : device === "desktop"
      ? "grid-cols-3"
      : "grid-cols-2";

  const sorted = applyCatalogFilters(sec.products, filterState, sec.filterConfig?.autoHideOutOfStock);

  const openItem = (item: (typeof sorted)[number]) => {
    if (preview) {
      useEditor.getState().openProduct({
        id: item.id,
        name: item.name,
        price: item.salePrice || item.price,
        regularPrice: item.regularPrice || item.price,
        salePrice: item.salePrice,
        discountPercentage: item.discountPercentage,
        stock: item.stock ?? 10,
        brand: item.brand,
        category: item.category,
        description: item.description,
        gallery: item.gallery && item.gallery.length > 0 ? item.gallery : [item.img],
        img: item.img,
        variants: item.variants,
        badge: item.badge,
      });
    } else {
      useEditor.getState().select(sec.id);
    }
  };

  const buyDirectOnWhatsApp = (event: React.MouseEvent, item: (typeof sorted)[number]) => {
    if (!preview) {
      useEditor.getState().select(sec.id);
      return;
    }
    event.stopPropagation();
    const origin = typeof window !== "undefined" ? window.location.origin : "https://ziteo.site";
    const productUrl = `${origin}/product?name=${encodeURIComponent(item.name)}`;
    const phone = (sec.whatsappNumber || "919876543210").replace(/[^0-9]/g, "");
    const message =
      `Hi! I'd like to order from Ziteo:\n\n` +
      `📦 *Product:* ${item.name}\n` +
      `💰 *Price:* ${money(item.salePrice || item.price, sec.currency || "$")}\n` +
      `🔗 *Link:* ${productUrl}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <SectionShell section={sec} background={sec.background} color={dark ? "#f5f5f7" : "#1d1d1f"}>
      <div className={cn("pt-2 pb-10", gutter(device))}>
        {/* Pure Catalog Grid — NO All essentials title, NO Footwear/Apparel pills */}
        <div key={`${filterState.activeSort}-${filterState.activeCategory}`} className={cn("animate-page-enter grid gap-x-4", isList ? "gap-y-3" : "gap-y-8", cols)}>
          {sorted.map((item) => (
            <StoreProductCard
              key={item.id}
              id={item.id}
              title={item.name}
              price={item.price}
              regularPrice={item.regularPrice}
              salePrice={item.salePrice}
              discountPercentage={item.discountPercentage}
              stock={item.stock}
              brand={item.brand}
              image={item.img}
              badge={item.badge}
              dark={dark}
              imageRatio={sec.imageRatio}
              borderRadius={sec.borderRadius ?? 16}
              typography={sec.typography}
              showBadge={sec.showBadge !== false}
              showPrice={sec.showPrice !== false}
              showButton={sec.showButton !== false}
              showBrand={sec.showBrand !== false}
              showDiscountBadge={sec.showDiscountBadge !== false}
              showStockStatus={sec.showStockStatus !== false}
              priceColor={sec.priceColor || (dark ? "#34d399" : "#059669")}
              buttonColor={sec.buttonColor || "#25D366"}
              currency={sec.currency || "$"}
              borderEnabled={sec.borderEnabled}
              borderWidth={sec.borderWidth}
              borderColor={sec.borderColor}
              shadowEnabled={sec.shadowEnabled}
              shadowStyle={sec.shadowStyle}
              cardBackground={sec.cardBackground}
              imageInset={sec.imageInset}
              imageRadius={sec.imageRadius}
              detailsLayout={sec.detailsLayout}
              textAlign={sec.textAlign}
              isList={isList}
              onCardClick={() => openItem(item)}
              onWhatsAppClick={(e) => buyDirectOnWhatsApp(e, item)}
            />
          ))}
        </div>

        {/* Empty State */}
        {sorted.length === 0 && (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
            <div className="size-12 rounded-2xl bg-fill flex items-center justify-center text-muted">
              <SlidersHorizontal className="size-6" />
            </div>
            <p className="text-sm font-semibold text-ink">No matching products found</p>
            <p className="text-xs text-muted max-w-xs">
              Try adjusting your filters or clearing them to browse all available items.
            </p>
            <button
              type="button"
              onClick={() => useEditor.getState().resetCatalogFilters()}
              className="mt-2 inline-flex items-center px-4 py-2 rounded-xl bg-ink text-on-ink text-xs font-semibold cursor-pointer shadow-xs hover:opacity-90"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </SectionShell>
  );
}


function ProductView({
  sec,
  device,
}: {
  sec: Extract<Section, { type: "product" }>;
  device: Device;
}) {
  const dark = isDark(sec.background);
  const preview = useEditor((s) => s.preview);
  const wide = device === "desktop";
  const isSplit = sec.template === "split";
  const isGrid = sec.template === "grid";

  const [activeImage, setActiveImage] = useState<string>(
    sec.image || (sec.gallery && sec.gallery[0]) || ""
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    sec.color || (sec.colors && sec.colors[0]) || ""
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    sec.size || (sec.sizes && sec.sizes[0]) || ""
  );

  useEffect(() => {
    if (sec.image) setActiveImage(sec.image);
    else if (sec.gallery && sec.gallery[0]) setActiveImage(sec.gallery[0]);
    if (sec.color) setSelectedColor(sec.color);
    if (sec.size) setSelectedSize(sec.size);
  }, [sec.image, sec.productName, sec.color, sec.size, sec.gallery]);

  // Variant extraction
  const colorGroup = sec.variants?.find((v) => v.name.toLowerCase() === "color");
  const sizeGroup = sec.variants?.find((v) => v.name.toLowerCase() === "size");

  const selectedSizeOption = sizeGroup?.options.find((o) => o.label === selectedSize);
  const sizePriceDelta = selectedSizeOption?.priceDelta || 0;

  // Price calculations
  const effRegularPrice =
    sec.regularPrice !== undefined ? sec.regularPrice : typeof sec.price === "number" ? sec.price : 149;
  const effSalePrice =
    sec.salePrice !== undefined && sec.salePrice < effRegularPrice ? sec.salePrice : undefined;
  const basePrice = effSalePrice !== undefined ? effSalePrice : (sec.price || effRegularPrice);

  const currentPrice = basePrice + sizePriceDelta;
  const currentRegularPrice = effRegularPrice + sizePriceDelta;
  const hasDiscount = effSalePrice !== undefined || currentPrice < currentRegularPrice;

  const discountPct =
    sec.discountPercentage !== undefined && sec.discountPercentage > 0
      ? sec.discountPercentage
      : hasDiscount && currentRegularPrice > 0
        ? Math.round(((currentRegularPrice - currentPrice) / currentRegularPrice) * 100)
        : 0;

  // Stock calculations
  const currentStock =
    selectedSizeOption?.stock !== undefined
      ? selectedSizeOption.stock
      : sec.stock !== undefined
        ? sec.stock
        : 10;
  const isOutOfStock = currentStock <= 0;

  const ratioClass =
    sec.imageRatio === "3:4"
      ? "aspect-[3/4]"
      : sec.imageRatio === "16:9"
        ? "aspect-video"
        : "aspect-square";

  const radiusPx = sec.borderRadius !== undefined ? `${sec.borderRadius}px` : "24px";
  const thumbRadiusPx = `${Math.max(6, Math.round((sec.borderRadius ?? 24) * 0.5))}px`;
  const galleryStyle = sec.galleryStyle || "strip";

  const titleSizeClass =
    sec.titleFontSize === "sm"
      ? "text-xl sm:text-2xl"
      : sec.titleFontSize === "lg"
        ? "text-3xl sm:text-4xl"
        : sec.titleFontSize === "xl"
          ? "text-3xl sm:text-5xl"
          : sec.typography === "sm"
            ? "text-2xl sm:text-3xl"
            : sec.typography === "lg"
              ? "text-3xl sm:text-5xl"
              : "text-2xl sm:text-4xl";

  const titleWeightClass =
    sec.titleFontWeight === "normal"
      ? "font-normal"
      : sec.titleFontWeight === "medium"
        ? "font-medium"
        : sec.titleFontWeight === "bold"
          ? "font-bold"
          : sec.typography === "lg"
            ? "font-bold"
            : "font-semibold";

  const titleClass = `${titleSizeClass} ${titleWeightClass}`;

  const handleBuyOnWhatsApp = (event: React.MouseEvent) => {
    if (!preview) return;
    event.stopPropagation();
    const origin = typeof window !== "undefined" ? window.location.origin : "https://ziteo.site";
    const productUrl = `${origin}/product?name=${encodeURIComponent(sec.productName)}`;
    const phone = (sec.whatsappNumber || "919876543210").replace(/[^0-9]/g, "");

    let specsText = "";
    if (sec.brand) specsText += `🏷️ *Brand:* ${sec.brand}\n`;
    if (sec.category) specsText += `📁 *Category:* ${sec.category}\n`;
    if (selectedColor) specsText += `🎨 *Color:* ${selectedColor}\n`;
    if (selectedSize) specsText += `📏 *Size:* ${selectedSize}\n`;

    const statusText = isOutOfStock
      ? "Out of Stock"
      : currentStock <= 3
        ? `Low Stock (${currentStock} left)`
        : "In Stock";

    const message =
      `Hi! I would like to order from your store:\n\n` +
      `📦 *Product:* ${sec.productName}\n` +
      specsText +
      `💰 *Price:* ${money(currentPrice, sec.currency || "$")}` +
      (hasDiscount && discountPct > 0
        ? ` (MRP: ${money(currentRegularPrice, sec.currency || "$")} • ${discountPct}% OFF)`
        : "") +
      `\n` +
      `📊 *Status:* ${statusText}\n` +
      `🔗 *Link:* ${productUrl}`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const galleryImages =
    sec.gallery && sec.gallery.length > 0 ? sec.gallery : [sec.image || PHOTOS.court];

  const gallery = (
    <div>
      <div
        style={{ borderRadius: radiusPx }}
        className={cn("relative overflow-hidden bg-fill/40", wide ? "h-96" : "")}
      >
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 items-start">
          {hasDiscount && discountPct > 0 && (
            <span className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-extrabold tracking-wider text-white uppercase shadow-sm">
              {discountPct}% OFF
            </span>
          )}
          {sec.showBadge !== false && sec.badgeText && (
            <span className="rounded-md bg-ink/90 px-2.5 py-1 text-xs font-bold tracking-wider text-on-ink uppercase backdrop-blur-xs shadow-xs">
              {sec.badgeText}
            </span>
          )}
        </div>
        <img
          key={activeImage}
          src={activeImage}
          alt={sec.productName}
          className={cn(
            "animate-fade-in w-full object-cover transition-transform duration-700 ease-out hover:scale-105",
            wide ? "h-full" : ratioClass
          )}
        />
      </div>

      {galleryStyle === "dots" ? (
        <div className="mt-3.5 flex items-center justify-center gap-2">
          {galleryImages.map((img) => (
            <button
              key={img}
              type="button"
              aria-label="Photo dot"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImage(img);
                useEditor.getState().setProductField({ image: img });
              }}
              className={cn(
                "tap-smooth rounded-full transition-all duration-200 cursor-pointer",
                img === activeImage
                  ? "h-2 w-6 bg-purple-600"
                  : "size-2 bg-slate-300 dark:bg-zinc-600 hover:bg-slate-400"
              )}
            />
          ))}
        </div>
      ) : galleryStyle === "grid" ? (
        <div className="mt-3.5 grid grid-cols-4 gap-2">
          {galleryImages.map((img) => (
            <button
              key={img}
              type="button"
              aria-label="Show photo"
              onClick={(event) => {
                event.stopPropagation();
                setActiveImage(img);
                useEditor.getState().setProductField({ image: img });
              }}
              style={{ borderRadius: thumbRadiusPx }}
              className={cn(
                "tap-smooth aspect-square overflow-hidden transition-all duration-200 cursor-pointer border",
                img === activeImage
                  ? "border-purple-600 ring-2 ring-purple-600/40 scale-102 shadow-xs"
                  : "border-transparent opacity-80 hover:opacity-100 hover:scale-102"
              )}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : (
        <div className={cn("no-scrollbar mt-3.5 flex gap-2 overflow-x-auto", wide ? "" : "px-1")}>
          {galleryImages.map((img) => (
            <button
              key={img}
              type="button"
              aria-label="Show photo"
              onClick={(event) => {
                event.stopPropagation();
                setActiveImage(img);
                useEditor.getState().setProductField({ image: img });
              }}
              style={{ borderRadius: thumbRadiusPx }}
              className={cn(
                "tap-smooth size-16 shrink-0 overflow-hidden transition-all duration-200 cursor-pointer border",
                img === activeImage
                  ? "border-purple-600 ring-2 ring-purple-600/40 scale-105 shadow-xs"
                  : "border-transparent opacity-80 hover:opacity-100 hover:scale-102"
              )}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const info = (
    <div className={cn(wide || isSplit ? "flex flex-col justify-center" : "pt-6")}>
      {/* Category & Brand Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-muted mb-2 font-medium">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (preview) useEditor.getState().switchPage("home");
          }}
          className="hover:text-ink transition-colors cursor-pointer"
        >
          Home
        </button>
        <span>/</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (preview) useEditor.getState().switchPage("shop");
          }}
          className="hover:text-ink transition-colors cursor-pointer"
        >
          {sec.category || "Catalog"}
        </button>
        {sec.brand && (
          <>
            <span>/</span>
            <span className="text-ink font-semibold">{sec.brand}</span>
          </>
        )}
      </div>

      <h1 className={cn("tracking-tight", titleClass)}>{sec.productName}</h1>

      {/* Stock availability & Discount badge */}
      <div className="mt-2.5 flex items-center gap-2.5 flex-wrap">
        {isOutOfStock ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300">
            <span className="size-2 rounded-full bg-rose-500" />
            <span>Out of Stock</span>
          </span>
        ) : currentStock <= 3 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <span className="size-2 rounded-full bg-amber-500" />
            <span>Low Stock — Only {currentStock} left!</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>In Stock ({currentStock} available)</span>
          </span>
        )}

        {hasDiscount && discountPct > 0 && (
          <span className="inline-flex items-center rounded-md bg-rose-600 px-2 py-0.5 text-xs font-bold text-white uppercase shadow-xs">
            {discountPct}% OFF
          </span>
        )}
      </div>

      {/* Price with strikethrough regular price */}
      <div className="mt-3.5 flex items-baseline gap-2.5 flex-wrap">
        <span
          className="text-2xl sm:text-3xl font-extrabold tracking-tight"
          style={{ color: sec.priceColor || (dark ? "#34d399" : "#059669") }}
        >
          {money(currentPrice, sec.currency || "$")}
        </span>
        {hasDiscount && (
          <span className="text-base text-slate-400 dark:text-slate-500 line-through font-normal">
            {money(currentRegularPrice, sec.currency || "$")}
          </span>
        )}
      </div>

      {/* Product Description */}
      {sec.showDescription !== false && sec.description && (
        <p className={cn("mt-4 max-w-md text-sm leading-relaxed", dark ? "text-on-ink/80" : "text-muted")}>
          {sec.description}
        </p>
      )}

      {/* Variant 1: Color Picker */}
      {sec.showColors !== false && (
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <p className={cn("text-xs font-semibold uppercase tracking-wider", dark ? "text-on-ink/70" : "text-muted")}>
              Select Color
            </p>
            {selectedColor && (
              <span className="text-xs font-medium text-ink">{selectedColor}</span>
            )}
          </div>
          <div className="mt-2.5 flex gap-2.5 flex-wrap">
            {colorGroup ? (
              colorGroup.options.map((opt) => {
                const isSelected = selectedColor === opt.label || selectedColor === opt.colorHex;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    title={`${opt.label} (${opt.stock} in stock)`}
                    aria-label={`Color ${opt.label}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedColor(opt.label);
                      useEditor.getState().setProductField({ color: opt.label });
                    }}
                    className={cn(
                      "tap-smooth flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all cursor-pointer",
                      isSelected
                        ? "border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 ring-2 ring-purple-600/30 font-semibold"
                        : "border-line-soft bg-surface hover:border-slate-300 dark:hover:border-slate-700 text-ink"
                    )}
                  >
                    {opt.colorHex && (
                      <span
                        className="size-3.5 rounded-full border border-black/10 shadow-2xs"
                        style={{ backgroundColor: opt.colorHex }}
                      />
                    )}
                    <span>{opt.label}</span>
                  </button>
                );
              })
            ) : sec.colors && sec.colors.length > 0 ? (
              sec.colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Color ${color}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedColor(color);
                    useEditor.getState().setProductField({ color });
                  }}
                  className={cn(
                    "tap-smooth size-10 rounded-full border border-line transition-transform duration-200 hover:scale-110 cursor-pointer",
                    color === selectedColor && "ring-2 ring-emerald-500 ring-offset-2 scale-105"
                  )}
                  style={{ background: color }}
                />
              ))
            ) : null}
          </div>
        </div>
      )}

      {/* Variant 2: Size Picker */}
      {sec.showSizes !== false && (
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <p className={cn("text-xs font-semibold uppercase tracking-wider", dark ? "text-on-ink/70" : "text-muted")}>
              Select Size
            </p>
            {selectedSize && (
              <span className="text-xs font-medium text-ink">{selectedSize}</span>
            )}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {sizeGroup ? (
              sizeGroup.options.map((opt) => {
                const isSelected = selectedSize === opt.label;
                const isOptOutOfStock = opt.stock <= 0;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isOptOutOfStock}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedSize(opt.label);
                      useEditor.getState().setProductField({ size: opt.label });
                    }}
                    className={cn(
                      "tap-smooth min-h-10 rounded-xl border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5",
                      isOptOutOfStock
                        ? "border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 line-through cursor-not-allowed opacity-50"
                        : isSelected
                          ? "border-purple-600 bg-purple-600 text-white shadow-xs cursor-pointer scale-102"
                          : "border-line-soft bg-surface hover:border-slate-300 text-ink cursor-pointer"
                    )}
                  >
                    <span>{opt.label}</span>
                    {opt.priceDelta ? (
                      <span className={cn("text-[10px]", isSelected ? "text-white/80" : "text-muted")}>
                        (+{money(opt.priceDelta, sec.currency || "$")})
                      </span>
                    ) : null}
                  </button>
                );
              })
            ) : sec.sizes && sec.sizes.length > 0 ? (
              sec.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedSize(size);
                    useEditor.getState().setProductField({ size });
                  }}
                  className={cn(
                    "tap-smooth h-10 rounded-full border px-4 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer",
                    size === selectedSize
                      ? "border-purple-600 bg-purple-600 text-white shadow-xs"
                      : "border-line bg-transparent hover:border-ink"
                  )}
                >
                  {size}
                </button>
              ))
            ) : null}
          </div>
        </div>
      )}

      {/* WhatsApp Buy Button */}
      <button
        type="button"
        disabled={isOutOfStock}
        onClick={handleBuyOnWhatsApp}
        style={{ backgroundColor: isOutOfStock ? "#94a3b8" : (sec.buttonColor || "#25D366") }}
        className={cn(
          "tap-smooth-sm mt-6 flex h-13 w-full items-center justify-center gap-2.5 rounded-full text-sm font-semibold text-white shadow-lg transition-all",
          isOutOfStock
            ? "cursor-not-allowed opacity-60"
            : "hover:opacity-95 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        )}
      >
        <WhatsAppIcon className="size-5 fill-white" />
        <span>
          {isOutOfStock
            ? "Sold Out in this Variant"
            : `${sec.buttonText || "Buy on WhatsApp"} · ${money(currentPrice, sec.currency || "$")}`}
        </span>
      </button>

      {sec.showTrustBadges !== false && (
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted">
          <span className="size-1.5 rounded-full" style={{ backgroundColor: sec.buttonColor || "#25D366" }} />
          <span>Direct WhatsApp order with instant seller confirmation</span>
        </div>
      )}
    </div>
  );

  return (
    <SectionShell section={sec} background={sec.background} color={dark ? "#f5f5f7" : "#1d1d1f"}>
      {isGrid && wide ? (
        <div className="grid grid-cols-12 gap-8 px-8 py-10">
          <div className="col-span-7">
            <div className="grid grid-cols-2 gap-3">
              {galleryImages.map((img, idx) => (
                <div
                  key={img}
                  style={{ borderRadius: radiusPx }}
                  className={cn(
                    "relative overflow-hidden bg-fill/40 cursor-pointer transition-transform hover:scale-[1.01]",
                    idx === 0 ? "col-span-2 aspect-[4/3]" : "aspect-square"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage(img);
                    useEditor.getState().setProductField({ image: img });
                  }}
                >
                  {idx === 0 && (
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 items-start">
                      {hasDiscount && discountPct > 0 && (
                        <span className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-extrabold tracking-wider text-white uppercase shadow-sm">
                          {discountPct}% OFF
                        </span>
                      )}
                      {sec.showBadge !== false && sec.badgeText && (
                        <span className="rounded-md bg-ink/90 px-2.5 py-1 text-xs font-bold tracking-wider text-on-ink uppercase backdrop-blur-xs shadow-xs">
                          {sec.badgeText}
                        </span>
                      )}
                    </div>
                  )}
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-5">
            <div className="sticky top-24">{info}</div>
          </div>
        </div>
      ) : (
        <div className={cn(wide || isSplit ? "grid grid-cols-2 gap-10 px-8 py-10" : "px-5 pb-8")}>
          {gallery}
          {info}
        </div>
      )}

      {sec.stickyButton && !wide && (
        <div className="fixed bottom-18 left-0 right-0 z-30 px-4 py-2 pointer-events-none">
          <div className="pointer-events-auto mx-auto max-w-md rounded-2xl border border-slate-200/80 bg-surface/95 p-2 shadow-xl backdrop-blur-xl flex items-center justify-between gap-3">
            <div className="pl-2 min-w-0">
              <div className="text-xs font-semibold text-ink truncate">{sec.productName}</div>
              <div
                className="text-xs font-bold"
                style={{ color: sec.priceColor || (dark ? "#34d399" : "#059669") }}
              >
                {money(sec.price)}
              </div>
            </div>
            <button
              type="button"
              onClick={handleBuyOnWhatsApp}
              style={{ backgroundColor: sec.buttonColor || "#25D366" }}
              className="tap-smooth shrink-0 flex h-10 px-4 items-center justify-center gap-2 rounded-xl text-xs font-semibold text-white shadow-sm hover:opacity-95"
            >
              <WhatsAppIcon className="size-4 fill-white" />
              <span>{sec.buttonText || "Buy on WhatsApp"}</span>
            </button>
          </div>
        </div>
      )}
    </SectionShell>
  );
}

function JoinForm({ dark }: { dark: boolean }) {
  const [email, setEmail] = useState("");
  const preview = useEditor((s) => s.preview);
  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!preview) return;
        event.stopPropagation();
        if (!email.trim()) return;
        setEmail("");
        useEditor.getState().showToast("You're on the list.");
      }}
    >
      <input
        type="email"
        required
        value={email}
        placeholder="Email"
        onClick={(event) => event.stopPropagation()}
        onChange={(event) => setEmail(event.target.value)}
        className={cn(
          "h-11 min-w-0 flex-1 rounded-full px-4 text-sm outline-none",
          dark ? "bg-on-ink/10 text-on-ink placeholder:text-on-ink/50" : "bg-surface text-ink",
        )}
      />
      <button type="submit" className={cn(solid(dark), "shrink-0 px-5")}>
        Join
      </button>
    </form>
  );
}

function FooterView({
  sec,
  device,
}: {
  sec: Extract<Section, { type: "footer" }>;
  device: Device;
}) {
  const dark = isDark(sec.background);
  const preview = useEditor((s) => s.preview);
  const link = (label: string, page?: PageId) => (
    <button
      type="button"
      onClick={(event) => {
        if (!preview) return;
        event.stopPropagation();
        if (page) useEditor.getState().switchPage(page);
        else useEditor.getState().showToast(`${label} lives on the published site.`);
      }}
      className="text-left text-sm opacity-80 hover:opacity-100"
    >
      {label}
    </button>
  );

  if (sec.template === "columns") {
    return (
      <SectionShell section={sec} background={sec.background} color={sec.text}>
        <div className={cn("grid gap-8 py-12", gutter(device), device === "desktop" ? "grid-cols-4" : "grid-cols-2")}>
          <div className={device === "mobile" ? "col-span-2" : ""}>
            <p className="text-sm font-semibold tracking-widest text-ink" style={{ color: isDark(sec.background) ? "#f5f5f7" : "#1d1d1f" }}>
              {sec.brand}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">Everyday footwear and modular layers.</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium tracking-widest uppercase opacity-60">Shop</p>
            {link("Footwear", "shop")}
            {link("Apparel", "shop")}
            {link("Featured", "product")}
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium tracking-widest uppercase opacity-60">Company</p>
            {link("About")}
            {link("Stores")}
            {link("Care")}
          </div>
          <div className={device === "mobile" ? "col-span-2" : ""}>
            <p className="text-xs font-medium tracking-widest uppercase opacity-60">Notes</p>
            <div className="mt-3">
              <JoinForm dark={dark} />
            </div>
          </div>
        </div>
        <p className={cn("pb-8 text-xs opacity-70", gutter(device))}>{sec.copy}</p>
      </SectionShell>
    );
  }

  return (
    <SectionShell section={sec} background={sec.background} color={sec.text}>
      <div className="px-5 py-10 text-center">
        <p className="text-sm font-semibold tracking-widest" style={{ color: isDark(sec.background) ? "#f5f5f7" : "#1d1d1f" }}>
          {sec.brand}
        </p>
        <div className="mt-4 flex justify-center gap-5">
          {link("Privacy")}
          {link("Terms")}
          {link("Support")}
        </div>
        <p className="mt-4 text-xs opacity-70">{sec.copy}</p>
      </div>
    </SectionShell>
  );
}

function SiteMenu() {
  const open = useEditor((s) => s.menuOpen);
  const pageId = useEditor((s) => s.pageId);
  const preview = useEditor((s) => s.preview);
  if (!open) return null;
  const links: { id: PageId; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "shop", label: "Shop" },
    { id: "product", label: "Product" },
  ];
  return (
    <div className="absolute inset-0 z-30">
      <button
        type="button"
        aria-label="Close menu"
        className="animate-fade-in absolute inset-0 bg-ink/30 backdrop-blur-xs transition-opacity"
        onClick={() => useEditor.getState().setMenuOpen(false)}
      />
      <div className="animate-slide-in-left relative flex h-full w-4/5 max-w-xs flex-col bg-surface px-6 py-6 text-ink shadow-frame">
        <button
          type="button"
          aria-label="Close"
          onClick={() => useEditor.getState().setMenuOpen(false)}
          className="tap-smooth mb-8 inline-flex size-11 items-center justify-center self-end rounded-full bg-fill hover:bg-line-soft transition-colors"
        >
          <X className="size-5" strokeWidth={1.5} />
        </button>
        <div className="flex flex-col gap-2">
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => {
                if (!preview) return;
                useEditor.getState().switchPage(link.id);
              }}
              className={cn(
                "tap-smooth-sm py-2 text-left text-3xl font-semibold tracking-tight transition-colors duration-150",
                link.id === pageId ? "text-ink" : "text-muted hover:text-ink",
              )}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturedView({
  sec,
  device,
}: {
  sec: Extract<Section, { type: "featured" }>;
  device: Device;
}) {
  const dark = isDark(sec.background);
  const preview = useEditor((s) => s.preview);
  const isCarousel = sec.template === "carousel";
  const cols =
    device === "desktop"
      ? "grid-cols-4"
      : device === "tablet"
        ? "grid-cols-3"
        : "grid-cols-2";

  const openItem = (item: (typeof sec.items)[number]) => {
    const num = Number(item.price.replace(/[^0-9.]/g, ""));
    const price = Number.isFinite(num) && num > 0 ? num : 149;
    if (preview) {
      useEditor.getState().openProduct({
        id: item.id,
        name: item.title,
        price: item.salePrice || price,
        regularPrice: item.regularPrice || price,
        salePrice: item.salePrice,
        discountPercentage: item.discountPercentage,
        stock: item.stock ?? 10,
        brand: item.brand,
        category: item.category || item.tag,
        description: item.description,
        gallery: item.gallery && item.gallery.length > 0 ? item.gallery : [item.image],
        img: item.image,
        variants: item.variants,
        badge: item.badge,
      });
    } else {
      useEditor.getState().select(sec.id);
    }
  };

  const buyDirectOnWhatsApp = (event: React.MouseEvent, item: (typeof sec.items)[number]) => {
    if (!preview) {
      useEditor.getState().select(sec.id);
      return;
    }
    event.stopPropagation();
    const origin = typeof window !== "undefined" ? window.location.origin : "https://ziteo.site";
    const productUrl = `${origin}/product?name=${encodeURIComponent(item.title)}`;
    const phone = (sec.whatsappNumber || "919876543210").replace(/[^0-9]/g, "");
    const message =
      `Hi! I'd like to order from Ziteo:\n\n` +
      `📦 *Product:* ${item.title}\n` +
      `💰 *Price:* ${item.price}\n` +
      `🔗 *Link:* ${productUrl}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <SectionShell section={sec} background={sec.background} color={dark ? "#f5f5f7" : "#1d1d1f"}>
      <div className={cn("py-10", gutter(device))}>
        <div className="flex items-end justify-between">
          <div>
            <h2 className={cn("font-semibold tracking-tight", titleSize(device))}>{sec.title}</h2>
            {sec.subtitle && (
              <p className={cn("mt-1.5 text-sm", dark ? "text-on-ink/70" : "text-muted")}>
                {sec.subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (preview) useEditor.getState().switchPage("shop");
            }}
            className={cn("tap-smooth text-xs font-semibold hover:underline", dark ? "text-purple-300" : "text-accent")}
          >
            View all drops →
          </button>
        </div>

        <div
          className={cn(
            "mt-6",
            isCarousel
              ? "no-scrollbar flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory"
              : cn("grid gap-x-4 gap-y-8", cols)
          )}
        >
          {sec.items.map((item) => (
            <StoreProductCard
              key={item.id}
              id={item.id}
              title={item.title}
              price={item.price}
              regularPrice={item.regularPrice}
              salePrice={item.salePrice}
              discountPercentage={item.discountPercentage}
              stock={item.stock}
              brand={item.brand}
              image={item.image}
              badge={item.badge}
              dark={dark}
              imageRatio={sec.imageRatio}
              borderRadius={sec.borderRadius ?? 16}
              typography={sec.typography}
              showBadge={sec.showBadge !== false}
              showPrice={sec.showPrice !== false}
              showButton={sec.showButton !== false}
              showBrand={sec.showBrand !== false}
              showDiscountBadge={sec.showDiscountBadge !== false}
              showStockStatus={sec.showStockStatus !== false}
              priceColor={sec.priceColor || (dark ? "#34d399" : "#059669")}
              buttonColor={sec.buttonColor || "#25D366"}
              currency={sec.currency || "$"}
              borderEnabled={sec.borderEnabled}
              borderWidth={sec.borderWidth}
              borderColor={sec.borderColor}
              shadowEnabled={sec.shadowEnabled}
              shadowStyle={sec.shadowStyle}
              cardBackground={sec.cardBackground}
              imageInset={sec.imageInset}
              imageRadius={sec.imageRadius}
              detailsLayout={sec.detailsLayout}
              textAlign={sec.textAlign}
              isCarousel={isCarousel}
              onCardClick={() => openItem(item)}
              onWhatsAppClick={(e) => buyDirectOnWhatsApp(e, item)}
            />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function CategoriesView({
  sec,
  device,
}: {
  sec: Extract<Section, { type: "categories" }>;
  device: Device;
}) {
  const dark = isDark(sec.background);
  const preview = useEditor((s) => s.preview);

  const handleClick = (name: string) => {
    if (preview) {
      useEditor.getState().setCatalogFilter(name as any);
      useEditor.getState().switchPage("shop");
    }
  };

  const isPills = sec.template === "pills";
  const isGrid = sec.template === "grid";

  return (
    <SectionShell section={sec} background={sec.background} color={dark ? "#f5f5f7" : "#1d1d1f"}>
      <div className={cn("py-8", gutter(device))}>
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <h2 className={cn("font-semibold tracking-tight", titleSize(device))}>{sec.title}</h2>
            {sec.subtitle && (
              <p className={cn("mt-1 text-sm", dark ? "text-on-ink/70" : "text-muted")}>
                {sec.subtitle}
              </p>
            )}
          </div>
        </div>

        {isPills ? (
          <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
            {sec.items.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick(cat.name);
                }}
                className={cn(
                  "tap-smooth flex items-center gap-2.5 rounded-full border border-line-soft px-3 py-1.5 shrink-0 transition-all hover:scale-105 shadow-2xs",
                  dark ? "bg-white/10 text-white" : "bg-surface text-ink hover:bg-fill"
                )}
              >
                <img src={cat.image} alt="" className="size-6 rounded-full object-cover" />
                <span className="text-xs font-semibold">{cat.name}</span>
                {cat.count && <span className="text-[10px] text-muted">{cat.count}</span>}
              </button>
            ))}
          </div>
        ) : isGrid ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {sec.items.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick(cat.name);
                }}
                className="group tap-smooth-sm flex flex-col items-center gap-2 rounded-2xl border border-line-soft bg-surface p-3 text-center shadow-2xs hover:border-line transition-all"
              >
                <div className="size-16 sm:size-20 overflow-hidden rounded-full bg-fill/50">
                  <img
                    src={cat.image}
                    alt=""
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-xs font-semibold text-ink group-hover:text-accent transition-colors">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {sec.items.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick(cat.name);
                }}
                className="group tap-smooth-sm relative aspect-[4/5] sm:aspect-square overflow-hidden rounded-3xl text-left shadow-xs transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <img
                  src={cat.image}
                  alt=""
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-sm font-bold tracking-tight">{cat.name}</div>
                  {cat.count && (
                    <div className="text-[11px] font-medium text-white/70">{cat.count}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </SectionShell>
  );
}

function BrandsView({
  sec,
  device,
}: {
  sec: Extract<Section, { type: "brands" }>;
  device: Device;
}) {
  const dark = isDark(sec.background);
  const isGrid = sec.template === "grid";

  return (
    <SectionShell section={sec} background={sec.background} color={dark ? "#f5f5f7" : "#1d1d1f"}>
      <div className={cn("py-8 text-center", gutter(device))}>
        <h2 className="text-xs font-bold tracking-widest text-muted uppercase">{sec.title}</h2>
        {sec.subtitle && (
          <p className={cn("mt-1 text-xs", dark ? "text-on-ink/60" : "text-muted")}>
            {sec.subtitle}
          </p>
        )}

        <div
          className={cn(
            "mt-5",
            isGrid
              ? "grid grid-cols-2 sm:grid-cols-3 gap-2.5"
              : "no-scrollbar flex items-center justify-center gap-3 overflow-x-auto py-1"
          )}
        >
          {sec.items.map((b) => (
            <div
              key={b.id}
              className={cn(
                "tap-smooth flex flex-col items-center justify-center rounded-2xl border border-line-soft px-5 py-3 shadow-2xs transition-all hover:scale-105",
                dark ? "bg-white/5 border-white/10" : "bg-surface hover:bg-fill/60",
                isGrid ? "" : "shrink-0 min-w-28"
              )}
            >
              <span className="text-sm font-black tracking-widest text-ink">{b.name}</span>
              {b.tagline && (
                <span className="text-[9px] font-medium text-muted mt-0.5">{b.tagline}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function AboutView({
  sec,
  device,
}: {
  sec: Extract<Section, { type: "about" }>;
  device: Device;
}) {
  const dark = isDark(sec.background);
  const isSplit = sec.template === "split" || !sec.template;
  const isCards = sec.template === "cards";

  return (
    <SectionShell section={sec} background={sec.background} color={sec.text}>
      <div className={cn("py-12", gutter(device))}>
        <div className={cn(isSplit ? "grid grid-cols-1 sm:grid-cols-2 gap-8 items-center" : "")}>
          {sec.image && isSplit && (
            <div className="overflow-hidden rounded-3xl shadow-sm">
              <img
                src={sec.image}
                alt=""
                className="aspect-square sm:aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          )}
          <div>
            <span className="text-xs font-bold tracking-widest text-muted uppercase">
              {sec.kicker}
            </span>
            <h2 className={cn("mt-2 font-semibold tracking-tight", device === "mobile" ? "text-2xl" : "text-3xl")}>
              {sec.title}
            </h2>
            <p className={cn("mt-3 text-sm leading-relaxed", dark ? "text-on-ink/80" : "text-muted")}>
              {sec.story}
            </p>

            <div className={cn("mt-6 grid gap-3", isCards ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1")}>
              {sec.features.map((f) => (
                <div
                  key={f.id}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl p-3.5 border transition-all",
                    dark ? "border-white/10 bg-white/5" : "border-line-soft bg-surface shadow-2xs"
                  )}
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-ink">{f.title}</h3>
                    <p className="mt-0.5 text-[11px] text-muted leading-snug">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function renderSection(sec: Section, device: Device) {
  switch (sec.type) {
    case "navbar":
      return <NavbarView key={sec.id} sec={sec} device={device} />;
    case "hero":
      return <HeroView key={sec.id} sec={sec} device={device} />;
    case "grid":
      return <GridView key={sec.id} sec={sec} device={device} />;
    case "featured":
      return <FeaturedView key={sec.id} sec={sec} device={device} />;
    case "categories":
      return <CategoriesView key={sec.id} sec={sec} device={device} />;
    case "brands":
      return <BrandsView key={sec.id} sec={sec} device={device} />;
    case "about":
      return <AboutView key={sec.id} sec={sec} device={device} />;
    case "filter-sort":
      return <FilterSortView key={sec.id} sec={sec} device={device} />;
    case "catalog":
      return <CatalogView key={sec.id} sec={sec} device={device} />;
    case "product":
      return <ProductView key={sec.id} sec={sec} device={device} />;
    case "footer":
      return <FooterView key={sec.id} sec={sec} device={device} />;
    case "product-card":
      return null;
    default: {
      const never: never = sec;
      return never;
    }
  }
}

function ProductCardStudio() {
  const [backdrop, setBackdrop] = useState<"pattern" | "light" | "dark">("pattern");
  const [cardView, setCardView] = useState<"1" | "2">("1");
  const section = useEditor((s) => selectedSection(s));

  // Extract all card settings from current section with sensible defaults
  const cardProps = {
    imageRatio: (section && "imageRatio" in section && section.imageRatio) || "1:1",
    typography: (section && "typography" in section && section.typography) || "base",
    borderRadius: (section && "borderRadius" in section && section.borderRadius !== undefined) ? section.borderRadius : 16,
    borderEnabled: (section && "borderEnabled" in section && section.borderEnabled !== undefined) ? section.borderEnabled : true,
    borderWidth: (section && "borderWidth" in section && section.borderWidth !== undefined) ? section.borderWidth : 1,
    borderColor: (section && "borderColor" in section && section.borderColor) || "#e2e8f0",
    shadowEnabled: (section && "shadowEnabled" in section && section.shadowEnabled !== undefined) ? section.shadowEnabled : false,
    shadowStyle: (section && "shadowStyle" in section && section.shadowStyle) || "soft",
    cardBackground: (section && "cardBackground" in section && section.cardBackground) || "#ffffff",
    imageInset: (section && "imageInset" in section && section.imageInset !== undefined) ? section.imageInset : false,
    imageRadius: (section && "imageRadius" in section && section.imageRadius !== undefined) ? section.imageRadius : undefined,
    detailsLayout: (section && "detailsLayout" in section && section.detailsLayout) || "outer",
    textAlign: (section && "textAlign" in section && section.textAlign) || "left",
    showBadge: (section && "showBadge" in section && section.showBadge !== undefined) ? section.showBadge : true,
    showPrice: (section && "showPrice" in section && section.showPrice !== undefined) ? section.showPrice : true,
    showButton: (section && "showButton" in section && section.showButton !== undefined) ? section.showButton : true,
    showBrand: (section && "showBrand" in section && section.showBrand !== undefined) ? section.showBrand : true,
    showDiscountBadge: (section && "showDiscountBadge" in section && section.showDiscountBadge !== undefined) ? section.showDiscountBadge : true,
    showStockStatus: (section && "showStockStatus" in section && section.showStockStatus !== undefined) ? section.showStockStatus : true,
    priceColor: (section && "priceColor" in section && section.priceColor) || "#059669",
    buttonColor: (section && "buttonColor" in section && section.buttonColor) || "#25D366",
    whatsappNumber: (section && "whatsappNumber" in section && section.whatsappNumber) || "919876543210",
    currency: (section && "currency" in section && section.currency) || "$",
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = cardProps.whatsappNumber.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent("Hi! Testing product card order from Ziteo Studio")}`, "_blank");
  };

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden select-none transition-colors duration-300",
        backdrop === "pattern"
          ? "bg-slate-100/90 text-slate-800"
          : backdrop === "dark"
            ? "bg-slate-950 text-slate-100"
            : "bg-white text-slate-900"
      )}
      style={
        backdrop === "pattern"
          ? {
              backgroundImage:
                "radial-gradient(rgba(148, 163, 184, 0.25) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }
          : undefined
      }
    >
      {/* Studio Top Control Bar */}
      <div className="z-20 flex items-center justify-between gap-1 sm:gap-2 border-b border-black/5 dark:border-white/10 px-2 sm:px-3 py-2 sm:py-2.5 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 shrink-0">
        <button
          type="button"
          onClick={() => useEditor.getState().deselect()}
          className="tap-smooth inline-flex items-center gap-1 rounded-full border border-slate-300/80 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer shrink-0 whitespace-nowrap active:scale-95"
        >
          <ArrowLeft className="size-3.5" />
          <span className="hidden sm:inline">Back to Store</span>
          <span className="sm:hidden">Back</span>
        </button>

        {/* 1 View vs 2 View Toggle */}
        <div className="flex items-center gap-0.5 rounded-full border border-purple-200 dark:border-purple-800/80 bg-purple-50/80 dark:bg-purple-950/60 p-0.5 shadow-2xs text-[11px] font-medium shrink-0">
          <button
            type="button"
            onClick={() => setCardView("1")}
            className={cn(
              "rounded-full px-2.5 py-1 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 font-semibold",
              cardView === "1"
                ? "bg-purple-600 text-white shadow-2xs"
                : "text-purple-700 dark:text-purple-300 hover:bg-purple-100/60 dark:hover:bg-purple-900/40"
            )}
          >
            <Square className="size-3" />
            <span>1 View</span>
          </button>
          <button
            type="button"
            onClick={() => setCardView("2")}
            className={cn(
              "rounded-full px-2.5 py-1 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 font-semibold",
              cardView === "2"
                ? "bg-purple-600 text-white shadow-2xs"
                : "text-purple-700 dark:text-purple-300 hover:bg-purple-100/60 dark:hover:bg-purple-900/40"
            )}
          >
            <Columns2 className="size-3" />
            <span>2 View</span>
          </button>
        </div>

        {/* Backdrop switch */}
        <div className="flex items-center gap-0.5 rounded-full border border-slate-300/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 p-0.5 shadow-2xs text-[10px] sm:text-[11px] font-medium shrink-0">
          <button
            type="button"
            onClick={() => setBackdrop("pattern")}
            title="Dot grid pattern background"
            className={cn(
              "rounded-full px-2 py-0.5 transition-all cursor-pointer whitespace-nowrap",
              backdrop === "pattern" ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-2xs font-semibold" : "text-muted hover:text-ink"
            )}
          >
            Dots
          </button>
          <button
            type="button"
            onClick={() => setBackdrop("light")}
            title="Light background"
            className={cn(
              "rounded-full px-2 py-0.5 transition-all cursor-pointer whitespace-nowrap",
              backdrop === "light" ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-2xs font-semibold" : "text-muted hover:text-ink"
            )}
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => setBackdrop("dark")}
            title="Dark background"
            className={cn(
              "rounded-full px-2 py-0.5 transition-all cursor-pointer whitespace-nowrap",
              backdrop === "dark" ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-2xs font-semibold" : "text-muted hover:text-ink"
            )}
          >
            Dark
          </button>
        </div>
      </div>

      {/* Main Studio Card Canvas */}
      <div className="relative flex flex-1 flex-col items-center justify-start sm:justify-center px-3 sm:px-6 pt-4 sm:pt-6 pb-32 sm:pb-36 overflow-y-auto min-h-0 no-scrollbar overscroll-contain">
        {cardView === "1" ? (
          /* 1 View: Single Card - compact & realistic size */
          <div className="w-full max-w-[200px] sm:max-w-[230px] transition-all duration-300 animate-in fade-in zoom-in-95">
            <StoreProductCard
              id="studio-sample-card-1"
              title="Air Retro Court"
              price={149}
              regularPrice={199}
              salePrice={149}
              discountPercentage={25}
              stock={8}
              brand="Nike"
              image="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80"
              badge="TRENDING"
              dark={backdrop === "dark"}
              imageRatio={cardProps.imageRatio}
              borderRadius={cardProps.borderRadius}
              typography={cardProps.typography}
              showBadge={cardProps.showBadge}
              showPrice={cardProps.showPrice}
              showButton={cardProps.showButton}
              showBrand={cardProps.showBrand}
              showDiscountBadge={cardProps.showDiscountBadge}
              showStockStatus={cardProps.showStockStatus}
              currency={cardProps.currency}
              priceColor={cardProps.priceColor}
              buttonColor={cardProps.buttonColor}
              borderEnabled={cardProps.borderEnabled}
              borderWidth={cardProps.borderWidth}
              borderColor={cardProps.borderColor}
              shadowEnabled={cardProps.shadowEnabled}
              shadowStyle={cardProps.shadowStyle}
              cardBackground={cardProps.cardBackground}
              imageInset={cardProps.imageInset}
              imageRadius={cardProps.imageRadius}
              detailsLayout={cardProps.detailsLayout}
              textAlign={cardProps.textAlign}
              onCardClick={() => {}}
              onWhatsAppClick={handleWhatsApp}
            />
          </div>
        ) : (
          /* 2 View: 2 Cards Side-by-Side in Grid */
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 w-full max-w-[340px] sm:max-w-[420px] transition-all duration-300 animate-in fade-in zoom-in-95">
            <StoreProductCard
              id="studio-sample-card-1"
              title="Air Retro Court"
              price={149}
              regularPrice={199}
              salePrice={149}
              discountPercentage={25}
              stock={8}
              brand="Nike"
              image="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80"
              badge="TRENDING"
              dark={backdrop === "dark"}
              imageRatio={cardProps.imageRatio}
              borderRadius={cardProps.borderRadius}
              typography={cardProps.typography}
              showBadge={cardProps.showBadge}
              showPrice={cardProps.showPrice}
              showButton={cardProps.showButton}
              showBrand={cardProps.showBrand}
              showDiscountBadge={cardProps.showDiscountBadge}
              showStockStatus={cardProps.showStockStatus}
              currency={cardProps.currency}
              priceColor={cardProps.priceColor}
              buttonColor={cardProps.buttonColor}
              borderEnabled={cardProps.borderEnabled}
              borderWidth={cardProps.borderWidth}
              borderColor={cardProps.borderColor}
              shadowEnabled={cardProps.shadowEnabled}
              shadowStyle={cardProps.shadowStyle}
              cardBackground={cardProps.cardBackground}
              imageInset={cardProps.imageInset}
              imageRadius={cardProps.imageRadius}
              detailsLayout={cardProps.detailsLayout}
              textAlign={cardProps.textAlign}
              onCardClick={() => {}}
              onWhatsAppClick={handleWhatsApp}
            />
            <StoreProductCard
              id="studio-sample-card-2"
              title="Weather Fleece"
              price={129}
              regularPrice={159}
              salePrice={129}
              discountPercentage={19}
              stock={3}
              brand="The North Face"
              image="https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80"
              badge="NEW"
              dark={backdrop === "dark"}
              imageRatio={cardProps.imageRatio}
              borderRadius={cardProps.borderRadius}
              typography={cardProps.typography}
              showBadge={cardProps.showBadge}
              showPrice={cardProps.showPrice}
              showButton={cardProps.showButton}
              showBrand={cardProps.showBrand}
              showDiscountBadge={cardProps.showDiscountBadge}
              showStockStatus={cardProps.showStockStatus}
              currency={cardProps.currency}
              priceColor={cardProps.priceColor}
              buttonColor={cardProps.buttonColor}
              borderEnabled={cardProps.borderEnabled}
              borderWidth={cardProps.borderWidth}
              borderColor={cardProps.borderColor}
              shadowEnabled={cardProps.shadowEnabled}
              shadowStyle={cardProps.shadowStyle}
              cardBackground={cardProps.cardBackground}
              imageInset={cardProps.imageInset}
              imageRadius={cardProps.imageRadius}
              detailsLayout={cardProps.detailsLayout}
              textAlign={cardProps.textAlign}
              onCardClick={() => {}}
              onWhatsAppClick={handleWhatsApp}
            />
          </div>
        )}

        <div className="mt-4 sm:mt-5 flex items-center gap-1.5 sm:gap-2 rounded-full border border-slate-300/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-3 py-1.5 text-[11px] sm:text-xs text-muted shadow-2xs max-w-full text-center">
          <Check className="size-3.5 text-emerald-500 shrink-0" />
          <span className="truncate">
            {cardView === "1" ? "Single card view · Syncs to all pages" : "2-Column grid preview · Syncs to all pages"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SiteFrame({ className }: { className?: string }) {
  const page = useEditor((s) => s.pages[s.pageId]);
  const pageId = useEditor((s) => s.pageId);
  const device = useEditor((s) => s.device);
  const selectedId = useEditor((s) => s.selectedId);

  if (selectedId === "product-card") {
    return (
      <div
        className={cn(
          "relative h-full overflow-hidden rounded-2xl sm:rounded-4xl border border-line-soft bg-surface shadow-frame transition-[background-color] duration-300",
          className,
        )}
      >
        <ProductCardStudio />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative h-full overflow-hidden rounded-2xl sm:rounded-4xl border border-line-soft bg-surface shadow-frame transition-[background-color] duration-300",
        className,
      )}
      style={{ background: page.background }}
    >
      <div key={pageId} className="animate-page-enter no-scrollbar h-full overflow-y-auto overscroll-contain">
        {page.sections.map((sec) => renderSection(sec, device))}
      </div>
      <SiteMenu />
    </div>
  );
}

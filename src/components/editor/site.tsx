import { useEffect, useState, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Menu,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { isDark, money, QUOTES } from "@/lib/editor/defaults";
import { useEditor } from "@/lib/editor/store";
import type {
  CatalogFilter,
  Device,
  NavbarSection,
  PageId,
  Section,
} from "@/lib/editor/types";
import { cn } from "@/lib/cn";

const FILTERS: CatalogFilter[] = ["All", "Footwear", "Apparel", "Accessories"];

function solid(dark: boolean) {
  return cn(
    "inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium",
    dark ? "bg-on-ink text-ink" : "bg-ink text-on-ink",
  );
}

function quiet(dark: boolean) {
  return cn(
    "inline-flex h-9 items-center justify-center rounded-full px-4 text-sm",
    dark ? "bg-on-ink/10 text-on-ink" : "bg-fill text-ink",
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

  const isGlobal =
    sec.type === "navbar" ||
    sec.type === "footer" ||
    sec.type === "catalog" ||
    sec.type === "grid";

  const displayName =
    sec.type === "navbar"
      ? "Header"
      : sec.type === "footer"
        ? "Footer"
        : sec.type === "catalog" || sec.type === "grid"
          ? "Product Card"
          : sec.name;

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
        {isGlobal && (
          <span className="rounded-full bg-purple-500/30 px-1.5 py-0.2 text-[8px] font-extrabold tracking-normal text-purple-200">
            GLOBAL
          </span>
        )}
      </span>

      <div className="h-3 w-[1px] bg-slate-700/80" />

      <button
        type="button"
        title="Move up"
        aria-label="Move up"
        disabled={index === 0}
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
        disabled={index === sections.length - 1}
        onClick={(event) => {
          event.stopPropagation();
          useEditor.getState().moveSection(id, 1);
        }}
        className="tap-smooth flex size-6 items-center justify-center rounded-full text-slate-300 hover:bg-white/15 hover:text-white disabled:opacity-20 transition-all active:scale-90"
      >
        <ChevronDown className="size-3.5 stroke-[2.5]" />
      </button>

      {sec.type !== "navbar" && (
        <>
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
  const selected = useEditor((s) => !s.preview && s.selectedId === section.id);

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

function LogoButton({ logo }: { logo: string }) {
  const preview = useEditor((s) => s.preview);
  return (
    <button
      type="button"
      onClick={(event) => {
        if (!preview) return;
        event.stopPropagation();
        useEditor.getState().switchPage("home");
      }}
      className="tap-smooth text-sm font-semibold tracking-widest hover:opacity-80 transition-opacity"
    >
      {logo}
    </button>
  );
}

function BagButton({ count }: { count: number }) {
  const preview = useEditor((s) => s.preview);
  return (
    <button
      type="button"
      aria-label="Open bag"
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

function SearchButton({ roomy }: { roomy: boolean }) {
  const preview = useEditor((s) => s.preview);
  return (
    <button
      type="button"
      aria-label="Search"
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

function PageLinks({ current }: { current: PageId }) {
  const preview = useEditor((s) => s.preview);
  const links: { id: PageId; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "shop", label: "Shop" },
    { id: "product", label: "Product" },
  ];
  return (
    <nav className="flex items-center gap-6">
      {links.map((link) => (
        <button
          key={link.id}
          type="button"
          onClick={(event) => {
            if (!preview) return;
            event.stopPropagation();
            useEditor.getState().switchPage(link.id);
          }}
          className={cn("tap-smooth text-sm transition-opacity duration-150 hover:opacity-100", link.id === current ? "font-semibold opacity-100" : "opacity-60")}
        >
          {link.label}
        </button>
      ))}
    </nav>
  );
}

function NavbarView({ sec, device }: { sec: NavbarSection; device: Device }) {
  const pageId = useEditor((s) => s.pageId);
  const preview = useEditor((s) => s.preview);
  const count = useEditor((s) => s.cart.reduce((sum, item) => sum + item.qty, 0));
  const roomy = device !== "mobile";

  const showLogo = sec.showLogo ?? true;
  const showSearch = sec.showSearch ?? true;
  const showCart = sec.showCart ?? true;
  const showMenu = sec.showMenu ?? true;
  const showLinks = sec.showLinks ?? true;
  const isSticky = sec.sticky ?? true;

  const bar =
    sec.template === "minimal" ? (
      <div className={cn("flex items-center justify-between py-2", gutter(device))}>
        {showLogo ? <LogoButton logo={sec.logo} /> : <div />}
        {showCart && <BagButton count={count} />}
      </div>
    ) : roomy ? (
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-2">
        <div className="justify-self-start">
          {showLogo && <LogoButton logo={sec.logo} />}
        </div>
        {showLinks ? <PageLinks current={pageId} /> : <div />}
        <div className="flex items-center justify-end gap-1">
          {showSearch && <SearchButton roomy />}
          {showCart && <BagButton count={count} />}
        </div>
      </div>
    ) : (
      <div className="relative flex items-center justify-between px-1 py-1">
        {showMenu ? (
          <button
            type="button"
            aria-label="Menu"
            onClick={(event) => {
              if (!preview) return;
              event.stopPropagation();
              useEditor.getState().setMenuOpen(true);
            }}
            className="inline-flex size-11 items-center justify-center"
          >
            <Menu className="size-5" strokeWidth={1.5} />
          </button>
        ) : (
          <div className="size-11" />
        )}
        {showLogo && (
          sec.template === "left" ? (
            <LogoButton logo={sec.logo} />
          ) : (
            <div className="pointer-events-auto absolute left-1/2 -translate-x-1/2">
              <LogoButton logo={sec.logo} />
            </div>
          )
        )}
        <div className="flex items-center">
          {showSearch && <SearchButton roomy={false} />}
          {showCart && <BagButton count={count} />}
        </div>
      </div>
    );

  if (sec.template === "float") {
    return (
      <SectionShell
        section={sec}
        background="transparent"
        color={sec.text}
        className={cn(isSticky && "sticky top-0 z-20")}
      >
        <div className="px-3 pt-3 pb-1">
          <div
            className="rounded-full border border-line-soft shadow-float backdrop-blur-md"
            style={{ background: sec.background, color: sec.text }}
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
      className={cn(isSticky && "sticky top-0 z-20 backdrop-blur-md")}
    >
      <div className="border-b border-line-soft">{bar}</div>
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
  const aspect = ratio.replace(":", " / ");

  useEffect(() => {
    if (sec.slides.length <= 1) return;
    const timer = setInterval(() => {
      useEditor.getState().setHeroSlide((sec.active + 1) % sec.slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [sec.active, sec.slides.length]);

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

  return (
    <SectionShell section={sec} background={sec.background}>
      <div
        className="relative w-full overflow-hidden transition-all duration-300"
        style={{ aspectRatio: aspect }}
      >
        {image && (
          <img
            key={image + sec.active}
            src={image}
            alt=""
            className="animate-fade-in h-full w-full object-cover transition-transform duration-700 ease-out"
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
    </SectionShell>
  );
}

function IntroView({
  sec,
  device,
}: {
  sec: Extract<Section, { type: "intro" }>;
  device: Device;
}) {
  const dark = isDark(sec.background);
  const preview = useEditor((s) => s.preview);
  return (
    <SectionShell section={sec} background={sec.background} color={sec.text}>
      <div className={cn("flex flex-col gap-6 py-8", gutter(device), device === "desktop" && "flex-row items-end justify-between")}>
        <div className="max-w-xl">
          <p className="text-xs font-medium tracking-widest uppercase" style={{ color: sec.kickerColor }}>
            {sec.kicker}
          </p>
          <h2 className={cn("mt-2 font-semibold tracking-tight", device === "mobile" ? "text-2xl" : "text-3xl")}>
            {sec.title}
          </h2>
          <p className={cn("mt-3 text-sm leading-relaxed", dark ? "text-on-ink/70" : "text-muted")}>{sec.body}</p>
        </div>
        {device !== "mobile" && (
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={(event) => {
                  if (!preview) return;
                  event.stopPropagation();
                  useEditor.getState().setCatalogFilter(filter);
                  useEditor.getState().switchPage("shop");
                }}
                className={quiet(dark)}
              >
                {filter}
              </button>
            ))}
          </div>
        )}
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

  return (
    <SectionShell section={sec} background={sec.background}>
      <div className={cn("grid gap-x-4 gap-y-8 pb-10", gutter(device), cols)}>
        {sec.items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              const open = () =>
                useEditor.getState().openProduct({
                  name: item.title,
                  price: priceNumber(item.price),
                  img: item.image,
                });
              if (preview) open();
              else useEditor.getState().select(sec.id);
            }}
            className="group tap-smooth-sm text-left"
          >
            <div className="overflow-hidden rounded-2xl bg-fill/50">
              <img
                src={item.image}
                alt=""
                className={cn(
                  "w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105",
                  sec.template === "editorial" ? "aspect-video" : "aspect-square",
                )}
              />
            </div>
            {sec.template === "editorial" && (
              <p className={cn("mt-3 text-xs", dark ? "text-on-ink/60" : "text-muted")}>{item.tag}</p>
            )}
            <div className="mt-3 flex items-baseline justify-between gap-3">
              <span className={cn("text-sm font-medium transition-colors group-hover:text-accent", dark ? "text-on-ink" : "text-ink")}>{item.title}</span>
              <span className={cn("text-sm font-medium", dark ? "text-on-ink/70" : "text-muted")}>{item.price}</span>
            </div>
          </button>
        ))}
      </div>
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
  const items = sec.products.filter((item) => sec.filter === "All" || item.category === sec.filter);
  const isList = sec.template === "list";
  const cols = isList
    ? "grid-cols-1 max-w-xl mx-auto"
    : device === "desktop"
      ? "grid-cols-3"
      : "grid-cols-2";

  return (
    <SectionShell section={sec} background={sec.background} color={dark ? "#f5f5f7" : "#1d1d1f"}>
      <div className={cn("pt-8 pb-10", gutter(device))}>
        <h2 className={cn("font-semibold tracking-tight", titleSize(device))}>{sec.title}</h2>
        <p className={cn("mt-2 max-w-lg text-sm leading-relaxed", dark ? "text-on-ink/70" : "text-muted")}>
          {sec.subtitle}
        </p>
        <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                useEditor.getState().setCatalogFilter(filter);
              }}
              className={cn("tap-smooth shrink-0 transition-all duration-200", filter === sec.filter ? solid(dark) : quiet(dark))}
            >
              {filter}
            </button>
          ))}
        </div>
        <div key={sec.filter} className={cn("animate-page-enter mt-6 grid gap-x-4", isList ? "gap-y-3" : "gap-y-8", cols)}>
          {items.map((item) => (
            <article
              key={item.id}
              className={cn(
                "group transition-all",
                isList
                  ? "flex items-center justify-between gap-4 p-3 rounded-2xl bg-fill/40 hover:bg-fill/70 border border-line-soft/60"
                  : ""
              )}
            >
              <button
                type="button"
                className={cn(
                  "tap-smooth-sm block text-left",
                  isList ? "flex items-center gap-3.5 flex-1 min-w-0" : "w-full"
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  if (preview) {
                    useEditor.getState().openProduct({
                      name: item.name,
                      price: item.price,
                      img: item.img,
                      rating: `${item.rating} · ${item.reviews} reviews`,
                    });
                  } else {
                    useEditor.getState().select(sec.id);
                  }
                }}
              >
                <div
                  className={cn(
                    "overflow-hidden rounded-2xl bg-fill/50",
                    isList ? "size-20 sm:size-24 shrink-0 rounded-xl" : "w-full"
                  )}
                >
                  <img
                    src={item.img}
                    alt=""
                    className={cn(
                      "object-cover transition-transform duration-500 ease-out group-hover:scale-105",
                      isList ? "size-full" : "aspect-square w-full"
                    )}
                  />
                </div>
                <div className={cn(isList ? "min-w-0 flex-1" : "")}>
                  <h3 className="mt-3 sm:mt-2 text-sm font-medium transition-colors group-hover:text-accent truncate">
                    {item.name}
                  </h3>
                  <p className={cn("mt-1 text-xs", dark ? "text-on-ink/60" : "text-muted")}>
                    {item.rating} · {item.reviews} reviews
                  </p>
                  {isList && (
                    <span className="mt-1 block text-sm font-semibold">{money(item.price)}</span>
                  )}
                </div>
              </button>
              <div className={cn(isList ? "shrink-0" : "mt-3 flex items-center justify-between")}>
                {!isList && <span className="text-sm font-medium">{money(item.price)}</span>}
                <button
                  type="button"
                  aria-label={`Add ${item.name}`}
                  onClick={(event) => {
                    if (!preview) return;
                    event.stopPropagation();
                    useEditor.getState().addToCart({ name: item.name, price: item.price, img: item.img });
                  }}
                  className={cn(
                    "tap-smooth inline-flex size-11 items-center justify-center rounded-full hover:scale-105 transition-all shadow-xs",
                    dark ? "bg-on-ink text-ink" : "bg-ink text-on-ink",
                  )}
                >
                  <Plus className="size-4" strokeWidth={1.75} />
                </button>
              </div>
            </article>
          ))}
        </div>
        {items.length === 0 && (
          <p className={cn("py-12 text-center text-sm", dark ? "text-on-ink/70" : "text-muted")}>
            Nothing in this category.
          </p>
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

  const gallery = (
    <div>
      <div className={cn("overflow-hidden bg-fill/40", wide ? "h-96 rounded-3xl" : "h-80")}>
        <img
          key={sec.image}
          src={sec.image}
          alt={sec.productName}
          className="animate-fade-in h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-105"
        />
      </div>
      <div className={cn("no-scrollbar mt-3 flex gap-2 overflow-x-auto", wide ? "" : "px-5")}>
        {sec.gallery.map((img) => (
          <button
            key={img}
            type="button"
            aria-label="Show photo"
            onClick={(event) => {
              event.stopPropagation();
              useEditor.getState().setProductField({ image: img });
            }}
            className={cn(
              "tap-smooth size-16 shrink-0 overflow-hidden rounded-xl transition-all duration-200",
              img === sec.image ? "ring-2 ring-accent scale-105" : "opacity-80 hover:opacity-100 hover:scale-102",
            )}
          >
            <img src={img} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );

  const info = (
    <div className={cn(wide ? "flex flex-col justify-center" : "px-5 pt-5")}>
      <p className={cn("text-xs", dark ? "text-on-ink/70" : "text-muted")}>{sec.rating}</p>
      <h1 className={cn("mt-2 font-semibold tracking-tight", wide ? "text-4xl" : "text-2xl")}>{sec.productName}</h1>
      <p className="mt-3 text-xl font-medium">{money(sec.price)}</p>
      <p className={cn("mt-4 max-w-md text-sm leading-relaxed", dark ? "text-on-ink/70" : "text-muted")}>
        {sec.description}
      </p>
      <div className="mt-6">
        <p className={cn("text-xs font-medium", dark ? "text-on-ink/70" : "text-muted")}>Color</p>
        <div className="mt-2 flex gap-2">
          {sec.colors.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Color ${color}`}
              onClick={(event) => {
                event.stopPropagation();
                useEditor.getState().setProductField({ color });
              }}
              className={cn(
                "tap-smooth size-11 rounded-full border border-line transition-transform duration-200 hover:scale-110",
                color === sec.color && "ring-2 ring-accent ring-offset-2 scale-105",
              )}
              style={{ background: color }}
            />
          ))}
        </div>
      </div>
      <div className="mt-5">
        <p className={cn("text-xs font-medium", dark ? "text-on-ink/70" : "text-muted")}>Size</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {sec.sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                useEditor.getState().setProductField({ size });
              }}
              className={cn(
                "tap-smooth h-11 rounded-full border px-4 text-sm font-medium transition-all duration-200",
                size === sec.size
                  ? dark
                    ? "border-on-ink bg-on-ink text-ink"
                    : "border-ink bg-ink text-on-ink"
                  : "border-line bg-transparent hover:border-ink",
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={(event) => {
          if (!preview) return;
          event.stopPropagation();
          useEditor.getState().addToCart({
            name: sec.productName,
            price: sec.price,
            img: sec.image,
          });
        }}
        className={cn(solid(dark), "tap-smooth-sm mt-6 w-full shadow-sm hover:opacity-95")}
      >
        Add to bag · {money(sec.price)}
      </button>
    </div>
  );

  return (
    <SectionShell section={sec} background={sec.background} color={dark ? "#f5f5f7" : "#1d1d1f"}>
      <div className={cn(wide ? "grid grid-cols-2 gap-10 px-10 py-10" : "pb-8")}>
        {gallery}
        {info}
      </div>
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

function BlockView({
  sec,
  device,
}: {
  sec: Extract<Section, { type: "block" }>;
  device: Device;
}) {
  const dark = isDark(sec.background);
  return (
    <SectionShell section={sec} background={sec.background} color={sec.text}>
      <div className={cn("py-10", gutter(device))}>
        <p className={cn("text-xs font-medium tracking-widest uppercase", dark ? "text-on-ink/60" : "text-muted")}>
          {sec.kicker}
        </p>
        <h2 className={cn("mt-2 font-semibold tracking-tight", device === "mobile" ? "text-2xl" : "text-3xl")}>
          {sec.title}
        </h2>
        <p className={cn("mt-3 max-w-lg text-sm leading-relaxed", dark ? "text-on-ink/70" : "text-muted")}>{sec.body}</p>
        {sec.kind === "reviews" ? (
          <div className={cn("mt-6 grid gap-3", device === "desktop" ? "grid-cols-3" : "grid-cols-1")}>
            {QUOTES.map((quote) => (
              <figure key={quote.name} className={cn("rounded-2xl p-5", dark ? "bg-on-ink/10" : "bg-fill")}>
                <blockquote className="text-sm leading-relaxed">“{quote.text}”</blockquote>
                <figcaption className={cn("mt-4 text-xs", dark ? "text-on-ink/60" : "text-muted")}>
                  {quote.name}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="mt-6 max-w-md">
            <JoinForm dark={dark} />
          </div>
        )}
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

function renderSection(sec: Section, device: Device) {
  switch (sec.type) {
    case "navbar":
      return <NavbarView key={sec.id} sec={sec} device={device} />;
    case "hero":
      return <HeroView key={sec.id} sec={sec} device={device} />;
    case "intro":
      return <IntroView key={sec.id} sec={sec} device={device} />;
    case "grid":
      return <GridView key={sec.id} sec={sec} device={device} />;
    case "catalog":
      return <CatalogView key={sec.id} sec={sec} device={device} />;
    case "product":
      return <ProductView key={sec.id} sec={sec} device={device} />;
    case "footer":
      return <FooterView key={sec.id} sec={sec} device={device} />;
    case "block":
      return <BlockView key={sec.id} sec={sec} device={device} />;
    default: {
      const never: never = sec;
      return never;
    }
  }
}

export function SiteFrame({ className }: { className?: string }) {
  const page = useEditor((s) => s.pages[s.pageId]);
  const pageId = useEditor((s) => s.pageId);
  const device = useEditor((s) => s.device);

  return (
    <div
      className={cn(
        "relative h-full overflow-hidden rounded-4xl border border-line-soft bg-surface shadow-frame transition-[background-color] duration-300",
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

import { useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  Maximize2,
  Menu,
  MessageCircle,
  MoveHorizontal,
  Palette,
  Pin,
  Plus,
  Search,
  SlidersHorizontal,
  Square,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import { ContextualDock, type ContextualDockOption } from "@/components/editor/contextual-dock";
import { cn } from "@/lib/cn";
import { colorWithOpacity } from "@/lib/editor/defaults";
import { useEditor } from "@/lib/editor/store";
import type { NavbarLink, NavbarSection, NavbarTemplate } from "@/lib/editor/types";

type CategoryId = "templates" | "style" | "elements" | "layout";
type SubOptionId =
  | "templates"
  | "colors"
  | "fonts"
  | "effects"
  | "logo"
  | "name"
  | "links"
  | "buttons"
  | "width"
  | "height"
  | "corners"
  | "sticky";

const NAV_TEMPLATES: { id: NavbarTemplate; label: string }[] = [
  { id: "centered", label: "Centered" },
  { id: "left", label: "Left" },
  { id: "minimal", label: "Minimal" },
  { id: "float", label: "Floating" },
  { id: "expanded", label: "Expanded" },
];

const BG_PALETTES = [
  { name: "White", value: "#ffffff" },
  { name: "Cloud", value: "#fbfbfd" },
  { name: "Linen", value: "#f7f4ed" },
  { name: "Mist", value: "#f1f5f9" },
  { name: "Ink", value: "#0b0b0d" },
  { name: "Slate", value: "#0f172a" },
  { name: "Navy", value: "#0a192f" },
  { name: "Forest", value: "#064e3b" },
  { name: "Violet", value: "#2e1065" },
  { name: "Wine", value: "#4c0519" },
];

const FG_PALETTES = [
  { name: "Black", value: "#111827" },
  { name: "Slate", value: "#334155" },
  { name: "Muted", value: "#64748b" },
  { name: "White", value: "#ffffff" },
  { name: "Purple", value: "#53389e" },
  { name: "Blue", value: "#0071e3" },
  { name: "Emerald", value: "#16a34a" },
  { name: "Crimson", value: "#dc2626" },
  { name: "Amber", value: "#d97706" },
  { name: "Rose", value: "#e11d48" },
];

const LINK_DESTINATIONS = [
  { label: "Home Page", value: "home" },
  { label: "Shop Page", value: "shop" },
  { label: "Product Page", value: "product" },
  { label: "Hero Section", value: "#hero" },
  { label: "Featured Section", value: "#featured" },
  { label: "Categories Section", value: "#categories" },
  { label: "Brands Section", value: "#brands" },
];

async function compressLogoImage(file: File): Promise<string> {
  if (file.type === "image/svg+xml" && file.size <= 45_000) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read SVG."));
      reader.readAsDataURL(file);
    });
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Invalid image file."));
      el.src = objectUrl;
    });

    const maxDim = 240;
    const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable.");
    ctx.drawImage(img, 0, 0, width, height);

    const png = canvas.toDataURL("image/png");
    if (png.length < 75_000) return png;
    return canvas.toDataURL("image/webp", 0.85);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function MiniSwitch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={ariaLabel}
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "tap-smooth relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-hidden",
        checked ? "bg-accent" : "bg-slate-200 dark:bg-zinc-700",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

function TemplatesPanel({ sec }: { sec: NavbarSection }) {
  const logo = sec.logo || "STORE";
  const iconColor = sec.iconColor || sec.text;
  const linkColor = sec.linkColor || sec.text;
  const bg = colorWithOpacity(sec.background, sec.backgroundOpacity ?? 100);

  const renderPreview = (id: NavbarTemplate) => {
    const brandPreview = (
      <div className="flex items-center gap-1.5 min-w-0">
        {sec.showLogo !== false && sec.logoImage && (
          <img src={sec.logoImage} alt="" className="size-3.5 rounded-full object-cover shrink-0" />
        )}
        {sec.showBrandName !== false && (
          <span className="font-bold tracking-widest text-[10px] uppercase truncate">{logo}</span>
        )}
      </div>
    );

    const rightIcons = (
      <div className="flex items-center gap-1 shrink-0" style={{ color: iconColor }}>
        {id !== "minimal" && id !== "expanded" && <Search className="size-3" strokeWidth={1.75} />}
        <MessageCircle className="size-3 text-emerald-500" strokeWidth={2} />
      </div>
    );

    if (id === "minimal") {
      return (
        <div
          className="flex items-center justify-between rounded-xl border border-line-soft/80 px-3 py-2.5 text-xs shadow-2xs"
          style={{ background: bg, color: sec.text }}
        >
          {brandPreview}
          {rightIcons}
        </div>
      );
    }

    if (id === "float") {
      return (
        <div className="rounded-xl border border-line-soft/50 bg-fill/40 p-1">
          <div
            className="flex items-center justify-between rounded-full border border-line-soft px-3 py-1.5 text-xs shadow-xs"
            style={{ background: bg, color: sec.text }}
          >
            <Menu className="size-3 shrink-0 opacity-80" strokeWidth={1.75} style={{ color: iconColor }} />
            {brandPreview}
            {rightIcons}
          </div>
        </div>
      );
    }

    if (id === "left") {
      return (
        <div
          className="flex items-center justify-between rounded-xl border border-line-soft/80 px-3 py-2 text-xs shadow-2xs"
          style={{ background: bg, color: sec.text }}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            {brandPreview}
            <div className="flex gap-1.5 text-[8px] font-semibold opacity-70" style={{ color: linkColor }}>
              <span>Home</span>
              <span>Shop</span>
            </div>
          </div>
          {rightIcons}
        </div>
      );
    }

    if (id === "expanded") {
      return (
        <div
          className="flex items-center justify-between gap-2 rounded-xl border border-line-soft/80 px-3 py-2 text-xs shadow-2xs"
          style={{ background: bg, color: sec.text }}
        >
          {brandPreview}
          <div className="flex-1 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-white/10 text-[9px] text-muted truncate border border-line-soft/40">
            <Search className="size-2.5 shrink-0" strokeWidth={1.75} style={{ color: iconColor }} />
            <span className="truncate">Search...</span>
          </div>
          {rightIcons}
        </div>
      );
    }

    return (
      <div
        className="flex items-center justify-between rounded-xl border border-line-soft/80 px-3 py-2 text-xs shadow-2xs"
        style={{ background: bg, color: sec.text }}
      >
        <Menu className="size-3 shrink-0 opacity-80" strokeWidth={1.75} style={{ color: iconColor }} />
        {brandPreview}
        {rightIcons}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {NAV_TEMPLATES.map((tmpl) => {
        const active = sec.template === tmpl.id;
        return (
          <button
            key={tmpl.id}
            type="button"
            onClick={() => useEditor.getState().applyNavbarTemplate(tmpl.id)}
            className={cn(
              "tap-smooth flex flex-col gap-2 rounded-2xl border p-2.5 text-left transition-all",
              active
                ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                : "border-line-soft bg-surface hover:border-line",
            )}
          >
            <div className="flex items-center justify-between px-0.5">
              <span className="text-xs font-semibold text-ink">{tmpl.label}</span>
              {active && <Check className="size-3.5 text-accent stroke-[2.5]" />}
            </div>
            <div aria-hidden="true">{renderPreview(tmpl.id)}</div>
          </button>
        );
      })}
    </div>
  );
}

function ColorsPanel({ sec }: { sec: NavbarSection }) {
  const [target, setTarget] = useState<"background" | "text" | "linkColor" | "iconColor">("background");
  const { patchSelected, patchSelectedLive, commitLivePatch } = useEditor.getState();

  const currentVal =
    target === "background"
      ? sec.background || "#ffffff"
      : target === "text"
        ? sec.text || "#1d1d1f"
        : target === "linkColor"
          ? sec.linkColor || sec.text || "#1d1d1f"
          : sec.iconColor || sec.text || "#1d1d1f";

  const palettes = target === "background" ? BG_PALETTES : FG_PALETTES;
  const opacity = sec.backgroundOpacity ?? 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-1 rounded-2xl bg-fill p-1 border border-line-soft">
        {(
          [
            { id: "background", label: "Bg" },
            { id: "text", label: "Brand" },
            { id: "linkColor", label: "Links" },
            { id: "iconColor", label: "Icons" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTarget(tab.id)}
            className={cn(
              "py-1.5 text-[11px] font-semibold rounded-xl transition-all",
              target === tab.id ? "bg-surface text-ink shadow-xs" : "text-muted hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2.5 rounded-2xl border border-line-soft bg-surface p-2.5">
        <label className="relative flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line overflow-hidden">
          <input
            type="color"
            value={/^#[0-9A-Fa-f]{6}$/.test(currentVal) ? currentVal : "#ffffff"}
            onChange={(e) => patchSelectedLive({ [target]: e.target.value })}
            onBlur={commitLivePatch}
            onPointerUp={commitLivePatch}
            className="absolute inset-0 size-full opacity-0 cursor-pointer"
          />
          <span className="size-full" style={{ background: currentVal }} />
        </label>
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted">#</span>
          <input
            type="text"
            value={currentVal.replace(/^#/, "")}
            onChange={(e) => {
              const hex = `#${e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6)}`;
              patchSelected({ [target]: hex });
            }}
            className="w-full rounded-xl border border-line-soft bg-fill/50 pl-7 pr-3 py-1.5 text-xs font-mono uppercase text-ink focus:border-accent focus:bg-surface focus:outline-hidden"
          />
        </div>
      </div>

      {target === "background" && (
        <div className="flex flex-col gap-1.5 rounded-2xl border border-line-soft bg-fill/40 px-3 py-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-ink">Background Opacity</span>
            <span className="font-mono font-bold text-accent">{opacity}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={opacity}
            onChange={(e) => patchSelectedLive({ backgroundOpacity: Number(e.target.value) })}
            onPointerUp={commitLivePatch}
            onTouchEnd={commitLivePatch}
            onKeyUp={commitLivePatch}
            className="accent-accent w-full cursor-pointer h-1.5"
          />
        </div>
      )}

      <div className="grid grid-cols-5 gap-1.5">
        {palettes.map((c) => {
          const active = currentVal.toLowerCase() === c.value.toLowerCase();
          const light = ["#ffffff", "#fbfbfd", "#f7f4ed", "#f1f5f9"].includes(c.value);
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => {
                if (target === "background") {
                  const fg = light ? "#1d1d1f" : "#ffffff";
                  patchSelected({ background: c.value, text: fg, linkColor: fg, iconColor: fg });
                } else {
                  patchSelected({ [target]: c.value });
                }
              }}
              className="tap-smooth flex flex-col items-center gap-1 rounded-xl border border-line-soft p-1.5 hover:bg-fill/70"
            >
              <span
                className={cn(
                  "size-7 rounded-full border border-line flex items-center justify-center",
                  active && "ring-2 ring-accent ring-offset-1",
                )}
                style={{ background: c.value }}
              >
                {active && (
                  <Check className={cn("size-3 stroke-[2.5]", light ? "text-slate-900" : "text-white")} />
                )}
              </span>
              <span className="text-[10px] font-medium text-muted truncate max-w-full">{c.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FontsPanel({ sec }: { sec: NavbarSection }) {
  const { patchSelected } = useEditor.getState();

  return (
    <div className="flex flex-col gap-3">
      <div>
        <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Size</span>
        <div className="mt-1 grid grid-cols-4 gap-1.5">
          {(["sm", "base", "lg", "xl"] as const).map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => patchSelected({ fontSize: sz })}
              className={cn(
                "py-1.5 text-xs font-semibold rounded-xl border uppercase transition-all",
                (sec.fontSize || "base") === sz
                  ? "border-accent bg-accent/10 text-accent font-bold"
                  : "border-line-soft bg-surface text-ink hover:bg-fill",
              )}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Weight</span>
        <div className="mt-1 grid grid-cols-4 gap-1.5">
          {(["normal", "medium", "semibold", "bold"] as const).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => patchSelected({ fontWeight: w })}
              className={cn(
                "py-1.5 text-xs font-semibold rounded-xl border capitalize transition-all",
                (sec.fontWeight || "semibold") === w
                  ? "border-accent bg-accent/10 text-accent font-bold"
                  : "border-line-soft bg-surface text-ink hover:bg-fill",
              )}
            >
              {w === "semibold" ? "Semi" : w}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Letter Spacing</span>
        <div className="mt-1 grid grid-cols-4 gap-1.5">
          {(["tight", "normal", "wide", "widest"] as const).map((ls) => (
            <button
              key={ls}
              type="button"
              onClick={() => patchSelected({ letterSpacing: ls })}
              className={cn(
                "py-1.5 text-xs font-semibold rounded-xl border capitalize transition-all",
                (sec.letterSpacing || "widest") === ls
                  ? "border-accent bg-accent/10 text-accent font-bold"
                  : "border-line-soft bg-surface text-ink hover:bg-fill",
              )}
            >
              {ls}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-line-soft bg-surface px-3 py-2.5">
        <div>
          <div className="text-xs font-semibold text-ink">Uppercase Text</div>
          <div className="text-[11px] text-muted">Format brand & links in ALL CAPS</div>
        </div>
        <MiniSwitch
          ariaLabel="Uppercase Brand and Links"
          checked={sec.uppercase !== false}
          onChange={() => patchSelected({ uppercase: sec.uppercase === false })}
        />
      </div>
    </div>
  );
}

function EffectsPanel({ sec }: { sec: NavbarSection }) {
  const { patchSelected, patchSelectedLive, commitLivePatch } = useEditor.getState();
  const borderStyle = sec.borderStyle || "subtle";

  return (
    <div className="flex flex-col gap-3">
      <div>
        <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Border Style</span>
        <div className="mt-1 grid grid-cols-3 gap-1.5">
          {(["none", "subtle", "solid"] as const).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => patchSelected({ borderStyle: b })}
              className={cn(
                "py-1.5 text-xs font-semibold rounded-xl border capitalize transition-all",
                borderStyle === b
                  ? "border-accent bg-accent/10 text-accent font-bold"
                  : "border-line-soft bg-surface text-ink hover:bg-fill",
              )}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {borderStyle !== "none" && (
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-line-soft bg-surface px-3 py-2">
          <span className="text-xs font-semibold text-ink">Border Color</span>
          <div className="flex items-center gap-1.5">
            {["#e8e8ed", "#d2d2d7", "#1d1d1f", "#0071e3", "#ffffff"].map((col) => (
              <button
                key={col}
                type="button"
                aria-label={`Border ${col}`}
                onClick={() => patchSelected({ borderColor: col })}
                className={cn(
                  "size-6 rounded-full border border-line transition-transform hover:scale-110",
                  sec.borderColor === col && "ring-2 ring-accent ring-offset-1",
                )}
                style={{ background: col }}
              />
            ))}
            <label className="relative size-6 cursor-pointer rounded-full border border-line overflow-hidden">
              <input
                type="color"
                value={sec.borderColor || "#e8e8ed"}
                onChange={(e) => patchSelectedLive({ borderColor: e.target.value })}
                onBlur={commitLivePatch}
                onPointerUp={commitLivePatch}
                className="absolute inset-0 size-full opacity-0 cursor-pointer"
              />
              <span className="block size-full" style={{ background: sec.borderColor || "#e8e8ed" }} />
            </label>
          </div>
        </div>
      )}

      <div>
        <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Shadow</span>
        <div className="mt-1 grid grid-cols-4 gap-1.5">
          {(["none", "subtle", "float", "glass"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => patchSelected({ shadow: s })}
              className={cn(
                "py-1.5 text-xs font-semibold rounded-xl border capitalize transition-all",
                (sec.shadow || "none") === s
                  ? "border-accent bg-accent/10 text-accent font-bold"
                  : "border-line-soft bg-surface text-ink hover:bg-fill",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-line-soft bg-surface px-3 py-2.5">
        <div>
          <div className="text-xs font-semibold text-ink">Backdrop Blur</div>
          <div className="text-[11px] text-muted">
            {(sec.backgroundOpacity ?? 100) >= 100
              ? "Lower background opacity in Colors to see blur"
              : "Frosted glass effect behind header"}
          </div>
        </div>
        <MiniSwitch
          ariaLabel="Backdrop Blur"
          checked={sec.backdropBlur !== false}
          onChange={() => patchSelected({ backdropBlur: sec.backdropBlur === false })}
        />
      </div>
    </div>
  );
}

function LogoPanel({ sec }: { sec: NavbarSection }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { patchSelected } = useEditor.getState();

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await compressLogoImage(file);
      patchSelected({ logoImage: dataUrl, showLogo: true });
      useEditor.getState().showToast("Logo updated.");
    } catch {
      useEditor.getState().showToast("Could not load that image.");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between rounded-2xl border border-line-soft bg-surface px-3 py-2.5">
        <div>
          <div className="text-xs font-semibold text-ink">Show Logo</div>
          <div className="text-[11px] text-muted">Display uploaded logo or monogram</div>
        </div>
        <MiniSwitch
          ariaLabel="Show Logo"
          checked={sec.showLogo ?? true}
          onChange={() => patchSelected({ showLogo: !(sec.showLogo ?? true) })}
        />
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-line-soft bg-surface p-3">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line-soft bg-fill">
          {sec.logoImage ? (
            <img src={sec.logoImage} alt={sec.logo} className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-5 text-muted" />
          )}
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="tap-smooth inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-on-ink hover:opacity-90"
          >
            <Upload className="size-3.5" />
            <span>{sec.logoImage ? "Replace Logo" : "Upload Logo"}</span>
          </button>
          {sec.logoImage && (
            <button
              type="button"
              onClick={() => patchSelected({ logoImage: undefined })}
              className="tap-smooth inline-flex items-center gap-1 rounded-full bg-fill px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              <Trash2 className="size-3.5" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-[11px] font-semibold text-muted uppercase tracking-wider">
          Or paste logo image URL
        </span>
        <input
          type="url"
          value={sec.logoImage?.startsWith("data:") ? "" : sec.logoImage || ""}
          placeholder="https://example.com/logo.png"
          onChange={(e) => patchSelected({ logoImage: e.target.value.trim() || undefined, showLogo: true })}
          className="w-full rounded-xl border border-line-soft bg-fill/50 px-3 py-2 text-xs text-ink focus:border-accent focus:bg-surface focus:outline-hidden"
        />
      </label>
    </div>
  );
}

function StoreNamePanel({ sec }: { sec: NavbarSection }) {
  const { patchSelected, patchSelectedLive, commitLivePatch } = useEditor.getState();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between rounded-2xl border border-line-soft bg-surface px-3 py-2.5">
        <div>
          <div className="text-xs font-semibold text-ink">Show Store Name</div>
          <div className="text-[11px] text-muted">Synced across Header & Footer</div>
        </div>
        <MiniSwitch
          ariaLabel="Show Store Name"
          checked={sec.showBrandName ?? true}
          onChange={() => patchSelected({ showBrandName: !(sec.showBrandName ?? true) })}
        />
      </div>

      <label className="block">
        <span className="mb-1 block text-[11px] font-semibold text-muted uppercase tracking-wider">
          Store Name
        </span>
        <input
          type="text"
          value={sec.logo}
          placeholder="ZITEO"
          onChange={(e) => patchSelectedLive({ logo: e.target.value })}
          onBlur={() => {
            if (!sec.logo.trim()) patchSelectedLive({ logo: "ZITEO" });
            commitLivePatch();
          }}
          className="w-full rounded-xl border border-line-soft bg-fill/50 px-3 py-2.5 text-sm font-semibold text-ink focus:border-accent focus:bg-surface focus:outline-hidden"
        />
      </label>
    </div>
  );
}

function LinksPanel({ sec }: { sec: NavbarSection }) {
  const { patchSelected } = useEditor.getState();
  const defaultLinks: NavbarLink[] = [
    { id: "1", label: "Home", url: "home", visible: true },
    { id: "2", label: "Shop", url: "shop", visible: true },
    { id: "3", label: "Product", url: "product", visible: true },
  ];
  const links = sec.links && sec.links.length > 0 ? sec.links : defaultLinks;

  const updateLinks = (next: NavbarLink[]) => patchSelected({ links: next });

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= links.length) return;
    const copy = [...links];
    const [item] = copy.splice(idx, 1);
    if (item) copy.splice(target, 0, item);
    updateLinks(copy);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between rounded-2xl border border-line-soft bg-surface px-3 py-2.5">
        <div>
          <div className="text-xs font-semibold text-ink">Show Navigation Links</div>
          <div className="text-[11px] text-muted">Also powers the mobile menu drawer</div>
        </div>
        <MiniSwitch
          ariaLabel="Show Navigation Links"
          checked={sec.showLinks ?? true}
          onChange={() => patchSelected({ showLinks: !(sec.showLinks ?? true) })}
        />
      </div>

      <div className="flex items-center justify-between px-0.5">
        <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
          Menu Links ({links.length})
        </span>
        <button
          type="button"
          onClick={() =>
            updateLinks([
              ...links,
              { id: Date.now().toString(), label: "Collection", url: "shop", visible: true },
            ])
          }
          className="tap-smooth inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent hover:bg-accent/15"
        >
          <Plus className="size-3.5" />
          <span>Add Link</span>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {links.map((link, idx) => {
          const normalizedUrl = link.url.trim().replace(/^\/+/, "");
          const isPreset = LINK_DESTINATIONS.some((d) => d.value === normalizedUrl);
          return (
            <div
              key={link.id}
              className={cn(
                "flex flex-col gap-2 rounded-2xl border border-line-soft bg-surface p-2.5",
                link.visible === false && "opacity-60",
              )}
            >
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label={link.visible === false ? "Show link" : "Hide link"}
                  onClick={() => {
                    const updated = [...links];
                    updated[idx] = { ...link, visible: link.visible === false };
                    updateLinks(updated);
                  }}
                  className="tap-smooth rounded-lg p-1.5 text-muted hover:bg-fill hover:text-ink"
                >
                  {link.visible === false ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => {
                    const updated = [...links];
                    updated[idx] = { ...link, label: e.target.value };
                    updateLinks(updated);
                  }}
                  placeholder="Label"
                  className="min-w-0 flex-1 rounded-lg border border-line-soft bg-fill/50 px-2.5 py-1 text-xs font-semibold text-ink focus:border-accent focus:bg-surface focus:outline-hidden"
                />
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={idx === 0}
                  onClick={() => move(idx, -1)}
                  className="tap-smooth rounded-lg p-1 text-muted hover:bg-fill disabled:opacity-25"
                >
                  <ChevronUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={idx === links.length - 1}
                  onClick={() => move(idx, 1)}
                  className="tap-smooth rounded-lg p-1 text-muted hover:bg-fill disabled:opacity-25"
                >
                  <ChevronDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Delete link"
                  onClick={() => updateLinks(links.filter((_, i) => i !== idx))}
                  className="tap-smooth rounded-lg p-1 text-muted hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <select
                  aria-label="Link destination"
                  value={isPreset ? normalizedUrl : "__custom__"}
                  onChange={(e) => {
                    const val = e.target.value;
                    const updated = [...links];
                    updated[idx] = { ...link, url: val === "__custom__" ? "https://" : val };
                    updateLinks(updated);
                  }}
                  className="flex-1 rounded-lg border border-line-soft bg-fill/50 px-2 py-1 text-[11px] font-medium text-ink focus:border-accent focus:outline-hidden"
                >
                  {LINK_DESTINATIONS.map((dest) => (
                    <option key={dest.value} value={dest.value}>
                      {dest.label}
                    </option>
                  ))}
                  <option value="__custom__">Custom URL / WhatsApp</option>
                </select>
                {!isPreset && (
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => {
                      const updated = [...links];
                      updated[idx] = { ...link, url: e.target.value };
                      updateLinks(updated);
                    }}
                    placeholder="https://... or #section"
                    className="w-36 rounded-lg border border-line-soft bg-fill/50 px-2 py-1 text-[11px] font-mono text-ink focus:border-accent focus:outline-hidden"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ButtonsPanel({ sec }: { sec: NavbarSection }) {
  const { patchSelected } = useEditor.getState();
  const showWhatsapp = sec.showWhatsapp ?? sec.showCart ?? false;

  const items = [
    {
      key: "showMenu" as const,
      label: "Menu Button",
      detail: "Hamburger drawer on mobile view",
      enabled: sec.showMenu ?? true,
    },
    {
      key: "showSearch" as const,
      label: "Search",
      detail: "Product search trigger in header",
      enabled: sec.showSearch ?? true,
    },
    {
      key: "showWhatsapp" as const,
      label: "WhatsApp Button",
      detail: "Direct WhatsApp chat shortcut",
      enabled: showWhatsapp,
    },
  ];

  return (
    <div className="flex flex-col gap-2.5">
      <div className="divide-y divide-line-soft overflow-hidden rounded-2xl border border-line-soft bg-surface">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between px-3 py-2.5">
            <div>
              <div className="text-xs font-semibold text-ink">{item.label}</div>
              <div className="text-[11px] text-muted">{item.detail}</div>
            </div>
            <MiniSwitch
              ariaLabel={item.label}
              checked={item.enabled}
              onChange={() =>
                patchSelected(
                  item.key === "showWhatsapp"
                    ? { showWhatsapp: !item.enabled, showCart: false }
                    : { [item.key]: !item.enabled },
                )
              }
            />
          </div>
        ))}
      </div>

      {showWhatsapp && (
        <label className="block rounded-2xl border border-line-soft bg-surface px-3 py-2.5">
          <span className="mb-1 block text-[11px] font-semibold text-muted uppercase tracking-wider">
            WhatsApp Number (Store-wide)
          </span>
          <input
            type="tel"
            value={sec.whatsappNumber || "919876543210"}
            onChange={(e) => patchSelected({ whatsappNumber: e.target.value })}
            placeholder="919876543210"
            className="w-full rounded-xl border border-line-soft bg-fill/50 px-3 py-1.5 text-xs font-mono text-ink focus:border-accent focus:bg-surface focus:outline-hidden"
          />
        </label>
      )}
    </div>
  );
}

function LayoutWidthPanel({ sec }: { sec: NavbarSection }) {
  const isFloating = sec.isFloating ?? (sec.template === "float");
  const { patchSelected } = useEditor.getState();

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => patchSelected({ isFloating: false })}
        className={cn(
          "tap-smooth rounded-2xl border py-3 text-xs font-semibold transition-all",
          !isFloating
            ? "border-accent bg-accent/10 text-accent font-bold ring-1 ring-accent/25"
            : "border-line-soft bg-surface text-ink hover:bg-fill",
        )}
      >
        Full Width
      </button>
      <button
        type="button"
        onClick={() => patchSelected({ isFloating: true })}
        className={cn(
          "tap-smooth rounded-2xl border py-3 text-xs font-semibold transition-all",
          isFloating
            ? "border-accent bg-accent/10 text-accent font-bold ring-1 ring-accent/25"
            : "border-line-soft bg-surface text-ink hover:bg-fill",
        )}
      >
        Floating
      </button>
    </div>
  );
}

function LayoutHeightPanel({ sec }: { sec: NavbarSection }) {
  const { patchSelectedLive, commitLivePatch } = useEditor.getState();
  const height = sec.height || 56;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-ink">Header Height</span>
        <span className="rounded-md bg-accent/10 px-2 py-0.5 font-mono font-bold text-accent">
          {height}px
        </span>
      </div>
      <input
        type="range"
        min={48}
        max={80}
        step={2}
        value={height}
        onChange={(e) => patchSelectedLive({ height: Number(e.target.value) })}
        onPointerUp={commitLivePatch}
        onTouchEnd={commitLivePatch}
        onKeyUp={commitLivePatch}
        className="accent-accent w-full cursor-pointer h-2"
      />
      <div className="flex justify-between text-[10px] font-mono text-muted">
        <span>Compact (48px)</span>
        <span>Standard (56px)</span>
        <span>Roomy (80px)</span>
      </div>
    </div>
  );
}

function LayoutCornersPanel({ sec }: { sec: NavbarSection }) {
  const { patchSelected, patchSelectedLive, commitLivePatch } = useEditor.getState();
  const isFloating = sec.isFloating ?? (sec.template === "float");
  const radius = sec.borderRadius ?? (isFloating ? 9999 : 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-ink">Corner Radius</span>
        <span className="rounded-md bg-accent/10 px-2 py-0.5 font-mono font-bold text-accent">
          {radius === 9999 ? "Full Pill" : `${radius}px`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={40}
          step={2}
          value={radius === 9999 ? 40 : radius}
          onChange={(e) => patchSelectedLive({ borderRadius: Number(e.target.value) })}
          onPointerUp={commitLivePatch}
          onTouchEnd={commitLivePatch}
          onKeyUp={commitLivePatch}
          className="accent-accent flex-1 cursor-pointer h-2"
        />
        <button
          type="button"
          onClick={() => patchSelected({ borderRadius: 9999 })}
          className={cn(
            "tap-smooth shrink-0 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all",
            radius === 9999
              ? "border-accent bg-accent text-white"
              : "border-line-soft bg-fill text-ink hover:bg-line-soft",
          )}
        >
          Pill
        </button>
      </div>
    </div>
  );
}

function LayoutStickyPanel({ sec }: { sec: NavbarSection }) {
  const sticky = sec.sticky ?? true;
  const { patchSelected } = useEditor.getState();

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => patchSelected({ sticky: true })}
        className={cn(
          "tap-smooth rounded-2xl border py-3 text-xs font-semibold transition-all",
          sticky
            ? "border-accent bg-accent/10 text-accent font-bold ring-1 ring-accent/25"
            : "border-line-soft bg-surface text-ink hover:bg-fill",
        )}
      >
        Sticky (Top)
      </button>
      <button
        type="button"
        onClick={() => patchSelected({ sticky: false })}
        className={cn(
          "tap-smooth rounded-2xl border py-3 text-xs font-semibold transition-all",
          !sticky
            ? "border-accent bg-accent/10 text-accent font-bold ring-1 ring-accent/25"
            : "border-line-soft bg-surface text-ink hover:bg-fill",
        )}
      >
        Static
      </button>
    </div>
  );
}

export function HeaderEditor({ section }: { section: NavbarSection }) {
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [subOption, setSubOption] = useState<SubOptionId | null>(null);
  const [expanded, setExpanded] = useState(false);

  const selectCategory = (next: CategoryId) => {
    setExpanded(false);
    if (next === "templates") {
      if (category === "templates" && subOption === "templates") {
        setCategory(null);
        setSubOption(null);
      } else {
        setCategory("templates");
        setSubOption("templates");
      }
      return;
    }
    setCategory(next);
    setSubOption(null);
  };

  const selectSub = (sub: SubOptionId) => {
    setExpanded(false);
    setSubOption((cur) => (cur === sub ? null : sub));
  };

  const rootOptions: ContextualDockOption[] = [
    {
      id: "elements",
      label: "Brand & Links",
      icon: SlidersHorizontal,
      active: category === "elements",
      onClick: () => selectCategory("elements"),
    },
    {
      id: "layout",
      label: "Layout",
      icon: Maximize2,
      active: category === "layout",
      onClick: () => selectCategory("layout"),
    },
    {
      id: "templates",
      label: "Presets",
      icon: LayoutTemplate,
      active: category === "templates",
      onClick: () => selectCategory("templates"),
    },
    {
      id: "style",
      label: "Appearance",
      icon: Palette,
      active: category === "style",
      onClick: () => selectCategory("style"),
    },
  ];

  const subOptionsByCategory: Record<Exclude<CategoryId, "templates">, ContextualDockOption[]> = {
    elements: [
      { id: "logo", label: "Logo", icon: ImageIcon, active: subOption === "logo", onClick: () => selectSub("logo") },
      { id: "name", label: "Store name", icon: Type, active: subOption === "name", onClick: () => selectSub("name") },
      { id: "links", label: "Menu links", icon: Compass, active: subOption === "links", onClick: () => selectSub("links") },
      { id: "buttons", label: "Actions", icon: MessageCircle, active: subOption === "buttons", onClick: () => selectSub("buttons") },
    ],
    layout: [
      { id: "width", label: "Spacing", icon: MoveHorizontal, active: subOption === "width", onClick: () => selectSub("width") },
      { id: "height", label: "Height", icon: Maximize2, active: subOption === "height", onClick: () => selectSub("height") },
      { id: "corners", label: "Corners", icon: Square, active: subOption === "corners", onClick: () => selectSub("corners") },
    ],
    style: [
      { id: "colors", label: "Colors", icon: Palette, active: subOption === "colors", onClick: () => selectSub("colors") },
      { id: "fonts", label: "Typography", icon: Type, active: subOption === "fonts", onClick: () => selectSub("fonts") },
      { id: "sticky", label: "Sticky", icon: Pin, active: subOption === "sticky", onClick: () => selectSub("sticky") },
      { id: "effects", label: "Blur & Shadow", icon: Layers, active: subOption === "effects", onClick: () => selectSub("effects") },
    ],
  };

  const backLabel =
    category === "style"
      ? "Appearance"
      : category === "elements"
        ? "Brand & Links"
        : category === "layout"
          ? "Layout"
          : undefined;

  const barOptions =
    category && category !== "templates" ? subOptionsByCategory[category] : rootOptions;

  const panelMeta: Record<
    SubOptionId,
    { title: string; expandable?: boolean; render: () => React.ReactNode }
  > = {
    templates: { title: "Header · All pages — Presets", expandable: true, render: () => <TemplatesPanel sec={section} /> },
    colors: { title: "Header · All pages — Colors", expandable: true, render: () => <ColorsPanel sec={section} /> },
    fonts: { title: "Header · All pages — Typography", render: () => <FontsPanel sec={section} /> },
    effects: { title: "Header · All pages — Blur & Shadow", expandable: true, render: () => <EffectsPanel sec={section} /> },
    logo: { title: "Header · All pages — Logo", expandable: true, render: () => <LogoPanel sec={section} /> },
    name: { title: "Header · All pages — Store name", render: () => <StoreNamePanel sec={section} /> },
    links: { title: "Header · All pages — Menu links", expandable: true, render: () => <LinksPanel sec={section} /> },
    buttons: { title: "Header · All pages — Action buttons", render: () => <ButtonsPanel sec={section} /> },
    width: { title: "Header · All pages — Spacing", render: () => <LayoutWidthPanel sec={section} /> },
    height: { title: "Header · All pages — Height", render: () => <LayoutHeightPanel sec={section} /> },
    corners: { title: "Header · All pages — Corners", render: () => <LayoutCornersPanel sec={section} /> },
    sticky: { title: "Header · All pages — Sticky behavior", render: () => <LayoutStickyPanel sec={section} /> },
  };

  const activeMeta = subOption ? panelMeta[subOption] : null;

  return (
    <ContextualDock
      panelTitle={activeMeta?.title}
      panelVisible={Boolean(activeMeta)}
      expandable={activeMeta?.expandable}
      expanded={expanded}
      onToggleExpand={() => setExpanded((e) => !e)}
      onClosePanel={() => {
        setSubOption(null);
        setExpanded(false);
        if (category === "templates") setCategory(null);
      }}
      panelContent={activeMeta?.render()}
      backLabel={backLabel}
      onBack={() => {
        setCategory(null);
        setSubOption(null);
        setExpanded(false);
      }}
      barOptions={barOptions}
    />
  );
}

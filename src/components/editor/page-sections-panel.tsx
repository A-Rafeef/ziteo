import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Image,
  Layers,
  LayoutGrid,
  Lock,
  MoreHorizontal,
  PanelBottom,
  PanelTop,
  Plus,
  Shield,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";
import { useEditor } from "@/lib/editor/store";
import type { Section } from "@/lib/editor/types";
import { cn } from "@/lib/cn";

function sectionIcon(type: Section["type"]) {
  switch (type) {
    case "navbar":
      return PanelTop;
    case "hero":
      return Image;
    case "featured":
      return Sparkles;
    case "categories":
      return LayoutGrid;
    case "brands":
      return Tag;
    case "about":
      return Shield;
    case "catalog":
    case "grid":
      return ShoppingBag;
    case "footer":
      return PanelBottom;
    default:
      return Layers;
  }
}

export function PageSectionsList({ onSelectSection }: { onSelectSection?: () => void }) {
  const sections = useEditor((s) => s.pages[s.pageId].sections);
  const selectedId = useEditor((s) => s.selectedId);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!menuId) return;
    const onPointerDown = () => setMenuId(null);
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [menuId]);

  const hasFooter = sections[sections.length - 1]?.type === "footer";
  const maxEligibleIndex = hasFooter ? sections.length - 2 : sections.length - 1;

  const handleRowSelect = (sec: Section) => {
    useEditor.getState().select(sec.id);
    if (typeof document !== "undefined") {
      setTimeout(() => {
        const el = document.querySelector(`[data-section-id="${sec.id}"]`);
        el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 30);
    }
    onSelectSection?.();
  };

  return (
    <div className="flex flex-col gap-1">
      {sections.map((sec, idx) => {
        const isLocked = sec.type === "navbar" || sec.type === "footer";
        const isHidden = "hidden" in sec && Boolean(sec.hidden);
        const isSelected = selectedId === sec.id;
        const canMoveUp = !isLocked && idx > 1;
        const canMoveDown = !isLocked && idx < maxEligibleIndex;
        const Icon = sectionIcon(sec.type);
        const label = sec.type === "navbar" ? "Header" : sec.type === "footer" ? "Footer" : sec.name;

        // Render "+ Add section here" before each eligible section (and before Footer)
        const showAddHereBefore = idx >= 1 && (sec.type !== "navbar");

        return (
          <div key={sec.id} className="flex flex-col gap-1">
            {showAddHereBefore && (
              <button
                type="button"
                onClick={() => useEditor.getState().openAddAt(idx)}
                className="group flex items-center justify-center gap-1 rounded-lg py-1 text-[11px] font-medium text-muted hover:bg-accent/8 hover:text-accent transition-colors cursor-pointer"
              >
                <Plus className="size-3" />
                <span>Add section here</span>
              </button>
            )}

            <div
              draggable={!isLocked}
              onDragStart={(e) => {
                if (isLocked) return;
                setDraggedId(sec.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                if (isLocked || !draggedId || draggedId === sec.id) return;
                e.preventDefault();
                setDragOverId(sec.id);
              }}
              onDragLeave={() => {
                if (dragOverId === sec.id) setDragOverId(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedId && draggedId !== sec.id && !isLocked) {
                  useEditor.getState().reorderSection(draggedId, idx);
                }
                setDraggedId(null);
                setDragOverId(null);
              }}
              onDragEnd={() => {
                setDraggedId(null);
                setDragOverId(null);
              }}
              className={cn(
                "relative flex items-center gap-2 rounded-xl border px-2 py-2 transition-all",
                isSelected
                  ? "border-accent bg-accent/10 shadow-2xs"
                  : isLocked
                    ? "border-line-soft/60 bg-fill/40"
                    : "border-line-soft bg-surface hover:border-line",
                isHidden && "opacity-65",
                dragOverId === sec.id && "border-accent ring-2 ring-accent/25",
              )}
            >
              {isLocked ? (
                <span
                  aria-label={`Fixed position · ${label}`}
                  title="Fixed position"
                  className="flex size-5 shrink-0 items-center justify-center text-muted"
                >
                  <Lock className="size-3.5" aria-hidden="true" />
                </span>
              ) : (
                <span
                  aria-label={`Drag ${label}`}
                  title="Drag to reorder"
                  className="flex size-5 shrink-0 cursor-grab items-center justify-center text-muted hover:text-ink active:cursor-grabbing"
                >
                  <GripVertical className="size-3.5" />
                </span>
              )}

              <button
                type="button"
                onClick={() => handleRowSelect(sec)}
                aria-current={isSelected ? "true" : undefined}
                className="flex min-w-0 flex-1 items-center gap-2 text-left cursor-pointer"
              >
                <Icon className={cn("size-4 shrink-0", isSelected ? "text-accent" : "text-muted")} />
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink">{label}</span>
                {isHidden && (
                  <span className="shrink-0 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                    Hidden
                  </span>
                )}
              </button>

              {isHidden && !isLocked && (
                <button
                  type="button"
                  onClick={() => useEditor.getState().toggleSectionHidden(sec.id)}
                  aria-label={`Show ${label}`}
                  className="shrink-0 rounded-lg bg-fill px-2 py-1 text-[10px] font-semibold text-ink hover:bg-line-soft cursor-pointer"
                >
                  Show
                </button>
              )}

              {!isLocked && (
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    disabled={!canMoveUp}
                    onClick={() => useEditor.getState().moveSection(sec.id, -1)}
                    aria-label={`Move ${label} up`}
                    title="Move up"
                    className="flex size-6 items-center justify-center rounded-lg text-ink hover:bg-fill disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={!canMoveDown}
                    onClick={() => useEditor.getState().moveSection(sec.id, 1)}
                    aria-label={`Move ${label} down`}
                    title="Move down"
                    className="flex size-6 items-center justify-center rounded-lg text-ink hover:bg-fill disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                  <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      aria-label={`Section actions for ${label}`}
                      aria-expanded={menuId === sec.id}
                      onClick={() => setMenuId(menuId === sec.id ? null : sec.id)}
                      className="flex size-6 items-center justify-center rounded-lg text-muted hover:bg-fill hover:text-ink cursor-pointer"
                    >
                      <MoreHorizontal className="size-3.5" />
                    </button>
                    {menuId === sec.id && (
                      <div
                        role="menu"
                        className="animate-scale-in absolute right-0 top-full z-40 mt-1 w-36 overflow-hidden rounded-xl border border-line-soft bg-surface py-1 shadow-xl"
                      >
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            useEditor.getState().toggleSectionHidden(sec.id);
                            setMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium text-ink hover:bg-fill cursor-pointer"
                        >
                          {isHidden ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                          <span>{isHidden ? "Show" : "Hide"}</span>
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            useEditor.getState().duplicateSection(sec.id);
                            setMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium text-ink hover:bg-fill cursor-pointer"
                        >
                          <Copy className="size-3.5" />
                          <span>Duplicate</span>
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            useEditor.getState().deleteSection(sec.id);
                            setMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PageSectionsSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <aside className="hidden md:flex flex-col items-center border-r border-line-soft bg-surface/90 p-2 shrink-0">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-expanded={false}
          aria-label="Expand Page sections"
          title="Page sections"
          className="flex flex-col items-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-semibold text-ink hover:bg-fill cursor-pointer"
        >
          <ChevronRight className="size-4" />
          <span className="[writing-mode:vertical-rl] rotate-180 tracking-wide text-[11px]">Page sections</span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Page sections"
      className="hidden md:flex w-72 shrink-0 flex-col border-r border-line-soft bg-surface/95"
    >
      <div className="flex items-center justify-between border-b border-line-soft px-3.5 py-2.5">
        <span className="text-xs font-bold tracking-tight text-ink">Page sections</span>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          aria-expanded={true}
          aria-label="Collapse Page sections"
          title="Collapse"
          className="flex size-7 items-center justify-center rounded-lg text-muted hover:bg-fill hover:text-ink cursor-pointer"
        >
          <ChevronLeft className="size-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3 pb-24">
        <PageSectionsList />
      </div>
    </aside>
  );
}

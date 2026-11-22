import { create } from "zustand";
import {
  createAboutSection,
  createBrandsSection,
  createCatalogSection,
  createCategoriesSection,
  createFeaturedSection,
  createFilterSortSection,
  createHeroSection,
  createPages,
  createProductSection,
  isDark,
  paintTheme,
  products,
} from "@/lib/editor/defaults";
import { renderHtml } from "@/lib/editor/export-html";
import type {
  CartItem,
  CatalogFilter,
  CatalogFilterState,
  CatalogSortOption,
  Device,
  GridItem,
  PageId,
  Pages,
  Product,
  Section,
  SheetKind,
  Snapshot,
} from "@/lib/editor/types";

const STORAGE_KEY = "ziteo-editor-v4";

export interface SavedEditor {
  pages: Pages;
  pageId: PageId;
  cart: CartItem[];
}

interface EditorState extends SavedEditor {
  selectedId: string | null;
  device: Device;
  zoom: number;
  preview: boolean;
  sheet: SheetKind | null;
  cartOpen: boolean;
  searchOpen: boolean;
  publishOpen: boolean;
  menuOpen: boolean;
  toast: string | null;
  past: Snapshot[];
  future: Snapshot[];
  select: (id: string) => void;
  deselect: () => void;
  setDevice: (device: Device) => void;
  nudgeZoom: (delta: number) => void;
  resetZoom: () => void;
  togglePreview: (force?: boolean) => void;
  switchPage: (pageId: PageId) => void;
  openSheet: (sheet: SheetKind) => void;
  closeSheet: () => void;
  setMenuOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openPublish: () => void;
  closePublish: () => void;
  undo: () => void;
  redo: () => void;
  patchSelected: (patch: Record<string, unknown>) => void;
  patchProductCard: (patch: Record<string, unknown>) => void;
  setLogo: (logo: string) => void;
  moveSection: (id: string, dir: -1 | 1) => void;
  reorderSection: (id: string, targetIndex: number) => void;
  deleteSection: (id: string) => void;
  insertSection: (
    kind:
      | "hero"
      | "featured"
      | "categories"
      | "brands"
      | "about"
      | "catalog"
      | "product",
  ) => void;
  applyTheme: (theme: "light" | "ink") => void;
  setPageColor: (background: string) => void;
  setHeroSlide: (index: number) => void;
  setCatalogFilter: (filter: CatalogFilter) => void;
  catalogFilterState: CatalogFilterState;
  setCatalogSort: (sort: CatalogSortOption) => void;
  setCatalogCategory: (cat: string) => void;
  toggleCatalogBrand: (brand: string) => void;
  setCatalogPriceBracket: (bracket: "all" | "under_100" | "100_150" | "above_150") => void;
  toggleCatalogInStockOnly: () => void;
  resetCatalogFilters: () => void;
  setProductField: (patch: Partial<Extract<Section, { type: "product" }>>) => void;
  openProduct: (product: Partial<Product> & { name: string; price: number; img: string }) => void;
  addToCart: (item: { name: string; price: number; img: string }) => void;
  updateQty: (index: number, delta: number) => void;
  removeItem: (index: number) => void;
  checkout: () => void;
  showToast: (toast: string) => void;
  reset: () => void;
  exportHtml: () => void;
  hydrate: (saved: SavedEditor) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

function snapshotOf(state: EditorState): Snapshot {
  return { pages: state.pages, pageId: state.pageId };
}

function freshCart(): CartItem[] {
  return [
    {
      id: "item1",
      name: "Air Retro Court",
      price: 149,
      qty: 1,
      img: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "item2",
      name: "Weatherproof Fleece",
      price: 129,
      qty: 1,
      img: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=400&q=80",
    },
  ];
}

export function isSavedEditor(value: unknown): value is SavedEditor {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<SavedEditor>;
  return Boolean(
    data.pages?.home?.sections &&
      data.pages.shop?.sections &&
      data.pages.product?.sections &&
      Array.isArray(data.cart) &&
      (data.pageId === "home" || data.pageId === "shop" || data.pageId === "product"),
  );
}

export const useEditor = create<EditorState>((set, get) => {
  const commit = (
    recipe: (draft: { pages: Pages; pageId: PageId }) => void,
    extra?: Partial<EditorState>,
  ) => {
    const current = get();
    const draft = { pages: structuredClone(current.pages), pageId: current.pageId };
    recipe(draft);
    set({
      pages: draft.pages,
      pageId: draft.pageId,
      past: [...current.past, snapshotOf(current)].slice(-30),
      future: [],
      ...extra,
    });
  };

  const mutate = (recipe: (pages: Pages) => void) => {
    const pages = structuredClone(get().pages);
    recipe(pages);
    set({ pages });
  };

  return {
    pages: createPages(),
    pageId: "home",
    cart: freshCart(),
    selectedId: null,
    device: "mobile",
    zoom: 100,
    preview: false,
    sheet: null,
    cartOpen: false,
    searchOpen: false,
    publishOpen: false,
    menuOpen: false,
    toast: null,
    past: [],
    future: [],
    catalogFilterState: {
      activeSort: "featured",
      activeCategory: "All",
      selectedBrands: [],
      priceBracket: "all",
      inStockOnly: false,
    },

    select: (id) => set({ selectedId: id, sheet: null }),
    deselect: () => set({ selectedId: null, sheet: null }),
    setDevice: (device) => set({ device }),
    nudgeZoom: (delta) => set({ zoom: Math.min(130, Math.max(70, get().zoom + delta)) }),
    resetZoom: () => set({ zoom: 100 }),
    togglePreview: (force) =>
      set({
        preview: typeof force === "boolean" ? force : !get().preview,
        selectedId: null,
        sheet: null,
      }),
    switchPage: (pageId) =>
      set({
        pageId,
        selectedId: null,
        sheet: null,
        menuOpen: false,
        searchOpen: false,
      }),
    openSheet: (sheet) => set({ sheet, cartOpen: false, searchOpen: false, publishOpen: false }),
    closeSheet: () => set({ sheet: null }),
    setMenuOpen: (menuOpen) => set({ menuOpen }),
    openCart: () => set({ cartOpen: true, sheet: null, searchOpen: false, menuOpen: false }),
    closeCart: () => set({ cartOpen: false }),
    openSearch: () => set({ searchOpen: true, sheet: null, cartOpen: false, menuOpen: false }),
    closeSearch: () => set({ searchOpen: false }),
    openPublish: () => set({ publishOpen: true, sheet: null }),
    closePublish: () => set({ publishOpen: false }),

    undo: () => {
      const current = get();
      const prev = current.past.at(-1);
      if (!prev) return;
      set({
        pages: prev.pages,
        pageId: prev.pageId,
        past: current.past.slice(0, -1),
        future: [...current.future, snapshotOf(current)].slice(-30),
        selectedId: null,
        sheet: null,
      });
    },
    redo: () => {
      const current = get();
      const next = current.future.at(-1);
      if (!next) return;
      set({
        pages: next.pages,
        pageId: next.pageId,
        future: current.future.slice(0, -1),
        past: [...current.past, snapshotOf(current)].slice(-30),
        selectedId: null,
        sheet: null,
      });
    },

    patchSelected: (patch) => {
      const id = get().selectedId;
      if (!id) return;
      commit(({ pages, pageId }) => {
        // GLOBAL PRODUCT CARD (from Global Elements)
        if (id === "product-card") {
          (Object.keys(pages) as PageId[]).forEach((pId) => {
            pages[pId].sections = pages[pId].sections.map((sec) => {
              if (sec.type === "catalog" || sec.type === "featured" || sec.type === "grid") {
                return { ...sec, ...patch } as Section;
              }
              if (sec.type === "product") {
                const prodPatch: Record<string, unknown> = {};
                if ("whatsappNumber" in patch) prodPatch.whatsappNumber = patch.whatsappNumber;
                if ("currency" in patch) prodPatch.currency = patch.currency;
                if ("buttonColor" in patch) prodPatch.buttonColor = patch.buttonColor;
                if ("priceColor" in patch) prodPatch.priceColor = patch.priceColor;
                if (Object.keys(prodPatch).length > 0) {
                  return { ...sec, ...prodPatch } as Section;
                }
              }
              return sec;
            });
          });
          return;
        }

        const curPage = pages[pageId];
        const currentSec = curPage.sections.find((sec) => sec.id === id);
        if (!currentSec) return;

        // 1. GLOBAL HEADER
        if (currentSec.type === "navbar") {
          (Object.keys(pages) as PageId[]).forEach((pId) => {
            pages[pId].sections = pages[pId].sections.map((sec) => {
              if (sec.type === "navbar") {
                return { ...sec, ...patch } as Section;
              }
              return sec;
            });
          });
          return;
        }

        // 2. GLOBAL FOOTER
        if (currentSec.type === "footer") {
          (Object.keys(pages) as PageId[]).forEach((pId) => {
            pages[pId].sections = pages[pId].sections.map((sec) => {
              if (sec.type === "footer") {
                return { ...sec, ...patch } as Section;
              }
              return sec;
            });
          });
          return;
        }

        // 3. GLOBAL PRODUCT CARD / PRODUCTS
        if (
          currentSec.type === "catalog" ||
          currentSec.type === "featured" ||
          currentSec.type === "grid" ||
          currentSec.type === "product"
        ) {
          // Sync card appearance across all product cards
          const cardStyleKeys = [
            "borderEnabled",
            "borderWidth",
            "borderColor",
            "shadowEnabled",
            "shadowStyle",
            "borderRadius",
            "cardBackground",
            "imageRatio",
            "imageInset",
            "imageRadius",
            "detailsLayout",
            "textAlign",
            "showBadge",
            "showRating",
            "showPrice",
            "showButton",
            "whatsappNumber",
            "currency",
            "priceColor",
            "buttonColor",
            "typography",
          ];
          const hasCardStylePatch = cardStyleKeys.some((k) => k in patch);
          if (
            hasCardStylePatch &&
            (currentSec.type === "catalog" || currentSec.type === "featured" || currentSec.type === "grid")
          ) {
            const cardPatch: Record<string, unknown> = {};
            cardStyleKeys.forEach((k) => {
              if (k in patch) cardPatch[k] = patch[k];
            });
            (Object.keys(pages) as PageId[]).forEach((pId) => {
              pages[pId].sections = pages[pId].sections.map((sec) => {
                if (sec.type === "catalog" || sec.type === "featured" || sec.type === "grid") {
                  return { ...sec, ...cardPatch } as Section;
                }
                return sec;
              });
            });
          }
          // A) If template is being changed
          if (patch.template) {
            const tmpl = patch.template as string;
            // Sync catalog template on shop
            const catalog = pages.shop.sections.find((s) => s.type === "catalog");
            if (catalog && catalog.type === "catalog") {
              catalog.template = tmpl === "editorial" || tmpl === "list" ? "list" : "grid";
            }
            // Sync grid template on home
            const grid = pages.home.sections.find((s) => s.type === "grid");
            if (grid && grid.type === "grid") {
              grid.template = tmpl === "list" || tmpl === "editorial" ? "editorial" : "mosaic";
            }
          }

          // B) If products array was patched (from CatalogForm)
          if (Array.isArray(patch.products)) {
            const updatedProducts = patch.products as Product[];
            const catalog = pages.shop.sections.find((s) => s.type === "catalog");
            if (catalog && catalog.type === "catalog") {
              catalog.products = updatedProducts;
            }
            // Sync to grid.items on home
            const grid = pages.home.sections.find((s) => s.type === "grid");
            if (grid && grid.type === "grid") {
              grid.items = grid.items.map((it) => {
                const match = updatedProducts.find((p) => p.id === it.id || p.name === it.title);
                if (match) {
                  return {
                    ...it,
                    title: match.name,
                    price: `$${match.price}`,
                    image: match.img,
                    tag: match.category,
                  };
                }
                return it;
              });
            }
            // Sync to product-view on product page
            const prod = pages.product.sections.find((s) => s.type === "product");
            if (prod && prod.type === "product") {
              const match = updatedProducts.find((p) => p.name === prod.productName || p.img === prod.image);
              if (match) {
                prod.productName = match.name;
                prod.price = match.price;
                prod.image = match.img;
              }
            }
          }

          // C) If grid items array was patched (from GridItems)
          if (Array.isArray(patch.items)) {
            const updatedItems = patch.items as GridItem[];
            const grid = pages.home.sections.find((s) => s.type === "grid");
            if (grid && grid.type === "grid") {
              grid.items = updatedItems;
            }
            // Sync to catalog products on shop
            const catalog = pages.shop.sections.find((s) => s.type === "catalog");
            if (catalog && catalog.type === "catalog") {
              catalog.products = catalog.products.map((p) => {
                const match = updatedItems.find((it) => it.id === p.id || it.title === p.name);
                if (match) {
                  const num = Number(match.price.replace(/[^0-9.]/g, ""));
                  return {
                    ...p,
                    name: match.title,
                    price: Number.isFinite(num) && num > 0 ? num : p.price,
                    img: match.image,
                  };
                }
                return p;
              });
            }
            // Sync to product-view
            const prod = pages.product.sections.find((s) => s.type === "product");
            if (prod && prod.type === "product") {
              const match = updatedItems.find((it) => it.title === prod.productName || it.image === prod.image);
              if (match) {
                const num = Number(match.price.replace(/[^0-9.]/g, ""));
                prod.productName = match.title;
                if (Number.isFinite(num) && num > 0) prod.price = num;
                prod.image = match.image;
              }
            }
          }

          // D) If single product fields were patched (from ProductForm)
          if (patch.productName !== undefined || patch.price !== undefined || patch.image !== undefined) {
            const prevName = currentSec.type === "product" ? currentSec.productName : "";
            const prevImage = currentSec.type === "product" ? currentSec.image : "";
            const newName = (patch.productName as string | undefined) ?? prevName;
            const newPrice = patch.price !== undefined ? Number(patch.price) : undefined;
            const newImg = (patch.image as string | undefined) ?? prevImage;

            // Sync to catalog on shop
            const catalog = pages.shop.sections.find((s) => s.type === "catalog");
            if (catalog && catalog.type === "catalog") {
              catalog.products = catalog.products.map((p) => {
                if (p.name === prevName || (prevImage && p.img === prevImage)) {
                  return {
                    ...p,
                    name: newName || p.name,
                    price: newPrice !== undefined && Number.isFinite(newPrice) ? newPrice : p.price,
                    img: newImg || p.img,
                  };
                }
                return p;
              });
            }
            // Sync to grid on home
            const grid = pages.home.sections.find((s) => s.type === "grid");
            if (grid && grid.type === "grid") {
              grid.items = grid.items.map((it) => {
                if (it.title === prevName || (prevImage && it.image === prevImage)) {
                  return {
                    ...it,
                    title: newName || it.title,
                    price: newPrice !== undefined && Number.isFinite(newPrice) ? `$${newPrice}` : it.price,
                    image: newImg || it.image,
                  };
                }
                return it;
              });
            }
          }

          // Apply patch to the current section (isolated per page)
          curPage.sections = curPage.sections.map((sec) =>
            sec.id === id ? ({ ...sec, ...patch } as Section) : sec,
          );
          return;
        }

        // Normal section patch (hero, intro, block, etc.)
        curPage.sections = curPage.sections.map((sec) =>
          sec.id === id ? ({ ...sec, ...patch } as Section) : sec,
        );
      });
    },

    patchProductCard: (patch) => {
      commit(({ pages }) => {
        (Object.keys(pages) as PageId[]).forEach((pId) => {
          pages[pId].sections = pages[pId].sections.map((sec) => {
            if (sec.type === "catalog" || sec.type === "featured" || sec.type === "grid") {
              return { ...sec, ...patch } as Section;
            }
            return sec;
          });
        });
      });
    },

    setLogo: (logo) => {
      const name = logo.trim() || "ZITEO";
      commit(
        ({ pages }) => {
          (Object.keys(pages) as PageId[]).forEach((id) => {
            pages[id].sections = pages[id].sections.map((sec) => {
              if (sec.type === "navbar") return { ...sec, logo: name };
              if (sec.type === "footer") return { ...sec, brand: name };
              return sec;
            });
          });
        },
        { sheet: null },
      );
    },

    moveSection: (id, dir) => {
      const page = get().pages[get().pageId];
      const index = page.sections.findIndex((sec) => sec.id === id);
      const currentSec = page.sections[index];
      if (!currentSec) return;
      if (currentSec.type === "navbar" || currentSec.type === "footer") {
        get().showToast(`${currentSec.type === "navbar" ? "Header" : "Footer"} is a fixed element.`);
        return;
      }
      const hasFooter = page.sections[page.sections.length - 1]?.type === "footer";
      const maxIndex = hasFooter ? page.sections.length - 2 : page.sections.length - 1;
      const next = index + dir;
      if (next < 1 || next > maxIndex) return;
      commit(({ pages, pageId }) => {
        const arr = pages[pageId].sections;
        const [item] = arr.splice(index, 1);
        if (item) arr.splice(next, 0, item);
      });
    },

    reorderSection: (id, targetIndex) => {
      const page = get().pages[get().pageId];
      const index = page.sections.findIndex((sec) => sec.id === id);
      const currentSec = page.sections[index];
      if (!currentSec) return;
      if (currentSec.type === "navbar" || currentSec.type === "footer") {
        get().showToast(`${currentSec.type === "navbar" ? "Header" : "Footer"} is a fixed element.`);
        return;
      }
      const hasFooter = page.sections[page.sections.length - 1]?.type === "footer";
      const maxIndex = hasFooter ? page.sections.length - 2 : page.sections.length - 1;
      const clampedTarget = Math.max(1, Math.min(targetIndex, maxIndex));
      if (clampedTarget === index) return;
      commit(({ pages, pageId }) => {
        const arr = pages[pageId].sections;
        const [item] = arr.splice(index, 1);
        if (item) arr.splice(clampedTarget, 0, item);
      });
    },

    deleteSection: (id) => {
      const page = get().pages[get().pageId];
      const sec = page.sections.find((item) => item.id === id);
      if (!sec) return;
      if (sec.type === "navbar" || sec.type === "footer") {
        get().showToast(`${sec.type === "navbar" ? "Header" : "Footer"} is fixed.`);
        return;
      }
      commit(
        ({ pages, pageId }) => {
          pages[pageId].sections = pages[pageId].sections.filter((item) => item.id !== id);
        },
        { selectedId: null, sheet: null },
      );
    },

    insertSection: (kind) => {
      const pageId = get().pageId;
      let newSec: Section;
      switch (kind) {
        case "hero":
          newSec = createHeroSection();
          break;
        case "featured":
          newSec = createFeaturedSection();
          if (pageId === "product") {
            newSec.id = `product-related-${Date.now()}`;
            newSec.name = "Related Products";
            newSec.title = "You May Also Like";
            newSec.subtitle = "Pair it with these handpicked essentials.";
          }
          break;
        case "categories":
          newSec = createCategoriesSection();
          break;
        case "brands":
          newSec = createBrandsSection();
          break;
        case "about":
          newSec = createAboutSection();
          if (pageId === "product") {
            newSec.id = `product-guarantees-${Date.now()}`;
            newSec.name = "Guarantees";
            newSec.kicker = "AUTHENTICITY & CARE";
            newSec.title = "Crafted for longevity.";
          }
          break;
        case "catalog":
          newSec = createCatalogSection();
          break;
        case "product":
          newSec = createProductSection();
          break;
      }

      commit(
        ({ pages, pageId: pId }) => {
          const sections = pages[pId].sections;
          const footerAt = sections.findIndex((sec) => sec.type === "footer");
          if (footerAt === -1) sections.push(newSec);
          else sections.splice(footerAt, 0, newSec);
        },
        { selectedId: newSec.id, sheet: null },
      );
      get().showToast(`Added ${newSec.name} section.`);
    },

    applyTheme: (theme) => {
      commit(
        ({ pages, pageId }) => {
          pages[pageId] = paintTheme(pages[pageId], theme);
          // Header and footer are global, mirror them across all pages
          const curNav = pages[pageId].sections.find((s) => s.type === "navbar");
          const curFoot = pages[pageId].sections.find((s) => s.type === "footer");
          (Object.keys(pages) as PageId[]).forEach((pId) => {
            if (pId === pageId) return;
            if (curNav) {
              pages[pId].sections = pages[pId].sections.map((s) =>
                s.type === "navbar"
                  ? ({ ...s, template: curNav.template, background: curNav.background, text: curNav.text } as Section)
                  : s,
              );
            }
            if (curFoot) {
              pages[pId].sections = pages[pId].sections.map((s) =>
                s.type === "footer"
                  ? ({ ...s, template: curFoot.template, background: curFoot.background, text: curFoot.text } as Section)
                  : s,
              );
            }
          });
        },
        { sheet: null },
      );
    },

    setPageColor: (background) => {
      commit(({ pages, pageId }) => {
        pages[pageId].background = background;
        pages[pageId].tone = isDark(background) ? "dark" : "light";
      });
    },

    setHeroSlide: (index) => {
      mutate((pages) => {
        const hero = pages[get().pageId].sections.find((sec) => sec.type === "hero");
        if (hero && hero.type === "hero") {
          hero.active = (index + hero.slides.length) % hero.slides.length;
        }
      });
    },

    setCatalogFilter: (filter) => {
      mutate((pages) => {
        const catalog = pages.shop.sections.find((sec) => sec.type === "catalog");
        if (catalog && catalog.type === "catalog") catalog.filter = filter;
      });
      set((state) => ({
        catalogFilterState: { ...state.catalogFilterState, activeCategory: filter },
      }));
    },

    setCatalogSort: (sort) => {
      set((state) => ({
        catalogFilterState: { ...state.catalogFilterState, activeSort: sort },
      }));
    },

    setCatalogCategory: (cat) => {
      set((state) => ({
        catalogFilterState: { ...state.catalogFilterState, activeCategory: cat },
      }));
    },

    toggleCatalogBrand: (brand) => {
      set((state) => {
        const brands = state.catalogFilterState.selectedBrands;
        const next = brands.includes(brand) ? brands.filter((b) => b !== brand) : [...brands, brand];
        return {
          catalogFilterState: { ...state.catalogFilterState, selectedBrands: next },
        };
      });
    },

    setCatalogPriceBracket: (bracket) => {
      set((state) => ({
        catalogFilterState: { ...state.catalogFilterState, priceBracket: bracket },
      }));
    },

    toggleCatalogInStockOnly: () => {
      set((state) => ({
        catalogFilterState: {
          ...state.catalogFilterState,
          inStockOnly: !state.catalogFilterState.inStockOnly,
        },
      }));
    },

    resetCatalogFilters: () => {
      set({
        catalogFilterState: {
          activeSort: "featured",
          activeCategory: "All",
          selectedBrands: [],
          priceBracket: "all",
          inStockOnly: false,
        },
      });
    },

    setProductField: (patch) => {
      mutate((pages) => {
        const view = pages.product.sections.find((sec) => sec.type === "product");
        if (view && view.type === "product") {
          const prevName = view.productName;
          const prevImg = view.image;
          Object.assign(view, patch);
          const newName = view.productName;
          const newPrice = view.price;
          const newImg = view.image;

          // Sync to catalog
          const catalog = pages.shop.sections.find((s) => s.type === "catalog");
          if (catalog && catalog.type === "catalog") {
            catalog.products = catalog.products.map((p) => {
              if (p.name === prevName || p.img === prevImg) {
                return {
                  ...p,
                  name: newName,
                  price: newPrice,
                  img: newImg,
                };
              }
              return p;
            });
          }

          // Sync to grid
          const grid = pages.home.sections.find((s) => s.type === "grid");
          if (grid && grid.type === "grid") {
            grid.items = grid.items.map((it) => {
              if (it.title === prevName || it.image === prevImg) {
                return {
                  ...it,
                  title: newName,
                  price: `$${newPrice}`,
                  image: newImg,
                };
              }
              return it;
            });
          }
        }
      });
    },

    openProduct: (product) => {
      const pages = structuredClone(get().pages);
      const view = pages.product.sections.find((sec) => sec.type === "product");
      if (view && view.type === "product") {
        const prodName = product.name || (product as { title?: string }).title || "";
        const prodId = product.id;
        const master = products.find(
          (p) =>
            (prodId && p.id === prodId) ||
            (prodName && p.name && p.name.toLowerCase() === prodName.toLowerCase())
        );
        const resolvedVariants =
          product.variants && product.variants.length > 0
            ? product.variants
            : master?.variants && master.variants.length > 0
              ? master.variants
              : undefined;

        view.productName = prodName;
        view.price = product.price;
        view.regularPrice = product.regularPrice ?? master?.regularPrice ?? product.price;
        view.salePrice = product.salePrice ?? master?.salePrice;
        view.discountPercentage = product.discountPercentage ?? master?.discountPercentage;
        view.stock = product.stock ?? master?.stock ?? 10;
        view.brand = product.brand || master?.brand;
        view.category = (typeof product.category === "string" ? product.category : master?.category) || "Catalog";
        view.description = product.description || master?.description || view.description;
        view.image =
          product.img ||
          (product.gallery && product.gallery[0]) ||
          (master?.gallery && master.gallery[0]) ||
          view.image;
        view.gallery =
          product.gallery && product.gallery.length > 0
            ? product.gallery
            : master?.gallery && master.gallery.length > 0
              ? master.gallery
              : [product.img, ...view.gallery.filter((img) => img !== product.img)].slice(0, 4);

        if (resolvedVariants && resolvedVariants.length > 0) {
          view.variants = resolvedVariants;
          const colorGroup = resolvedVariants.find((v) => v.name.toLowerCase() === "color");
          if (colorGroup && colorGroup.options[0]) {
            view.color = colorGroup.options[0].colorHex || colorGroup.options[0].label;
            view.colors = colorGroup.options.map((o) => o.colorHex || o.label);
          }
          const sizeGroup = resolvedVariants.find((v) => v.name.toLowerCase() === "size");
          if (sizeGroup && sizeGroup.options[0]) {
            view.size = sizeGroup.options[0].label;
            view.sizes = sizeGroup.options.map((o) => o.label);
          }
        }
        view.activeProduct = (master ? { ...master, ...product } : product) as Product;
      }
      set({
        pages,
        pageId: "product",
        menuOpen: false,
        searchOpen: false,
        selectedId: null,
        sheet: null,
      });
    },

    addToCart: (item) => {
      const cart = get().cart.map((entry) => ({ ...entry }));
      const found = cart.find((entry) => entry.name === item.name);
      if (found) found.qty += 1;
      else cart.push({ id: `item-${Date.now()}`, ...item, qty: 1 });
      set({ cart, cartOpen: true, sheet: null, menuOpen: false });
      get().showToast(`${item.name} added to bag.`);
    },

    updateQty: (index, delta) => {
      const cart = get().cart.map((entry) => ({ ...entry }));
      const item = cart[index];
      if (!item) return;
      item.qty += delta;
      set({ cart: cart.filter((entry) => entry.qty > 0) });
    },

    removeItem: (index) => {
      set({ cart: get().cart.filter((_, i) => i !== index) });
    },

    checkout: () => {
      set({ cart: [], cartOpen: false });
      get().showToast("Order placed.");
    },

    showToast: (toast) => {
      if (toastTimer) clearTimeout(toastTimer);
      set({ toast });
      toastTimer = setTimeout(() => set({ toast: null }), 2200);
    },

    reset: () => {
      localStorage.removeItem(STORAGE_KEY);
      set({
        pages: createPages(),
        pageId: "home",
        cart: freshCart(),
        selectedId: null,
        device: "mobile",
        zoom: 100,
        preview: false,
        sheet: null,
        cartOpen: false,
        searchOpen: false,
        publishOpen: false,
        menuOpen: false,
        past: [],
        future: [],
      });
      get().showToast("Template restored.");
    },

    exportHtml: () => {
      const { pages, pageId } = get();
      const blob = new Blob([renderHtml(pages[pageId])], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ziteo-${pageId}.html`;
      link.click();
      URL.revokeObjectURL(url);
      get().showToast("HTML downloaded.");
    },

    hydrate: (saved) => {
      const allowedTypes: Record<PageId, Section["type"][]> = {
        home: ["navbar", "hero", "categories", "featured", "brands", "footer"],
        shop: ["navbar", "filter-sort", "catalog", "footer"],
        product: ["navbar", "product", "featured", "about", "footer"],
      };

      const cleanPages = structuredClone(saved.pages);
      (Object.keys(cleanPages) as PageId[]).forEach((pId) => {
        const allowed = allowedTypes[pId];
        if (allowed && Array.isArray(cleanPages[pId].sections)) {
          cleanPages[pId].sections = cleanPages[pId].sections.filter((s) => allowed.includes(s.type));
        }
      });

      // Strictly ensure home page has no promo banner, no about us, no reviews, no newsletter
      if (cleanPages.home && Array.isArray(cleanPages.home.sections)) {
        cleanPages.home.sections = cleanPages.home.sections.filter(
          (s) => (s as { type: string }).type !== "banner" && s.type !== "about" && (s as { type: string }).type !== "block"
        );
      }

      // Strictly ensure shop page has only filter-sort & catalog grid (+ navbar & footer)
      if (cleanPages.shop && Array.isArray(cleanPages.shop.sections)) {
        cleanPages.shop.sections = cleanPages.shop.sections.filter(
          (s) => s.type === "navbar" || s.type === "filter-sort" || s.type === "catalog" || s.type === "footer"
        );
        const hasFilterSort = cleanPages.shop.sections.some((s) => s.type === "filter-sort");
        if (!hasFilterSort) {
          const catIdx = cleanPages.shop.sections.findIndex((s) => s.type === "catalog");
          const insertIdx = catIdx !== -1 ? catIdx : 1;
          cleanPages.shop.sections.splice(insertIdx, 0, createFilterSortSection("shop-filter-sort"));
        }
        const cat = cleanPages.shop.sections.find((s) => s.type === "catalog");
        if (cat && cat.type === "catalog") {
          cat.title = "";
          cat.subtitle = "";
          cat.name = "Catalog Grid";
        }
      }

      // Strictly ensure product page has no reviews, no promo banner, no newsletter
      if (cleanPages.product && Array.isArray(cleanPages.product.sections)) {
        cleanPages.product.sections = cleanPages.product.sections.filter(
          (s) => (s as { type: string }).type !== "banner" && (s as { type: string }).type !== "block"
        );
      }

      // If product page only had minimal sections, ensure it has its companion sections
      if (cleanPages.product && cleanPages.product.sections.length <= 3) {
        const hasRelated = cleanPages.product.sections.some(
          (s) => s.id === "product-related" || (s.type === "featured" && s.id !== "featured"),
        );
        const hasGuarantees = cleanPages.product.sections.some((s) => s.id === "product-guarantees");
        const footerIndex = cleanPages.product.sections.findIndex((s) => s.type === "footer");
        const insertIdx = footerIndex !== -1 ? footerIndex : cleanPages.product.sections.length;

        const newSections: Section[] = [];
        if (!hasRelated) {
          newSections.push({
            ...createFeaturedSection(),
            id: "product-related",
            name: "Related Products",
            title: "You May Also Like",
            subtitle: "Pair it with these handpicked essentials.",
          });
        }
        if (!hasGuarantees) {
          newSections.push({
            ...createAboutSection(),
            id: "product-guarantees",
            name: "Guarantees",
            kicker: "AUTHENTICITY & CARE",
            title: "Crafted for longevity.",
          });
        }
        cleanPages.product.sections.splice(insertIdx, 0, ...newSections);
      }

      set({ pages: cleanPages, pageId: saved.pageId, cart: saved.cart });
    },
  };
});

export function selectedSection(state: Pick<EditorState, "pages" | "pageId" | "selectedId">) {
  if (!state.selectedId) return null;
  if (state.selectedId === "product-card") {
    const curPage = state.pages[state.pageId];
    return (
      curPage.sections.find((s) => s.type === "catalog" || s.type === "featured" || s.type === "grid") ??
      state.pages.shop.sections.find((s) => s.type === "catalog") ??
      state.pages.home.sections.find((s) => s.type === "featured" || s.type === "grid") ??
      null
    );
  }
  return state.pages[state.pageId].sections.find((sec) => sec.id === state.selectedId) ?? null;
}

if (typeof window !== "undefined") {
  (window as unknown as { __editorStore: unknown }).__editorStore = useEditor;
}

export { STORAGE_KEY };

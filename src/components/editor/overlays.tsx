import { useEffect, useMemo, useState } from "react";
import { Copy, Minus, Plus, Search, Trash2, X } from "lucide-react";
import { money } from "@/lib/editor/defaults";
import { useEditor } from "@/lib/editor/store";
import type { Product } from "@/lib/editor/types";
import { cn } from "@/lib/cn";

const EMPTY_PRODUCTS: Product[] = [];

function catalogProducts(products: Product[], query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return products;
  return products.filter(
    (item) =>
      item.name.toLowerCase().includes(needle) ||
      (item.brand && item.brand.toLowerCase().includes(needle)) ||
      (item.category && item.category.toLowerCase().includes(needle)),
  );
}

export function Overlays() {
  return (
    <>
      <CartDrawer />
      <SearchModal />
      <PublishModal />
      <Toast />
    </>
  );
}

function CartDrawer() {
  const open = useEditor((s) => s.cartOpen);
  const cart = useEditor((s) => s.cart);
  if (!open) return null;
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close bag"
        className="animate-fade-in absolute inset-0 bg-ink/30 backdrop-blur-xs transition-opacity"
        onClick={() => useEditor.getState().closeCart()}
      />
      <aside className="animate-slide-in-right relative flex h-full w-full max-w-sm flex-col bg-surface text-ink shadow-frame">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-lg font-semibold tracking-tight">Bag</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={() => useEditor.getState().closeCart()}
            className="tap-smooth inline-flex size-11 items-center justify-center rounded-full bg-fill hover:bg-line-soft transition-colors"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5">
          {cart.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-muted">Your bag is empty.</p>
              <button
                type="button"
                onClick={() => {
                  useEditor.getState().closeCart();
                  useEditor.getState().switchPage("shop");
                }}
                className="tap-smooth mt-4 text-sm font-medium text-accent hover:underline"
              >
                Continue shopping
              </button>
            </div>
          )}
          <ul className="flex flex-col">
            {cart.map((item, index) => (
              <li key={item.id} className="flex gap-3 border-t border-line-soft py-4">
                <img src={item.img} alt="" className="size-20 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="mt-1 text-sm text-muted">{money(item.price)}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Decrease"
                      onClick={() => useEditor.getState().updateQty(index, -1)}
                      className="tap-smooth inline-flex size-8 items-center justify-center rounded-full bg-fill hover:bg-line-soft transition-colors"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="text-sm tabular-nums">{item.qty}</span>
                    <button
                      type="button"
                      aria-label="Increase"
                      onClick={() => useEditor.getState().updateQty(index, 1)}
                      className="tap-smooth inline-flex size-8 items-center justify-center rounded-full bg-fill hover:bg-line-soft transition-colors"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={() => useEditor.getState().removeItem(index)}
                  className="tap-smooth inline-flex size-11 items-center justify-center text-muted hover:text-ink transition-colors"
                >
                  <Trash2 className="size-4" strokeWidth={1.75} />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-line-soft px-5 py-4">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-sm text-muted">Subtotal · {count}</span>
            <span className="text-base font-semibold tabular-nums">{money(subtotal)}</span>
          </div>
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => useEditor.getState().checkout()}
            className="tap-smooth-sm h-12 w-full rounded-full bg-ink text-sm font-medium text-on-ink disabled:opacity-40 hover:opacity-95 transition-opacity"
          >
            Check out
          </button>
        </div>
      </aside>
    </div>
  );
}

function SearchModal() {
  const open = useEditor((s) => s.searchOpen);
  const products = useEditor((s) => {
    const catalog = s.pages.shop.sections.find((sec) => sec.type === "catalog");
    return catalog && catalog.type === "catalog" ? catalog.products : EMPTY_PRODUCTS;
  });
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);
  const results = useMemo(() => catalogProducts(products, query), [products, query]);
  if (!open) return null;

  const openProduct = (product: Product) => {
    setQuery("");
    useEditor.getState().openProduct({
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      regularPrice: product.regularPrice || product.price,
      salePrice: product.salePrice,
      discountPercentage: product.discountPercentage,
      stock: product.stock ?? 10,
      brand: product.brand,
      category: product.category,
      description: product.description,
      gallery: product.gallery && product.gallery.length > 0 ? product.gallery : [product.img],
      img: product.img,
      variants: product.variants,
      badge: product.badge,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-16">
      <button
        type="button"
        aria-label="Close search"
        className="animate-fade-in absolute inset-0 bg-ink/30 backdrop-blur-xs transition-opacity"
        onClick={() => useEditor.getState().closeSearch()}
      />
      <div className="animate-scale-in relative w-full max-w-lg overflow-hidden rounded-3xl bg-surface shadow-frame">
        <div className="flex items-center gap-2 px-4">
          <Search className="size-5 text-muted" strokeWidth={1.75} />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the store"
            className="h-14 w-full bg-transparent text-base outline-none placeholder:text-faint"
          />
          <button
            type="button"
            aria-label="Close"
            onClick={() => useEditor.getState().closeSearch()}
            className="tap-smooth inline-flex size-11 items-center justify-center rounded-full text-muted hover:text-ink transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="border-t border-line-soft px-2 py-2">
          {query.trim() === "" && (
            <p className="px-3 py-2 text-xs font-medium text-muted">Suggestions</p>
          )}
          {results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted">No matches.</p>
          )}
          {results.slice(0, 6).map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => openProduct(product)}
              className="tap-smooth flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left hover:bg-fill transition-colors"
            >
              <img src={product.img} alt="" className="size-12 rounded-xl object-cover transition-transform duration-200 group-hover:scale-105" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{product.name}</span>
                <span className="text-xs text-muted">{product.category}</span>
              </span>
              <span className="text-sm tabular-nums font-medium">{money(product.price)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PublishModal() {
  const open = useEditor((s) => s.publishOpen);
  const hasUnpublishedChanges = useEditor((s) => s.hasUnpublishedChanges);
  const publishedAt = useEditor((s) => s.publishedAt);
  const saveStatus = useEditor((s) => s.saveStatus);
  const saveError = useEditor((s) => s.saveError);
  const [copied, setCopied] = useState(false);
  if (!open) return null;

  // Only expose an external public store URL if actually configured; never show a fake live URL
  const publicUrl =
    (typeof import.meta !== "undefined" &&
      (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_PUBLIC_STORE_URL) ||
    "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close publish"
        className="animate-fade-in absolute inset-0 bg-ink/30 backdrop-blur-xs transition-opacity"
        onClick={() => useEditor.getState().closePublish()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-dialog-title"
        className="animate-scale-in relative w-full max-w-sm rounded-3xl bg-surface px-6 py-7 text-center shadow-frame"
      >
        <div className="mb-3 flex justify-center">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold",
              saveStatus === "save_failed"
                ? "bg-red-500/15 text-red-700"
                : hasUnpublishedChanges
                  ? "bg-amber-500/15 text-amber-700"
                  : "bg-emerald-500/15 text-emerald-700",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                saveStatus === "save_failed"
                  ? "bg-red-500"
                  : hasUnpublishedChanges
                    ? "bg-amber-500"
                    : "bg-emerald-500",
              )}
            />
            {saveStatus === "save_failed"
              ? "Save failed"
              : saveStatus === "publishing"
                ? "Publishing..."
                : hasUnpublishedChanges
                  ? "Unpublished changes"
                  : publishedAt
                    ? "Published"
                    : "Draft saved"}
          </span>
        </div>
        <h2 id="publish-dialog-title" className="text-xl font-semibold tracking-tight">
          {saveStatus === "save_failed"
            ? "Publish could not finish"
            : hasUnpublishedChanges
              ? "Publish draft changes?"
              : "Store design is up to date"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {saveError
            ? `${saveError} Your draft changes are preserved.`
            : hasUnpublishedChanges
              ? "Design edits stay in draft until you publish. Price and stock edits update live."
              : publicUrl
                ? "Your published storefront is updated."
                : "Remote public hosting is not connected in this repository. Publishing updates your local published snapshot."}
        </p>
        {saveStatus === "save_failed" && (
          <button
            type="button"
            onClick={() => useEditor.getState().publishDraft()}
            className="tap-smooth-sm mt-4 h-11 w-full rounded-full bg-red-600 text-sm font-semibold text-white hover:opacity-95 cursor-pointer"
          >
            Retry publish
          </button>
        )}
        {hasUnpublishedChanges && saveStatus !== "save_failed" && (
          <button
            type="button"
            onClick={() => useEditor.getState().publishDraft()}
            className="tap-smooth-sm mt-4 h-11 w-full rounded-full bg-accent text-sm font-semibold text-white hover:opacity-95 transition-opacity cursor-pointer"
          >
            Publish changes
          </button>
        )}
        {publicUrl ? (
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 rounded-2xl bg-fill px-3 py-2">
              <span className="truncate text-left text-sm text-muted">{publicUrl}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(publicUrl).catch(() => undefined);
                  setCopied(true);
                  useEditor.getState().showToast("Live URL copied.");
                }}
                className="tap-smooth inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-surface px-3 text-xs font-medium shadow-xs hover:bg-line-soft cursor-pointer"
              >
                <Copy className="size-3.5" />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-smooth-sm flex h-11 w-full items-center justify-center rounded-full border border-line-soft bg-surface text-sm font-medium text-ink hover:bg-fill transition-colors"
            >
              Open live store
            </a>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-line-soft bg-fill/40 px-3.5 py-2.5 text-left text-xs text-muted">
            Your design is saved as a draft. Connect your store domain in dashboard settings to publish live.
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
            setCopied(true);
            useEditor.getState().showToast("Preview link copied.");
          }}
          className="tap-smooth-sm mt-3 h-11 w-full rounded-full border border-line-soft bg-surface text-sm font-medium text-ink hover:bg-fill transition-colors cursor-pointer"
        >
          {copied ? "Preview link copied" : "Copy preview link"}
        </button>
        <button
          type="button"
          onClick={() => {
            useEditor.getState().closePublish();
            useEditor.getState().togglePreview(true);
          }}
          className="tap-smooth-sm mt-3 h-11 w-full rounded-full bg-ink text-sm font-medium text-on-ink hover:opacity-90 transition-opacity cursor-pointer"
        >
          Preview draft
        </button>
        <button
          type="button"
          onClick={() => useEditor.getState().closePublish()}
          className="tap-smooth-sm mt-2 h-11 w-full text-sm text-muted hover:text-ink transition-colors cursor-pointer"
        >
          Back to editor
        </button>
      </div>
    </div>
  );
}

function Toast() {
  const toast = useEditor((s) => s.toast);
  const preview = useEditor((s) => s.preview);
  if (!toast) return null;
  return (
    <div
      className={cn(
        "pointer-events-none fixed left-1/2 z-toast -translate-x-1/2",
        preview ? "bottom-6" : "bottom-24",
      )}
    >
      <div className="animate-scale-in rounded-full bg-ink px-4 py-2 text-xs sm:text-sm font-medium text-on-ink shadow-xl">
        {toast}
      </div>
    </div>
  );
}

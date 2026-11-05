import { useMemo, useState } from "react";
import { Copy, Minus, Plus, Search, Trash2, X } from "lucide-react";
import { money } from "@/lib/editor/defaults";
import { useEditor } from "@/lib/editor/store";
import type { Product } from "@/lib/editor/types";
import { cn } from "@/lib/cn";

const EMPTY_PRODUCTS: Product[] = [];

function catalogProducts(products: Product[], query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return products;
  return products.filter((item) => item.name.toLowerCase().includes(needle));
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
  const results = useMemo(() => catalogProducts(products, query), [products, query]);
  if (!open) return null;

  const openProduct = (product: Product) => {
    setQuery("");
    useEditor.getState().openProduct({
      name: product.name,
      price: product.price,
      img: product.img,
      rating: `${product.rating} · ${product.reviews} reviews`,
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
  const [copied, setCopied] = useState(false);
  if (!open) return null;
  const link = "https://ziteo.site";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close publish"
        className="animate-fade-in absolute inset-0 bg-ink/30 backdrop-blur-xs transition-opacity"
        onClick={() => useEditor.getState().closePublish()}
      />
      <div className="animate-scale-in relative w-full max-w-sm rounded-3xl bg-surface px-6 py-7 text-center shadow-frame">
        <h2 className="text-xl font-semibold tracking-tight">Your site is live.</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          The current pages are ready to share. Preview stays inside the editor.
        </p>
        <div className="mt-5 flex items-center justify-between gap-2 rounded-2xl bg-fill px-3 py-2">
          <span className="truncate text-left text-sm text-muted">{link}</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(link).catch(() => undefined);
              setCopied(true);
              useEditor.getState().showToast("Link copied.");
            }}
            className="tap-smooth inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-surface px-3 text-xs font-medium shadow-xs hover:bg-line-soft transition-all"
          >
            <Copy className="size-3.5" />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            useEditor.getState().closePublish();
            useEditor.getState().togglePreview(true);
          }}
          className="tap-smooth-sm mt-4 h-11 w-full rounded-full bg-ink text-sm font-medium text-on-ink hover:opacity-90 transition-opacity"
        >
          Preview site
        </button>
        <button
          type="button"
          onClick={() => useEditor.getState().closePublish()}
          className="tap-smooth-sm mt-2 h-11 w-full text-sm text-muted hover:text-ink transition-colors"
        >
          Back to editor
        </button>
      </div>
    </div>
  );
}

function Toast() {
  const toast = useEditor((s) => s.toast);
  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed top-16 left-1/2 z-toast -translate-x-1/2">
      <div className={cn("animate-slide-down rounded-full bg-ink px-4 py-2 text-sm font-medium text-on-ink shadow-float")}>
        {toast}
      </div>
    </div>
  );
}

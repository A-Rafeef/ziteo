import type { Design, Product, Stock, Variant, VariantGroup } from "../types";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}

export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ApiError("Please provide a valid request object.");
  return value as Record<string, unknown>;
}

export function text(value: unknown, name: string, max = 5000, required = false): string {
  if (typeof value !== "string") {
    if (!required && (value === undefined || value === null)) return "";
    throw new ApiError(`${name} must be text.`);
  }
  const result = value.trim();
  if (required && !result) throw new ApiError(`${name} is required.`);
  if (result.length > max) throw new ApiError(`${name} must be ${max} characters or fewer.`);
  return result;
}

export function boolean(value: unknown, fallback = false): boolean {
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") throw new ApiError("Please use true or false for this setting.");
  return value;
}

export function price(value: unknown, name = "Price"): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || value > 100000000 || Math.abs(Math.round(value * 100) - value * 100) > 0.0001) {
    throw new ApiError(`${name} must be greater than zero, with no more than two decimal places.`);
  }
  return value;
}

export function salePrice(value: unknown, regular: number): number | null {
  if (value === undefined || value === null || value === "") return null;
  const sale = price(value, "Sale price");
  if (sale >= regular) throw new ApiError("Sale price must be lower than the regular price.");
  return sale;
}

function stock(value: unknown): Stock {
  if (value !== "in_stock" && value !== "out_of_stock") throw new ApiError("Choose In Stock or Out of Stock.");
  return value;
}

export function imageUrl(value: unknown, storeId?: string): string {
  const source = text(value, "Image URL", 2000, true);
  if (source.startsWith("/api/images/")) {
    if (!storeId || !source.startsWith(`/api/images/${storeId}/`)) throw new ApiError("This image does not belong to your store.");
    return source;
  }
  let url: URL;
  try { url = new URL(source); } catch { throw new ApiError("Please use a valid image URL."); }
  if (url.protocol !== "https:" || url.username || url.password) throw new ApiError("Image URLs must use HTTPS.");
  return source;
}

export function normalizeWhatsApp(value: unknown): string {
  const raw = text(value, "WhatsApp number", 30);
  if (!raw) return "";
  const normalized = raw.replace(/[\s()+-]/g, "");
  if (!/^[1-9]\d{9,14}$/.test(normalized)) throw new ApiError("Enter a WhatsApp number with country code and 10–15 digits.");
  return normalized;
}

export function validateSlug(value: unknown): string {
  const slug = text(value, "Store address", 60, true).toLowerCase();
  if (!/^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])?$/.test(slug) || slug.length < 3) throw new ApiError("Store address must have 3–60 lowercase letters, numbers or hyphens, without a leading or trailing hyphen.");
  const reserved = new Set(["api", "app", "dashboard", "products", "settings", "editor", "analytics", "preview", "privacy", "terms", "support", "signin-with-chatgpt", "signout-with-chatgpt"]);
  if (reserved.has(slug)) throw new ApiError("That store address is reserved. Please choose another.");
  return slug;
}

export function available(product: Product): boolean {
  return product.variants.length > 0 ? product.variants.some((v) => v.stock === "in_stock") : product.stock === "in_stock";
}

export function validateProduct(input: unknown, storeId: string, previous?: Product): Product {
  const raw = { ...previous, ...object(input) };
  const regular = price(raw.price);
  const rawImages = raw.images;
  if (!Array.isArray(rawImages) || rawImages.length < 1 || rawImages.length > 5) throw new ApiError("A product needs 1–5 images.");
  const images = rawImages.map((v) => imageUrl(v, storeId));
  if (new Set(images).size !== images.length) throw new ApiError("Remove duplicate product images.");
  const rawGroups = raw.variantGroups ?? [];
  const rawVariants = raw.variants ?? [];
  if (!Array.isArray(rawGroups) || rawGroups.length > 4) throw new ApiError("Use no more than four option groups.");
  if (!Array.isArray(rawVariants) || rawVariants.length > 100) throw new ApiError("A product can have up to 100 variant combinations.");
  const groups: VariantGroup[] = rawGroups.map((value) => {
    const group = object(value);
    if (!Array.isArray(group.values) || !group.values.length || group.values.length > 100) throw new ApiError("Every option group needs at least one value.");
    const values = group.values.map((v) => text(v, "Option value", 60, true));
    if (new Set(values.map((v) => v.toLowerCase())).size !== values.length) throw new ApiError("Option values must be unique within a group.");
    return { name: text(group.name, "Option name", 60, true), values, affectsPrice: boolean(group.affectsPrice) };
  });
  if (new Set(groups.map((g) => g.name.toLowerCase())).size !== groups.length) throw new ApiError("Option group names must be unique.");
  const combinations = groups.reduce((count, group) => count * group.values.length, 1);
  if (combinations > 100) throw new ApiError("These options produce more than 100 variants. Please reduce the options.");
  if (groups.length === 0 && rawVariants.length) throw new ApiError("Add option groups before adding variants.");
  if (groups.length > 0 && rawVariants.length !== combinations) throw new ApiError("Generate a variant for every option combination.");
  const seen = new Set<string>();
  const ids = new Set<string>();
  const variants: Variant[] = rawVariants.map((value) => {
    const variant = object(value);
    const options = object(variant.options);
    if (Object.keys(options).length !== groups.length) throw new ApiError("Each variant must include every option group.");
    const normalizedOptions: Record<string, string> = {};
    for (const group of groups) {
      const selected = options[group.name];
      if (typeof selected !== "string" || !group.values.includes(selected)) throw new ApiError(`Choose a valid ${group.name} for every variant.`);
      normalizedOptions[group.name] = selected;
    }
    const key = JSON.stringify(groups.map((g) => normalizedOptions[g.name]));
    if (seen.has(key)) throw new ApiError("Variant combinations must be unique.");
    seen.add(key);
    const id = typeof variant.id === "string" && variant.id.length <= 100 && variant.id ? variant.id : crypto.randomUUID();
    if (ids.has(id)) throw new ApiError("Variant identifiers must be unique.");
    ids.add(id);
    const variantPrice = price(variant.price, "Variant price");
    return { id, options: normalizedOptions, price: variantPrice, salePrice: salePrice(variant.salePrice, variantPrice), stock: stock(variant.stock) };
  });
  const status = raw.status ?? "draft";
  if (status !== "draft" && status !== "published") throw new ApiError("Choose Draft or Published. Use Archive to remove a product.");
  const productStock = variants.length ? (variants.some((v) => v.stock === "in_stock") ? "in_stock" : "out_of_stock") : stock(raw.stock ?? "in_stock");
  return {
    id: previous?.id ?? crypto.randomUUID(), shortId: previous?.shortId ?? crypto.randomUUID().replace(/-/g, "").slice(0, 12),
    name: text(raw.name, "Product name", 160, true), description: text(raw.description, "Description", 10000), price: regular,
    salePrice: salePrice(raw.salePrice, regular), images, status, stock: productStock, showDiscount: boolean(raw.showDiscount, true),
    variantGroups: groups, variants, createdAt: previous?.createdAt ?? new Date().toISOString(), archivedAt: null,
    sample: previous?.sample ?? false,
  };
}

export const DEFAULT_DESIGN: Design = {
  accent: "#264A3A", template: "editorial", heroTitle: "Everyday things.\nExtraordinary living.",
  heroSubtitle: "Thoughtfully chosen pieces for the way you live. Discover a little something to make every day feel special.",
  heroImage: "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1400&q=85",
  columns: 3, cardStyle: "clean", imageRatio: "portrait", showDiscount: true,
  sections: ["navbar", "hero", "products", "about", "footer"], aboutText: "We believe the things you surround yourself with should be as considered as the life you’re building. Meet our edit of beautiful, useful pieces — made for the everyday.",
  bannerText: "Thoughtful finds. Made for everyday.", textContent: "Good design belongs in everyday life.", alignment: "left",
};

export function validateDesign(input: unknown, storeId: string): Design {
  const value = object(input);
  const design = { ...DEFAULT_DESIGN, ...value };
  if (!/^#[0-9a-fA-F]{6}$/.test(String(design.accent))) throw new ApiError("Choose a valid six-digit accent color.");
  if (!["minimal", "editorial", "bold"].includes(String(design.template))) throw new ApiError("Choose a supported website template.");
  if (![1, 2, 3, 4].includes(Number(design.columns))) throw new ApiError("Product columns must be between 1 and 4.");
  if (!["clean", "soft", "bordered"].includes(String(design.cardStyle))) throw new ApiError("Choose a supported card style.");
  if (!["square", "portrait"].includes(String(design.imageRatio))) throw new ApiError("Choose a supported image ratio.");
  if (!["left", "center"].includes(String(design.alignment))) throw new ApiError("Choose left or center text alignment.");
  const allowed = new Set(["navbar", "hero", "products", "about", "banner", "text", "contact", "footer"]);
  if (!Array.isArray(design.sections) || design.sections.some((v) => typeof v !== "string" || !allowed.has(v)) || new Set(design.sections).size !== design.sections.length) throw new ApiError("Choose supported, unique website sections.");
  if (!["navbar", "products", "footer"].every((name) => design.sections.includes(name))) throw new ApiError("Navigation, Products and Footer are required sections.");
  if (design.sections[0] !== "navbar" || design.sections[design.sections.length - 1] !== "footer") throw new ApiError("Keep navigation first and footer last.");
  let sectionTemplates: Design['sectionTemplates'];
  if (value.sectionTemplates !== undefined) {
    const templates = object(value.sectionTemplates);
    const editable = new Set([...allowed, 'product-detail']);
    if (Object.keys(templates).some(key => !editable.has(key)) || Object.values(templates).some(template => typeof template !== 'string' || !['minimal', 'editorial', 'bold'].includes(template))) throw new ApiError('Choose a supported section template.');
    sectionTemplates = Object.fromEntries(Object.entries(templates)) as Design['sectionTemplates'];
  }
  return {
    ...(sectionTemplates === undefined ? {} : {sectionTemplates}),
    accent: String(design.accent), template: design.template as Design["template"], heroTitle: text(design.heroTitle, "Hero title", 200),
    heroSubtitle: text(design.heroSubtitle, "Hero subtitle", 1000), heroImage: design.heroImage ? imageUrl(design.heroImage, storeId) : "",
    columns: Number(design.columns), cardStyle: design.cardStyle as Design["cardStyle"], imageRatio: design.imageRatio as Design["imageRatio"],
    showDiscount: boolean(design.showDiscount, true), sections: design.sections, aboutText: text(design.aboutText, "About text", 5000),
    bannerText: text(design.bannerText, "Banner text", 500), textContent: text(design.textContent, "Text content", 5000), alignment: design.alignment as Design["alignment"],
  };
}

export function sniffImage(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((n, i) => bytes[i] === n)) return "image/png";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0,4)) === "RIFF" && String.fromCharCode(...bytes.slice(8,12)) === "WEBP") return "image/webp";
  return null;
}

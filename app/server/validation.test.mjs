import assert from "node:assert/strict";
import test from "node:test";
import { available, DEFAULT_DESIGN, normalizeWhatsApp, sniffImage, validateDesign, validateProduct, validateSlug } from "./validation.ts";

const storeId = "e2913785-719a-4899-9b6a-324f21675152";
const base = () => ({ name: "Cotton shirt", price: 1299, images: ["https://images.unsplash.com/photo-shirt"], status: "published", stock: "in_stock" });
const variantProduct = () => ({
  ...base(), variantGroups: [{ name: "Size", values: ["S", "M"], affectsPrice: true }, { name: "Color", values: ["Blue", "White"], affectsPrice: false }],
  variants: [
    { id: "s-blue", options: { Size: "S", Color: "Blue" }, price: 1299, salePrice: 999, stock: "in_stock" },
    { id: "s-white", options: { Size: "S", Color: "White" }, price: 1299, salePrice: null, stock: "out_of_stock" },
    { id: "m-blue", options: { Size: "M", Color: "Blue" }, price: 1499, salePrice: 1199, stock: "in_stock" },
    { id: "m-white", options: { Size: "M", Color: "White" }, price: 1499, salePrice: null, stock: "out_of_stock" },
  ],
});

test("section templates extend existing design without changing legacy data", () => {
  const oldDesign = structuredClone(DEFAULT_DESIGN);
  const restored = validateDesign(oldDesign, storeId);
  assert.deepEqual(restored, oldDesign);
  const configured = validateDesign({...oldDesign, sectionTemplates:{navbar:'bold','product-detail':'minimal'}}, storeId);
  assert.deepEqual(configured.sectionTemplates,{navbar:'bold','product-detail':'minimal'});
  assert.equal(configured.heroTitle, oldDesign.heroTitle);
  assert.equal(configured.template, oldDesign.template);
  assert.throws(()=>validateDesign({...oldDesign,sectionTemplates:{navbar:'unsupported'}}, storeId));
  assert.throws(()=>validateDesign({...oldDesign,sectionTemplates:{navbar:['bold']}}, storeId));
  assert.throws(()=>validateDesign({...oldDesign,sectionTemplates:{navbar:null}}, storeId));
  assert.throws(()=>validateDesign({...oldDesign,sectionTemplates:{checkout:'bold'}}, storeId));
  assert.throws(()=>validateDesign({...oldDesign,sectionTemplates:[]}, storeId));
});

test("a saved product retains stable identity and URL after rename", () => {
  const original = validateProduct(base(), storeId);
  const edited = validateProduct({ name: "Updated shirt" }, storeId, original);
  assert.equal(edited.id, original.id);
  assert.equal(edited.shortId, original.shortId);
  assert.equal(edited.createdAt, original.createdAt);
  assert.equal(edited.name, "Updated shirt");
});

test("required product information, image bounds and valid money are enforced", () => {
  for (const change of [{ name: "" }, { price: 0 }, { price: -1 }, { price: NaN }, { price: Infinity }, { price: 1.111 }, { images: [] }, { images: Array(6).fill("https://example.com/image") }]) {
    assert.throws(() => validateProduct({ ...base(), ...change }, storeId));
  }
  assert.throws(() => validateProduct({ ...base(), salePrice: 1299 }, storeId), /lower/);
  assert.throws(() => validateProduct({ ...base(), salePrice: -100 }, storeId));
  assert.equal(validateProduct({ ...base(), price: 99.99, salePrice: 79.99 }, storeId).salePrice, 79.99);
});

test("every option combination has its own resolved price and stock", () => {
  const product = validateProduct(variantProduct(), storeId);
  assert.equal(product.variants.find((v) => v.options.Size === "M" && v.options.Color === "Blue").salePrice, 1199);
  assert.equal(product.variants.find((v) => v.options.Size === "S" && v.options.Color === "White").stock, "out_of_stock");
  assert.equal(available(product), true);
  assert.equal(product.stock, "in_stock");
});

test("missing, duplicate and extraneous variant options are rejected", () => {
  const missing = variantProduct(); missing.variants.pop();
  assert.throws(() => validateProduct(missing, storeId), /every option combination/);
  const duplicate = variantProduct(); duplicate.variants[1].options = duplicate.variants[0].options;
  assert.throws(() => validateProduct(duplicate, storeId), /unique/);
  const extraneous = variantProduct(); extraneous.variants[0].options.Material = "Linen";
  assert.throws(() => validateProduct(extraneous, storeId), /every option group/);
});

test("all unavailable variants make product unavailable", () => {
  const input = variantProduct(); input.variants.forEach((v) => { v.stock = "out_of_stock"; });
  const product = validateProduct(input, storeId);
  assert.equal(product.stock, "out_of_stock");
  assert.equal(available(product), false);
});

test("duplicate option groups and excessive combination counts are blocked", () => {
  const duplicate = variantProduct(); duplicate.variantGroups[1].name = "size";
  assert.throws(() => validateProduct(duplicate, storeId), /names must be unique/);
  const input = { ...base(), variantGroups: [{ name: "Size", values: Array.from({ length: 11 }, (_, i) => `S${i}`) }, { name: "Color", values: Array.from({ length: 10 }, (_, i) => `C${i}`) }], variants: [] };
  assert.throws(() => validateProduct(input, storeId), /more than 100/);
});

test("image references are HTTPS or this store's scoped uploaded images", () => {
  assert.throws(() => validateProduct({ ...base(), images: ["javascript:alert(1)"] }, storeId), /HTTPS/);
  assert.throws(() => validateProduct({ ...base(), images: ["/api/images/some-other-store/image.jpg"] }, storeId), /belong/);
  assert.ok(validateProduct({ ...base(), images: [`/api/images/${storeId}/image.jpg`] }, storeId));
});

test("WhatsApp normalizes international numbers and rejects bad destinations", () => {
  assert.equal(normalizeWhatsApp("+91 (98765) 43210"), "919876543210");
  assert.equal(normalizeWhatsApp(""), "");
  for (const number of ["123", "00000000000", "919876543210x", "1234567890123456"]) assert.throws(() => normalizeWhatsApp(number));
});

test("published-address format is safe and reserved addresses are rejected", () => {
  assert.equal(validateSlug("Everyday-Edit"), "everyday-edit");
  for (const value of ["api", "-store", "store-", "../store", "a", "hello world"]) assert.throws(() => validateSlug(value));
});

test("design requires mandatory sections and keeps navigation/footer anchored", () => {
  assert.equal(validateDesign(DEFAULT_DESIGN, storeId).template, "editorial");
  assert.throws(() => validateDesign({ ...DEFAULT_DESIGN, sections: ["navbar", "hero", "footer"] }, storeId), /required/);
  assert.throws(() => validateDesign({ ...DEFAULT_DESIGN, sections: ["hero", "navbar", "products", "footer"] }, storeId), /first/);
  assert.throws(() => validateDesign({ ...DEFAULT_DESIGN, sections: ["navbar", "products", "footer", "products"] }, storeId), /unique/);
  assert.throws(() => validateDesign({ ...DEFAULT_DESIGN, columns: 12 }, storeId));
});

test("upload content type is detected from bytes rather than file extension", () => {
  assert.equal(sniffImage(new Uint8Array([255, 216, 255, 0])), "image/jpeg");
  assert.equal(sniffImage(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])), "image/png");
  assert.equal(sniffImage(new TextEncoder().encode("RIFF1234WEBP")), "image/webp");
  assert.equal(sniffImage(new TextEncoder().encode("<svg onload=alert(1)>")), null);
});

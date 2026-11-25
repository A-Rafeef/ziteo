import { colorWithOpacity, money } from "@/lib/editor/defaults";
import type { PageModel } from "@/lib/editor/types";

function esc(value: string) {
  return value
    .replaceAll("&", "&" + "amp;")
    .replaceAll("<", "&" + "lt;")
    .replaceAll(">", "&" + "gt;")
    .replaceAll('"', "&" + "quot;");
}

export function renderHtml(page: PageModel) {
  const parts: string[] = [];
  const navSec = page.sections.find((s) => s.type === "navbar");
  const storeName = navSec && navSec.type === "navbar" ? navSec.logo : "ZITEO";

  for (const sec of page.sections) {
    if (sec.type === "navbar") {
      const bg = colorWithOpacity(sec.background, sec.backgroundOpacity ?? 100);
      const navLinks = (sec.links ?? [
        { id: "1", label: "Home", url: "home", visible: true },
        { id: "2", label: "Shop", url: "shop", visible: true },
        { id: "3", label: "Product", url: "product", visible: true },
      ])
        .filter((l) => l.visible !== false)
        .map((l) => `<span style="color:${esc(sec.linkColor || sec.text)}">${esc(l.label)}</span>`)
        .join(" · ");
      const logoImg =
        sec.showLogo !== false && sec.logoImage
          ? `<img src="${esc(sec.logoImage)}" alt="${esc(sec.logo)}" style="width:28px;height:28px;border-radius:99px;object-fit:cover">`
          : "";
      const brandName = sec.showBrandName !== false ? `<strong style="letter-spacing:.14em">${esc(sec.logo)}</strong>` : "";
      const radius = sec.borderRadius ? `${sec.borderRadius}px` : "0px";
      parts.push(
        `<header style="display:flex;justify-content:space-between;align-items:center;min-height:${sec.height || 56}px;padding:12px 28px;background:${esc(bg)};color:${esc(sec.text)};border-radius:${esc(radius)};border-bottom:1px solid ${esc(sec.borderColor || "#e8e8ed")}"><div style="display:flex;align-items:center;gap:8px">${logoImg}${brandName}</div>${sec.showLinks !== false ? `<nav style="display:flex;gap:14px">${navLinks}</nav>` : ""}</header>`,
      );
    } else if (sec.type === "hero") {
      const img = sec.slides[sec.active] ?? sec.slides[0];
      parts.push(
        `<section><img src="${esc(img ?? "")}" alt="" style="width:100%;height:420px;object-fit:cover"><div style="padding:40px 28px"><p style="color:#6e6e73">${esc(sec.kicker)}</p><h1 style="font-size:44px;letter-spacing:-.03em;margin:8px 0">${esc(sec.title)}</h1><p style="max-width:36rem;color:#6e6e73">${esc(sec.body)}</p></div></section>`,
      );
    } else if (sec.type === "grid" || sec.type === "featured") {
      const cards = sec.items
        .map(
          (item) =>
            `<figure style="margin:0"><img src="${esc(item.image)}" alt="${esc(item.title)}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:18px"><figcaption style="padding-top:10px"><strong>${esc(item.title)}</strong><div style="color:#6e6e73">${esc(item.price)}</div></figcaption></figure>`,
        )
        .join("");
      parts.push(
        `<section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:18px;padding:20px 28px 40px">${cards}</section>`,
      );
    } else if (sec.type === "categories") {
      const catCards = sec.items
        .map(
          (cat) =>
            `<div style="text-align:center"><img src="${esc(cat.image)}" alt="${esc(cat.name)}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:18px"><h3 style="margin:8px 0 0;font-size:14px">${esc(cat.name)}</h3></div>`,
        )
        .join("");
      parts.push(
        `<section style="padding:28px"><h2 style="font-size:28px">${esc(sec.title)}</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin-top:16px">${catCards}</div></section>`,
      );
    } else if (sec.type === "brands") {
      const brandPills = sec.items
        .map((b) => `<span style="padding:8px 18px;background:#f5f5f7;border-radius:99px;font-weight:600">${esc(b.name)}</span>`)
        .join(" ");
      parts.push(
        `<section style="padding:28px;text-align:center"><h2 style="font-size:24px">${esc(sec.title)}</h2><div style="display:flex;gap:12px;justify-content:center;margin-top:16px">${brandPills}</div></section>`,
      );
    } else if (sec.type === "about") {
      parts.push(
        `<section style="padding:36px 28px"><p style="font-size:12px;letter-spacing:.14em;color:#6e6e73">${esc(sec.kicker)}</p><h2 style="font-size:32px;margin:8px 0">${esc(sec.title)}</h2><p style="color:#6e6e73;max-width:38rem">${esc(sec.story)}</p></section>`,
      );
    } else if (sec.type === "catalog") {
      const cards = sec.products
        .map(
          (item) =>
            `<article><img src="${esc(item.img)}" alt="${esc(item.name)}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:18px"><h3 style="margin:10px 0 0;font-size:15px">${esc(item.name)}</h3><p style="margin:4px 0;color:#6e6e73">${money(item.price)}</p></article>`,
        )
        .join("");
      parts.push(
        `<section style="padding:28px"><h2 style="font-size:32px;letter-spacing:-.03em">${esc(sec.title)}</h2><p style="color:#6e6e73">${esc(sec.subtitle)}</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:18px;margin-top:20px">${cards}</div></section>`,
      );
    } else if (sec.type === "product") {
      parts.push(
        `<section style="display:grid;grid-template-columns:1.1fr .9fr;gap:32px;padding:28px"><img src="${esc(sec.image)}" alt="${esc(sec.productName)}" style="width:100%;border-radius:24px;object-fit:cover"><div><p style="color:#6e6e73">${esc(sec.rating)}</p><h1 style="font-size:36px;letter-spacing:-.03em">${esc(sec.productName)}</h1><p style="font-size:22px">${money(sec.price)}</p><p style="color:#6e6e73">${esc(sec.description)}</p><p>Size ${esc(sec.size)}</p></div></section>`,
      );
    } else if (sec.type === "footer") {
      parts.push(
        `<footer style="padding:36px 28px;background:${esc(sec.background)};color:${esc(sec.text)};text-align:center"><strong style="letter-spacing:.14em;color:#1d1d1f">${esc(sec.brand)}</strong><p>${esc(sec.copy)}</p></footer>`,
      );
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)} · ${esc(storeName)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap">
<style>
  body{margin:0;font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;color:#1d1d1f;background:${esc(page.background)};}
  img{display:block}
  h1,h2,h3,p{font-weight:600}
  p,figcaption{font-weight:400}
</style>
</head>
<body>
${parts.join("\n")}
</body>
</html>`;
}

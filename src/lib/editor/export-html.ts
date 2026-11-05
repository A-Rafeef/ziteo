import { money } from "@/lib/editor/defaults";
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
  for (const sec of page.sections) {
    if (sec.type === "navbar") {
      parts.push(
        `<header style="display:flex;justify-content:space-between;align-items:center;padding:18px 28px;border-bottom:1px solid #e8e8ed"><strong style="letter-spacing:.14em">${esc(sec.logo)}</strong><nav>Collections · Shop · Product</nav></header>`,
      );
    } else if (sec.type === "hero") {
      const img = sec.slides[sec.active] ?? sec.slides[0];
      parts.push(
        `<section><img src="${esc(img ?? "")}" alt="" style="width:100%;height:420px;object-fit:cover"><div style="padding:40px 28px"><p style="color:#6e6e73">${esc(sec.kicker)}</p><h1 style="font-size:44px;letter-spacing:-.03em;margin:8px 0">${esc(sec.title)}</h1><p style="max-width:36rem;color:#6e6e73">${esc(sec.body)}</p></div></section>`,
      );
    } else if (sec.type === "intro") {
      parts.push(
        `<section style="padding:24px 28px 8px"><p style="color:${esc(sec.kickerColor)};letter-spacing:.14em;text-transform:uppercase;font-size:12px">${esc(sec.kicker)}</p><h2 style="font-size:32px;letter-spacing:-.03em;margin:8px 0">${esc(sec.title)}</h2><p style="color:#6e6e73">${esc(sec.body)}</p></section>`,
      );
    } else if (sec.type === "grid") {
      const cards = sec.items
        .map(
          (item) =>
            `<figure style="margin:0"><img src="${esc(item.image)}" alt="${esc(item.title)}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:18px"><figcaption style="padding-top:10px"><strong>${esc(item.title)}</strong><div style="color:#6e6e73">${esc(item.price)}</div></figcaption></figure>`,
        )
        .join("");
      parts.push(
        `<section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:18px;padding:20px 28px 40px">${cards}</section>`,
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
    } else if (sec.type === "block") {
      parts.push(
        `<section style="padding:36px 28px;text-align:center"><p style="letter-spacing:.14em;text-transform:uppercase;font-size:12px;color:#6e6e73">${esc(sec.kicker)}</p><h2>${esc(sec.title)}</h2><p style="color:#6e6e73">${esc(sec.body)}</p></section>`,
      );
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)} · ZITEO</title>
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

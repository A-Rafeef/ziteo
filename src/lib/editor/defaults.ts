import type {
  BlockSection,
  FooterSection,
  NavbarSection,
  PageModel,
  Pages,
  Product,
  Section,
} from "@/lib/editor/types";

export const PHOTOS = {
  court:
    "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1400&q=80",
  red: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=80",
  sport:
    "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1400&q=80",
  white:
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1400&q=80",
  fleece:
    "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1200&q=80",
  knit: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80",
  bag: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80",
} as const;

export const HERO_PHOTOS = [
  { name: "Air Court", url: PHOTOS.court },
  { name: "Red high", url: PHOTOS.red },
  { name: "Sport", url: PHOTOS.sport },
  { name: "White court", url: PHOTOS.white },
];

export const SWATCHES = ["#1d1d1f", "#d2d2d7", "#f5f5f7", "#0071e3"];

export const PAGE_COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Gray", value: "#f5f5f7" },
  { name: "Cloud", value: "#fbfbfd" },
  { name: "Ink", value: "#1d1d1f" },
  { name: "Black", value: "#000000" },
];

export const TEXT_COLORS = [
  { name: "Ink", value: "#1d1d1f" },
  { name: "Gray", value: "#6e6e73" },
  { name: "White", value: "#f5f5f7" },
  { name: "Blue", value: "#0071e3" },
];

export const QUOTES = [
  { text: "I forget I'm wearing them.", name: "A. Shah" },
  { text: "The only pair I pack.", name: "M. Okonkwo" },
  { text: "Quiet, then you notice the comfort.", name: "L. Berg" },
];

const products: Product[] = [
  {
    id: "p1",
    name: "Air Retro Court",
    price: 149,
    rating: 4.9,
    reviews: 142,
    img: PHOTOS.court,
    category: "Footwear",
  },
  {
    id: "p2",
    name: "Velocity Runner",
    price: 165,
    rating: 4.8,
    reviews: 88,
    img: PHOTOS.red,
    category: "Footwear",
  },
  {
    id: "p3",
    name: "Weatherproof Fleece",
    price: 129,
    rating: 5,
    reviews: 64,
    img: PHOTOS.fleece,
    category: "Apparel",
  },
  {
    id: "p4",
    name: "Merino Beanie",
    price: 95,
    rating: 4.7,
    reviews: 31,
    img: PHOTOS.knit,
    category: "Apparel",
  },
  {
    id: "p5",
    name: "Leather Carry",
    price: 110,
    rating: 4.9,
    reviews: 52,
    img: PHOTOS.bag,
    category: "Accessories",
  },
  {
    id: "p6",
    name: "Court Sport High",
    price: 175,
    rating: 4.8,
    reviews: 119,
    img: PHOTOS.sport,
    category: "Footwear",
  },
];

function navbar(): NavbarSection {
  return {
    id: "navbar",
    type: "navbar",
    name: "Navigation",
    template: "centered",
    background: "#ffffff",
    text: "#1d1d1f",
    logo: "ZITEO",
    sticky: true,
    showSearch: true,
    showCart: true,
    showMenu: true,
    showLinks: true,
    showLogo: true,
  };
}

function footer(): FooterSection {
  return {
    id: "footer",
    type: "footer",
    name: "Footer",
    template: "minimal",
    brand: "ZITEO",
    copy: "© 2026 ZITEO. All rights reserved.",
    background: "#f5f5f7",
    text: "#6e6e73",
  };
}

export function createPages(): Pages {
  return {
    home: {
      id: "home",
      title: "Home",
      path: "/",
      background: "#ffffff",
      tone: "light",
      sections: [
        navbar(),
        {
          id: "hero",
          type: "hero",
          name: "Hero",
          template: "bleed",
          background: "#ffffff",
          slides: [PHOTOS.court, PHOTOS.red, PHOTOS.sport, PHOTOS.white],
          active: 0,
          kicker: "New",
          title: "Built for every routine.",
          body: "Court-ready footwear and modular layers, tuned for the hours you actually spend in them.",
        },
        {
          id: "intro",
          type: "intro",
          name: "Intro",
          kicker: "Collections",
          title: "A quieter uniform.",
          body: "Filter by what the day asks for — movement, weather, or nothing in particular.",
          kickerColor: "#6e6e73",
          background: "#ffffff",
          text: "#1d1d1f",
        },
        {
          id: "grid",
          type: "grid",
          name: "Collections",
          template: "mosaic",
          background: "#ffffff",
          items: [
            {
              id: "p1",
              title: "Air Retro Court",
              tag: "Footwear",
              price: "$149",
              image: PHOTOS.court,
            },
            {
              id: "p2",
              title: "Velocity Runner",
              tag: "Footwear",
              price: "$165",
              image: PHOTOS.red,
            },
            {
              id: "p3",
              title: "Weatherproof Fleece",
              tag: "Apparel",
              price: "$129",
              image: PHOTOS.fleece,
            },
            {
              id: "p5",
              title: "Leather Carry",
              tag: "Accessories",
              price: "$110",
              image: PHOTOS.bag,
            },
          ],
        },
        footer(),
      ],
    },
    shop: {
      id: "shop",
      title: "Shop",
      path: "/shop",
      background: "#ffffff",
      tone: "light",
      sections: [
        navbar(),
        {
          id: "catalog",
          type: "catalog",
          name: "Catalog",
          title: "All essentials",
          subtitle: "Footwear, apparel, and the few things you carry.",
          filter: "All",
          background: "#ffffff",
          products,
        },
        footer(),
      ],
    },
    product: {
      id: "product",
      title: "Product",
      path: "/product",
      background: "#ffffff",
      tone: "light",
      sections: [
        navbar(),
        {
          id: "product-view",
          type: "product",
          name: "Product",
          productName: "Air Retro Court",
          price: 149,
          rating: "4.9 · 142 reviews",
          description:
            "Full-grain leather, a responsive foam bed, and a high-traction outsole for ordinary miles.",
          colors: [...SWATCHES],
          color: "#1d1d1f",
          sizes: ["US 8", "US 9", "US 10", "US 11", "US 12"],
          size: "US 10",
          gallery: [PHOTOS.court, PHOTOS.red, PHOTOS.sport],
          image: PHOTOS.court,
          background: "#ffffff",
        },
        footer(),
      ],
    },
  };
}

export function createBlock(kind: BlockSection["kind"]): BlockSection {
  const id = `block-${Date.now()}`;
  if (kind === "reviews") {
    return {
      id,
      type: "block",
      name: "Reviews",
      kind,
      kicker: "Reviews",
      title: "Quietly praised.",
      body: "Comfort that disappears once you start walking.",
      background: "#ffffff",
      text: "#1d1d1f",
    };
  }
  return {
    id,
    type: "block",
    name: "Newsletter",
    kind,
    kicker: "Notes",
    title: "First look at new drops.",
    body: "A short note, a few times a season.",
    background: "#ffffff",
    text: "#1d1d1f",
  };
}

export function isDark(hex: string) {
  const h = hex.replace("#", "").slice(0, 6);
  if (h.length < 6) return false;
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return false;
  return (r * 299 + g * 587 + b * 114) / 1000 < 145;
}

export function paintTheme(page: PageModel, theme: "light" | "ink"): PageModel {
  const dark = theme === "ink";
  const bg = dark ? "#1d1d1f" : "#ffffff";
  const soft = dark ? "#000000" : "#f5f5f7";
  const text = dark ? "#f5f5f7" : "#1d1d1f";
  const muted = dark ? "#a1a1a6" : "#6e6e73";
  const sections: Section[] = page.sections.map((sec) => {
    switch (sec.type) {
      case "navbar":
        return {
          ...sec,
          template: dark ? "float" : "centered",
          background: dark ? "#000000" : "#ffffff",
          text,
        };
      case "hero":
        return { ...sec, template: dark ? "split" : "bleed", background: bg };
      case "intro":
        return { ...sec, background: bg, text, kickerColor: muted };
      case "grid":
      case "catalog":
      case "product":
        return { ...sec, background: bg };
      case "footer":
        return { ...sec, background: soft, text: muted, template: dark ? "columns" : "minimal" };
      case "block":
        return { ...sec, background: bg, text };
      default: {
        const never: never = sec;
        return never;
      }
    }
  });
  return {
    ...page,
    background: bg,
    tone: dark ? "dark" : "light",
    sections,
  };
}

export function money(n: number) {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

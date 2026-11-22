import type {
  AboutSection,
  BrandsSection,
  CatalogSection,
  CategoriesSection,
  FeaturedSection,
  FilterSortSection,
  FooterSection,
  HeroSection,
  NavbarSection,
  PageModel,
  Pages,
  Product,
  ProductSection,
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

export const products: Product[] = [
  {
    id: "p1",
    name: "Air Retro Court",
    price: 149,
    regularPrice: 199,
    salePrice: 149,
    discountPercentage: 25,
    stock: 15,
    brand: "Nike",
    category: "Footwear",
    description:
      "Crafted with full-grain leather, a responsive foam bed, and high-traction rubber outsole engineered for court durability and daily comfort.",
    badge: "SALE",
    img: PHOTOS.court,
    gallery: [PHOTOS.court, PHOTOS.red, PHOTOS.sport, PHOTOS.white],
    variants: [
      {
        id: "color",
        name: "Color",
        options: [
          { id: "c1", label: "Midnight Black", colorHex: "#18181b", stock: 8 },
          { id: "c2", label: "Crimson Red", colorHex: "#dc2626", stock: 5 },
          { id: "c3", label: "Pure White", colorHex: "#ffffff", stock: 2 },
        ],
      },
      {
        id: "size",
        name: "Size",
        options: [
          { id: "s1", label: "UK 7", stock: 3 },
          { id: "s2", label: "UK 8", stock: 6 },
          { id: "s3", label: "UK 9", stock: 4 },
          { id: "s4", label: "UK 10", priceDelta: 10, stock: 2 },
          { id: "s5", label: "UK 11", priceDelta: 10, stock: 0 },
        ],
      },
    ],
  },
  {
    id: "p2",
    name: "Velocity Runner",
    price: 165,
    regularPrice: 195,
    salePrice: 165,
    discountPercentage: 15,
    stock: 8,
    brand: "Adidas",
    category: "Footwear",
    description:
      "Ultralight breathable mesh runner with adaptive energy-return cushioning and stabilizing heel geometry for maximum road speed.",
    badge: "NEW",
    img: PHOTOS.red,
    gallery: [PHOTOS.red, PHOTOS.court, PHOTOS.sport],
    variants: [
      {
        id: "color",
        name: "Color",
        options: [
          { id: "c1", label: "Infrared", colorHex: "#ef4444", stock: 5 },
          { id: "c2", label: "Stealth Black", colorHex: "#0f172a", stock: 3 },
        ],
      },
      {
        id: "size",
        name: "Size",
        options: [
          { id: "s1", label: "UK 7", stock: 2 },
          { id: "s2", label: "UK 8", stock: 4 },
          { id: "s3", label: "UK 9", stock: 2 },
          { id: "s4", label: "UK 10", stock: 0 },
        ],
      },
    ],
  },
  {
    id: "p3",
    name: "Weatherproof Fleece",
    price: 129,
    regularPrice: 159,
    salePrice: 129,
    discountPercentage: 19,
    stock: 12,
    brand: "Ziteo Outerwear",
    category: "Apparel",
    description:
      "DWR-coated recycled high-loft fleece jacket with wind-blocking chest panels and reinforced YKK zipped utility pockets.",
    badge: "HOT",
    img: PHOTOS.fleece,
    gallery: [PHOTOS.fleece, PHOTOS.knit, PHOTOS.bag],
    variants: [
      {
        id: "color",
        name: "Color",
        options: [
          { id: "c1", label: "Forest Olive", colorHex: "#3f4f38", stock: 6 },
          { id: "c2", label: "Charcoal Heather", colorHex: "#374151", stock: 6 },
        ],
      },
      {
        id: "size",
        name: "Size",
        options: [
          { id: "s1", label: "S", stock: 3 },
          { id: "s2", label: "M", stock: 5 },
          { id: "s3", label: "L", stock: 4 },
          { id: "s4", label: "XL", priceDelta: 10, stock: 0 },
        ],
      },
    ],
  },
  {
    id: "p4",
    name: "Merino Beanie",
    price: 75,
    regularPrice: 95,
    salePrice: 75,
    discountPercentage: 21,
    stock: 20,
    brand: "Ziteo Studio",
    category: "Accessories",
    description:
      "100% superfine Australian merino wool knit rib beanie. Naturally thermoregulating, odor-resistant, and itch-free comfort.",
    badge: "SALE",
    img: PHOTOS.knit,
    gallery: [PHOTOS.knit, PHOTOS.bag, PHOTOS.court],
    variants: [
      {
        id: "color",
        name: "Color",
        options: [
          { id: "c1", label: "Oatmeal Melange", colorHex: "#d6cebe", stock: 10 },
          { id: "c2", label: "Deep Navy", colorHex: "#1e293b", stock: 10 },
        ],
      },
      {
        id: "size",
        name: "Size",
        options: [{ id: "s1", label: "One Size", stock: 20 }],
      },
    ],
  },
  {
    id: "p5",
    name: "Leather Carry",
    price: 110,
    regularPrice: 140,
    salePrice: 110,
    discountPercentage: 21,
    stock: 4,
    brand: "Ziteo Leathercraft",
    category: "Accessories",
    description:
      "Hand-burnished vegetable tanned leather everyday tote with solid brass hardware, laptop sleeve, and water-resistant lining.",
    badge: "HOT",
    img: PHOTOS.bag,
    gallery: [PHOTOS.bag, PHOTOS.knit, PHOTOS.fleece],
    variants: [
      {
        id: "color",
        name: "Color",
        options: [
          { id: "c1", label: "Saddle Tan", colorHex: "#92400e", stock: 3 },
          { id: "c2", label: "Noir", colorHex: "#18181b", stock: 1 },
        ],
      },
    ],
  },
  {
    id: "p6",
    name: "Court Sport High",
    price: 175,
    regularPrice: 210,
    salePrice: 175,
    discountPercentage: 17,
    stock: 6,
    brand: "Nike",
    category: "Footwear",
    description:
      "High-top basketball heritage sneaker with padded ankle collar, responsive Air unit, and retro leather overlays.",
    badge: "NEW",
    img: PHOTOS.sport,
    gallery: [PHOTOS.sport, PHOTOS.white, PHOTOS.court],
    variants: [
      {
        id: "color",
        name: "Color",
        options: [
          { id: "c1", label: "Royal Blue & White", colorHex: "#1d4ed8", stock: 4 },
          { id: "c2", label: "Triple White", colorHex: "#ffffff", stock: 2 },
        ],
      },
      {
        id: "size",
        name: "Size",
        options: [
          { id: "s1", label: "UK 8", stock: 2 },
          { id: "s2", label: "UK 9", stock: 3 },
          { id: "s3", label: "UK 10", priceDelta: 15, stock: 1 },
        ],
      },
    ],
  },
];

export function navbar(): NavbarSection {
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
    showCart: false,
    showMenu: true,
    showLinks: true,
    showLogo: true,
  };
}

export function footer(): FooterSection {
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

export function createHeroSection(id = `hero-${Date.now()}`): HeroSection {
  return {
    id,
    type: "hero",
    name: "Hero",
    template: "bleed",
    ratio: "16:9",
    background: "transparent",
    slides: [PHOTOS.court, PHOTOS.red, PHOTOS.sport, PHOTOS.white],
    active: 0,
    kicker: "New Release",
    title: "Engineered for movement.",
    body: "Minimalist silhouettes and all-day comfort. Direct WhatsApp orders with instant confirmation.",
    widthMode: "full",
    paddingY: "none",
    borderRadius: 0,
    animationEffect: "slide",
    autoplay: true,
  };
}

export function createFeaturedSection(id = `featured-${Date.now()}`): FeaturedSection {
  return {
    id,
    type: "featured",
    name: "Featured Products",
    title: "Featured Drops",
    subtitle: "Our most requested silhouettes, ready to ship.",
    background: "#ffffff",
    template: "grid",
    imageRatio: "1:1",
    borderRadius: 16,
    typography: "base",
    borderEnabled: true,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowEnabled: false,
    shadowStyle: "soft",
    cardBackground: "#ffffff",
    imageInset: false,
    imageRadius: 16,
    detailsLayout: "outer",
    textAlign: "left",
    showBadge: true,
    showRating: false,
    showPrice: true,
    showButton: true,
    whatsappNumber: "919876543210",
    priceColor: "#059669",
    buttonColor: "#25D366",
    items: [
      {
        id: "p1",
        title: "Air Retro Court",
        tag: "Footwear",
        price: "$149",
        regularPrice: 199,
        salePrice: 149,
        discountPercentage: 25,
        stock: 15,
        brand: "Nike",
        category: "Footwear",
        image: PHOTOS.court,
        gallery: [PHOTOS.court, PHOTOS.red, PHOTOS.sport, PHOTOS.white],
        badge: "SALE",
        variants: products[0].variants,
        description: products[0].description,
      },
      {
        id: "p2",
        title: "Velocity Runner",
        tag: "Footwear",
        price: "$165",
        regularPrice: 195,
        salePrice: 165,
        discountPercentage: 15,
        stock: 8,
        brand: "Adidas",
        category: "Footwear",
        image: PHOTOS.red,
        gallery: [PHOTOS.red, PHOTOS.court, PHOTOS.sport],
        badge: "NEW",
        variants: products[1].variants,
        description: products[1].description,
      },
      {
        id: "p6",
        title: "Court Sport High",
        tag: "Footwear",
        price: "$175",
        regularPrice: 210,
        salePrice: 175,
        discountPercentage: 17,
        stock: 6,
        brand: "Nike",
        category: "Footwear",
        image: PHOTOS.sport,
        gallery: [PHOTOS.sport, PHOTOS.white, PHOTOS.court],
        badge: "HOT",
        variants: products[5].variants,
        description: products[5].description,
      },
      {
        id: "p5",
        title: "Leather Carry",
        tag: "Accessories",
        price: "$110",
        regularPrice: 140,
        salePrice: 110,
        discountPercentage: 21,
        stock: 4,
        brand: "Ziteo Leathercraft",
        category: "Accessories",
        image: PHOTOS.bag,
        gallery: [PHOTOS.bag, PHOTOS.knit, PHOTOS.fleece],
        variants: products[4].variants,
        description: products[4].description,
      },
    ],
  };
}

export function createCategoriesSection(id = `categories-${Date.now()}`): CategoriesSection {
  return {
    id,
    type: "categories",
    name: "Categories",
    title: "Shop by Category",
    subtitle: "Find exactly what your routine needs.",
    background: "#ffffff",
    template: "cards",
    items: [
      {
        id: "cat-1",
        name: "Footwear",
        image: PHOTOS.court,
        count: "24 items",
      },
      {
        id: "cat-2",
        name: "Apparel",
        image: PHOTOS.fleece,
        count: "18 items",
      },
      {
        id: "cat-3",
        name: "Accessories",
        image: PHOTOS.bag,
        count: "12 items",
      },
      {
        id: "cat-4",
        name: "Headwear",
        image: PHOTOS.knit,
        count: "8 items",
      },
    ],
  };
}

export function createBrandsSection(id = `brands-${Date.now()}`): BrandsSection {
  return {
    id,
    type: "brands",
    name: "Brands",
    title: "Curated Brands",
    subtitle: "Authorized stockist for global innovators.",
    background: "#ffffff",
    template: "row",
    items: [
      { id: "b1", name: "NIKE", tagline: "Performance & Innovation" },
      { id: "b2", name: "ADIDAS", tagline: "Originals & Speed" },
      { id: "b3", name: "NEW BALANCE", tagline: "Boston Craftsmanship" },
      { id: "b4", name: "SALOMON", tagline: "Technical Trailwear" },
      { id: "b5", name: "ASICS", tagline: "Sound Body & Mind" },
      { id: "b6", name: "PUMA", tagline: "Forever Faster" },
    ],
  };
}

export function createAboutSection(id = `about-${Date.now()}`): AboutSection {
  return {
    id,
    type: "about",
    name: "About",
    kicker: "OUR PHILOSOPHY",
    title: "Essential uniforms for ordinary days.",
    story: "Founded with a commitment to uncompromised craftsmanship, Ziteo delivers footwear and modular garments made to outlast seasons and trends. Direct support and bespoke sizing right on WhatsApp.",
    image: PHOTOS.sport,
    background: "#ffffff",
    text: "#1d1d1f",
    template: "split",
    features: [
      {
        id: "f1",
        title: "100% Certified Authentic",
        description: "Direct distribution partnerships with verified source authenticity.",
      },
      {
        id: "f2",
        title: "WhatsApp Personal Care",
        description: "Instant sizing advice, real photographs, and human order tracking.",
      },
      {
        id: "f3",
        title: "Express Dispatch",
        description: "Secure packaging dispatched within 24 hours of confirmation.",
      },
    ],
  };
}

export function createCatalogSection(id = `catalog-${Date.now()}`): CatalogSection {
  return {
    id,
    type: "catalog",
    name: "Catalog Grid",
    title: "",
    subtitle: "",
    filter: "All",
    background: "#ffffff",
    template: "grid",
    imageRatio: "1:1",
    borderRadius: 16,
    typography: "base",
    borderEnabled: true,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowEnabled: false,
    shadowStyle: "soft",
    cardBackground: "#ffffff",
    imageInset: false,
    imageRadius: 16,
    detailsLayout: "outer",
    textAlign: "left",
    showBadge: true,
    showRating: false,
    showPrice: true,
    showButton: true,
    whatsappNumber: "919876543210",
    priceColor: "#059669",
    buttonColor: "#25D366",
    sortConfig: {
      enabled: true,
      defaultSort: "featured",
      allowedSorts: ["featured", "price_asc", "price_desc", "discount_desc", "newest", "name_asc"],
    },
    filterConfig: {
      showCategories: true,
      showBrands: true,
      showPrice: true,
      showStock: true,
      autoHideOutOfStock: false,
    },
    layoutConfig: {
      style: "hybrid",
      sticky: true,
      showItemCount: true,
    },
    products,
  };
}

export function createFilterSortSection(id = `filter-sort-${Date.now()}`): FilterSortSection {
  return {
    id,
    type: "filter-sort",
    name: "Filter & Sort Grid",
    background: "#ffffff",
    sortConfig: {
      enabled: true,
      defaultSort: "featured",
      allowedSorts: ["featured", "price_asc", "price_desc", "discount_desc", "newest", "name_asc"],
    },
    filterConfig: {
      showCategories: true,
      showBrands: true,
      showPrice: true,
      showStock: true,
      autoHideOutOfStock: false,
    },
    layoutConfig: {
      style: "hybrid",
      sticky: true,
      showItemCount: true,
    },
  };
}

export function createProductSection(id = `product-view-${Date.now()}`): ProductSection {
  const p1 = products[0];
  return {
    id,
    type: "product",
    name: "Product Details",
    productName: p1.name,
    price: p1.price,
    regularPrice: p1.regularPrice,
    salePrice: p1.salePrice,
    discountPercentage: p1.discountPercentage,
    stock: p1.stock,
    brand: p1.brand,
    category: p1.category as string,
    rating: "4.9 · 142 reviews",
    description:
      p1.description ||
      "Crafted with full-grain leather, a responsive foam bed, and high-traction rubber outsole engineered for court durability and daily comfort.",
    colors: [...SWATCHES],
    color: "#18181b",
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    size: "UK 8",
    gallery: p1.gallery || [PHOTOS.court, PHOTOS.red, PHOTOS.sport, PHOTOS.white],
    image: p1.img,
    background: "#ffffff",
    template: "stacked",
    imageRatio: "1:1",
    typography: "base",
    showBadge: true,
    showRating: false,
    whatsappNumber: "919876543210",
    variants: p1.variants,
    activeProduct: p1,
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
          name: "Hero Banner",
          template: "bleed",
          background: "transparent",
          slides: [PHOTOS.court, PHOTOS.red, PHOTOS.sport, PHOTOS.white],
          active: 0,
          kicker: "New",
          title: "Built for every routine.",
          body: "Court-ready footwear and modular layers, tuned for the hours you actually spend in them.",
          widthMode: "full",
          paddingY: "none",
          borderRadius: 0,
          animationEffect: "slide",
          autoplay: true,
        },
        createCategoriesSection("categories"),
        createFeaturedSection("featured"),
        createBrandsSection("brands"),
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
        createFilterSortSection("shop-filter-sort"),
        createCatalogSection("catalog"),
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
        createProductSection("product-view"),
        {
          ...createFeaturedSection("product-related"),
          id: "product-related",
          name: "Related Products",
          title: "You May Also Like",
          subtitle: "Pair it with these handpicked essentials.",
        },
        {
          ...createAboutSection("product-guarantees"),
          id: "product-guarantees",
          name: "Guarantees",
          kicker: "AUTHENTICITY & CARE",
          title: "Crafted for longevity.",
        },
        footer(),
      ],
    },
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
      case "grid":
      case "featured":
      case "categories":
      case "brands":
      case "catalog":
      case "filter-sort":
      case "product":
        return { ...sec, background: bg };
      case "about":
        return { ...sec, background: bg, text };
      case "footer":
        return { ...sec, background: soft, text: muted, template: dark ? "columns" : "minimal" };
      case "product-card":
        return sec;
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

export function money(n: number, currency = "$") {
  const formatted = Number.isInteger(n) ? `${n}` : n.toFixed(2);
  const cur = currency || "$";
  if (cur.length > 1 && !["₹", "$", "€", "£", "¥"].includes(cur)) {
    return `${cur} ${formatted}`;
  }
  return `${cur}${formatted}`;
}

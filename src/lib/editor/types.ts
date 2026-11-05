export type PageId = "home" | "shop" | "product";
export type Device = "mobile" | "tablet" | "desktop";
export type Tone = "light" | "dark";
export type Category = "Footwear" | "Apparel" | "Accessories";
export type CatalogFilter = "All" | Category;

export type NavbarTemplate = "centered" | "left" | "minimal" | "float";
export type HeroTemplate = "bleed" | "split";
export type HeroRatio = "16:9" | "21:9" | "4:3" | "3:2" | "1:1";
export type GridTemplate = "mosaic" | "editorial";
export type FooterTemplate = "minimal" | "columns";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  img: string;
}

export interface GridItem {
  id: string;
  title: string;
  tag: string;
  price: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  img: string;
  category: Category;
}

export interface NavbarSection {
  id: string;
  type: "navbar";
  name: string;
  template: NavbarTemplate;
  background: string;
  text: string;
  logo: string;
  sticky?: boolean;
  showSearch?: boolean;
  showCart?: boolean;
  showMenu?: boolean;
  showLinks?: boolean;
  showLogo?: boolean;
}

export interface HeroSection {
  id: string;
  type: "hero";
  name: string;
  template: HeroTemplate;
  ratio?: HeroRatio;
  background: string;
  slides: string[];
  active: number;
  kicker: string;
  title: string;
  body: string;
}

export interface IntroSection {
  id: string;
  type: "intro";
  name: string;
  kicker: string;
  title: string;
  body: string;
  kickerColor: string;
  background: string;
  text: string;
  template?: "standard" | "centered";
}

export interface GridSection {
  id: string;
  type: "grid";
  name: string;
  template: GridTemplate;
  background: string;
  items: GridItem[];
}

export interface CatalogSection {
  id: string;
  type: "catalog";
  name: string;
  title: string;
  subtitle: string;
  filter: CatalogFilter;
  background: string;
  products: Product[];
  template?: "grid" | "list";
}

export interface ProductSection {
  id: string;
  type: "product";
  name: string;
  productName: string;
  price: number;
  rating: string;
  description: string;
  colors: string[];
  color: string;
  sizes: string[];
  size: string;
  gallery: string[];
  image: string;
  background: string;
  template?: "stacked" | "split";
}

export interface FooterSection {
  id: string;
  type: "footer";
  name: string;
  template: FooterTemplate;
  brand: string;
  copy: string;
  background: string;
  text: string;
}

export interface BlockSection {
  id: string;
  type: "block";
  name: string;
  kind: "reviews" | "newsletter";
  kicker: string;
  title: string;
  body: string;
  background: string;
  text: string;
  template?: "card" | "minimal";
}

export type Section =
  | NavbarSection
  | HeroSection
  | IntroSection
  | GridSection
  | CatalogSection
  | ProductSection
  | FooterSection
  | BlockSection;

export interface PageModel {
  id: PageId;
  title: string;
  path: string;
  background: string;
  tone: Tone;
  sections: Section[];
}

export type Pages = Record<PageId, PageModel>;

export type SheetKind =
  | "themes"
  | "add"
  | "page-color"
  | "navbar-style"
  | "navbar-name"
  | "navbar-color"
  | "navbar-sticky"
  | "navbar-elements"
  | "hero-layout"
  | "hero-photo"
  | "hero-text"
  | "intro-text"
  | "kicker-color"
  | "grid-layout"
  | "grid-items"
  | "catalog-text"
  | "product-text"
  | "footer-style"
  | "block-text"
  | "section-color"
  | "intro-template"
  | "catalog-template"
  | "product-template"
  | "block-template";

export interface Snapshot {
  pages: Pages;
  pageId: PageId;
}

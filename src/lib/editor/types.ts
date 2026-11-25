export type PageId = "home" | "shop" | "product";
export type Device = "mobile" | "tablet" | "desktop";
export type Tone = "light" | "dark";
export type Category = "Footwear" | "Apparel" | "Accessories";
export type CatalogFilter = "All" | Category;

export type NavbarTemplate = "centered" | "left" | "minimal" | "float" | "expanded";
export type HeroTemplate = "bleed" | "split";
export type HeroRatio = "16:9" | "21:9" | "4:3" | "3:2" | "1:1" | "auto";
export type HeroWidth = "full" | "gap-sm" | "gap-md" | "gap-lg";
export type HeroPadding = "none" | "sm" | "md" | "lg";
export type HeroAnimation = "slide" | "fade" | "zoom" | "none";
export type GridTemplate = "mosaic" | "editorial";
export type FooterTemplate = "minimal" | "columns";

export type ProductImageRatio = "1:1" | "3:4" | "16:9";
export type ProductTypography = "sm" | "base" | "lg";
export type ProductCardShadow = "none" | "soft" | "smooth" | "float" | "deep";
export type ProductCardDetailsLayout = "outer" | "inner";
export type ProductCardTextAlign = "left" | "center";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  img: string;
}

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface VariantOption {
  id: string;
  label: string;
  colorHex?: string; // hex code for visual color swatches, e.g. "#18181b", "#EF4444"
  priceDelta?: number; // additional price delta for this option (+100, 0, etc.)
  stock: number; // exact stock count (e.g. 5, 2, 0)
}

export interface VariantGroup {
  id: string;
  name: "Color" | "Size" | "Material" | "Storage" | string;
  options: VariantOption[];
}

export interface GridItem {
  id: string;
  title: string;
  tag?: string;
  price: string;
  regularPrice?: number;
  salePrice?: number;
  discountPercentage?: number;
  stock?: number;
  brand?: string;
  category?: string;
  description?: string;
  image: string;
  hoverImage?: string;
  gallery?: string[];
  variants?: VariantGroup[];
  badge?: "NEW" | "SALE" | "HOT" | "TRENDING";
}

export interface Product {
  id: string;
  name: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  discountPercentage?: number;
  stock?: number;
  description?: string;
  category: Category | string;
  brand?: string;
  gallery?: string[];
  img: string;
  variants?: VariantGroup[];
  badge?: "NEW" | "SALE" | "HOT" | "TRENDING";
  rating?: number;
  reviews?: number;
  originalPrice?: number;
}

export interface NavbarLink {
  id: string;
  label: string;
  url: string;
  visible?: boolean;
}

export interface NavbarSection {
  id: string;
  type: "navbar";
  name: string;
  template: NavbarTemplate;
  background: string;
  backgroundOpacity?: number;
  text: string;
  linkColor?: string;
  iconColor?: string;
  logo: string;
  logoImage?: string;
  sticky?: boolean;
  showSearch?: boolean;
  showCart?: boolean;
  showWhatsapp?: boolean;
  whatsappNumber?: string;
  showMenu?: boolean;
  showLinks?: boolean;
  showLogo?: boolean;
  showBrandName?: boolean;
  isFloating?: boolean;
  height?: number;
  borderRadius?: number;
  borderStyle?: "none" | "solid" | "subtle";
  borderColor?: string;
  shadow?: "none" | "subtle" | "float" | "glass";
  backdropBlur?: boolean;
  fontSize?: "sm" | "base" | "lg" | "xl";
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  letterSpacing?: "tight" | "normal" | "wide" | "widest";
  uppercase?: boolean;
  links?: NavbarLink[];
}

export interface HeroSection {
  id: string;
  type: "hero";
  name: string;
  hidden?: boolean;
  template: HeroTemplate;
  ratio?: HeroRatio;
  background: string;
  slides: string[];
  slideLinks?: string[];
  slideFocalPoints?: string[];
  slideFits?: ("cover" | "contain")[];
  active: number;
  kicker: string;
  title: string;
  body: string;
  widthMode?: HeroWidth;
  paddingY?: HeroPadding;
  paddingX?: HeroPadding;
  borderRadius?: number;
  animationEffect?: HeroAnimation;
  autoplay?: boolean;
  autoplaySpeed?: number;
}

export interface GridSection {
  id: string;
  type: "grid";
  name: string;
  hidden?: boolean;
  template: GridTemplate;
  background: string;
  items: GridItem[];
  imageRatio?: ProductImageRatio;
  borderRadius?: number;
  typography?: ProductTypography;
  borderEnabled?: boolean;
  borderWidth?: number;
  borderColor?: string;
  shadowEnabled?: boolean;
  shadowStyle?: ProductCardShadow;
  cardBackground?: string;
  imageInset?: boolean;
  imageRadius?: number;
  detailsLayout?: ProductCardDetailsLayout;
  textAlign?: ProductCardTextAlign;
  showBadge?: boolean;
  showRating?: boolean;
  showPrice?: boolean;
  showButton?: boolean;
  showBrand?: boolean;
  showDiscountBadge?: boolean;
  showStockStatus?: boolean;
  whatsappNumber?: string;
  currency?: string;
  priceColor?: string;
  buttonColor?: string;
}

export interface FeaturedSection {
  id: string;
  type: "featured";
  name: string;
  hidden?: boolean;
  title: string;
  subtitle: string;
  background: string;
  template: "grid" | "carousel";
  imageRatio?: ProductImageRatio;
  borderRadius?: number;
  typography?: ProductTypography;
  borderEnabled?: boolean;
  borderWidth?: number;
  borderColor?: string;
  shadowEnabled?: boolean;
  shadowStyle?: ProductCardShadow;
  cardBackground?: string;
  imageInset?: boolean;
  imageRadius?: number;
  detailsLayout?: ProductCardDetailsLayout;
  textAlign?: ProductCardTextAlign;
  showBadge?: boolean;
  showRating?: boolean;
  showPrice?: boolean;
  showButton?: boolean;
  showBrand?: boolean;
  showDiscountBadge?: boolean;
  showStockStatus?: boolean;
  whatsappNumber?: string;
  currency?: string;
  priceColor?: string;
  buttonColor?: string;
  items: GridItem[];
}

export interface CategoryItem {
  id: string;
  name: string;
  image: string;
  count?: string;
}

export interface CategoriesSection {
  id: string;
  type: "categories";
  name: string;
  hidden?: boolean;
  title: string;
  subtitle?: string;
  background: string;
  template: "cards" | "pills" | "grid" | "story";
  items: CategoryItem[];
}

export type BrandTemplate = "marquee" | "grid" | "editorial" | "story" | "row";
export type BrandSpeed = "slow" | "normal" | "fast";
export type BrandDirection = "left" | "right";
export type BrandColorFilter = "monochrome" | "original" | "inverted";

export interface BrandItem {
  id: string;
  name: string;
  tagline?: string;
  logoUrl?: string;
  image?: string;
  buttonText?: string;
}

export interface BrandsSection {
  id: string;
  type: "brands";
  name: string;
  hidden?: boolean;
  title: string;
  subtitle?: string;
  trustBadge?: string;
  background: string;
  template: BrandTemplate;
  marqueeSpeed?: BrandSpeed;
  marqueeDirection?: BrandDirection;
  pauseOnHover?: boolean;
  colorFilter?: BrandColorFilter;
  edgeFade?: boolean;
  columns?: 2 | 3 | 4 | 6;
  items: BrandItem[];
}

export interface AboutFeature {
  id: string;
  title: string;
  description: string;
}

export interface AboutSection {
  id: string;
  type: "about";
  name: string;
  hidden?: boolean;
  kicker: string;
  title: string;
  story: string;
  image: string;
  features: AboutFeature[];
  background: string;
  text: string;
  template: "split" | "story" | "cards";
}

export type CatalogSortOption =
  | "featured"
  | "price_asc"
  | "price_desc"
  | "discount_desc"
  | "newest"
  | "name_asc";

export type CatalogFilterStyle = "hybrid" | "minimal" | "pills_only";

export interface CatalogSortConfig {
  enabled: boolean;
  defaultSort: CatalogSortOption;
  allowedSorts: CatalogSortOption[];
}

export interface CatalogFilterConfig {
  showCategories: boolean;
  showBrands: boolean;
  showPrice: boolean;
  showStock: boolean;
  showSizes?: boolean;
  showColors?: boolean;
  autoHideOutOfStock?: boolean;
  customCategories?: string[];
}

export interface CatalogLayoutConfig {
  style: CatalogFilterStyle;
  sticky: boolean;
  showItemCount: boolean;
}

export interface CatalogSection {
  id: string;
  type: "catalog";
  name: string;
  hidden?: boolean;
  title: string;
  subtitle: string;
  filter: CatalogFilter;
  background: string;
  products: Product[];
  template?: "grid" | "list";
  imageRatio?: ProductImageRatio;
  borderRadius?: number;
  typography?: ProductTypography;
  borderEnabled?: boolean;
  borderWidth?: number;
  borderColor?: string;
  shadowEnabled?: boolean;
  shadowStyle?: ProductCardShadow;
  cardBackground?: string;
  imageInset?: boolean;
  imageRadius?: number;
  detailsLayout?: ProductCardDetailsLayout;
  textAlign?: ProductCardTextAlign;
  showBadge?: boolean;
  showRating?: boolean;
  showPrice?: boolean;
  showButton?: boolean;
  showBrand?: boolean;
  showDiscountBadge?: boolean;
  showStockStatus?: boolean;
  whatsappNumber?: string;
  currency?: string;
  priceColor?: string;
  buttonColor?: string;
  sortConfig?: CatalogSortConfig;
  filterConfig?: CatalogFilterConfig;
  layoutConfig?: CatalogLayoutConfig;
}

export interface ProductSection {
  id: string;
  type: "product";
  name: string;
  hidden?: boolean;
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
  template?: "stacked" | "split" | "grid";
  imageRatio?: ProductImageRatio;
  typography?: ProductTypography;
  borderRadius?: number;
  galleryStyle?: "strip" | "dots" | "grid";
  showBadge?: boolean;
  badgeText?: string;
  showRating?: boolean;
  showDescription?: boolean;
  showColors?: boolean;
  showSizes?: boolean;
  showTrustBadges?: boolean;
  whatsappNumber?: string;
  currency?: string;
  buttonText?: string;
  buttonColor?: string;
  stickyButton?: boolean;
  priceColor?: string;
  titleFontSize?: "sm" | "base" | "lg" | "xl";
  titleFontWeight?: "normal" | "medium" | "semibold" | "bold";
  regularPrice?: number;
  salePrice?: number;
  discountPercentage?: number;
  stock?: number;
  brand?: string;
  category?: string;
  variants?: VariantGroup[];
  activeProduct?: Product;
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

export interface ProductCardSection {
  id: "product-card";
  type: "product-card";
  name: "Product Card";
  imageRatio?: ProductImageRatio;
  borderRadius?: number;
  typography?: ProductTypography;
  borderEnabled?: boolean;
  borderWidth?: number;
  borderColor?: string;
  shadowEnabled?: boolean;
  shadowStyle?: ProductCardShadow;
  cardBackground?: string;
  imageInset?: boolean;
  imageRadius?: number;
  detailsLayout?: ProductCardDetailsLayout;
  textAlign?: ProductCardTextAlign;
  showBadge?: boolean;
  showRating?: boolean;
  showPrice?: boolean;
  showButton?: boolean;
  showBrand?: boolean;
  showDiscountBadge?: boolean;
  showStockStatus?: boolean;
  whatsappNumber?: string;
  currency?: string;
  priceColor?: string;
  buttonColor?: string;
}

export interface FilterSortSection {
  id: string;
  type: "filter-sort";
  name: string;
  hidden?: boolean;
  background: string;
  sortConfig?: CatalogSortConfig;
  filterConfig?: CatalogFilterConfig;
  layoutConfig?: CatalogLayoutConfig;
}

export interface CatalogFilterState {
  activeSort: CatalogSortOption;
  activeCategory: string;
  selectedBrands: string[];
  priceBracket: "all" | "under_100" | "100_150" | "above_150";
  inStockOnly: boolean;
}

export type Section =
  | NavbarSection
  | HeroSection
  | GridSection
  | FeaturedSection
  | CategoriesSection
  | BrandsSection
  | AboutSection
  | CatalogSection
  | FilterSortSection
  | ProductSection
  | FooterSection
  | ProductCardSection;

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
  | "arrange"
  | "themes"
  | "add"
  | "page-color"
  | "hero-layout"
  | "hero-width"
  | "hero-background"
  | "hero-ratio"
  | "hero-padding"
  | "hero-radius"
  | "hero-animation"
  | "hero-media"
  | "hero-link"
  | "hero-appearance"
  | "hero-photo"
  | "hero-text"
  | "grid-layout"
  | "grid-items"
  | "catalog-text"
  | "product-text"
  | "footer-style"
  | "section-color"
  | "catalog-template"
  | "catalog-filter-sort"
  | "product-template"
  | "product-gallery"
  | "product-elements"
  | "product-cta"
  | "product-color"
  | "product-typography"
  | "product-card-box"
  | "product-card-image"
  | "product-card-details"
  | "product-card-style"
  | "product-card-badges"
  | "product-card-color"
  | "product-card-cta"
  | "categories-template"
  | "brands-template"
  | "brands-style"
  | "brands-items"
  | "about-template"
  | "featured-template";

export interface Snapshot {
  pages: Pages;
  pageId: PageId;
}

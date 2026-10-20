import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const stores = sqliteTable("stores", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  slug: text("slug").notNull(),
  data: text("data").notNull(),
  published: integer("published").notNull().default(0),
  createdAt: text("created_at").notNull(),
}, (t) => [uniqueIndex("stores_owner_unique").on(t.ownerId), uniqueIndex("stores_slug_unique").on(t.slug)]);

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  shortId: text("short_id").notNull(),
  storeId: text("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  data: text("data").notNull(),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
  archivedAt: text("archived_at"),
}, (t) => [uniqueIndex("products_short_id_unique").on(t.shortId), index("products_store_status").on(t.storeId, t.status), index("products_created_at").on(t.createdAt)]);

export const dailyMetrics = sqliteTable("daily_metrics", {
  storeId: text("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  storeViews: integer("store_views").notNull().default(0),
  productViews: integer("product_views").notNull().default(0),
  whatsappClicks: integer("whatsapp_clicks").notNull().default(0),
}, (t) => [primaryKey({ columns: [t.storeId, t.date] })]);

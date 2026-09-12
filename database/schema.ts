import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  doublePrecision,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

// 1. Users Table (Authentication)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("cashier"), // 'admin' | 'cashier'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Consoles Table (Clean relational entity)
export const consoles = pgTable("consoles", {
  id: integer("id").primaryKey(), // Keep numeric ID to match frontend (1, 2, 3...)
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'PS4' | 'PS5' | 'Xbox' | 'VIP'
  status: varchar("status", { length: 20 }).notNull().default("available"), // 'available' | 'occupied' | 'paused' | 'maintenance' | 'reserved'
  dailyTotal: doublePrecision("daily_total").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3. Console Sessions Table (Relational replacement for jsonb session)
export const consoleSessions = pgTable("console_sessions", {
  id: serial("id").primaryKey(),
  consoleId: integer("console_id")
    .notNull()
    .references(() => consoles.id, { onDelete: "cascade" }),
  mode: varchar("mode", { length: 20 }).notNull(), // 'prepaid' | 'postpaid'
  playerType: varchar("player_type", { length: 20 }).notNull(), // 'single' | 'multi'
  startTime: doublePrecision("start_time").notNull(),
  pausedAt: doublePrecision("paused_at"),
  totalPausedMs: doublePrecision("total_paused_ms").notNull().default(0),
  targetDurationMin: integer("target_duration_min"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 4. Session Price Segments Table (Relational price segments)
export const sessionPriceSegments = pgTable("session_price_segments", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => consoleSessions.id, { onDelete: "cascade" }),
  playerType: varchar("player_type", { length: 20 }).notNull(), // 'single' | 'multi'
  startElapsedMs: doublePrecision("start_elapsed_ms").notNull().default(0),
  ratePerHour: doublePrecision("rate_per_hour").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Session Tab Items Table (Relational session orders / cafe tab)
export const sessionTabItems = pgTable("session_tab_items", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => consoleSessions.id, { onDelete: "cascade" }),
  itemId: varchar("item_id", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  price: doublePrecision("price").notNull(),
  qty: integer("qty").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. Categories Table
export const categories = pgTable("categories", {
  id: varchar("id", { length: 50 }).primaryKey(), // 'c1', 'c2', ...
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 7. Menu Items Table
export const menuItems = pgTable("menu_items", {
  id: varchar("id", { length: 50 }).primaryKey(), // 'm1', 'm2', ...
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  price: doublePrecision("price").notNull(),
  costPrice: doublePrecision("cost_price").notNull().default(0),
  stock: integer("stock").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 8. Pricing Configurations
export const pricingConfigs = pgTable("pricing_configs", {
  type: varchar("type", { length: 20 }).primaryKey(), // 'PS4' | 'PS5' | 'Xbox' | 'VIP'
  singleRate: doublePrecision("single_rate").notNull(),
  multiRate: doublePrecision("multi_rate").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 9. Controllers Table
export const controllers = pgTable("controllers", {
  id: varchar("id", { length: 50 }).primaryKey(), // 'ctrl1', ...
  number: varchar("number", { length: 50 }).notNull(),
  assignedTo: integer("assigned_to"),
  status: varchar("status", { length: 20 }).notNull().default("working"), // 'working' | 'damaged' | 'repair' | 'retired'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 10. Maintenance Records
export const maintenanceRecords = pgTable("maintenance_records", {
  id: varchar("id", { length: 50 }).primaryKey(), // 'mr1', ...
  date: varchar("date", { length: 50 }).notNull(),
  targetType: varchar("target_type", { length: 20 }).notNull(), // 'console' | 'controller'
  targetId: varchar("target_id", { length: 50 }).notNull(),
  targetLabel: varchar("target_label", { length: 100 }).notNull(),
  issue: text("issue").notNull(),
  cost: doublePrecision("cost").notNull().default(0),
  resolvedBy: varchar("resolved_by", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 11. Shift Reports
export const shiftReports = pgTable("shift_reports", {
  id: varchar("id", { length: 50 }).primaryKey(), // 'sr1', ...
  date: varchar("date", { length: 50 }).notNull(),
  staff: varchar("staff", { length: 100 }).notNull(),
  countedCash: doublePrecision("counted_cash").notNull(),
  expectedCash: doublePrecision("expected_cash").notNull(),
  variance: doublePrecision("variance").notNull(),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 12. Customers Table
export const customers = pgTable("customers", {
  id: varchar("id", { length: 50 }).primaryKey(), // 'cu1', ...
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  balance: doublePrecision("balance").notNull().default(0),
  creditLimit: doublePrecision("credit_limit"),
  tabEnabled: boolean("tab_enabled").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 13. Audit Entries (Activity Logs)
export const auditEntries = pgTable("audit_entries", {
  id: varchar("id", { length: 50 }).primaryKey(), // 'a1', ...
  timestamp: varchar("timestamp", { length: 50 }).notNull(),
  staff: varchar("staff", { length: 100 }).notNull(),
  actionType: varchar("action_type", { length: 100 }).notNull(),
  details: text("details").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 14. Company Info Table
export const companyInfo = pgTable("company_info", {
  id: integer("id").primaryKey().default(1),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 100 }),
  address: text("address"),
  addressAr: text("address_ar"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 15. Company Socials Table (Relational replacement for jsonb socials)
export const companySocials = pgTable("company_socials", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companyInfo.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 50 }).notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  handle: varchar("handle", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 16. App Settings (e.g. activation, trial_start)
export const appSettings = pgTable("app_settings", {
  key: varchar("key", { length: 50 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

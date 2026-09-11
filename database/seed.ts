import bcrypt from "bcryptjs";
import { count } from "drizzle-orm";
import { db, checkDatabaseConnection } from "./db.js";
import {
  users,
  consoles,
  categories,
  menuItems,
  pricingConfigs,
  controllers,
  shiftReports,
  maintenanceRecords,
  customers,
  auditEntries,
  companyInfo,
} from "./schema.js";

const now = Date.now();

export const seedAccounts = [
  {
    role: "admin",
    username: "admin",
    name: "Ahmed Al-Rashidi",
    password: "admin123",
  },
  {
    role: "cashier",
    username: "cashier",
    name: "Mohammed Saleh",
    password: "cashier123",
  },
];

export const seedConsoles = [
  {
    id: 1,
    name: "PS5 — 01",
    type: "PS5",
    status: "occupied",
    dailyTotal: 42,
    session: {
      mode: "prepaid",
      playerType: "single",
      startTime: now - 45 * 60_000,
      pausedAt: null,
      totalPausedMs: 0,
      targetDurationMin: 60,
      priceSegments: [{ playerType: "single", startElapsedMs: 0, ratePerHour: 4 }],
      tab: [{ id: "m1", name: "Pepsi", price: 2, qty: 1 }],
    },
  },
  { id: 2, name: "PS5 — 02", type: "PS5", status: "available", dailyTotal: 68, session: null },
  {
    id: 3,
    name: "PS4 — 01",
    type: "PS4",
    status: "occupied",
    dailyTotal: 30,
    session: {
      mode: "postpaid",
      playerType: "multi",
      startTime: now - 93 * 60_000,
      pausedAt: null,
      totalPausedMs: 0,
      priceSegments: [
        { playerType: "single", startElapsedMs: 0, ratePerHour: 3 },
        { playerType: "multi", startElapsedMs: 30 * 60_000, ratePerHour: 4 },
      ],
      tab: [
        { id: "m3", name: "Coffee", price: 5, qty: 2 },
        { id: "m5", name: "Chips", price: 3, qty: 1 },
      ],
    },
  },
  {
    id: 4,
    name: "PS4 — 02",
    type: "PS4",
    status: "paused",
    dailyTotal: 18,
    session: {
      mode: "postpaid",
      playerType: "single",
      startTime: now - 38 * 60_000,
      pausedAt: now - 6 * 60_000,
      totalPausedMs: 0,
      priceSegments: [{ playerType: "single", startElapsedMs: 0, ratePerHour: 3 }],
      tab: [],
    },
  },
  { id: 5, name: "Xbox — 01", type: "Xbox", status: "available", dailyTotal: 51, session: null },
  { id: 6, name: "Xbox — 02", type: "Xbox", status: "maintenance", dailyTotal: 0, session: null },
  { id: 7, name: "VIP Room", type: "VIP", status: "reserved", dailyTotal: 120, session: null },
  { id: 8, name: "PS5 — 03", type: "PS5", status: "available", dailyTotal: 24, session: null },
  { id: 9, name: "PS4 — 03", type: "PS4", status: "available", dailyTotal: 0, session: null },
];

export const seedCategories = [
  { id: "c1", name: "Hot Drinks", nameAr: "مشروبات ساخنة" },
  { id: "c2", name: "Cold Drinks", nameAr: "مشروبات باردة" },
  { id: "c3", name: "Snacks", nameAr: "وجبات خفيفة" },
  { id: "c4", name: "Meals", nameAr: "وجبات رئيسية" },
];

export const seedMenuItems = [
  { id: "m1", name: "Pepsi", nameAr: "بيبسي", category: "c2", price: 2, costPrice: 0.8, stock: 48, lowStockThreshold: 10 },
  { id: "m2", name: "Water", nameAr: "ماء", category: "c2", price: 1, costPrice: 0.3, stock: 60, lowStockThreshold: 15 },
  { id: "m3", name: "Coffee", nameAr: "قهوة", category: "c1", price: 5, costPrice: 1.5, stock: 30, lowStockThreshold: 5 },
  { id: "m4", name: "Tea", nameAr: "شاي", category: "c1", price: 3, costPrice: 0.8, stock: 40, lowStockThreshold: 5 },
  { id: "m5", name: "Chips", nameAr: "رقائق", category: "c3", price: 3, costPrice: 1.2, stock: 35, lowStockThreshold: 8 },
  { id: "m6", name: "Sandwich", nameAr: "ساندويتش", category: "c4", price: 8, costPrice: 3.5, stock: 12, lowStockThreshold: 5 },
  { id: "m7", name: "Burger", nameAr: "برغر", category: "c4", price: 12, costPrice: 5, stock: 8, lowStockThreshold: 3 },
  { id: "m8", name: "Energy Drink", nameAr: "مشروب طاقة", category: "c2", price: 6, costPrice: 2.5, stock: 4, lowStockThreshold: 5 },
  { id: "m9", name: "Popcorn", nameAr: "فشار", category: "c3", price: 4, costPrice: 1, stock: 20, lowStockThreshold: 6 },
  { id: "m10", name: "Lemonade", nameAr: "عصير ليمون", category: "c2", price: 4, costPrice: 1.2, stock: 3, lowStockThreshold: 5 },
];

export const seedPricing = [
  { type: "PS4", singleRate: 3, multiRate: 4 },
  { type: "PS5", singleRate: 4, multiRate: 5 },
  { type: "Xbox", singleRate: 3.5, multiRate: 4.5 },
  { type: "VIP", singleRate: 8, multiRate: 10 },
];

export const seedControllers = [
  { id: "ctrl1", number: "C-001", assignedTo: 1, status: "working" },
  { id: "ctrl2", number: "C-002", assignedTo: 1, status: "working" },
  { id: "ctrl3", number: "C-003", assignedTo: 3, status: "repair" },
  { id: "ctrl4", number: "C-004", assignedTo: null, status: "damaged" },
  { id: "ctrl5", number: "C-005", assignedTo: 2, status: "working" },
  { id: "ctrl6", number: "C-006", assignedTo: null, status: "retired" },
];

export const seedShiftReports = [
  { id: "sr1", date: "2026-09-10", staff: "Admin", countedCash: 892.75, expectedCash: 895.5, variance: -2.75, notes: "Slight shortage, verified receipts." },
  { id: "sr2", date: "2026-09-09", staff: "Cashier", countedCash: 1040, expectedCash: 1040, variance: 0, notes: "Balanced." },
  { id: "sr3", date: "2026-09-08", staff: "Cashier", countedCash: 765.25, expectedCash: 760, variance: 5.25, notes: "Extra change from tips jar." },
  { id: "sr4", date: "2026-09-07", staff: "Admin", countedCash: 980, expectedCash: 984.5, variance: -4.5, notes: "" },
];

export const seedMaintenanceRecords = [
  { id: "mr1", date: "2026-09-08", targetType: "console", targetId: "6", targetLabel: "Xbox — 02", issue: "HDMI port damaged — replaced", cost: 45, resolvedBy: "Ahmed K." },
  { id: "mr2", date: "2026-09-05", targetType: "controller", targetId: "ctrl4", targetLabel: "C-004", issue: "Analog stick drift — recalibrated", cost: 20, resolvedBy: "Ahmed K." },
  { id: "mr3", date: "2026-09-01", targetType: "console", targetId: "4", targetLabel: "PS4 — 02", issue: "Overheating — thermal paste replaced", cost: 15, resolvedBy: "Mohammed S." },
  { id: "mr4", date: "2026-08-28", targetType: "controller", targetId: "ctrl3", targetLabel: "C-003", issue: "USB cable fraying — replaced cable", cost: 8, resolvedBy: "Ahmed K." },
];

export const seedCustomers = [
  { id: "cu1", name: "Khalid Al-Rashidi", phone: "+966 50 123 4567", balance: 0, creditLimit: 100, tabEnabled: false },
  { id: "cu2", name: "Omar Hassan", phone: "+966 55 987 6543", balance: 25, creditLimit: 50, tabEnabled: true },
  { id: "cu3", name: "Sara Al-Mansouri", phone: "+966 59 456 7890", balance: 0, creditLimit: null, tabEnabled: false },
  { id: "cu4", name: "Faisal Al-Otaibi", phone: "+966 50 321 0987", balance: 75, creditLimit: 100, tabEnabled: true },
  { id: "cu5", name: "Reem Al-Zahrani", phone: "+966 54 789 1230", balance: 12.5, creditLimit: null, tabEnabled: true },
];

export const seedAuditLog = [
  { id: "a1", timestamp: "2026-09-10 14:32:00", staff: "Admin", actionType: "Session Ended", details: "Console PS5-01 — Duration: 1h 20m — Total: $5.33" },
  { id: "a2", timestamp: "2026-09-10 13:15:00", staff: "Admin", actionType: "Price Changed", details: "PS5 single rate changed: $3.50 → $4.00/hr" },
  { id: "a3", timestamp: "2026-09-10 12:45:00", staff: "Cashier", actionType: "Sale Completed", details: "Walk-in sale: Coffee ×1, Chips ×2 — Total: $11.00" },
  { id: "a4", timestamp: "2026-09-10 11:30:00", staff: "Cashier", actionType: "Session Cancelled", details: "Xbox-01 session cancelled at customer request" },
  { id: "a5", timestamp: "2026-09-10 10:00:00", staff: "Admin", actionType: "Item Deleted", details: 'Menu item "Hot Chocolate" removed from catalogue' },
  { id: "a6", timestamp: "2026-09-09 20:15:00", staff: "Cashier", actionType: "Shift Submitted", details: "Shift handover submitted — Counted: $890.00, Expected: $892.75, Variance: −$2.75" },
];

export const seedCompany = {
  id: 1,
  name: "PS Café Lounge",
  nameAr: "صالة بلايستيشن كافيه",
  phone: "+20 100 234 5678",
  email: "hello@pscafe.eg",
  address: "15 Gaming Street, Nasr City, Cairo, Egypt",
  addressAr: "15 شارع الألعاب، مدينة نصر، القاهرة، مصر",
  socials: [
    { label: "Instagram", icon: "📷", handle: "@pscafe.eg" },
    { label: "Facebook", icon: "👍", handle: "/pscafe.eg" },
    { label: "TikTok", icon: "🎵", handle: "@pscafe" },
    { label: "WhatsApp", icon: "💬", handle: "+20 100 234 5678" },
  ],
};

export async function autoSeedDatabase() {
  const connected = await checkDatabaseConnection();
  if (!connected) {
    console.warn("⚠️  Skipping database auto-seed (DB connection not available yet).");
    return;
  }

  try {
    // 1. Users
    const [{ value: userCount }] = await db.select({ value: count() }).from(users);
    if (userCount === 0) {
      console.log("🌱 Seeding users...");
      for (const acc of seedAccounts) {
        const hashedPassword = await bcrypt.hash(acc.password, 10);
        await db.insert(users).values({
          username: acc.username,
          name: acc.name,
          role: acc.role,
          password: hashedPassword,
        });
      }
    }

    // 2. Consoles
    const [{ value: consoleCount }] = await db.select({ value: count() }).from(consoles);
    if (consoleCount === 0) {
      console.log("🌱 Seeding consoles...");
      for (const con of seedConsoles) {
        await db.insert(consoles).values(con);
      }
    }

    // 3. Categories
    const [{ value: categoryCount }] = await db.select({ value: count() }).from(categories);
    if (categoryCount === 0) {
      console.log("🌱 Seeding categories...");
      for (const cat of seedCategories) {
        await db.insert(categories).values(cat);
      }
    }

    // 4. Menu items
    const [{ value: menuCount }] = await db.select({ value: count() }).from(menuItems);
    if (menuCount === 0) {
      console.log("🌱 Seeding menu items...");
      for (const m of seedMenuItems) {
        await db.insert(menuItems).values(m);
      }
    }

    // 5. Pricing
    const [{ value: pricingCount }] = await db.select({ value: count() }).from(pricingConfigs);
    if (pricingCount === 0) {
      console.log("🌱 Seeding pricing configurations...");
      for (const p of seedPricing) {
        await db.insert(pricingConfigs).values(p);
      }
    }

    // 6. Controllers
    const [{ value: controllerCount }] = await db.select({ value: count() }).from(controllers);
    if (controllerCount === 0) {
      console.log("🌱 Seeding controllers...");
      for (const c of seedControllers) {
        await db.insert(controllers).values(c);
      }
    }

    // 7. Maintenance records
    const [{ value: maintCount }] = await db.select({ value: count() }).from(maintenanceRecords);
    if (maintCount === 0) {
      console.log("🌱 Seeding maintenance records...");
      for (const mr of seedMaintenanceRecords) {
        await db.insert(maintenanceRecords).values(mr);
      }
    }

    // 8. Shift reports
    const [{ value: shiftCount }] = await db.select({ value: count() }).from(shiftReports);
    if (shiftCount === 0) {
      console.log("🌱 Seeding shift reports...");
      for (const sr of seedShiftReports) {
        await db.insert(shiftReports).values(sr);
      }
    }

    // 9. Customers
    const [{ value: custCount }] = await db.select({ value: count() }).from(customers);
    if (custCount === 0) {
      console.log("🌱 Seeding customers...");
      for (const cust of seedCustomers) {
        await db.insert(customers).values(cust);
      }
    }

    // 10. Audit log
    const [{ value: auditCount }] = await db.select({ value: count() }).from(auditEntries);
    if (auditCount === 0) {
      console.log("🌱 Seeding audit log...");
      for (const a of seedAuditLog) {
        await db.insert(auditEntries).values(a);
      }
    }

    // 11. Company info
    const [{ value: compCount }] = await db.select({ value: count() }).from(companyInfo);
    if (compCount === 0) {
      console.log("🌱 Seeding company info...");
      await db.insert(companyInfo).values(seedCompany);
    }

    console.log("✅ Database auto-seed check complete.");
  } catch (error) {
    console.error("❌ Error during database seeding:", error);
  }
}

// If executed directly (e.g. via `npm run db:seed`)
if (process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js")) {
  autoSeedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

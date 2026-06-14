import {
  pgTable,
  uuid,
  text,
  jsonb,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

// ============================================================
// 1. PROFILES — Data publik user (terhubung ke auth.users)
// ============================================================
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // References auth.users.id (diisi manual saat trigger/signup)
  email: text("email"),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ============================================================
// 2. PRDS — Dokumen PRD yang digenerate oleh AI
// ============================================================
export const prds = pgTable("prds", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  projectName: text("project_name"),
  content: jsonb("content"), // Isi PRD terstruktur (JSON)
  status: text("status").default("completed").notNull(), // 'draft' | 'completed'
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ============================================================
// 3. SUBSCRIPTIONS — Manajemen kuota & langganan
// ============================================================
export const subscriptions = pgTable("subscriptions", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  plan: text("plan").default("free").notNull(), // 'free' | 'pro'
  currentUsage: integer("current_usage").default(0).notNull(), // Jumlah PRD yang sudah digenerate
  lastResetDate: timestamp("last_reset_date", { withTimezone: true })
    .defaultNow()
    .notNull(),
  paymentId: text("payment_id"), // Stripe / Lemon Squeezy Customer ID (Phase 2)
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ============================================================
// Type Exports — untuk digunakan di seluruh aplikasi
// ============================================================
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Prd = typeof prds.$inferSelect;
export type NewPrd = typeof prds.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

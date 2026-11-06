import { table, integer, text } from "sdk/db";

// One bounded logo per Telegram account; invoice drafts remain device-local.
export const userLogos = table("user_logos", {
  userId: integer("user_id").primaryKey(),
  dataUrl: text("data_url").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const userSettings = table("user_settings", {
  userId: integer("user_id").primaryKey(),
  sellerName: text("seller_name").notNull().default(""),
  sellerEmail: text("seller_email").notNull().default(""),
  sellerAddress: text("seller_address").notNull().default(""),
  theme: text("theme").notNull().default("modern"),
  prefix: text("prefix").notNull().default("INV-"),
  padding: integer("padding").notNull().default(4),
  nextNumber: integer("next_number").notNull().default(1),
  currency: text("currency").notNull().default("USD"),
  tax: text("tax").notNull().default("0"),
  notes: text("notes").notNull().default(""),
  updatedAt: integer("updated_at").notNull(),
});

export const userPaymentQrs = table("user_payment_qrs", {
  userId: integer("user_id").primaryKey(),
  dataUrl: text("data_url").notNull(),
  enabled: integer("enabled").notNull().default(1),
  updatedAt: integer("updated_at").notNull(),
});

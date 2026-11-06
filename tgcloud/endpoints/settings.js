import { db, EndpointError } from "sdk";
import { eq, and, lte, sql } from "sdk/db";
import { userSettings } from "../schema.js";
import {
  defaultSettings,
  validateSettings,
  publicSettings,
  formatInvoiceNumber,
  MAX_INVOICE_NUMBER,
} from "../lib/settings.js";

export default async function (input, ctx) {
  const userId = ctx?.initData?.user?.id;
  if (!Number.isSafeInteger(userId) || userId <= 0)
    throw new EndpointError("Open in Telegram.", { code: "OPEN_TELEGRAM" });
  switch (input?.action ?? "get") {
    case "get": {
      const row = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId))
        .get();
      return { settings: publicSettings(row), configured: Boolean(row) };
    }
    case "set": {
      let settings;
      try {
        settings = validateSettings(input.settings);
      } catch (error) {
        throw new EndpointError("Check your settings.", {
          code: error.message,
        });
      }
      const updatedAt = Date.now();
      // Only an explicit counter edit may restart numbering. Ordinary settings
      // saves must not rewind a counter advanced by another device.
      const [row] = await db
        .insert(userSettings)
        .values({ userId, ...settings, updatedAt })
        .onConflictDoUpdate({
          target: userSettings.userId,
          set: {
            ...settings,
            nextNumber:
              input.updateNextNumber === true
                ? settings.nextNumber
                : sql`max(${userSettings.nextNumber}, ${settings.nextNumber})`,
            updatedAt,
          },
        })
        .returning()
        .run();
      return { settings: publicSettings(row), configured: true };
    }
    case "next": {
      await db
        .insert(userSettings)
        .values({ userId, ...defaultSettings(), updatedAt: Date.now() })
        .onConflictDoNothing({ target: userSettings.userId })
        .run();
      // One atomic UPDATE allocates a different sequence value to each caller.
      const [row] = await db
        .update(userSettings)
        .set({
          nextNumber: sql`${userSettings.nextNumber} + 1`,
          updatedAt: Date.now(),
        })
        .where(
          and(
            eq(userSettings.userId, userId),
            lte(userSettings.nextNumber, MAX_INVOICE_NUMBER),
          ),
        )
        .returning()
        .run();
      if (!row)
        throw new EndpointError("Invoice number limit reached.", {
          code: "NUMBER_EXHAUSTED",
        });
      return {
        number: formatInvoiceNumber(row, row.nextNumber - 1),
        settings: publicSettings(row),
      };
    }
    default:
      throw new EndpointError("Unknown settings action.", {
        code: "INVALID_ACTION",
      });
  }
}

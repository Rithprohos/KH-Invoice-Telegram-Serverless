import { db, EndpointError } from "sdk";
import { eq } from "sdk/db";
import { userPaymentQrs } from "../schema.js";
import { validatePaymentQr } from "../lib/payment-qr.js";
export default async function (input, ctx) {
  const userId = ctx?.initData?.user?.id;
  if (!Number.isSafeInteger(userId) || userId <= 0)
    throw new EndpointError("Open in Telegram.", { code: "OPEN_TELEGRAM" });
  const read = async () => {
    const row = await db
      .select()
      .from(userPaymentQrs)
      .where(eq(userPaymentQrs.userId, userId))
      .get();
    return { dataUrl: row?.dataUrl ?? null, enabled: Boolean(row?.enabled) };
  };
  switch (input?.action ?? "get") {
    case "get":
      return read();
    case "set": {
      let dataUrl;
      try {
        dataUrl = validatePaymentQr(input.dataUrl);
      } catch {
        throw new EndpointError("Use a cropped PNG QR image up to 192 KB.", {
          code: "INVALID_QR",
        });
      }
      const values = { dataUrl, enabled: 1, updatedAt: Date.now() };
      await db
        .insert(userPaymentQrs)
        .values({ userId, ...values })
        .onConflictDoUpdate({ target: userPaymentQrs.userId, set: values })
        .run();
      return { dataUrl, enabled: true };
    }
    case "toggle":
      if (typeof input.enabled !== "boolean")
        throw new EndpointError("Invalid display setting.", {
          code: "INVALID_QR",
        });
      await db
        .update(userPaymentQrs)
        .set({ enabled: input.enabled ? 1 : 0, updatedAt: Date.now() })
        .where(eq(userPaymentQrs.userId, userId))
        .run();
      return read();
    case "remove":
      await db
        .delete(userPaymentQrs)
        .where(eq(userPaymentQrs.userId, userId))
        .run();
      return { dataUrl: null, enabled: false };
    default:
      throw new EndpointError("Unknown action.", { code: "INVALID_ACTION" });
  }
}

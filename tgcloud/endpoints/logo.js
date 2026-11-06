import { db, EndpointError } from "sdk";
import { eq } from "sdk/db";
import { userLogos } from "../schema.js";
import { validateLogo } from "../lib/logo.js";

export default async function (input, ctx) {
  const userId = ctx?.initData?.user?.id;
  if (!Number.isSafeInteger(userId) || userId <= 0)
    throw new EndpointError("Open the app in Telegram.", {
      code: "OPEN_TELEGRAM",
    });
  // Identity always comes from verified init data, never the input payload.
  switch (input?.action ?? "get") {
    case "get": {
      const row = await db
        .select()
        .from(userLogos)
        .where(eq(userLogos.userId, userId))
        .get();
      return { dataUrl: row?.dataUrl ?? null };
    }
    case "set": {
      let dataUrl;
      try {
        dataUrl = validateLogo(input.dataUrl);
      } catch {
        throw new EndpointError("Use a PNG logo up to 512 pixels and 192 KB.", {
          code: "INVALID_LOGO",
        });
      }
      const updatedAt = Date.now();
      await db
        .insert(userLogos)
        .values({ userId, dataUrl, updatedAt })
        .onConflictDoUpdate({
          target: userLogos.userId,
          set: { dataUrl, updatedAt },
        })
        .run();
      return { dataUrl };
    }
    case "remove":
      await db.delete(userLogos).where(eq(userLogos.userId, userId)).run();
      return { dataUrl: null };
    default:
      throw new EndpointError("Unknown logo action.", {
        code: "INVALID_ACTION",
      });
  }
}

import { api, InputFile, EndpointError, BotApiError } from "sdk";
import { decodePng } from "../lib/image.js";
export default async function (input, ctx) {
  const userId = ctx.initData?.user?.id;
  if (!Number.isSafeInteger(userId) || userId <= 0)
    throw new EndpointError(
      "Open this app from Telegram to share your invoice.",
      { code: "OPEN_TELEGRAM" },
    );
  let bytes;
  try {
    bytes = decodePng(input?.imageBase64);
  } catch {
    throw new EndpointError(
      "The invoice image is too large or invalid. Try fewer items, or save it as an image instead.",
      { code: "INVALID_IMAGE" },
    );
  }
  const caption =
    typeof input.caption === "string" ? input.caption.slice(0, 500) : "Invoice";
  let message;
  try {
    // The destination is always the authenticated caller, never client input.
    message = await api.sendPhoto({
      chat_id: userId,
      photo: new InputFile(bytes, "invoice.png", { type: "image/png" }),
      caption,
    });
  } catch (error) {
    if (error instanceof BotApiError && [400, 403].includes(error.code))
      throw new EndpointError(
        "Open the bot chat, press Start, and allow messages. Then try sharing again.",
        { code: "START_BOT" },
      );
    throw error;
  }
  // Saving to the caller's chat does not need a recipient picker.
  if (input.prepareShare === false) return { delivered: true };
  try {
    const photo = message.photo[message.photo.length - 1];
    const prepared = await api.savePreparedInlineMessage({
      user_id: userId,
      result: {
        type: "photo",
        id: `invoice_${message.message_id}`,
        photo_file_id: photo.file_id,
        caption,
      },
      allow_user_chats: true,
      allow_group_chats: true,
      allow_channel_chats: true,
    });
    return { preparedId: prepared.id };
  } catch {
    console.warn("Invoice delivered; prepared sharing unavailable.");
    return { preparedId: null };
  }
}

// handlers/message.js — runs on each `message` update. The file name is the
// Telegram update type; the platform calls the default export with the matching
// payload (here, a Message). The full update is available as `ctx.update`.

import { api } from "sdk";

export default async function (message) {
  if (
    message.chat.type !== "private" ||
    !/^\/start(?:@\w+)?(?:\s|$)/.test(message.text || "")
  )
    return;
  await api.sendMessage({
    chat_id: message.chat.id,
    text:
      message.from?.language_code === "km"
        ? "សូមស្វាគមន៍! បើកកម្មវិធីតូចតាមប៊ូតុងម៉ឺនុយ ដើម្បីបង្កើតវិក្កយបត្រ រក្សាទុកជារូបភាព ឬចែករំលែកក្នុង Telegram។ ច្បាប់ចម្លងវិក្កយបត្រដែលអ្នកចែករំលែកនឹងបង្ហាញក្នុងការជជែកនេះ។"
        : "Welcome to Invoice Studio. Open the Mini App using the menu button to create an invoice, save it as an image, or share it in Telegram. Invoice copies you choose to share will appear in this chat.",
  });
}

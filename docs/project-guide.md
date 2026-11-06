# Invoice Studio

A Telegram Mini App that builds invoices, downloads PNG images, and shares them in Telegram. Hosted entirely on **Telegram Serverless**, following the [official guide](https://core.telegram.org/bots/serverless).

## Run locally

Use Node.js 22.12+ for this project (Vite also supports Node.js 20.19+).

```sh
npm install
npm run dev
```

Open the printed local URL. Invoice editing, live preview, local draft recovery, PNG export, and browser file sharing work without a bot. Telegram sharing needs a deployment and a real Telegram launch.

## Features

- Khmer by default with a saved English/Khmer language switch. Labels, validation, share captions, and invoice images follow the selected language; entered customer/item text is preserved.
- Two invoice themes: **Modern** and **OG**. Switch the current draft in Preview or save a default in Settings. OG uses a traditional Cambodian invoice-pad design with Moul Khmer headings, bilingual column labels, red numbering, a blue ruled table (at least 15 rows), an optional logo watermark, signatures, and the saved KHQR at the bottom.
- Phone-first Customer → Items → Preview flow with one primary action per screen, roomy item cards, collapsible number/date and contact details, and Save/Share actions on the preview. Forward actions validate fields and reveal the step that needs correction; tabs allow freely reviewing drafts. The mobile action bar respects safe areas and hides while the onscreen keyboard reduces the visual viewport. Wider screens keep the full editor beside the preview. Settings groups logo, KHQR, business details, numbering, and defaults into expandable sections; language selection lives there and preserves pending settings edits.
- Light, Dark, and Automatic appearance in Settings, saved immediately on this device. Automatic follows Telegram’s color scheme (or the OS theme in a browser), including live changes. Supported Telegram clients also receive matching header/background/bottom-bar colors. Invoice PNGs and KHQR images retain their original paper/image colors.
- Bundled Kantumruy Pro font, loaded before image export; word/grapheme-aware wrapping preserves Khmer combining characters. No Google Fonts request is needed.
- A mobile Settings screen for business details, logo, invoice prefix, digit padding, next number, and default currency, tax, and notes. Defaults are remembered per Telegram account and apply to new invoices; existing drafts are preserved.
- A custom logo per Telegram user, remembered across devices in Telegram Serverless's database. Upload, replace, or remove it; it appears in the preview, downloaded PNG, and images sent by the bot. Browser previews store their logo only in that browser.
- Optional bank KHQR image in Settings, with square cropping, zoom/position controls, a white border, and an independent show/hide switch. It appears below the notes in the invoice preview and exported images. This displays an uploaded image only: no bank integration, generated payment request, or payment verification.
- Business/customer details, issue date, optional due date, and editable invoice number. New invoices leave the due date blank; blank due dates are omitted from the exported image.
- Up to 20 items, whole-number quantities, rates with two decimal places, and optional tax.
- USD, KHR, EUR, GBP, and THB; amounts are shown with two decimal places. No currency conversion.
- Notes/payment details, a live preview, and high-resolution PNG export.
- One automatically saved draft per browser/device. No cloud invoice history or payment collection.
- In Telegram, **Save to chat** sends the invoice image directly to the authenticated user's bot chat, with a permission prompt when needed. It does not open the recipient picker. **Download PNG instead** remains available, and saving in an ordinary browser downloads the PNG.
- Telegram sharing saves a photo copy to the user's bot chat, then opens the native recipient picker. Telegram may compress photos sent to chat; the downloaded PNG is the original.

## Link and deploy

1. Create/select your bot in [@BotFather](https://t.me/BotFather).
2. Enable **Serverless**. Open **Serverless → CLI Access → Access token**.
3. Run the following locally and paste the CLI token into the interactive prompt. This is the `app<id>:<secret>` token, **not** the ordinary Bot API token. Do not put tokens in frontend code or commit them.

```sh
npx tgcloud login
npx tgcloud push tgcloud/schema.js
npx tgcloud migrate --safe
npm run deploy
```

4. Use the exact `https://app<app_id>.tgcloud.ai/` URL printed by deployment as the Mini App URL in BotFather. Configure the bot's Main Mini App and/or menu button to open that URL.
5. Open the bot in Telegram and press **Start**, launch the Mini App, and create an invoice. **Save to chat** delivers the image to that chat. Allow the bot to message you if requested. **Share invoice** also opens Telegram's recipient picker.

Settings and logos require the `user_settings`, `user_logos`, and `user_payment_qrs` tables. Deploy the schema and apply the safe migration before publishing the updated frontend, as above. Later schema changes still need a separate migration; deploying code does not migrate the database.

## Settings and numbering

Open the gear button to configure reusable business details and defaults. Logo changes save immediately; other fields use **Save settings**. Sender details and the invoice number can still be overridden on an individual draft.

The authenticated `settings` endpoint stores one `user_settings` row per verified Telegram user. Its `next` action allocates a number using an atomic database update, so simultaneous devices receive different sequence values. Editing Next number explicitly sends `updateNextNumber: true`, allowing a restart at 1 (or any valid number); it applies to the next new invoice and leaves the current draft unchanged. Ordinary settings saves cannot rewind the counter. Restarting can reuse previously issued invoice numbers. Prefixes support Khmer and Latin letters, digits, spaces, hyphens, slashes, and underscores; padding ranges from 3 to 6 digits.

A new draft consumes a number (including the first draft on a new device). Reloading, previewing, saving, and sharing the same draft do not consume another. Discarded drafts or lost network responses can leave gaps. There is no invoice ledger, and manually edited numbers are not checked for uniqueness. Changing a prefix keeps the sequence; numbers are not reset each year. Browser previews use local storage and Web Locks where available; account synchronization requires Telegram.

## Logo storage

Telegram's Mini App `CloudStorage` is limited to 4096 characters per value, so images are kept in the built-in Serverless SQLite database instead. Each `user_logos` row is keyed by the verified `ctx.initData.user.id`; clients cannot choose another user's ID. `logo` endpoint actions (`get`, `set`, `remove`) always scope reads and writes to that identity.

The app accepts PNG, JPEG, or WebP up to 5 MB and 16 megapixels. It converts uploads to PNG, preserves transparency, and resizes to at most 512 pixels per edge and 192 KiB before storing a data URL. The endpoint enforces the normalized size and format too. There is one logo per account, replaced atomically on upload. Logos are returned only through the authenticated endpoint, with no public image URL or external storage credentials.

Logo uploads are separate from invoice drafts, so starting a new invoice retains the user's logo. In Telegram, exports wait for the stored logo to load; a failed load offers retry instead of silently omitting it. Outside Telegram, a separate browser-only logo is used, and no account synchronization is claimed.

## Invoice themes

In Preview, phone users tap the compact theme button above the invoice to open theme cards; selecting a card updates the invoice immediately and closes the picker. Desktop previews show the cards directly. The Customer and Items steps stay focused on invoice details.

The draft stores its own `theme`; older drafts default to Modern. Settings persist the preferred theme per Telegram account, applied only when a new invoice is created. Changing themes changes presentation, not customer details, items, numbering, or amounts. OG uses Khmer/English labels together even when the UI language is English.

OG has a minimum A4-like portrait proportion and expands for long descriptions, extra rows (up to the existing 20-item limit), notes, or payment QR. It exports one PNG, not paginated paper/PDF. The totals use the existing subtotal, tax, and total values; the theme does not introduce deposit/payment tracking. Signature lines are blank spaces, not electronic signatures. The account's own logo is used at the top and as a faint table watermark. No reference-image business identities or payment codes are bundled.

The `user_settings` schema includes the default invoice theme. Deploy schema changes and migrate separately before deploying frontend code that depends on them.

## Payment KHQR

Upload a clear PNG/JPEG/WebP screenshot up to 5 MB and 16 megapixels. Fit the entire code inside the crop using zoom and horizontal/vertical controls, then choose **Use this QR**. A 32-pixel white border is added to a 512-pixel square PNG (up to 192 KiB). Check the final image with your banking app; the app does not validate the QR payload, bank account, or payment status. The uploaded QR is reused unchanged regardless of invoice amount. Use a reusable bank QR rather than an expiring payment request.

The authenticated `paymentQr` endpoint stores one image and display flag per verified user in `user_payment_qrs`. Upload, removal, and visibility changes save immediately and apply to the current draft. A hidden image remains stored. Browser previews store their own copy locally. Exports wait for the account's QR settings to load; failed loads offer retry in Settings.

## Architecture

```text
src/                         Vite browser app; renders the invoice to canvas
tgcloud/endpoints/prepareInvoice.js
                             Verified user → send photo to self → optional prepared share
tgcloud/endpoints/logo.js     Read/update/remove only the caller's logo
tgcloud/endpoints/settings.js Per-user defaults and atomic invoice numbering
tgcloud/lib/image.js          Bounded PNG decoding without Node APIs
tgcloud/handlers/message.js   /start greeting
tgcloud/schema.js            user_logos, user_settings, and user_payment_qrs keyed by Telegram user ID
tgcloud.jsonc                Hosts dist/ on Telegram
```

The browser calls `Telegram.WebApp.Serverless.call`. Telegram validates init data before the endpoint runs. The endpoint uses only `ctx.initData.user.id` as the destination, never an ID supplied by the browser. Sending to another chat is a separate, user-controlled action through `Telegram.WebApp.shareMessage` and `savePreparedInlineMessage`.

No npm packages or Node APIs run inside `tgcloud/`. The backend uses Telegram's `sdk`, `InputFile`, and Bot API. Authentication credentials stay in the CLI-managed, gitignored `.tgcloud/` directory.

## Checks and limitations

```sh
npm test
npm run build
npx tgcloud status
```

Tests cover money calculations, input validation, draft recovery, image decoding, settings validation, default inheritance, settings authentication, per-user logo isolation and removal, and the send endpoint's authenticated destination and sharing fallback using a mocked SDK. A local build cannot verify the Telegram-hosted runtime, message permissions, or recipient picker. Verify these on a linked bot before release. Older Telegram clients can forward the copy from the bot chat if native sharing is unavailable. Some mobile WebViews block blob downloads; the bot-chat copy is the fallback.

The share endpoint accepts PNG images up to about 4 MB decoded and enforces Telegram's photo dimension limits. Long invoices can always be downloaded locally; if sharing rejects the image, shorten it or send the downloaded file manually. This MVP does not store server-side invoice history or implement a durable idempotency key, so retrying after an ambiguous network failure can produce a second bot-chat copy.

Official references: [Serverless](https://core.telegram.org/bots/serverless), [Mini App methods](https://core.telegram.org/bots/webapps), [prepared messages](https://core.telegram.org/bots/api#savepreparedinlinemessage).

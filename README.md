# KH Invoice · Telegram Serverless

**A FREE, Khmer-first invoice builder inside Telegram.**

Create an invoice on your phone, save it as an image, and send it to your customer—without spreadsheets or a separate invoicing account.

## Why this project exists

Small shops, freelancers, and service providers need a quick way to make clear, professional invoices. KH Invoice makes that workflow accessible in Khmer, in an app people already use: Telegram.

The goal is simple: **help anyone create and share an invoice for free**, with a mobile-friendly interface and familiar Cambodian invoice designs.

## FREE to use and build on

- No subscriptions, paid tiers, or invoice-generation fees built into this app.
- Free source code under the [MIT license](LICENSE): use, modify, share, or self-host it, including for commercial projects.
- No separate backend server or external image-storage service to provision; the deployed app uses Telegram Serverless.

“Free” describes this project's software and features. Telegram and any other services you choose to use remain subject to their own terms, quotas, and pricing.

## What you can do

- **Create invoices on a phone:** Customer → Items → Preview.
- **Use Khmer or English**, with bundled Khmer fonts.
- **Choose Light, Dark, or Automatic appearance.**
- **Pick an invoice design:** Modern or **OG**, inspired by traditional Cambodian invoice pads.
- **Add your business logo** and reuse it on future invoices.
- **Display your bank KHQR image**, with crop and positioning controls.
- **Customize numbering:** prefix, digit padding, and next number, including restarting at 1.
- **Add up to 20 items**, optional tax, notes, and an optional due date.
- **Use USD, KHR, EUR, GBP, or THB** without currency conversion.
- **Save a PNG**, receive the invoice in your bot chat, or share it through Telegram's recipient picker.

KHQR is an uploaded payment image. The app does not process transfers or check payment status.

## Privacy and storage

Your current invoice draft stays in your browser/device. The app does not maintain a cloud invoice history.

Business preferences, logo, and KHQR are stored per verified Telegram user in Telegram Serverless's database. Language and appearance are remembered on the device. Browser-only previews use local storage.

When you save to Telegram, the bot sends the invoice image to your own bot chat. Sharing also creates that copy first, then opens Telegram's recipient picker so you choose who receives it. Sent images are handled and stored by Telegram. No external image host or shared storage channel is used.

## Run locally

Use **Node.js 22.12 or later**.

```sh
git clone https://github.com/Rithprohos/KH-Invoice-Telegram-Serverless.git
cd KH-Invoice-Telegram-Serverless
npm ci
npm run dev
```

Open the local URL printed by Vite. You can edit and preview invoices and download PNGs in a browser. Telegram account features and native sharing require a linked bot and a Telegram launch.

## Deploy your own bot

1. Create a bot through [@BotFather](https://t.me/BotFather) and enable [Telegram Serverless](https://core.telegram.org/bots/serverless).
2. Get the Serverless CLI access token and enter it through the interactive login prompt. Keep it private.
3. Deploy the schema, apply migrations, and publish the app:

```sh
npx tgcloud login
npx tgcloud push tgcloud/schema.js
npx tgcloud migrate --safe
npm run deploy
```

4. Set the deployed URL printed by the CLI as your bot's Mini App URL in BotFather.
5. Start your bot in Telegram and open the Mini App.

Deployment does not automatically migrate the database. The frontend build runs as part of `npm run deploy`.

## Development

```sh
npm test        # Automated checks
npm run build   # Production frontend build
```

- `src/` — Vite frontend, mobile UI, and canvas invoice rendering.
- `tgcloud/` — Telegram Serverless endpoints, bot handler, and database schema.
- `test/` — Tests for invoices, localization, themes, account isolation, and sharing.
- [Project guide](docs/project-guide.md) — Detailed setup, storage, numbering, and limitations.
- [Serverless SDK reference](docs/tgcloud-sdk.md) — Platform APIs used by the backend.

Credentials in `.tgcloud/`, local environment files, dependencies, build output, and development artifacts are excluded from Git.

## Contributing

Bug reports, Khmer wording improvements, usability feedback, and pull requests are welcome. For layout issues, include your device, Telegram version, and a screenshot with private customer or payment information removed.

## License

[MIT](LICENSE). Bundled font packages retain their own licenses; see [third-party notices](THIRD_PARTY_NOTICES.md).

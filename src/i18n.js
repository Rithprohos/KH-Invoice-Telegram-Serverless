// Shared by the form and canvas so exported invoices follow the chosen language.
export const messages = {
  en: {
    appearance: "Appearance",
    appearanceAuto: "Automatic",
    appearanceLight: "Light",
    appearanceDark: "Dark",
    appearanceHelp:
      "Automatic follows Telegram or your device. Changes apply immediately and are remembered on this device.",

    stepCustomer: "Customer",
    stepItems: "Items",
    customerStepTitle: "Who is this for?",
    customerStepHint:
      "Start with your customer. Add contact details if needed.",
    itemsStepHint: "Add what you sold and set the price.",
    continueItems: "Continue to items →",
    reviewInvoice: "Review invoice →",
    back: "Back",

    newShort: "New",
    themeLabel: "Theme",
    invoiceTheme: "Invoice theme",
    defaultTheme: "Default invoice theme",
    themeModern: "Modern",
    themeOg: "OG",
    themeModernHint: "Clean and spacious",
    themeOgHint: "Classic invoice pad",
    ogNo: "No.",
    ogBuyer: "Buyer",
    ogSeller: "Seller",
    qrTitle: "Payment KHQR",
    qrHelp:
      "Upload your bank KHQR image to display at the bottom of invoices for bank transfers.",
    qrDisplay: "Show KHQR on invoices",
    qrUpload: "Upload / replace KHQR",
    qrRemove: "Remove KHQR",
    qrCrop: "Adjust your QR image",
    qrCropHelp:
      "Zoom and move to frame the entire QR code, including all three corner squares. A white border is added. Check it scans with your banking app before using it.",
    qrZoom: "Zoom",
    qrHorizontal: "Move left / right",
    qrVertical: "Move up / down",
    qrUse: "Use this QR",
    qrLoading: "Loading KHQR…",
    qrSaving: "Saving KHQR…",
    qrSaved: "KHQR settings saved.",
    qrError: "Could not save KHQR. Please try again.",
    qrLoadError:
      "Could not load KHQR. Open Settings and retry before exporting.",
    qrFileError:
      "Use a clear PNG, JPG or WebP under 5 MB. Crop closely around the full QR code.",
    qrCloud:
      "KHQR changes save immediately to your Telegram account and apply to the current invoice.",
    qrLocal:
      "KHQR changes save immediately in this browser. Open in Telegram to sync across devices.",
    qrScan: "Scan KHQR to pay",
    app: "Invoice Studio",
    title: "Create an invoice",
    intro: "Fill it in. Save it. Send it.",
    newInvoice: "New invoice",
    settings: "Settings",
    closeSettings: "Close settings",
    cancelSettings: "Cancel",
    saveSettings: "Save settings",
    businessDetails: "Business details",
    setupBusiness: "Set up your business",
    senderOverride: "Edit sender for this invoice",
    numbering: "Invoice numbering",
    numberPrefix: "Prefix",
    numberDigits: "Number format",
    nextNumber: "Next number",
    numberPreview: "Next invoice will look like",
    numberingHelp:
      "This number applies to the next new invoice. Set it to 1 to restart numbering. Numbers advance automatically when you create an invoice.",
    invoiceDefaults: "Invoice defaults",
    settingsCloudHint: "Your business preferences, remembered across devices.",
    settingsLocalHint:
      "Preferences are remembered in this browser. Use Telegram to sync across devices.",
    logoImmediate:
      "Logo changes are saved immediately and appear on the current invoice too.",
    defaultsHelp:
      "Saved business details and defaults apply to new invoices. Your current draft stays unchanged.",
    settingsLoading: "Loading your settings…",
    settingsSaving: "Saving your settings…",
    settingsSaved: "Settings saved. They will be used for your next invoice.",
    settingsLoadError: "Could not load settings. Please retry.",
    settingsLoadBanner: "Your settings could not load. Open Settings to retry.",
    settingsSaveError:
      "Could not confirm the save. Reload settings to check, or try saving again.",
    settingsInvalid:
      "Check the fields: prefix up to 16 letters, numbers or separators; next number 1–999,999,999; tax 0–100%; address up to 5 lines; notes up to 10 lines.",
    retrySettings: "Reload settings",
    newInvoiceError:
      "Could not create the next invoice. Your existing draft is safe. Try again; a number may have been skipped if the connection failed.",
    language: "Language",
    edit: "Edit",
    preview: "Preview",
    view: "Invoice view",
    essentials: "Invoice details",
    saved: "Draft saved",
    unsaved: "Draft not saved",
    number: "Invoice number",
    date: "Issued on",
    dueDate: "Due date",
    from: "From",
    billTo: "Bill to",
    seller: "Business or your name",
    customer: "Customer name",
    sellerPlaceholder: "Your business name",
    customerPlaceholder: "Customer or company",
    email: "Email",
    address: "Address",
    addressPlaceholder: "Street, city, country",
    optional: "optional",
    logoTitle: "Your business logo",
    logoUpload: "Upload logo",
    logoReplace: "Replace logo",
    logoRemove: "Remove",
    logoRetry: "Retry loading logo",
    logoCloudHelp:
      "Saved to your Telegram account for future invoices, across devices. PNG, JPG or WebP, up to 5 MB.",
    logoBrowserHelp:
      "Remembered in this browser. Open in Telegram to save it to your account across devices. PNG, JPG or WebP, up to 5 MB.",
    logoLoading: "Loading your logo…",
    logoSaving: "Saving your logo…",
    logoCloudSaved: "Logo saved to your account.",
    logoLocalSaved: "Logo remembered in this browser.",
    logoRemoved: "Logo removed.",
    logoLoadError:
      "Could not load your saved logo. Retry before exporting, or upload a replacement.",
    logoLocalError:
      "The browser could not restore your logo. You can upload it again.",
    logoSaveError:
      "Could not confirm the change. Your previous logo is still shown; retry loading or uploading.",
    logoInvalid:
      "This image could not be used as a logo. Try a different PNG, JPG or WebP.",
    logoTypeError: "Choose a PNG, JPG or WebP image.",
    logoSizeError:
      "Choose an image up to 5 MB and 16 megapixels, without an extremely wide or tall shape.",
    contactDetails: "Email & address",
    items: "Items & services",
    item: "Item",
    description: "Description",
    quantity: "Quantity",
    rate: "Unit price",
    amount: "Amount",
    itemPlaceholder: "e.g. Design service",
    remove: "Remove item",
    addItem: "Add item",
    currency: "Currency",
    tax: "Tax",
    subtotal: "Subtotal",
    total: "Total due",
    notesTitle: "Notes & payment",
    notes: "Notes & payment details",
    notesPlaceholder: "Payment instructions or a message for your customer",
    save: "Save image",
    saveToChat: "Save to chat",
    downloadFile: "Download PNG instead",
    savedToChat:
      "Invoice image sent to your bot chat. You can save it to your device from there.",
    saveError:
      "Could not confirm delivery. Check your bot chat before retrying, or download the PNG instead.",
    share: "Share invoice",
    invoice: "Invoice",
    thanks: "Thank you for your business.",
    privacy: "Your draft stays on this device.",
    shareHelpTelegram:
      "Save sends the image to your bot chat. Share also lets you choose another recipient.",
    shareHelpBrowser: "Save a PNG image or share it with another app.",
    resetTitle: "Start a new invoice?",
    resetBody:
      "This replaces the draft on this device. Save your current invoice first if you need it.",
    cancelReset: "Keep editing",
    required: "Please fill in this field.",
    invalidEmail: "Enter a valid email address.",
    invalidNumber: "Enter a valid number within the displayed limits.",
    missingDetails:
      "Add an invoice number, your business name, and a customer name.",
    invalidDate: "Choose a due date on or after the issue date.",
    tooManyLines:
      "Keep addresses to 5 lines and notes to 10 lines for a readable image.",
    invalidItems: "Use between 1 and 20 line items.",
    missingDescription: "Add a description for each item.",
    invalidQuantity: "Quantities must be whole numbers from 1 to 999.",
    invalidRate:
      "Enter rates from 0 to 10,000,000 with up to two decimal places.",
    invalidTax:
      "Tax must be between 0 and 100 percent with up to two decimal places.",
    imageError: "Could not create the image. Please try again.",
    fontError:
      "The Khmer font could not load. Check your connection and reload before exporting.",
    downloading:
      "PNG download requested. If Telegram blocks it, use Share invoice to get a copy in your bot chat.",
    updateTelegram:
      "Update Telegram to send the invoice, or download the PNG instead.",
    allowMessages:
      "Allow the bot to message you, or choose Download PNG instead.",
    sending: "Sending a copy to your bot chat…",
    chooseChat: "Copy saved. Choose a chat to share it with.",
    sent: "Invoice shared. A copy is also in your bot chat.",
    shareClosed: "Sharing closed. Your copy is still in the bot chat.",
    forwardCopy:
      "Invoice sent to your bot chat. Open it and forward the image to a recipient.",
    deviceShared: "Invoice passed to your device’s share menu.",
    attachImage: "PNG download requested. Attach the saved image in any chat.",
    cancelled: "Sharing cancelled.",
    shareError: "Sharing failed. Try again or save the image instead.",
    openTelegram: "Open this app from Telegram to send the invoice.",
    imageTooLarge:
      "The image is too large or invalid. Use fewer items, or choose Download PNG instead.",
    startBot:
      "Open the bot chat, press Start, and allow messages. Then try again.",
  },
  km: {
    appearance: "រូបរាងកម្មវិធី",
    appearanceAuto: "ស្វ័យប្រវត្តិ",
    appearanceLight: "ភ្លឺ",
    appearanceDark: "ងងឹត",
    appearanceHelp:
      "ស្វ័យប្រវត្តិអនុវត្តតាម Telegram ឬឧបករណ៍របស់អ្នក។ ការផ្លាស់ប្ដូរមានប្រសិទ្ធភាពភ្លាមៗ និងរក្សាទុកលើឧបករណ៍នេះ។",

    stepCustomer: "អតិថិជន",
    stepItems: "ទំនិញ",
    customerStepTitle: "ចេញជូនអតិថិជនណា?",
    customerStepHint: "បំពេញឈ្មោះអតិថិជន។ បន្ថែមព័ត៌មានទំនាក់ទំនង បើចាំបាច់។",
    itemsStepHint: "បន្ថែមទំនិញ ឬសេវាកម្ម និងកំណត់តម្លៃ។",
    continueItems: "បន្តទៅទំនិញ →",
    reviewInvoice: "ពិនិត្យវិក្កយបត្រ →",
    back: "ត្រឡប់ក្រោយ",

    newShort: "ថ្មី",
    themeLabel: "ទម្រង់",
    invoiceTheme: "ទម្រង់វិក្កយបត្រ",
    defaultTheme: "ទម្រង់ដើមសម្រាប់វិក្កយបត្រ",
    themeModern: "ទំនើប",
    themeOg: "OG · បែបដើម",
    themeModernHint: "សាមញ្ញ និងមានលំហ",
    themeOgHint: "បែបសៀវភៅវិក្កយបត្រ",
    ogNo: "ល.រ",
    ogBuyer: "អ្នកទិញ",
    ogSeller: "អ្នកលក់",
    qrTitle: "KHQR សម្រាប់ទូទាត់",
    qrHelp:
      "បញ្ចូលរូបភាព KHQR របស់ធនាគារអ្នក ដើម្បីបង្ហាញនៅខាងក្រោមវិក្កយបត្រសម្រាប់ការផ្ទេរប្រាក់។",
    qrDisplay: "បង្ហាញ KHQR លើវិក្កយបត្រ",
    qrUpload: "បញ្ចូល / ប្ដូរ KHQR",
    qrRemove: "លុប KHQR",
    qrCrop: "កែសម្រួលរូបភាព QR",
    qrCropHelp:
      "ពង្រីក និងរំកិលឱ្យឃើញ QR ទាំងមូល រួមទាំងជ្រុងការេទាំងបី។ ប្រព័ន្ធបន្ថែមស៊ុមពណ៌ស។ សូមសាកស្កេនជាមួយកម្មវិធីធនាគារមុនប្រើ។",
    qrZoom: "ពង្រីក",
    qrHorizontal: "រំកិលឆ្វេង / ស្ដាំ",
    qrVertical: "រំកិលលើ / ក្រោម",
    qrUse: "ប្រើ QR នេះ",
    qrLoading: "កំពុងផ្ទុក KHQR…",
    qrSaving: "កំពុងរក្សាទុក KHQR…",
    qrSaved: "បានរក្សាទុកការកំណត់ KHQR។",
    qrError: "មិនអាចរក្សាទុក KHQR បានទេ។ សូមព្យាយាមម្ដងទៀត។",
    qrLoadError:
      "មិនអាចផ្ទុក KHQR បានទេ។ សូមបើកការកំណត់ ហើយព្យាយាមម្ដងទៀតមុនរក្សាទុករូបភាព។",
    qrFileError:
      "ប្រើរូប PNG, JPG ឬ WebP ច្បាស់ មិនលើសពី 5 MB។ កាត់ឱ្យជិតជុំវិញ QR ទាំងមូល។",
    qrCloud:
      "ការផ្លាស់ប្ដូរ KHQR រក្សាទុកភ្លាមៗក្នុងគណនី Telegram និងប្រើលើវិក្កយបត្របច្ចុប្បន្ន។",
    qrLocal:
      "ការផ្លាស់ប្ដូរ KHQR រក្សាទុកភ្លាមៗក្នុងកម្មវិធីរុករកនេះ។ បើកក្នុង Telegram ដើម្បីប្រើលើឧបករណ៍ផ្សេងៗ។",
    qrScan: "ស្កេន KHQR ដើម្បីទូទាត់",
    app: "វិក្កយបត្រ",
    title: "បង្កើតវិក្កយបត្រ",
    intro: "បំពេញព័ត៌មាន រួចរក្សាទុក ឬផ្ញើ។",
    newInvoice: "បង្កើតថ្មី",
    settings: "ការកំណត់",
    closeSettings: "បិទការកំណត់",
    cancelSettings: "បោះបង់",
    saveSettings: "រក្សាទុកការកំណត់",
    businessDetails: "ព័ត៌មានអាជីវកម្ម",
    setupBusiness: "បំពេញព័ត៌មានអាជីវកម្ម",
    senderOverride: "កែព័ត៌មានអ្នកចេញវិក្កយបត្រនេះ",
    numbering: "ការកំណត់លេខវិក្កយបត្រ",
    numberPrefix: "បុព្វបទ",
    numberDigits: "ទម្រង់លេខ",
    nextNumber: "លេខបន្ទាប់",
    numberPreview: "គំរូលេខវិក្កយបត្របន្ទាប់",
    numberingHelp:
      "លេខនេះប្រើសម្រាប់វិក្កយបត្រថ្មីបន្ទាប់។ កំណត់ជា 1 ដើម្បីចាប់ផ្ដើមលេខឡើងវិញ។ លេខកើនឡើងដោយស្វ័យប្រវត្តិនៅពេលបង្កើតវិក្កយបត្រថ្មី។",
    invoiceDefaults: "ការកំណត់ដើមសម្រាប់វិក្កយបត្រ",
    settingsCloudHint:
      "រក្សាទុកការកំណត់អាជីវកម្មរបស់អ្នក ដើម្បីប្រើលើឧបករណ៍ផ្សេងៗ។",
    settingsLocalHint:
      "រក្សាទុកការកំណត់ក្នុងកម្មវិធីរុករកនេះ។ ប្រើ Telegram ដើម្បីធ្វើសមកាលកម្មលើឧបករណ៍ផ្សេងៗ។",
    logoImmediate:
      "ការផ្លាស់ប្ដូរឡូហ្គោត្រូវបានរក្សាទុកភ្លាមៗ និងបង្ហាញលើវិក្កយបត្របច្ចុប្បន្នផងដែរ។",
    defaultsHelp:
      "ព័ត៌មានអាជីវកម្ម និងការកំណត់ដែលបានរក្សាទុកនឹងប្រើសម្រាប់វិក្កយបត្រថ្មី។ សេចក្ដីព្រាងបច្ចុប្បន្នមិនផ្លាស់ប្ដូរទេ។",
    settingsLoading: "កំពុងផ្ទុកការកំណត់របស់អ្នក…",
    settingsSaving: "កំពុងរក្សាទុកការកំណត់…",
    settingsSaved:
      "បានរក្សាទុកការកំណត់។ នឹងប្រើសម្រាប់វិក្កយបត្របន្ទាប់របស់អ្នក។",
    settingsLoadError: "មិនអាចផ្ទុកការកំណត់បានទេ។ សូមព្យាយាមម្ដងទៀត។",
    settingsLoadBanner:
      "មិនអាចផ្ទុកការកំណត់បានទេ។ សូមបើកការកំណត់ដើម្បីព្យាយាមម្ដងទៀត។",
    settingsSaveError:
      "មិនអាចបញ្ជាក់ការរក្សាទុកបានទេ។ សូមផ្ទុកការកំណត់ឡើងវិញដើម្បីពិនិត្យ ឬសាកល្បងរក្សាទុកម្ដងទៀត។",
    settingsInvalid:
      "សូមពិនិត្យព័ត៌មាន៖ បុព្វបទមិនលើសពី 16 តួអក្សរ លេខបន្ទាប់ពី 1 ដល់ 999,999,999 ពន្ធពី 0 ដល់ 100% អាសយដ្ឋានមិនលើសពី 5 បន្ទាត់ និងកំណត់សម្គាល់ 10 បន្ទាត់។",
    retrySettings: "ផ្ទុកការកំណត់ឡើងវិញ",
    newInvoiceError:
      "មិនអាចបង្កើតវិក្កយបត្របន្ទាប់បានទេ។ សេចក្ដីព្រាងបច្ចុប្បន្ននៅតែមាន។ សូមព្យាយាមម្ដងទៀត។ អាចមានការរំលងលេខ ប្រសិនបើការតភ្ជាប់បរាជ័យ។",
    language: "ភាសា",
    edit: "កែសម្រួល",
    preview: "មើលជាមុន",
    view: "ទិដ្ឋភាពវិក្កយបត្រ",
    essentials: "ព័ត៌មានវិក្កយបត្រ",
    saved: "បានរក្សាទុក",
    unsaved: "មិនទាន់បានរក្សាទុក",
    number: "លេខវិក្កយបត្រ",
    date: "កាលបរិច្ឆេទ",
    dueDate: "ថ្ងៃផុតកំណត់",
    from: "អ្នកចេញវិក្កយបត្រ",
    billTo: "អតិថិជន",
    seller: "ឈ្មោះអ្នក ឬអាជីវកម្ម",
    customer: "ឈ្មោះអតិថិជន",
    sellerPlaceholder: "បញ្ចូលឈ្មោះអាជីវកម្ម",
    customerPlaceholder: "បញ្ចូលឈ្មោះអតិថិជន",
    email: "អ៊ីមែល",
    address: "អាសយដ្ឋាន",
    addressPlaceholder: "ផ្លូវ ក្រុង ប្រទេស",
    optional: "មិនចាំបាច់",
    logoTitle: "ឡូហ្គោអាជីវកម្ម",
    logoUpload: "បញ្ចូលឡូហ្គោ",
    logoReplace: "ប្ដូរឡូហ្គោ",
    logoRemove: "លុប",
    logoRetry: "ផ្ទុកឡូហ្គោម្ដងទៀត",
    logoCloudHelp:
      "រក្សាទុកក្នុងគណនី Telegram របស់អ្នក សម្រាប់វិក្កយបត្របន្ទាប់នៅលើឧបករណ៍ផ្សេងៗ។ PNG, JPG ឬ WebP មិនលើសពី 5 MB។",
    logoBrowserHelp:
      "រក្សាទុកក្នុងកម្មវិធីរុករកនេះ។ បើកក្នុង Telegram ដើម្បីរក្សាទុកក្នុងគណនី និងប្រើលើឧបករណ៍ផ្សេងៗ។ PNG, JPG ឬ WebP មិនលើសពី 5 MB។",
    logoLoading: "កំពុងផ្ទុកឡូហ្គោរបស់អ្នក…",
    logoSaving: "កំពុងរក្សាទុកឡូហ្គោ…",
    logoCloudSaved: "បានរក្សាទុកឡូហ្គោក្នុងគណនីរបស់អ្នក។",
    logoLocalSaved: "បានរក្សាទុកឡូហ្គោក្នុងកម្មវិធីរុករកនេះ។",
    logoRemoved: "បានលុបឡូហ្គោ។",
    logoLoadError:
      "មិនអាចផ្ទុកឡូហ្គោបានទេ។ សូមព្យាយាមម្ដងទៀតមុនរក្សាទុកវិក្កយបត្រ ឬបញ្ចូលឡូហ្គោថ្មី។",
    logoLocalError:
      "កម្មវិធីរុករកមិនអាចផ្ទុកឡូហ្គោបានទេ។ អ្នកអាចបញ្ចូលម្ដងទៀត។",
    logoSaveError:
      "មិនអាចបញ្ជាក់ការផ្លាស់ប្ដូរបានទេ។ ឡូហ្គោចាស់នៅតែបង្ហាញ។ សូមផ្ទុក ឬបញ្ចូលម្ដងទៀត។",
    logoInvalid:
      "មិនអាចប្រើរូបភាពនេះជាឡូហ្គោបានទេ។ សូមសាកល្បង PNG, JPG ឬ WebP ផ្សេង។",
    logoTypeError: "សូមជ្រើសរើសរូបភាព PNG, JPG ឬ WebP។",
    logoSizeError:
      "សូមជ្រើសរើសរូបភាពមិនលើសពី 5 MB និង 16 មេហ្គាភីកសែល ដែលមិនវែង ឬខ្ពស់ខ្លាំងពេក។",
    contactDetails: "អ៊ីមែល និងអាសយដ្ឋាន",
    items: "ទំនិញ និងសេវាកម្ម",
    item: "មុខទំនិញ",
    description: "បរិយាយ",
    quantity: "ចំនួន",
    rate: "តម្លៃឯកតា",
    amount: "សរុប",
    itemPlaceholder: "ឧ. សេវាកម្មរចនា",
    remove: "លុបមុខទំនិញ",
    addItem: "បន្ថែមមុខទំនិញ",
    currency: "រូបិយប័ណ្ណ",
    tax: "ពន្ធ",
    subtotal: "សរុបមុនពន្ធ",
    total: "សរុបត្រូវបង់",
    notesTitle: "កំណត់សម្គាល់",
    notes: "កំណត់សម្គាល់ និងការទូទាត់",
    notesPlaceholder: "ព័ត៌មានទូទាត់ ឬសារសម្រាប់អតិថិជន",
    save: "រក្សាទុករូបភាព",
    saveToChat: "រក្សាទុកក្នុងឆាត",
    downloadFile: "ទាញយករូបភាព PNG ជំនួស",
    savedToChat:
      "បានផ្ញើរូបភាពវិក្កយបត្រទៅក្នុងការជជែកជាមួយបូត។ អ្នកអាចរក្សាទុករូបភាពលើឧបករណ៍ពីទីនោះ។",
    saveError:
      "មិនអាចបញ្ជាក់ការផ្ញើបានទេ។ សូមពិនិត្យការជជែកជាមួយបូតមុនព្យាយាមម្ដងទៀត ឬទាញយករូបភាព PNG ជំនួស។",
    share: "ចែករំលែក",
    invoice: "វិក្កយបត្រ",
    thanks: "សូមអរគុណសម្រាប់ការគាំទ្រ។",
    privacy: "សេចក្ដីព្រាងត្រូវបានរក្សាទុកលើឧបករណ៍នេះ។",
    shareHelpTelegram:
      "ការរក្សាទុកនឹងផ្ញើរូបភាពទៅក្នុងការជជែកជាមួយបូត។ ការចែករំលែកក៏អនុញ្ញាតឱ្យអ្នកជ្រើសរើសអ្នកទទួលផ្សេងទៀតដែរ។",
    shareHelpBrowser: "រក្សាទុកជារូបភាព PNG ឬចែករំលែកទៅកម្មវិធីផ្សេង។",
    resetTitle: "បង្កើតវិក្កយបត្រថ្មី?",
    resetBody:
      "សេចក្ដីព្រាងបច្ចុប្បន្ននឹងត្រូវបានជំនួស។ សូមរក្សាទុកវិក្កយបត្រនេះជាមុន ប្រសិនបើអ្នកត្រូវការ។",
    cancelReset: "បន្តកែសម្រួល",
    required: "សូមបំពេញព័ត៌មាននេះ។",
    invalidEmail: "សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលត្រឹមត្រូវ។",
    invalidNumber: "សូមបញ្ចូលលេខត្រឹមត្រូវក្នុងកម្រិតដែលបានកំណត់។",
    missingDetails: "សូមបញ្ចូលលេខវិក្កយបត្រ ឈ្មោះអាជីវកម្ម និងឈ្មោះអតិថិជន។",
    invalidDate:
      "ថ្ងៃផុតកំណត់ត្រូវនៅថ្ងៃដូចគ្នា ឬក្រោយកាលបរិច្ឆេទចេញវិក្កយបត្រ។",
    tooManyLines:
      "អាសយដ្ឋានអាចមានរហូតដល់ 5 បន្ទាត់ និងកំណត់សម្គាល់ 10 បន្ទាត់។",
    invalidItems: "សូមបញ្ចូលពី 1 ដល់ 20 មុខទំនិញ។",
    missingDescription: "សូមបញ្ចូលបរិយាយសម្រាប់មុខទំនិញនីមួយៗ។",
    invalidQuantity: "ចំនួនត្រូវជាលេខគត់ពី 1 ដល់ 999។",
    invalidRate: "តម្លៃត្រូវពី 0 ដល់ 10,000,000 និងមានខ្ទង់ទសភាគមិនលើសពី 2។",
    invalidTax: "ពន្ធត្រូវពី 0 ដល់ 100 ភាគរយ និងមានខ្ទង់ទសភាគមិនលើសពី 2។",
    imageError: "មិនអាចបង្កើតរូបភាពបានទេ។ សូមព្យាយាមម្ដងទៀត។",
    fontError:
      "មិនអាចផ្ទុកពុម្ពអក្សរខ្មែរបានទេ។ សូមពិនិត្យអ៊ីនធឺណិត រួចផ្ទុកទំព័រឡើងវិញ។",
    downloading:
      "បានស្នើសុំទាញយករូបភាព PNG។ ប្រសិនបើ Telegram រារាំង សូមចុចចែករំលែក ដើម្បីទទួលច្បាប់ចម្លងក្នុងការជជែកជាមួយបូត។",
    updateTelegram:
      "សូមធ្វើបច្ចុប្បន្នភាព Telegram ដើម្បីផ្ញើវិក្កយបត្រ ឬទាញយករូបភាព PNG ជំនួស។",
    allowMessages: "សូមអនុញ្ញាតឱ្យបូតផ្ញើសារ ឬជ្រើសរើសទាញយករូបភាព PNG ជំនួស។",
    sending: "កំពុងផ្ញើច្បាប់ចម្លងទៅក្នុងការជជែកជាមួយបូត…",
    chooseChat: "បានរក្សាទុកច្បាប់ចម្លង។ សូមជ្រើសរើសអ្នកទទួល។",
    sent: "បានចែករំលែកវិក្កយបត្រ។ ច្បាប់ចម្លងក៏មានក្នុងការជជែកជាមួយបូតដែរ។",
    shareClosed: "បានបិទការចែករំលែក។ ច្បាប់ចម្លងនៅតែមានក្នុងការជជែកជាមួយបូត។",
    forwardCopy:
      "បានផ្ញើវិក្កយបត្រទៅក្នុងការជជែកជាមួយបូត។ អ្នកអាចបញ្ជូនបន្តទៅអ្នកទទួល។",
    deviceShared: "បានបើកម៉ឺនុយចែករំលែករបស់ឧបករណ៍។",
    attachImage:
      "បានស្នើសុំទាញយករូបភាព PNG។ អ្នកអាចភ្ជាប់រូបភាពនេះក្នុងការជជែកណាមួយ។",
    cancelled: "បានបោះបង់ការចែករំលែក។",
    shareError: "ការចែករំលែកបរាជ័យ។ សូមព្យាយាមម្ដងទៀត ឬរក្សាទុករូបភាព។",
    openTelegram: "សូមបើកកម្មវិធីនេះពី Telegram ដើម្បីផ្ញើវិក្កយបត្រ។",
    imageTooLarge:
      "រូបភាពធំពេក ឬមិនត្រឹមត្រូវ។ សូមកាត់បន្ថយមុខទំនិញ ឬទាញយករូបភាព PNG ជំនួស។",
    startBot:
      "សូមបើកការជជែកជាមួយបូត ចុច Start និងអនុញ្ញាតសារ រួចព្យាយាមម្ដងទៀត។",
  },
};
export function text(language, key) {
  return (messages[language] || messages.km)[key] || messages.en[key] || key;
}

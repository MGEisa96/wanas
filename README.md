# ونس · Wanas (ecommerce)

Handmade ecommerce storefront + product/order dashboard for **ونس**.

Arabic-first (RTL) with English toggle. Cart and checkout run on-site. Payment methods: **COD**, **InstaPay**, or **WhatsApp confirmation** (no card gateway).

**Hotline:** [01061381439](tel:+201061381439) · [WhatsApp](https://wa.me/201061381439)

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js 16, React 19, TypeScript, Tailwind 4 |
| Data | Cloud Firestore (`products`, `categories`, `orders`, `config/store`) |
| Auth | Firebase Authentication (dashboard) |
| Media | Cloudinary via `/api/cloudinary/upload` (folder `wanas`) |
| Hosting | Vercel |

## Run

```bash
cd wanas
npm install
cp .env.local.example .env.local   # add Firebase + Cloudinary
npm run dev
```

- Store: http://localhost:3000  
- Shop: http://localhost:3000/shop  
- Dashboard: http://localhost:3000/dashboard  

Without Firebase env, the storefront still runs on **seed products** in `lib/seed.ts`. Orders may not persist until Firebase is configured.

## Storefront routes

| Route | Purpose |
| --- | --- |
| `/` | Home + featured products |
| `/shop` | Catalog filters |
| `/product/[slug]` | Product detail |
| `/cart` | Cart |
| `/checkout` | Customer + payment method |
| `/order/[id]` | Thank-you |

## Dashboard

Login → Overview, Orders, Products, Categories, Store settings, Users, Logs (owner), Errors.

Deploy Firestore rules:

```bash
firebase deploy --only firestore:rules
```

## Cursor skill

Cloudinary uploads: `.cursor/skills/cloudinary-uploads/SKILL.md`

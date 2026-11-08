# How Wanas ecommerce works

**Brand:** ونس / Wanas  
**Positioning:** Handmade ceramics, jewelry, decor, and gift boxes.  
**Hotline / WhatsApp:** 01061381439 (+201061381439)

## Commercial path

```
Browse shop → Add to cart → Checkout on site
  → Order saved in Firestore (status: new)
  → Payment: COD | InstaPay | WhatsApp confirmation
  → Staff updates status in dashboard
  → Ship or workshop pickup
```

There is **no card payment gateway** in this version.

## Catalog

- Products live in Firestore `products` (seed defaults ship with the app if empty).
- Categories in `categories`.
- Store settings in `config/store` (brand, shipping, InstaPay text, featured IDs).

## Checkout rules

- Server `POST /api/orders` re-reads live product prices and stock.
- Shipping: flat fee from settings, free over threshold, zero for pickup.
- WhatsApp method opens a prefilled order message after save.

## Dashboard

Staff (Firebase Auth + `admins`) manage products, categories, orders, and store settings. Owner also sees audit logs and can remove users.

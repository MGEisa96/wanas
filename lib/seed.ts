import type { Category, Product, StoreSettings } from "./commerce";

export function defaultStoreSettings(): StoreSettings {
  return {
    brand: {
      name: { ar: "ونس", en: "Wanas" },
      tagline: {
        ar: "منتجات يدوية بروح البيت",
        en: "Handmade pieces with a home-made soul",
      },
      logo: "/assets/logo.jpeg",
    },
    phones: {
      primary: "01061381439",
      whatsapp: "201061381439",
    },
    seo: {
      title: "ونس | منتجات يدوية بروح البيت",
      description:
        "ونس للمنتجات اليدوية: سيراميك، إكسسوارات، ديكور، وبوكسات هدايا — اطلبي أونلاين وأكّدي عبر واتساب أو الدفع عند الاستلام أو إنستاباي.",
    },
    shipping: {
      flatFee: 60,
      freeOver: 800,
      enabled: true,
    },
    instapay: {
      enabled: true,
      number: "01061381439",
      instructions: {
        ar: "حوّلي على إنستاباي بنفس رقم الواتساب، وابعتي صورة التحويل بعد الطلب.",
        en: "Transfer via InstaPay to the WhatsApp number, then send the receipt after ordering.",
      },
    },
    cod: {
      enabled: true,
      note: {
        ar: "الدفع نقداً عند الاستلام داخل القاهرة والجيزة، وبالاتفاق لباقي المحافظات.",
        en: "Cash on delivery in Cairo and Giza; other governorates by agreement.",
      },
    },
    whatsappCheckout: { enabled: true },
    featuredProductIds: [
      "ceramic-mug",
      "gift-box",
      "jewelry-set",
      "serving-tray",
    ],
    hero: {
      eyebrow: {
        ar: "قطع يدوية للبيت والهدايا",
        en: "Handmade for home and gifts",
      },
      title: {
        ar: "ونس",
        en: "Wanas",
      },
      subtitle: {
        ar: "سيراميك وإكسسوارات وديكور بتفصيلة هادئة — اطلبي من المتجر وأكّدي الطلب بالطريقة اللي تريحك.",
        en: "Calm ceramics, jewelry, and decor — shop online and confirm the way that suits you.",
      },
      cta: { ar: "تسوّقي الآن", en: "Shop now" },
      image: "/assets/logo.jpeg",
    },
    footerNote: {
      ar: "صنع يدوي · تغليف هدية · شحن داخل مصر",
      en: "Handmade · gift wrap · shipping across Egypt",
    },
  };
}

export function seedCategories(): Category[] {
  return [
    {
      id: "ceramics",
      name: { ar: "سيراميك", en: "Ceramics" },
      slug: "ceramics",
      sort: 1,
      visible: true,
    },
    {
      id: "jewelry",
      name: { ar: "إكسسوارات", en: "Jewelry" },
      slug: "jewelry",
      sort: 2,
      visible: true,
    },
    {
      id: "decor",
      name: { ar: "ديكور", en: "Decor" },
      slug: "decor",
      sort: 3,
      visible: true,
    },
    {
      id: "gifts",
      name: { ar: "هدايا", en: "Gifts" },
      slug: "gifts",
      sort: 4,
      visible: true,
    },
    {
      id: "candles",
      name: { ar: "شموع", en: "Candles" },
      slug: "candles",
      sort: 5,
      visible: true,
    },
  ];
}

const now = Date.UTC(2026, 0, 1);

export function seedProducts(): Product[] {
  const base = (partial: Omit<Product, "createdAt" | "updatedAt">): Product => ({
    ...partial,
    createdAt: now,
    updatedAt: now,
  });

  return [
    base({
      id: "ceramic-mug",
      name: {
        ar: "مج سيراميك يدوي",
        en: "Handmade ceramic mug",
      },
      slug: "ceramic-mug",
      description: {
        ar: "مج سيراميك بألوان هادئة، طلاء آمن للطعام، مناسب للقهوة اليومية أو كهدية بسيطة.",
        en: "A soft-toned ceramic mug with food-safe glaze — for everyday coffee or a simple gift.",
      },
      price: 220,
      compareAtPrice: 260,
      images: [
        "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80",
        "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800&q=80",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
      ],
      categoryIds: ["ceramics", "gifts"],
      stock: 24,
      status: "active",
      tags: ["mug", "ceramic"],
      featured: true,
    }),
    base({
      id: "serving-tray",
      name: {
        ar: "صينية تقديم خشب ومعدن",
        en: "Wood & metal serving tray",
      },
      slug: "serving-tray",
      description: {
        ar: "صينية عملية لطاولات الضيافة مع مقابض معدنية وتشطيب يدوي ناعم.",
        en: "A practical hosting tray with metal handles and a soft hand finish.",
      },
      price: 480,
      images: [
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
        "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=80",
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80",
      ],
      categoryIds: ["decor"],
      stock: 12,
      status: "active",
      tags: ["tray"],
      featured: true,
    }),
    base({
      id: "jewelry-set",
      name: {
        ar: "طقم إكسسوارات خرز",
        en: "Bead jewelry set",
      },
      slug: "jewelry-set",
      description: {
        ar: "حلق وأسورة بألوان موسمية خفيفة، مع تغليف صغير أنيق.",
        en: "Earrings and bracelet in light seasonal colors, with small elegant packaging.",
      },
      price: 320,
      images: ["/assets/logo.jpeg"],
      categoryIds: ["jewelry", "gifts"],
      stock: 18,
      status: "active",
      tags: ["jewelry"],
      featured: true,
    }),
    base({
      id: "gift-box",
      name: {
        ar: "بوكس هدايا ونس",
        en: "Wanas gift box",
      },
      slug: "gift-box",
      description: {
        ar: "مجموعة مختارة متناسقة مع تغليف وكرت رسالة — جاهزة للإهداء.",
        en: "A curated matching set with wrap and a note card — ready to gift.",
      },
      price: 650,
      compareAtPrice: 750,
      images: [
        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80",
        "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&q=80",
        "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&q=80",
      ],
      categoryIds: ["gifts"],
      stock: 10,
      status: "active",
      tags: ["gift"],
      featured: true,
    }),
    base({
      id: "wall-hoop",
      name: {
        ar: "لوحة حائط مطرزة",
        en: "Embroidered wall hoop",
      },
      slug: "wall-hoop",
      description: {
        ar: "تطريز يدوي على طارة، جاهزة للتعليق فوق المكتب أو سرير الأطفال.",
        en: "Hand embroidery on a hoop — ready to hang above a desk or child’s bed.",
      },
      price: 380,
      images: ["/assets/logo.jpeg"],
      categoryIds: ["decor"],
      stock: 8,
      status: "active",
      tags: ["embroidery"],
      featured: false,
    }),
    base({
      id: "candle-set",
      name: {
        ar: "طقم شموع سيراميك",
        en: "Ceramic candle set",
      },
      slug: "candle-set",
      description: {
        ar: "شموع معطرة في أواني سيراميك قابلة لإعادة الاستخدام.",
        en: "Scented candles in reusable ceramic vessels.",
      },
      price: 290,
      images: ["/assets/logo.jpeg"],
      categoryIds: ["ceramics", "gifts"],
      stock: 15,
      status: "active",
      tags: ["candle"],
      featured: false,
    }),
    base({
      id: "custom-nameplate",
      name: {
        ar: "قطعة مخصصة بالاسم",
        en: "Custom name piece",
      },
      slug: "custom-nameplate",
      description: {
        ar: "قطعة مخصصة بالنص والألوان — نثبت التفاصيل معاك قبل التنفيذ.",
        en: "A custom piece with your text and colors — details confirmed before making.",
      },
      price: 550,
      images: ["/assets/logo.jpeg"],
      categoryIds: ["gifts"],
      stock: 99,
      status: "active",
      tags: ["custom"],
      featured: false,
    }),
    base({
      id: "favor-pack",
      name: {
        ar: "باقة توزيعات مناسبة",
        en: "Event favor pack",
      },
      slug: "favor-pack",
      description: {
        ar: "باقة موحدة الشكل لتوزيعات الأفراح وبيبي شاور (١٠ قطع).",
        en: "A matched pack of 10 favors for weddings and baby showers.",
      },
      price: 750,
      images: ["/assets/logo.jpeg"],
      categoryIds: ["gifts"],
      stock: 6,
      status: "active",
      tags: ["favors"],
      featured: false,
    }),
    base({
      id: "coffee-glass-candle",
      name: { ar: "شمعة قهوة", en: "Coffee glass candle" },
      slug: "coffee-glass-candle",
      description: {
        ar: "شمعة في كوب زجاج بتدرج بني وفاتح، وفوقها حبات شمع على شكل بن.",
        en: "A glass candle poured in two coffee tones, topped with wax coffee beans.",
      },
      price: 280,
      images: ["/assets/candles/coffee-glass.jpg"],
      categoryIds: ["candles"],
      stock: 8,
      status: "active",
      tags: ["candle", "coffee"],
      featured: false,
    }),
    base({
      id: "wax-charm-set",
      name: { ar: "طقم تعليقات شمع", en: "Wax charm set" },
      slug: "wax-charm-set",
      description: {
        ar: "تعليقات شمع بخيط: قلب، نجمة، وردة، ودائرة. تعلق في الدولاب أو كهدية صغيرة.",
        en: "Wax charms on cord: heart, star, flower, and circle. Hang them or gift them.",
      },
      price: 240,
      images: ["/assets/candles/wax-charms.jpg"],
      categoryIds: ["candles", "gifts"],
      stock: 10,
      status: "active",
      tags: ["candle", "charm"],
      featured: false,
    }),
    base({
      id: "rose-bubble-candle",
      name: { ar: "شمعة وردة", en: "Rose bubble candle" },
      slug: "rose-bubble-candle",
      description: {
        ar: "شمعة وردة منحوتة في طبق فقاعات، تضاء من النص.",
        en: "A carved rose candle set in a bubble dish, lit from the center.",
      },
      price: 450,
      images: ["/assets/candles/rose-bubble.jpg"],
      categoryIds: ["candles", "decor"],
      stock: 4,
      status: "active",
      tags: ["candle", "rose"],
      featured: false,
    }),
    base({
      id: "wanas-lilac-candle",
      name: { ar: "شمعة ونس البنفسجية", en: "Wanas lilac candle" },
      slug: "wanas-lilac-candle",
      description: {
        ar: "شمعة بنفسجية في كوب لامع بستيكر ونس.",
        en: "A lilac candle in an iridescent glass with the Wanas sticker.",
      },
      price: 340,
      images: ["/assets/candles/lilac-jar.jpg"],
      categoryIds: ["candles"],
      stock: 8,
      status: "active",
      tags: ["candle", "jar"],
      featured: false,
    }),
    base({
      id: "heart-cube-candle",
      name: { ar: "شمعة قلوب", en: "Heart cube candle" },
      slug: "heart-cube-candle",
      description: {
        ar: "شمعة حمراء مكعبة من قلوب صغيرة متراصة.",
        en: "A red cube candle built from stacked little hearts.",
      },
      price: 290,
      images: ["/assets/candles/heart-cube.jpg"],
      categoryIds: ["candles", "gifts"],
      stock: 8,
      status: "active",
      tags: ["candle", "heart"],
      featured: false,
    }),
    base({
      id: "galaxy-candle",
      name: { ar: "شمعة مجرة", en: "Galaxy candle" },
      slug: "galaxy-candle",
      description: {
        ar: "شمعة زرقاء بتموجات فضية في كوب زجاج، ومعاها كرت: في مجرة مليئة بالنجوم كنتِ أنتِ نجمي المفضل.",
        en: "A blue swirled candle in glass, with a note card.",
      },
      price: 360,
      images: ["/assets/candles/galaxy-jar.jpg"],
      categoryIds: ["candles", "gifts"],
      stock: 6,
      status: "active",
      tags: ["candle", "galaxy"],
      featured: false,
    }),
    base({
      id: "berry-candle",
      name: { ar: "شمعة توت", en: "Berry candle" },
      slug: "berry-candle",
      description: {
        ar: "شمعة حمراء في كوب، سطحها حبات توت شمع، والغطا بشعار ونس.",
        en: "A red jar candle topped with wax berries, lid stamped with Wanas.",
      },
      price: 320,
      images: ["/assets/candles/berry-jar.jpg"],
      categoryIds: ["candles"],
      stock: 8,
      status: "active",
      tags: ["candle", "berry"],
      featured: false,
    }),
    base({
      id: "daisy-candle",
      name: { ar: "شمعة زهرة", en: "Daisy candle" },
      slug: "daisy-candle",
      description: {
        ar: "شمعة وردية في كوب زجاج، وفوقها زهرة شمع فاتحة.",
        en: "A pink glass candle topped with a pale wax daisy.",
      },
      price: 310,
      images: ["/assets/candles/daisy-jar.jpg"],
      categoryIds: ["candles"],
      stock: 8,
      status: "active",
      tags: ["candle", "flower"],
      featured: false,
    }),
    base({
      id: "glitter-charm-set",
      name: { ar: "طقم شمع لامع", en: "Glitter wax set" },
      slug: "glitter-charm-set",
      description: {
        ar: "سبع تعليقات شمع لامعة بأشكال مختلفة وخيط خيش.",
        en: "Seven glitter wax charms in mixed shapes, each on jute cord.",
      },
      price: 260,
      images: ["/assets/candles/glitter-charms.jpg"],
      categoryIds: ["candles", "gifts"],
      stock: 10,
      status: "active",
      tags: ["candle", "glitter"],
      featured: false,
    }),
    base({
      id: "bubble-knot-candle",
      name: { ar: "شمعة فقاعات", en: "Bubble knot candle" },
      slug: "bubble-knot-candle",
      description: {
        ar: "شمعة صغيرة بشكل عقدة فقاعات بلون موف.",
        en: "A small mauve candle shaped like a knotted bubble.",
      },
      price: 270,
      images: ["/assets/candles/bubble-knot.jpg"],
      categoryIds: ["candles"],
      stock: 8,
      status: "active",
      tags: ["candle", "bubble"],
      featured: false,
    }),
  ];
}

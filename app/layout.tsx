import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cairo } from "next/font/google";
import { ErrorTracker } from "@/components/ErrorTracker";
import { FirebaseAnalytics } from "@/components/FirebaseAnalytics";
import { MotionRoot } from "@/components/MotionRoot";
import { CartProvider } from "@/lib/cart";
import { StoreProvider } from "@/lib/store";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme";
import { UiProvider } from "@/lib/ui";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wanas.local"),
  title: "ونس | منتجات يدوية بروح البيت",
  description:
    "ونس للمنتجات اليدوية: سيراميك، إكسسوارات، ديكور، وبوكسات هدايا — اطلبي أونلاين وأكّدي عبر واتساب أو الدفع عند الاستلام أو إنستاباي.",
  applicationName: "ونس",
  icons: {
    icon: [{ url: "/assets/logo.jpeg", type: "image/jpeg" }],
    apple: "/assets/logo.jpeg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} light antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="min-h-dvh bg-background font-sans text-foreground">
        <FirebaseAnalytics />
        <ErrorTracker />
        <UiProvider>
          <StoreProvider>
            <CartProvider>
              <MotionRoot>{children}</MotionRoot>
            </CartProvider>
          </StoreProvider>
        </UiProvider>
      </body>
    </html>
  );
}

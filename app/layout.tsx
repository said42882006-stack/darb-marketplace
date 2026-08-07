import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "OTR — إيجارات ونقل بثقة",
  description: "منصة لتأجير العقارات والأراضي والشاليهات والمنتجعات والفنادق والسيارات والدراجات والقوارب والكرفان، ونشر خدمات النقل العام والمندوب والرافعات والمعدات الثقيلة.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-body min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}


import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { auth } from "@/lib/auth";
import SessionProvider from "@/components/layout/SessionProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HiranandaniHomes — Real Estate Advisors",
    template: "%s | HiranandaniHomes",
  },
  description:
    "Discover exceptional homes in Hiranandani Estate, Thane. Zero brokerage — browse listings and connect directly with verified owners for free.",
  keywords: [
    "Hiranandani Estate",
    "Hiranandani homes",
    "Thane real estate",
    "flats for rent Thane",
    "flats for sale Thane",
    "luxury homes Thane",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://hiranandanihomes.in",
    siteName: "HiranandaniHomes",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch session on server so SessionProvider hydrates instantly —
  // no loading flash, no stale state when navigating between route groups
  const session = await auth();

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <SessionProvider session={session}>
          {children}
          <Toaster richColors position="top-right" />
        </SessionProvider>
      </body>
    </html>
  );
}

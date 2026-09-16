import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = { title: "Examinery Admin", description: "Admin dashboard for Examinery" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" className={montserrat.variable}><body className="bg-gray-50 text-gray-900 font-body"><Providers>{children}</Providers></body></html>);
}

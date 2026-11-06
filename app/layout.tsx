import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "@/styles/juno.css";
import { cx } from "@/utils/cx";

export const metadata: Metadata = {
  title: "juno",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cx("dark h-full antialiased", GeistSans.variable, GeistMono.variable)}>
      <body className="min-h-full bg-background-full font-sans text-text-primary">{children}</body>
    </html>
  );
}

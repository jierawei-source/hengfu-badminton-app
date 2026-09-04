import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "恆富創新｜智慧羽球館・匹克球館管理系統",
  description:
    "恆富創新提供智慧羽球館、匹克球館自助結帳與門禁管理系統，協助場館 24 小時無人自動化營運。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Outfit:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

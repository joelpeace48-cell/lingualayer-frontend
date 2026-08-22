import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { WalletProvider } from "@/contexts/WalletContext";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "LinguaLayer",
    template: "%s | " + "LinguaLayer",
  },
  description: "Rights, licensing, and royalties for African language AI.",
  applicationName: "LinguaLayer",
  openGraph: {
    title: "LinguaLayer",
    description: "Rights, licensing, and royalties for African language AI.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinguaLayer",
    description: "Rights, licensing, and royalties for African language AI.",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
};

const nav = [
  ["Communities", "/communities"],
  ["Licensing", "/licensing"],
  ["Royalties", "/royalties"],
  ["Governance", "/governance"],
  ["Roadmap", "/roadmap"],
  ["Docs", "/docs"],
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <header className="nav">
            <div className="container nav-inner">
              <Link href="/" className="brand brand-with-logo">
                <Image
                  src="/icon.svg"
                  alt=""
                  width={38}
                  height={38}
                  className="nav-logo"
                  unoptimized
                />
                <span className="brand-text">LinguaLayer</span>
              </Link>
              <nav className="links">
                {nav.map(([label, href]) => (
                  <Link key={href} href={href}>{label}</Link>
                ))}
              </nav>
              <WalletConnectButton />
            </div>
          </header>
          <main className="container">{children}</main>
        </WalletProvider>
      </body>
    </html>
  );
}

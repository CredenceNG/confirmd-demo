import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ConfirmD Demos - Verifiable Credential Use Cases",
  description: "Explore real-world applications of verifiable credentials with ConfirmD Platform demonstrations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

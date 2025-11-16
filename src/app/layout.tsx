import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { DemoSessionProvider } from "@/contexts/DemoSessionContext";
import GlobalLeaveDemoButton from "@/components/GlobalLeaveDemoButton";

export const metadata: Metadata = {
  title: "Confirmd Demos - Verifiable Credential Use Cases",
  description: "Explore real-world applications of verifiable credentials with Confirmd Platform demonstrations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <DemoSessionProvider>
          {/* Header */}
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                {/* Logo and Brand */}
                <Link href="/" className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2L4 5V11C4 16.55 7.84 21.74 12 23C16.16 21.74 20 16.55 20 11V5L12 2Z"
                      fill="white"
                      fillOpacity="0.95"
                    />
                    <path
                      d="M10 14.17L7.83 12L7.12 12.71L10 15.59L16.88 8.71L16.17 8L10 14.17Z"
                      fill="#3B82F6"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Confirmd Platform
                  </h1>
                  <p className="text-sm text-gray-500">
                    Verifiable Credentials Demos
                  </p>
                </div>
              </Link>

              {/* Navigation Links */}
              <div className="flex items-center gap-2">
                <GlobalLeaveDemoButton />
                <Link
                  href="/articles"
                  className="px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium"
                >
                  Articles
                </Link>
                <Link
                  href="/about"
                  className="px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium"
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className="px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1">
          {children}
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600 text-sm">
              <p>
                Confirmd Platform is a product of{" "}
                <a
                  href="https://credence.ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Credence Networks, Inc
                </a>
                {" "}• {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </footer>
        </DemoSessionProvider>
      </body>
    </html>
  );
}

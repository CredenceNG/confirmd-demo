import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-[#1e3a5f] text-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold">
              ConfirmD
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/"
                className="text-white hover:text-gray-200 transition-colors border-b-2 border-white pb-1"
              >
                Personal
              </Link>
              <Link
                href="#"
                className="text-white hover:text-gray-200 transition-colors"
              >
                Business
              </Link>
              <Link
                href="#"
                className="text-white hover:text-gray-200 transition-colors"
              >
                About Us
              </Link>
              <Link
                href="#"
                className="text-white hover:text-gray-200 transition-colors"
              >
                Contact
              </Link>
            </div>

            {/* CTA Button */}
            <Link
              href="/nelfund"
              className="bg-[#f97316] hover:bg-[#ea6a0f] text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="text-blue-500 hover:underline">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-400">Home</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-[#1e3a5f] mb-6 leading-tight">
                Simplified way to{" "}
                <span className="text-[#f97316]">confirm</span> data about
                yourself, digitally.
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Securely manage your digital credentials, control your personal
                data, and prove who you are digitally with confidence.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/nelfund"
                  className="bg-[#f97316] hover:bg-[#ea6a0f] text-white px-8 py-3.5 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                >
                  Try Our Demo
                </Link>
                <Link
                  href="#"
                  className="bg-white hover:bg-gray-50 text-[#1e3a5f] border-2 border-[#1e3a5f] px-8 py-3.5 rounded-lg font-semibold transition-colors"
                >
                  Get Confirmed
                </Link>
              </div>
            </div>

            {/* Right Content - Phone Mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-[300px] h-[600px] bg-black rounded-[3rem] p-3 shadow-2xl">
                {/* Phone Screen */}
                <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden">
                  {/* Status Bar */}
                  <div className="bg-black text-white px-6 py-2 flex items-center justify-between text-xs">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span>📶</span>
                      <span>📡</span>
                      <span>🔋</span>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="bg-black text-white px-6 py-4">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                        <span className="text-black text-sm font-bold">✓</span>
                      </div>
                      <h2 className="text-xl font-bold">CONFIRMD</h2>
                    </div>

                    <h3 className="text-lg mb-6">My Wallet</h3>

                    {/* Credentials */}
                    <div className="space-y-3">
                      {/* Confirmed Person */}
                      <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                          <span className="text-white">✓</span>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">CONFIRMED</div>
                          <div className="font-semibold">PERSON</div>
                        </div>
                      </div>

                      {/* Driver's License */}
                      <div className="bg-blue-900 rounded-lg p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#f97316] rounded flex items-center justify-center">
                          <span className="text-white text-xl">🪪</span>
                        </div>
                        <div>
                          <div className="text-sm text-blue-300">DRIVER'S</div>
                          <div className="font-semibold">LICENSE</div>
                        </div>
                      </div>

                      {/* Employee ID */}
                      <div className="bg-red-900 rounded-lg p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#f97316] rounded flex items-center justify-center">
                          <span className="text-white text-xl">🪪</span>
                        </div>
                        <div>
                          <div className="text-sm text-red-300">EMPLOYEE</div>
                          <div className="font-semibold">ID</div>
                        </div>
                      </div>

                      {/* Transcripts */}
                      <div className="bg-green-900 rounded-lg p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#f97316] rounded flex items-center justify-center">
                          <span className="text-white text-xl">📄</span>
                        </div>
                        <div>
                          <div className="text-sm text-green-300">TRANSCRIPTS</div>
                          <div className="font-semibold"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Bar */}
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                    <div className="w-32 h-1 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1e3a5f] mb-4">
              How it works
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Confirmed Person makes managing your Digital Credentials simple and intuitive
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-[#f97316] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold text-[#1e3a5f] mb-4">
                Download the app
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get started with our secure Digital Trust Wallet app now available on iOS and Android.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-[#f97316] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold text-[#1e3a5f] mb-4">
                Verify your identity
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Complete a simple verification process to receive your Digital Credentials.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-[#f97316] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold text-[#1e3a5f] mb-4">
                Use anywhere
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Securely share your Confirmed Credentials with private and govt services without hassles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community and Partners Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-[#1e3a5f] text-center mb-12">
            Our Community members and Partners
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
            {/* Partner Logos - Placeholder boxes */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-center hover:shadow-md transition-shadow min-h-[120px]">
              <div className="text-center">
                <div className="font-bold text-[#1e3a5f] text-sm">THE LINUX</div>
                <div className="font-bold text-[#1e3a5f] text-sm">FOUNDATION</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-center hover:shadow-md transition-shadow min-h-[120px]">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-center hover:shadow-md transition-shadow min-h-[120px]">
              <div className="text-center">
                <div className="font-bold text-blue-600 text-lg">Hyperledger</div>
                <div className="text-sm text-gray-600">Aries</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-center hover:shadow-md transition-shadow min-h-[120px]">
              <div className="text-center">
                <div className="font-bold text-blue-600 text-lg">Hyperledger</div>
                <div className="text-sm text-gray-600">Indy</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-center hover:shadow-md transition-shadow min-h-[120px]">
              <div className="text-center">
                <div className="font-bold text-[#1e3a5f] text-sm">OpenWallet</div>
                <div className="font-bold text-[#1e3a5f] text-sm">Foundation</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-center hover:shadow-md transition-shadow min-h-[120px]">
              <div className="text-center">
                <div className="font-bold text-purple-600 text-lg">DIDComm</div>
                <div className="text-sm text-gray-600">Messaging</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-white">ConfirmD</span>
              </div>
              <p className="text-gray-400 mb-4">
                Building trust in digital interactions through verifiable credentials and decentralized identity.
              </p>
              <p className="text-sm text-gray-500">
                © 2025 ConfirmD Platform. All rights reserved.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://docs.confirmd.com" className="text-gray-400 hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="https://github.com/confirmd" className="text-gray-400 hover:text-white transition-colors">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="/nelfund" className="text-gray-400 hover:text-white transition-colors">
                    Demos
                  </a>
                </li>
              </ul>
            </div>

            {/* Download */}
            <div>
              <h3 className="text-white font-semibold mb-4">Get the App</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://apps.apple.com/app/confirmd/id6504173780" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    iOS App Store
                  </a>
                </li>
                <li>
                  <a href="https://play.google.com/store/apps/details?id=ng.credence.confirmd" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    Google Play
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

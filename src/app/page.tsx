/**
 * Demos Landing Page
 *
 * Showcases all available ConfirmD Platform integration demos
 */
"use client";

import Link from "next/link";
import { useState } from "react";

interface Demo {
  id: string;
  title: string;
  description: string;
  href: string;
  status: "active" | "coming-soon";
  icon: string;
  features: string[];
  category?: string;
  tested?: boolean; // Whether the demo has been end-to-end tested
}

const demos: Demo[] = [
  {
    id: "academic-employers",
    title: "Academic Credentials - For Employers",
    description: "Instantly verify job applicants' academic qualifications without contacting institutions. Reduce hiring fraud and speed up recruitment processes.",
    href: "/academic/employers",
    status: "coming-soon",
    icon: "💼",
    category: "Education",
    features: [
      "Real-time degree verification",
      "Fraud detection and prevention",
      "Bulk credential verification",
      "Integration with HR systems",
    ],
  },
  {
    id: "academic-students",
    title: "Academic Credentials - For Students",
    description: "Store and share your academic achievements securely. Present verified credentials to employers and institutions without waiting for official transcripts.",
    href: "/academic/students",
    status: "coming-soon",
    icon: "📚",
    category: "Education",
    features: [
      "Digital credential wallet",
      "One-click credential sharing",
      "Privacy-preserving disclosure",
      "Lifetime credential access",
    ],
  },
  {
    id: "academic-universities",
    title: "Statement of Results",
    description: "Issue tamper-proof Statement of Results and academic credentials to graduating students. Required for NYSC registration and employment verification.",
    href: "/academic/universities",
    status: "active",
    icon: "🏛️",
    category: "Education",
    tested: true,
    features: [
      "Issue Statement of Results",
      "Digital transcript generation",
      "Verifiable degree certificates",
      "Alumni credential management",
    ],
  },
  {
    id: "document-backed-holders",
    title: "Document-Backed Credentials - For Holders",
    description: "Apply for your digital driver's license online. Submit your application and receive your credential securely via email once approved by FRSC.",
    href: "/document-backed/holders",
    status: "active",
    icon: "🪪",
    category: "Government & Public Sector",
    features: [
      "Submit driver's license application online",
      "Receive credential via email",
      "Store securely in your digital wallet",
      "Use for insurance, rentals, and more",
    ],
  },
  {
    id: "document-backed-issuers",
    title: "Document-Backed Credentials - For Issuers",
    description: "Issue verifiable driver's license credentials after verifying government-issued documents. Government agencies like FRSC can digitize physical licenses into tamper-proof verifiable credentials.",
    href: "/document-backed/issuers",
    status: "active",
    icon: "🏢",
    category: "Government & Public Sector",
    features: [
      "Upload and process driver's license documents",
      "Extract information automatically",
      "Issue tamper-proof verifiable credentials",
      "Secure delivery to citizen's wallet",
    ],
  },
  {
    id: "document-backed-relying-parties",
    title: "Document-Backed Credentials - For Relying Parties",
    description: "Verify driver's license credentials instantly for insurance applications. Insurance companies can cryptographically verify licenses without handling physical documents or storing sensitive data.",
    href: "/document-backed/relying-parties",
    status: "active",
    icon: "✅",
    category: "Government & Public Sector",
    features: [
      "Request driver's license from customers",
      "Cryptographic verification in seconds",
      "No physical document handling",
      "Privacy-preserving data extraction",
    ],
  },
  {
    id: "government-permits-citizens",
    title: "Government Permits - For Citizens",
    description: "Access and share your permits and licenses digitally. Prove compliance to contractors, landlords, and inspectors without carrying physical documents.",
    href: "/government/permits/citizens",
    status: "coming-soon",
    icon: "📋",
    category: "Government & Public Sector",
    features: [
      "Digital permit storage",
      "Instant permit verification",
      "Renewal reminders and alerts",
      "Easy sharing with authorities",
    ],
  },
  {
    id: "government-permits-government",
    title: "Government Permits - For Government",
    description: "Digitize permit issuance and management for government agencies. Issue verifiable building permits, business licenses, and regulatory approvals instantly.",
    href: "/government/permits/government",
    status: "coming-soon",
    icon: "🏢",
    category: "Government & Public Sector",
    features: [
      "Digital permit issuance",
      "Automated compliance tracking",
      "Real-time permit status updates",
      "Revenue collection integration",
    ],
  },
  {
    id: "legal-evidence",
    title: "Court-Ready Credentials - For Legal Professionals",
    description: "Verify credentials that meet modern evidentiary standards for court proceedings. Cryptographically-signed credentials provide stronger proof of authenticity than traditional paper documents.",
    href: "/legal/evidence",
    status: "coming-soon",
    icon: "⚖️",
    category: "Government & Public Sector",
    features: [
      "Digital chain of custody verification",
      "Non-repudiation guarantees",
      "Remote document authentication",
      "Nigerian Evidence Act 2011 compliance",
    ],
  },
  {
    id: "health-issue-card",
    title: "Health Sector - Issue Medical Health Card",
    description: "Issue verifiable medical health cards to patients with comprehensive medical information. Hospital admins can digitally credential patients with health details, blood type, allergies, and chronic conditions.",
    href: "/health/issue-card",
    status: "active",
    icon: "🏥",
    category: "Healthcare",
    features: [
      "Issue digital medical health cards",
      "Patient medical records management",
      "Blood type and genotype verification",
      "Allergy and condition tracking",
    ],
  },
  {
    id: "health-verify-patient",
    title: "Health Sector - Verify Patient for Visit",
    description: "Verify patient medical health cards for hospital visits. Instantly access verified patient information including medical history, allergies, and chronic conditions for safe and efficient visit registration.",
    href: "/health/verify-patient",
    status: "active",
    icon: "👨‍⚕️",
    category: "Healthcare",
    features: [
      "Instant patient credential verification",
      "Medical history access for visits",
      "Allergy and condition alerts",
      "Secure patient visit registration",
    ],
  },
  {
    id: "medical-fitness",
    title: "Medical Fitness Certificate - For Medical Centers",
    description: "Issue verifiable Medical Fitness Certificates to graduating students. Required for NYSC registration and employment. Streamline health clearance verification.",
    href: "/medical/fitness",
    status: "active",
    icon: "🏥",
    category: "Healthcare",
    tested: true,
    features: [
      "Issue Medical Fitness Certificates",
      "Digital health clearance",
      "NYSC registration requirement",
      "Tamper-proof verification",
    ],
  },
  {
    id: "nysc",
    title: "NYSC Registration & Onboarding",
    description: "Complete two-phase NYSC journey: Register with academic credentials to get Green Card, then use Green Card at camp to receive NYSC ID. Demonstrates credential chaining and multi-stage workflows.",
    href: "/nysc",
    status: "active",
    icon: "🇳🇬",
    category: "Government & Public Sector",
    tested: true,
    features: [
      "Multi-stage credential lifecycle",
      "Credential chaining workflow",
      "Green Card issuance",
      "NYSC ID Card issuance",
    ],
  },
  {
    id: "professional-job-portal",
    title: "Professional Job Portal - Graduate Onboarding",
    description: "Apply for jobs using verified academic and NYSC credentials. Graduates can instantly share their Statement of Result and NYSC Certificate for employment verification, eliminating weeks of document verification.",
    href: "/professional",
    status: "active",
    icon: "💼",
    category: "Employment",
    tested: true,
    features: [
      "Dual credential verification (Academic + NYSC)",
      "Instant employer verification",
      "Auto-populated application forms",
      "Tamper-proof qualification proof",
    ],
  },
  {
    id: "professional-members",
    title: "Professional Memberships - For Members",
    description: "Register for the 2025 Annual Professional Development Conference with exclusive member discounts. Verify your membership designation to receive automatic discounts (Emeritus 50%, Fellow 30%, Senior 20%, Member 15%).",
    href: "/professional/members",
    status: "active",
    icon: "👔",
    category: "Memberships",
    features: [
      "Conference registration with member discounts",
      "Instant membership verification",
      "Designation-based pricing (up to 50% off)",
      "Automatic discount calculation",
    ],
  },
  {
    id: "professional-organizations",
    title: "Professional Memberships - For Organizations",
    description: "Issue verifiable membership credentials and certifications to your members. Manage license renewals, continuing education requirements, and member standing digitally.",
    href: "/professional/organizations",
    status: "active",
    icon: "🏢",
    category: "Memberships",
    features: [
      "Issue digital membership credentials",
      "Automated license renewal tracking",
      "Continuing education credit management",
      "Member standing verification",
    ],
  },
  {
    id: "kyc-account-holders",
    title: "Reusable KYC - For Account Holders",
    description: "Complete KYC verification once and reuse it across multiple financial services. Control what information you share with each institution.",
    href: "/kyc/account-holders",
    status: "coming-soon",
    icon: "👤",
    category: "Financial Services",
    features: [
      "One-time identity verification",
      "Selective information disclosure",
      "Instant account opening",
      "Privacy control and consent",
    ],
  },
  {
    id: "kyc-institutions",
    title: "Reusable KYC - For Institutions",
    description: "Accept pre-verified KYC credentials from customers. Reduce onboarding friction, cut verification costs, and ensure regulatory compliance.",
    href: "/kyc/institutions",
    status: "coming-soon",
    icon: "🏦",
    category: "Financial Services",
    features: [
      "Instant customer verification",
      "Reduced onboarding costs",
      "Regulatory compliance assurance",
      "Risk assessment integration",
    ],
  },
  {
    id: "student-card",
    title: "Student Card",
    description: "Verifiable digital student identity credentials. Confirm studentship with verified information including names, admission number, matriculation number, department, programme, and year of graduation.",
    href: "/student-card",
    status: "active",
    icon: "🎫",
    category: "Education",
    tested: true,
    features: [
      "Student identity verification",
      "Admission and matric number confirmation",
      "Department and programme details",
      "Year of graduation validation",
    ],
  },
  {
    id: "course-registration",
    title: "Course Registration",
    description: "Semester course registration for students. Verify student identity with Student Card credential, process payment, and register for courses - all with verifiable credentials.",
    href: "/education/course-registration",
    status: "active",
    icon: "📝",
    category: "Education",
    tested: true,
    features: [
      "Verify student identity with Student Card",
      "Semester payment processing",
      "Course selection and registration",
      "Privacy-preserving student verification",
    ],
  },
  {
    id: "loan",
    title: "Student Loan Application",
    description: "Verify student credentials using verifiable credentials for loan applications. Demonstrates proof request flows and credential verification.",
    href: "/loan",
    status: "active",
    icon: "🎓",
    category: "Government & Public Sector",
    features: [
      "Student credential verification",
      "Multi-attribute proof requests",
      "Real-time verification status",
      "Secure credential presentation",
    ],
  },
  {
    id: "training-verify-certification",
    title: "Training Certifications - For Employers",
    description: "Verify candidate training certifications for employment decisions. Instantly authenticate professional training credentials to confirm candidate skills and qualifications during hiring.",
    href: "/training/verify-certification",
    status: "active",
    icon: "💼",
    category: "Training & Development",
    features: [
      "Instant certification verification",
      "Candidate skills authentication",
      "Employment background checks",
      "Hiring decision support",
    ],
  },
  {
    id: "training-issue-certification",
    title: "Training Certifications - For Training Organizations",
    description: "Issue verifiable professional training certifications to course graduates. Training organizations can digitally credential students with course completion, grades, and skills acquired.",
    href: "/training/issue-certification",
    status: "active",
    icon: "🎓",
    category: "Training & Development",
    features: [
      "Issue digital training certifications",
      "Course completion verification",
      "Grade and skills documentation",
      "Tamper-proof credential issuance",
    ],
  },
  {
    id: "finance-issue-ekyc",
    title: "Issuing eKYC",
    description: "Issue verifiable eKYC (electronic Know Your Customer) credentials to customers after identity verification. Financial institutions can digitally credential customers with verified identity information.",
    href: "/finance/issue-ekyc",
    status: "active",
    icon: "🏦",
    category: "Finance",
    features: [
      "Issue digital eKYC credentials",
      "Customer identity verification",
      "Regulatory compliance (KYC/AML)",
      "Secure credential delivery to wallet",
    ],
  },
  {
    id: "finance-onboarding-ekyc",
    title: "Onboarding with eKYC",
    description: "Streamline customer onboarding by verifying eKYC credentials. Banks and fintech companies can instantly verify customer identity using eKYC credentials for account opening and service activation.",
    href: "/finance/onboarding-ekyc",
    status: "active",
    icon: "📱",
    category: "Finance",
    features: [
      "Instant customer identity verification",
      "Automated KYC compliance",
      "Faster account opening process",
      "Reduced onboarding friction",
    ],
  },
  {
    id: "finance-investment-account",
    title: "Investment Account Opening",
    description: "Open investment accounts instantly by reusing existing eKYC credentials from your primary bank. Skip the KYC process entirely and start investing in minutes.",
    href: "/finance/investment-account",
    status: "active",
    icon: "💼",
    category: "Finance",
    tested: true,
    features: [
      "Skip KYC verification process",
      "Instant account opening",
      "Reuse verified eKYC credentials",
      "Cross-institution credential sharing",
    ],
  },
  {
    id: "telecoms-signup",
    title: "Telecoms Service Signup (eKYC Reuse)",
    description: "Activate mobile services instantly by reusing eKYC credentials from financial institutions. No physical documents or store visits required.",
    href: "/telecoms/signup",
    status: "active",
    icon: "📱",
    category: "Finance",
    tested: true,
    features: [
      "Instant SIM registration",
      "Cross-industry eKYC credential reuse",
      "NCC compliance without friction",
      "Privacy-preserving verification",
    ],
  },
];

// Demo Card Component
const DemoCard = ({
  demo,
  hoveredDemo,
  setHoveredDemo,
}: {
  demo: Demo;
  hoveredDemo: string | null;
  setHoveredDemo: (id: string | null) => void;
}) => {
  const isActive = demo.status === "active";

  if (isActive) {
    return (
      <Link
        href={demo.href}
        onMouseEnter={() => setHoveredDemo(demo.id)}
        onMouseLeave={() => setHoveredDemo(null)}
        className="block group"
      >
        <div
          className={`relative bg-white rounded-xl p-6 h-full transition-all duration-200 border ${
            hoveredDemo === demo.id
              ? "border-blue-300 shadow-lg -translate-y-1"
              : "border-gray-200 shadow-sm hover:shadow-md"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Icon and Title */}
            <div className="flex items-start gap-4 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                {demo.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {demo.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {demo.category && (
                    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {demo.category}
                    </span>
                  )}
                  {demo.tested && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Tested
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3 flex-1">
              {demo.description}
            </p>

            {/* CTA */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-blue-600 font-semibold text-sm">
                Try Demo
              </span>
              <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 h-full border border-gray-200 shadow-md">
      <div className="relative z-10 opacity-60">
        {/* Demo Icon */}
        <div className="flex items-start justify-between mb-6">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center text-5xl">
            {demo.icon}
          </div>
          <span className="px-4 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
            COMING SOON
          </span>
        </div>

        {/* Demo Info */}
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{demo.title}</h3>
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">{demo.description}</p>

        {/* Features */}
        <div className="space-y-3">
          {demo.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="text-gray-400 text-lg flex-shrink-0">○</span>
              <span className="text-sm text-gray-600 leading-relaxed">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function DemosLandingPage() {
  const [hoveredDemo, setHoveredDemo] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Education");

  const activeDemos = demos.filter((demo) => demo.status === "active");

  // Get unique categories from active demos (excluding 'All')
  const categories = Array.from(new Set(activeDemos.map((demo) => demo.category).filter((cat): cat is string => Boolean(cat))));

  // Filter demos by category
  const filteredDemos = activeDemos.filter((demo) => demo.category === selectedCategory);

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Verifiable Credentials Demos
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Interactive demos showcasing digital credentials and verification
          </p>
        </div>

        {/* Category Selector */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:shadow-sm"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Active Demos */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDemos.map((demo) => (
              <DemoCard
                key={demo.id}
                demo={demo}
                hoveredDemo={hoveredDemo}
                setHoveredDemo={setHoveredDemo}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

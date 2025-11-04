"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/login", label: "Sign In", icon: "🔐" },
  { href: "/register", label: "Register", icon: "📝" },
  { href: "/dashboard/users", label: "Users", icon: "👥" },
  { href: "/dashboard/posts", label: "Posts", icon: "📄" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar w-64 min-h-screen bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-green-600 font-bold text-xl">N</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">NELFUND</h1>
          </div>
        </div>
        <p className="text-xs text-green-100">Admin Dashboard</p>
      </div>
      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`sidebar-link flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  pathname === item.href
                    ? "bg-green-50 text-green-700 font-medium border-l-4 border-green-600"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

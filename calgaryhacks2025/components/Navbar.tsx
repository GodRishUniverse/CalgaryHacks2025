"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  // Don't show navbar on login page
  if (pathname === '/login') return null;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌿</span>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
              WildlifeDAO
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link 
                  href="/projects" 
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Projects
                </Link>
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {user.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg 
                    hover:border-pink-300 text-gray-600 hover:text-pink-500 transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-400 
                text-white rounded-lg font-semibold transition-all hover:scale-105"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 
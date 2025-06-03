'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Any = any;

// Debounce function to limit how often a function can be called
function debounce<T extends (...args: Any[]) => Any>(fn: T, delay = 300) {
  let timeoutId: Any;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Helper function to capitalize first letter of each word
function capitalizeWords(str: string): string {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function TopMenu({ query }: { query?: string }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(query || '');
  const [user, setUser] = useState<{ name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth');
        const data = await response.json();

        if (response.ok && data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm && searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSearch = debounce((event: React.ChangeEvent<HTMLInputElement>) => {
    const search = event.target.value.trim();
    setSearchTerm(event.target.value);
    if (search) {
      router.push(`/search?q=${encodeURIComponent(search)}`);
    }
  }, 500);

  const accountLinkText = user?.name ? capitalizeWords(user.name) : "Account";

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Oddities
            </Link>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-6">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <span className="absolute left-3 text-gray-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleSearch(e);
                }}
                className="w-full py-2 px-4 pl-10 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md border border-blue-600"
              >
                Search
              </button>
            </form>
          </div>

          {/* Nav */}
          <nav className="flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 text-sm font-medium">
              Home
            </Link>
            <Link href="/cart" className="flex items-center text-gray-700 hover:text-blue-600 text-sm font-medium">
              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Cart
            </Link>
            <Link
              href="/account"
              className="flex items-center text-gray-700 hover:text-blue-600 text-sm font-medium"
            >
              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {loading ? "Account" : accountLinkText}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
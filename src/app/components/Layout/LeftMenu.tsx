'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

interface LeftMenuProps {
  categories: string[];
}

export function LeftMenu({ categories }: LeftMenuProps) {
  const pathname = usePathname();

  // Sort categories alphabetically
  const sortedCategories = [...categories].sort();

  return (
    <aside className="w-full p-4 bg-white rounded-lg shadow-sm">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Categories</h2>

      <nav className="space-y-1">
        {sortedCategories.map((category) => (
          <Link
            key={category}
            href={`/categories/${encodeURIComponent(category)}`}
            className={`block px-3 py-2 rounded-md text-sm font-medium ${pathname === `/categories/${encodeURIComponent(category)}`
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`}
          >
            {category}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
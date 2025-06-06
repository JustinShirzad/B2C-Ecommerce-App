'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A-Z)', icon: '🔤' },
  { value: 'name-desc', label: 'Name (Z-A)', icon: '🔤' },
  { value: 'price-asc', label: 'Price (Low to High)', icon: '💰' },
  { value: 'price-desc', label: 'Price (High to Low)', icon: '💎' },
  { value: 'newest', label: 'Newest First', icon: '🆕' },
  { value: 'oldest', label: 'Oldest First', icon: '⏰' },
  { value: 'stock-asc', label: 'Stock (Low to High)', icon: '📦' },
  { value: 'stock-desc', label: 'Stock (High to Low)', icon: '📦' },
];

const QUICK_SORTS = ['price-asc', 'price-desc', 'newest', 'name-asc'];

export function SortBy() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState('name-asc');

  useEffect(() => {
    setSortBy(searchParams.get('sort') || 'name-asc');
  }, [searchParams]);

  const updateSort = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    params.delete('page'); // Reset pagination
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearSort = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('sort');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Sort By</h2>
        {searchParams.get('sort') && (
          <button
            onClick={clearSort}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Reset
          </button>
        )}
      </div>

      {/* Dropdown */}
      <select
        value={sortBy}
        onChange={(e) => updateSort(e.target.value)}
        className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Quick Sort Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {QUICK_SORTS.map((sortValue) => {
          const option = SORT_OPTIONS.find(opt => opt.value === sortValue)!;
          const isActive = sortBy === sortValue;
          
          return (
            <button
              key={sortValue}
              onClick={() => updateSort(sortValue)}
              className={`px-3 py-2 text-xs rounded-md font-medium transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {option.icon} {option.label.split(' ')[0]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
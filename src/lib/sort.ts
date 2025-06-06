export function getSortConfig(sortBy: string) {
  switch (sortBy) {
    case 'name-desc':
      return { name: 'desc' } as const;
    case 'price-asc':
      return { price: 'asc' } as const;
    case 'price-desc':
      return { price: 'desc' } as const;
    case 'newest':
      return { createdAt: 'desc' } as const;
    case 'oldest':
      return { createdAt: 'asc' } as const;
    case 'stock-asc':
      return { stock: 'asc' } as const;
    case 'stock-desc':
      return { stock: 'desc' } as const;
    case 'name-asc':
    default:
      return { name: 'asc' } as const;
  }
}

export const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'price-asc', label: 'Price (Low to High)' },
  { value: 'price-desc', label: 'Price (High to Low)' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'stock-asc', label: 'Stock (Low to High)' },
  { value: 'stock-desc', label: 'Stock (High to Low)' },
] as const;
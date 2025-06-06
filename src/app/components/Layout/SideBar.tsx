import { LeftMenu } from './LeftMenu';
import { SortBy } from '../Layout/SortBy';

interface SidebarProps {
  categories: string[];
}

export function Sidebar({ categories }: SidebarProps) {
  return (
    <aside className="w-full space-y-6">
      <SortBy />
      <LeftMenu categories={categories} />
    </aside>
  );
}
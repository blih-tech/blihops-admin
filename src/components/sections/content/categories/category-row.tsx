import type { Category } from '@/lib/api/content/categories';

type CategoryRowProps = {
  category: Category;
};

export function CategoryRow({ category }: CategoryRowProps) {
  return (
    <div className="flex items-center px-5 py-3.5">
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {category.name}
      </p>
    </div>
  );
}

// components/products/product-empty-state.tsx
import { Package, Search, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ProductEmptyStateProps {
  type?: 'empty' | 'error' | 'search';
  onRetry?: () => void;
}

export function ProductEmptyState({ type = 'empty', onRetry }: ProductEmptyStateProps) {
  type Config = {
    icon: React.ElementType;
    title: string;
    description: string;
    action: string;
    href?: string;
    onClick?: () => void;
  };

  const configs: Record<'empty' | 'search' | 'error', Config> = {
    empty: {
      icon: Package,
      title: 'No products yet',
      description: 'Start building your jewelry inventory by adding your first product.',
      action: 'Add Product',
      href: '/products/product-list/add-products',
    },
    search: {
      icon: Search,
      title: 'No products found',
      description: 'Try adjusting your search or filter criteria.',
      action: 'Clear filters',
      href: '/products/product-list',
    },
    error: {
      icon: AlertTriangle,
      title: 'Something went wrong',
      description: 'We couldn\'t load your products. Please try again.',
      action: 'Retry',
      onClick: onRetry,
    },
  };

  const config = configs[type];

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-center space-y-4">
        <div className="mx-auto h-20 w-20 text-muted-foreground">
          <config.icon className="h-full w-full" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold">{config.title}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            {config.description}
          </p>
        </div>

        <Button
          asChild
          {...(config.onClick ? { onClick: config.onClick } : {})}
        >
          <Link href={config.href || '#'}>
            {type === 'error' ? <RefreshCw className="mr-2 h-4 w-4" /> : null}
            {config.action}
          </Link>
        </Button>
      </div>
    </div>
  );
}
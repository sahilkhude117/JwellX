// components/products/product-grid.tsx
'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ProductActions } from './product-actions';
import { ProductDataRow } from '@/lib/types/product';
import { Heart } from 'lucide-react';
import Link from 'next/link';

interface ProductGridProps {
  products: ProductDataRow[];
  selectedProducts: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function ProductGrid({ products, selectedProducts, onSelectionChange }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="group relative overflow-hidden">
          <CardContent className="p-0">
            {/* Image */}
            <div className="aspect-square relative overflow-hidden">
              <div className="w-full h-full">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-4xl">{product.name[0]}</span>
                  </div>
                )}
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              
              {/* Checkbox */}
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Checkbox
                  checked={selectedProducts.includes(product.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onSelectionChange([...selectedProducts, product.id]);
                    } else {
                      onSelectionChange(selectedProducts.filter(id => id !== product.id));
                    }
                  }}
                  className="bg-white/90"
                />
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-1">
                <Button size="icon" variant="ghost" className="bg-white/90 h-8 w-8">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <Link href={`/products/product-list/${product.id}`}>
                  <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-xs text-muted-foreground mt-1">{product.sku}</p>
              </div>

              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">{product.category.name}</Badge>
                {product.brand && (
                  <Badge variant="outline" className="text-xs">{product.brand.name}</Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{product.totalStock} in stock</p>
                  <p className="text-xs text-muted-foreground">
                    {product._count.variants} variants
                  </p>
                </div>
                <Badge 
                  variant={product.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {product.status}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1" asChild>
                  <Link href={`/products/product-list/${product.id}/edit`}>
                    Edit
                  </Link>
                </Button>
                <ProductActions product={product} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
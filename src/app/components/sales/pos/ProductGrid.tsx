'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Package, 
  Tag, 
  Weight,
  Star,
  Grid3X3,
  List,
  Filter
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Mock data interface for products
export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  weight?: number;
  stock: number;
  category: string;
  brand?: string;
  image?: string;
  description?: string;
  tags?: string[];
  materialBreakdown?: {
    materialId: string;
    materialName: string;
    weight: number;
    ratePerGram: number;
    value: number;
  }[];
  isLowStock?: boolean;
  isFeatured?: boolean;
}

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  searchQuery: string;
  selectedCategory: string;
  selectedBrand: string;
  viewMode: 'grid' | 'list';
}

function ProductCard({ 
  product, 
  onAddToCart, 
  viewMode 
}: { 
  product: Product; 
  onAddToCart: (product: Product) => void;
  viewMode: 'grid' | 'list';
}) {
  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors group">
        {/* Product Image */}
        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <Package className="h-8 w-8 text-muted-foreground" />
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="h-5 text-xs">
                  {product.category}
                </Badge>
                {product.weight && (
                  <Badge variant="secondary" className="h-5 text-xs">
                    <Weight className="w-3 h-3 mr-1" />
                    {product.weight}g
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">{formatCurrency(product.price)}</p>
              <p className="text-xs text-muted-foreground">
                Stock: {product.stock}
              </p>
            </div>
          </div>
        </div>

        {/* Add Button */}
        <Button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden">
      {product.isFeatured && (
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-yellow-500 text-yellow-50">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}
      
      {product.isLowStock && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="destructive" className="text-xs">
            Low Stock
          </Badge>
        </div>
      )}

      <div className="aspect-square bg-muted relative">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Quick Add Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={product.stock === 0}
          size="sm"
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <CardContent className="p-3">
        <div className="space-y-2">
          <div>
            <h3 className="font-medium text-sm line-clamp-2 leading-tight">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              SKU: {product.sku}
            </p>
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            <Badge variant="outline" className="h-5 text-xs">
              {product.category}
            </Badge>
            {product.weight && (
              <Badge variant="secondary" className="h-5 text-xs">
                <Weight className="w-3 h-3 mr-1" />
                {product.weight}g
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">
                {formatCurrency(product.price)}
              </p>
              <p className="text-xs text-muted-foreground">
                Stock: {product.stock}
              </p>
            </div>
          </div>

          {/* Material Breakdown Preview */}
          {product.materialBreakdown && product.materialBreakdown.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>
                  {product.materialBreakdown.length} material{product.materialBreakdown.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductGrid({ 
  products, 
  onAddToCart, 
  searchQuery, 
  selectedCategory, 
  selectedBrand,
  viewMode 
}: ProductGridProps) {
  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || 
      product.category === selectedCategory;
    
    const matchesBrand = !selectedBrand || selectedBrand === 'all' || 
      product.brand === selectedBrand;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  if (filteredProducts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            viewMode="list"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {filteredProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          viewMode="grid"
        />
      ))}
    </div>
  );
}
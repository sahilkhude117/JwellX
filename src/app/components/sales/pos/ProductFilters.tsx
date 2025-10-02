'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ScanLine,
  X,
  Star,
  Package
} from 'lucide-react';

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  categories: Array<{ id: string; name: string; count: number }>;
  brands: Array<{ id: string; name: string; count: number }>;
  activeFiltersCount: number;
  onClearFilters: () => void;
  onScanBarcode?: () => void;
}

export function ProductFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedBrand,
  onBrandChange,
  viewMode,
  onViewModeChange,
  categories,
  brands,
  activeFiltersCount,
  onClearFilters,
  onScanBarcode
}: ProductFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products, SKU, or scan barcode..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-12 h-11"
        />
        {onScanBarcode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onScanBarcode}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 p-0"
          >
            <ScanLine className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters and View Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Filter Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{category.name}</span>
                    <Badge variant="secondary" className="ml-2 h-5 text-xs">
                      {category.count}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Brand Filter */}
          <Select value={selectedBrand} onValueChange={onBrandChange}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{brand.name}</span>
                    <Badge variant="secondary" className="ml-2 h-5 text-xs">
                      {brand.count}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Active Filters Badge */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="h-7">
                <Filter className="w-3 h-3 mr-1" />
                {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-7 px-2 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="h-9 rounded-r-none border-r"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="h-9 rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Filter Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Quick filters:</span>
        <Button variant="outline" size="sm" className="h-7">
          <Star className="w-3 h-3 mr-1" />
          Featured
        </Button>
        <Button variant="outline" size="sm" className="h-7">
          <Package className="w-3 h-3 mr-1" />
          Low Stock
        </Button>
        <Button variant="outline" size="sm" className="h-7">
          New Arrivals
        </Button>
        <Button variant="outline" size="sm" className="h-7">
          Best Sellers
        </Button>
      </div>
    </div>
  );
}
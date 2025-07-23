// components/products/product-filters.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, Search, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { ViewToggle } from '@/components/ui/view-toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

interface ProductFiltersProps {
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
  view: 'table' | 'grid';
  onViewChange: (view: 'table' | 'grid') => void;
  isLoading?: boolean;
}

export function ProductFilters({ categories, brands, view, onViewChange, isLoading }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState('');

  const activeFilters = {
    category: searchParams.get('categoryId'),
    brand: searchParams.get('brandId'),
    status: searchParams.get('status'),
  };

  const clearFilter = (key: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    params.set('page', '1');
    router.push(`?${params}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    params.set('page', '1');
    router.push(`?${params}`);
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    router.push(`?${params}`);
  };

  const getFilterButtonText = (type: string, filters: typeof activeFilters) => {
    switch(type) {
      case 'category':
        return filters.category ? categories.find(c => c.id === filters.category)?.name : 'Category';
      case 'brand':
        return filters.brand ? brands.find(b => b.id === filters.brand)?.name : 'Brand';
      case 'status':
        return filters.status ? filters.status.charAt(0).toUpperCase() + filters.status.slice(1) : 'Status';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top row: Search + View Toggle + Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10 w-full"
            value={searchParams.get('q') || ''}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <div>
            <ViewToggle value={view} onChange={onViewChange} />
          </div>
          <Button 
            className="bg-black text-white hover:bg-black/90" 
            asChild
          >
            <Link href="/products/product-list/add-products">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Bottom row: Individual filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Category Filter */}
        <Popover open={open === 'category'} onOpenChange={(isOpen) => setOpen(isOpen ? 'category' : '')}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              Category
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${open === 'category' ? 'rotate-180' : ''}`} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="start">
            <Command>
              <CommandInput placeholder="Search categories..." />
              <CommandEmpty>No categories found.</CommandEmpty>
              <CommandGroup>
                {categories.map((category) => (
                  <CommandItem
                    key={category.id}
                    onSelect={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set('categoryId', category.id);
                      params.set('page', '1');
                      router.push(`?${params}`);
                      setOpen('');
                    }}
                  >
                    {category.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Brand Filter */}
        <Popover open={open === 'brand'} onOpenChange={(isOpen) => setOpen(isOpen ? 'brand' : '')}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              Brand
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${open === 'brand' ? 'rotate-180' : ''}`} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="start">
            <Command>
              <CommandInput placeholder="Search brands..." />
              <CommandEmpty>No brands found.</CommandEmpty>
              <CommandGroup>
                {brands.map((brand) => (
                  <CommandItem
                    key={brand.id}
                    onSelect={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set('brandId', brand.id);
                      params.set('page', '1');
                      router.push(`?${params}`);
                      setOpen('');
                    }}
                  >
                    {brand.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Status Filter */}
        <Popover open={open === 'status'} onOpenChange={(isOpen) => setOpen(isOpen ? 'status' : '')}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              Status
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${open === 'status' ? 'rotate-180' : ''}`} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="start">
            <Command>
              <CommandGroup>
                {['active', 'inactive', 'discontinued'].map((status) => (
                  <CommandItem
                    key={status}
                    onSelect={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set('status', status);
                      params.set('page', '1');
                      router.push(`?${params}`);
                      setOpen('');
                    }}
                  >
                    <span className="capitalize">{status}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Active filter chips with X buttons */}
        {Object.entries(activeFilters).map(([key, value]) => {
          if (!value) return null;
          const label = key === 'category' 
            ? categories.find(c => c.id === value)?.name
            : key === 'brand'
            ? brands.find(b => b.id === value)?.name
            : value.charAt(0).toUpperCase() + value.slice(1);
          
          return (
            <Badge key={key} variant="secondary" className="gap-1 pr-1.5">
              {label}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => clearFilter(key)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          );
        })}

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground"
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}
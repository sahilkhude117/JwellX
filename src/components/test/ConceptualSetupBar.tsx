// components/add-product/ContextualSetupBar.tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Scan, ChevronDown, Loader2, Plus, AlertCircle } from 'lucide-react';
import { useCategories, useBrands } from '@/hooks/products/use-products';
import CategoryFormDialog from '@/app/components/products/categories/category-form-dialog';
import BrandFormDialog from '@/app/components/products/categories/brand-form-dialog';
import { toast } from '@/hooks/use-toast';
import { BrandOption, CategoryOption } from '@/lib/types/products/create-products';

export default function ContextualSetupBar({
  category,
  brand,
  onCategoryChange,
  onBrandChange,
}: {
  category: string;
  brand: string;
  onCategoryChange: (category: string) => void;
  onBrandChange: (brand: string) => void;
}) {
  const [openCategory, setOpenCategory] = useState(false);
  const [openBrand, setOpenBrand] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState('');
  const [searchBrand, setSearchBrand] = useState('');

  const {
    data: categoryData,
    isLoading: isCategoriesLoading,
    error: categoryError,
    refetch: refetchCategories
  } = useCategories();

  const {
    data: brandsData,
    isLoading: isBrandsLoading,
    error: brandError,
    refetch: refetchBrands
  } = useBrands();

  const filteredCategories = categoryData?.categories.filter(cat =>
    cat.name.toLowerCase().includes(searchCategory.toLowerCase())
  ) || [];

  const filteredBrands = brandsData?.brands.filter(brand =>
    brand.name.toLowerCase().includes(searchBrand.toLowerCase())
  ) || [];

  const getProductType = () => {
    if (!category) return '';
    const cat = categoryData?.categories.find(c => c.id === category);
    if (!cat) return '';

    return cat.name;
  }
  
  const handleScan = async () => {
    setScanning(true);

    try {
      // In a real implementation, this would interface with a barcode scanner
      // For now, we'll simulate a successful scan
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate parsing barcode data
      const scannedData = {
        category: 'rings',
        brand: 'tiffany',
        sku: 'RING-18K-6.0'
      };
      
      // Update parent component
      onCategoryChange(scannedData.category);
      onBrandChange(scannedData.brand);
      
      toast({
        title: "Barcode scanned",
        description: `Found product in ${scannedData.category} category by ${scannedData.brand}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Scan failed",
        description: "Could not read barcode. Please try again.",
      });
    } finally {
      setScanning(false);
    }
  }

  const handleCategorySelect = (value: string) => {
    try {
      onCategoryChange(value);
      setOpenCategory(false);
      setSearchCategory('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update category. Please try again.",
      });
    }
  };

  const handleBrandSelect = (value: string) => {
    try {
      onBrandChange(value);
      setOpenBrand(false);
      setSearchBrand('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update brand. Please try again.",
      });
    }
  };

  const handleAddNewCategory = () => {
    setIsCategoryDialogOpen(true);
    setOpenCategory(false);
  };

  // Handle adding new brand
  const handleAddNewBrand = () => {
    setIsBrandDialogOpen(true);
    setOpenBrand(false);
  };

  return (
    <div className="sticky top-0 bg-background z-10 py-4 border-b mb-6 -mx-6 px-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button 
          variant="outline" 
          onClick={handleScan}
          disabled={scanning}
          className="gap-2"
        >
          {scanning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Scan className="h-4 w-4" />
              Scan SKU
            </>
          )}
        </Button>

        {/* Category Dropdown */}
        <Popover open={openCategory} onOpenChange={setOpenCategory}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              role="combobox"
              disabled={isCategoriesLoading || categoryError !== null}
              className="min-w-[180px] justify-between"
            >
              {isCategoriesLoading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </span>
              ) : categoryError ? (
                <span className="flex items-center text-destructive">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Error
                </span>
              ) : category 
                ? categoryData?.categories.find(c => c.id === category)?.name || 'Select category...'
                : 'Select category...'}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[200px]">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search categories..." 
                value={searchCategory}
                onValueChange={setSearchCategory}
              />
              <CommandList>
                {categoryError ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mx-auto mb-2" />
                    Failed to load categories. 
                    <Button 
                      variant="link" 
                      className="p-0 h-auto font-normal"
                      onClick={() => refetchCategories()}
                    >
                      Try again
                    </Button>
                  </div>
                ) : isCategoriesLoading ? (
                  <div className="p-4 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <>
                      <CommandEmpty>No categories found.</CommandEmpty>

                      {filteredCategories.length > 0 && (
                        <CommandGroup heading="Categories">
                          {filteredCategories.map((cat) => (
                            <CommandItem
                              key={cat.id}
                              value={cat.id}
                              onSelect={handleCategorySelect}
                              className="flex items-center gap-2"
                            >
                              {cat.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}

                      <CommandGroup>
                        <CommandItem
                          onSelect={handleAddNewCategory}
                          className="text-primary cursor-pointer flex items-center"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add New Category
                        </CommandItem>
                      </CommandGroup>
                  </> 
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Brand Combobox */}
        <Popover open={openBrand} onOpenChange={setOpenBrand}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              role="combobox"
              disabled={isBrandsLoading || brandError !== null}
              className="min-w-[180px] justify-between"
            >
              {isBrandsLoading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </span>
              ) : brandError ? (
                <span className="flex items-center text-destructive">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Error
                </span>
              ) : brand 
                ? brandsData?.brands.find(b => b.id === brand)?.name || 'Select brand...'
                : 'Select brand...'}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[200px]">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search brands..." 
                value={searchBrand}
                onValueChange={setSearchBrand}
              />
              <CommandList>
                {brandError ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mx-auto mb-2" />
                    Failed to load brands. 
                    <Button 
                      variant="link" 
                      className="p-0 h-auto font-normal"
                      onClick={() => refetchBrands()}
                    >
                      Try again
                    </Button>
                  </div>
                ) : isBrandsLoading ? (
                  <div className="p-4 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <>
                      <CommandEmpty>No brands found.</CommandEmpty>

                      {filteredBrands.length > 0 && (
                        <CommandGroup heading="Brands">
                          {filteredBrands.map((b) => (
                            <CommandItem
                              key={b.id}
                              value={b.id}
                              onSelect={handleBrandSelect}
                              className="flex items-center gap-2"
                            > 
                              {b.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}

                      <CommandGroup>
                        <CommandItem
                          onSelect={handleAddNewBrand}
                          className="text-primary cursor-pointer flex items-center"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add New Brand
                        </CommandItem>
                      </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Product Type Badge */}
        {getProductType() && (
          <Badge 
            variant="secondary" 
            className="text-sm px-3 py-1.5 bg-primary/10 text-primary"
          >
            {getProductType()}
          </Badge>
        )}
      </div>

      <CategoryFormDialog
        isOpen={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
        mode='create'
      />

      <BrandFormDialog
        isOpen={isBrandDialogOpen}
        onClose={() => setIsBrandDialogOpen(false)}
        mode='create'
      />
    </div>
  );
}
'use client';
import { useState, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Scan, ChevronDown, Loader2, Plus, AlertCircle } from 'lucide-react';
import { useCategories, useBrands } from '@/hooks/products/use-products';
import CategoryFormDialog from '@/app/components/products/categories/category-form-dialog';
import BrandFormDialog from '@/app/components/products/categories/brand-form-dialog';
import { toast } from 'sonner';
import { CreateProductFormData } from '@/lib/types/products/create-products';

export default function ContextualSetupBar() {
  const { control, watch, setValue, formState: { errors, isSubmitting } } = useFormContext<CreateProductFormData>();
  const [openCategory, setOpenCategory] = useState(false);
  const [openBrand, setOpenBrand] = useState(false);
  const [searchCategory, setSearchCategory] = useState('');
  const [searchBrand, setSearchBrand] = useState('');
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  
  const watchedCategory = watch('category');
  const watchedBrand = watch('brand');
  
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
  
  // Filter data based on search
  const filteredCategories = categoryData?.categories.filter(cat =>
    cat.name.toLowerCase().includes(searchCategory.toLowerCase())
  ) || [];
  
  const filteredBrands = brandsData?.brands.filter(brand =>
    brand.name.toLowerCase().includes(searchBrand.toLowerCase())
  ) || [];
  
  // Get category name for display
  const getCategoryName = () => {
    if (!watchedCategory) return '';
    return categoryData?.categories.find(c => c.id === watchedCategory)?.name || '';
  };
  
  // Get brand name for display
  const getBrandName = () => {
    if (!watchedBrand) return '';
    return brandsData?.brands.find(b => b.id === watchedBrand)?.name || '';
  };
  
  // Handle category selection
  const handleCategorySelect = (value: string) => {
    try {
      setValue('category', value);
      setOpenCategory(false);
      setSearchCategory('');
    } catch (error) {
      toast.error('Failed to update category. Please try again.');
    }
  };
  
  // Handle brand selection
  const handleBrandSelect = (value: string) => {
    try {
      setValue('brand', value);
      setOpenBrand(false);
      setSearchBrand('');
    } catch (error) {
      toast.error('Failed to update brand. Please try again.');
    }
  };
  
  // Handle adding new category
  const handleAddNewCategory = () => {
    setIsCategoryDialogOpen(true);
    setOpenCategory(false);
  };
  
  // Handle adding new brand
  const handleAddNewBrand = () => {
    setIsBrandDialogOpen(true);
    setOpenBrand(false);
  };
  
  // Reset search when dialog closes
  useEffect(() => {
    if (!isCategoryDialogOpen) {
      setSearchCategory('');
    }
    if (!isBrandDialogOpen) {
      setSearchBrand('');
    }
  }, [isCategoryDialogOpen, isBrandDialogOpen]);
  

  return (
    <div className="sticky top-0 bg-background z-10 py-4 border-b rounded-md mb-6 px-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Category Selector */}
        <div className="flex flex-col">
          <Controller
            name="category"
            control={control}
            rules={{ required: 'Category is required' }}
            render={({ field: { value } }) => (
              <Popover open={openCategory} onOpenChange={setOpenCategory}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    disabled={isCategoriesLoading || categoryError !== null || isSubmitting}
                    className={`min-w-[180px] justify-between ${
                      errors.category ? 'border-destructive' : ''
                    }`}
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
                    ) : value ? (
                      getCategoryName()
                    ) : (
                      'Select category...'
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[250px]">
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
                                  {cat.description && (
                                    <span className="text-xs text-muted-foreground ml-2 truncate max-w-[120px]">
                                      {cat.description}
                                    </span>
                                  )}
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
            )}
          />
          {errors.category && (
            <span className="text-sm text-destructive mt-1">
              {errors.category.message}
            </span>
          )}
        </div>
        
        {/* Brand Selector */}
        <div className="flex flex-col">
          <Controller
            name="brand"
            control={control}
            render={({ field: { value } }) => (
              <Popover open={openBrand} onOpenChange={setOpenBrand}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    disabled={isBrandsLoading || brandError !== null || isSubmitting}
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
                    ) : value ? (
                      getBrandName()
                    ) : (
                      'Select brand...'
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[250px]">
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
                              {filteredBrands.map((brand) => (
                                <CommandItem
                                  key={brand.id}
                                  value={brand.id}
                                  onSelect={handleBrandSelect}
                                  className="flex items-center gap-2"
                                >
                                  {brand.name}
                                  {brand.description && (
                                    <span className="text-xs text-muted-foreground ml-2 truncate max-w-[120px]">
                                      {brand.description}
                                    </span>
                                  )}
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
            )}
          />
        </div>
        
        {/* Category Badge */}
        {getCategoryName() && (
          <Badge
            variant="secondary"
            className="text-sm px-3 py-1.5 bg-primary/10 text-primary"
          >
            {getCategoryName()}
          </Badge>
        )}
        
        {/* Category Form Dialog */}
        <CategoryFormDialog
          isOpen={isCategoryDialogOpen}
          onClose={() => {
            setIsCategoryDialogOpen(false);
            // Optionally refresh categories after adding new one
            setTimeout(() => {
              refetchCategories();
            }, 500);
          }}
          mode='create'
        />
        
        {/* Brand Form Dialog */}
        <BrandFormDialog
          isOpen={isBrandDialogOpen}
          onClose={() => {
            setIsBrandDialogOpen(false);
          }}
          mode='create'
        />
      </div>
    </div>
  );
}
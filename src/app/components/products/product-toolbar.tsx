'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brand, Category } from "@/lib/types/product";
import { PlusCircle, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ProductToolbarProps {
    categories: Category[];
    brands: Brand[];
}

export function ProductToolbar({ categories, brands}: ProductToolbarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');


    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            handleFilterChange('q', searchValue);
        }, 300);

        return () => clearTimeout(delayedSearch);
    }, [searchValue]);

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        params.delete('page'); // Reset page when filters change

        router.push(`/products/product-list/?${params.toString()}`);
    };
 
    const clearFilters = () => {
        setSearchValue('');
        router.push('/products');
    }


    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Filter by Name or SKU..."
                        className="h-8 w-[150px] lg:w-[250px] pl-8"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>

                <Select
                    value={searchParams.get('category') || 'all'}
                    onValueChange={(value) => handleFilterChange('categoryId', value)}
                >
                    <SelectTrigger className="h-8 w-[180px]">
                        <SelectValue placeholder="Filter by Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='all'>All Categories</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={searchParams.get("brandId") || 'all'}
                    onValueChange={(value) => handleFilterChange('brandId', value)}
                >
                    <SelectTrigger className="h-8 w-[180px]">
                        <SelectValue placeholder="Filter by Brand" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='all'>All Brands</SelectItem>
                        {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                                {brand.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button variant={'outline'} size={'sm'} onClick={clearFilters}>
                    Clear Filters
                </Button>
            </div>

            <Link href={'/products/product-list/add-products'}>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Product
                </Button>
            </Link>
        </div>
    )
}
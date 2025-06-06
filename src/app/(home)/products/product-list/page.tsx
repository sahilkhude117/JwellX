import { DataTable } from "@/app/components/products/data-table";
import { ProductCard } from "@/app/components/products/product-card";
import { ProductToolbar } from "@/app/components/products/product-toolbar";
import { Brand, Category, ProductDataRow } from "@/lib/types/product";
import { get } from "http";
import { Package } from "lucide-react";

// Mock data - replace with actual API calls
const mockProducts: ProductDataRow[] = [
  {
    id: '1',
    name: 'Diamond Ring Collection',
    sku: 'RING-001',
    imageUrl: '/images/products/ring-001.jpg',
    category: { id: '1', name: 'Rings' },
    brand: { id: '1', name: 'Luxury Brand' },
    _count: { variants: 3 },
    totalStock: 25,
    status: 'active',
  },
  {
    id: '2',
    name: 'Gold Necklace Set',
    sku: 'NECK-002',
    imageUrl: '/images/products/necklace-002.jpg',
    category: { id: '2', name: 'Necklaces' },
    brand: { id: '2', name: 'Premium Gold' },
    _count: { variants: 2 },
    totalStock: 8,
    status: 'active',
  },
  // Add more mock data as needed
];

const mockCategories: Category[] = [
  { id: '1', name: 'Rings' },
  { id: '2', name: 'Necklaces' },
  { id: '3', name: 'Earrings' },
  { id: '4', name: 'Bracelets' },
];

const mockBrands: Brand[] = [
  { id: '1', name: 'Luxury Brand' },
  { id: '2', name: 'Premium Gold' },
  { id: '3', name: 'Diamond Elite' },
];

async function getProducts(searchParams: { [key: string]: string | string[] | undefined }) {
    // Simulate a delay for fetching data
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter products based on search parameters if provided
     return {
        products: mockProducts,
        totalCount: mockProducts.length,
        page: 1,
        limit: 10,
    };
}

async function getCategories() {
  // const response = await fetch('/api/categories');
  // return response.json();
  return mockCategories;
}

async function getBrands() {
  // const response = await fetch('/api/brands');
  // return response.json();
  return mockBrands;
}

export default async function ProductListPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const [productsData, categories, brands] = await Promise.all([
        getProducts(searchParams),
        getCategories(),
        getBrands(),    
    ]);

    return (
        <div className="flex-1 space-y-4 p-4 pt-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Product List</h1>
            </div>

            <ProductToolbar categories={categories} brands={brands} />
      
            {/* Desktop Table View */}
            <div className="hidden md:block">
                <DataTable data={productsData.products} />
            </div>

            <div className="md:hidden space-y-4">
                {productsData.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
                
                {/* Mobile Pagination */}
                <div className="flex justify-center space-x-2 pt-4">
                <button className="px-4 py-2 border rounded-md disabled:opacity-50">
                    Previous
                </button>
                <button className="px-4 py-2 border rounded-md disabled:opacity-50">
                    Next
                </button>
                </div>
            </div>

            {productsData.products.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No products found</h3>
                <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria.
                </p>
                </div>
            )}
        </div>
    )
}
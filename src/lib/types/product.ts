export type ProductDataRow = {
    id: string;
    name: string;
    sku: string;
    imageUrl?: string;
    category: Category;
    brand?: Brand;
    _count: {
        variants: number;
    };
    totalStock: number;
    status: 'active' | 'inactive';
};

export type Category = {
  id: string;
  name: string;
};

export type Brand = {
  id: string;
  name: string;
};
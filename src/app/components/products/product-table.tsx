// components/products/product-table.tsx
'use client';

import { useState } from 'react';
import { ColumnDef, SortingState } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { ProductActions } from './product-actions';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ProductDataRow } from '@/lib/types/product';

interface ProductTableProps {
  products: ProductDataRow[];
  selectedProducts: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function ProductTable({ products, selectedProducts, onSelectionChange }: ProductTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<ProductDataRow>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            const allIds = value 
              ? products.map(p => p.id) 
              : [];
            onSelectionChange(allIds);
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedProducts.includes(row.original.id)}
          onCheckedChange={(checked) => {
            if (checked) {
              onSelectionChange([...selectedProducts, row.original.id]);
            } else {
              onSelectionChange(selectedProducts.filter(id => id !== row.original.id));
            }
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={row.original.imageUrl} />
            <AvatarFallback>{row.original.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-muted-foreground">{row.original.sku}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.category.name}</Badge>
      ),
    },
    {
      accessorKey: 'brand',
      header: 'Brand',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.brand?.name || 'N/A'}</Badge>
      ),
    },
    {
      accessorKey: '_count.variants',
      header: 'Variants',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original._count.variants} variants
        </div>
      ),
    },
    {
      accessorKey: 'totalStock',
      header: 'Stock',
      cell: ({ row }) => (
        <div className={`text-sm font-medium ${row.original.totalStock < 10 ? 'text-red-600' : ''}`}>
          {row.original.totalStock} units
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge 
          variant={row.original.status === 'active' ? 'default' : 'secondary'}
          className="capitalize"
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => <ProductActions product={row.original} />,
    },
  ];

  return (
    <DataTable
      data={products}
      columns={columns}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  );
}
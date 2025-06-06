'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductDataRow } from "@/lib/types/product";
import { Package } from "lucide-react";
import Link from "next/link";
import { ProductActions } from "./product-actions";

interface ProductCardProps {
    product: ProductDataRow;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={product.imageUrl} alt={product.name} />
                            <AvatarFallback>
                                <Package className="h-4 w-4"/>
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <Link href={`/products/product-list/${product.id}`} >
                                <h3 className="font-medium text-sm hover:underline truncate">
                                    {product.name}
                                </h3>
                            </Link>
                            <p className="text-xs text-muted-foreground">
                                SKU: {product.sku}
                            </p>

                            <div className="flex flex-wrap gap-1 mt-2">
                                <Badge variant='outline' className="text-xs">
                                    {product.category.name}
                                </Badge>
                                <Badge variant={'secondary'} className="text-xs">
                                    {product._count.variants} Variants
                                </Badge>
                                <Badge
                                    variant='outline'
                                    className={`text-xs ${
                                        product.totalStock < 10 ? 'text-red-600 border-red-200' : ''
                                    }`}
                                >
                                    {product.totalStock} in Stock
                                </Badge>
                                <Badge
                                    variant={product.status === 'active' ? 'default' : 'secondary'}
                                    className="text-xs"
                                >
                                    {product.status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <ProductActions product={product}/>
                </div>
            </CardContent>
        </Card>
    )
}

"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash2, Package, Image as ImageIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Brand } from "@/lib/types/products/categories";
import BrandFormDialog from "./brand-form-dialog";
import DeleteConfirmationDialog from "./delete-confirmation-dialog";
import { formatDate } from "@/lib/utils/metal-rates";
import { useDeleteBrand } from "@/hooks/products/use-brands";

interface BrandCardProps {
  brand: Brand;
}

export default function BrandCard({ brand }: BrandCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteBrand = useDeleteBrand();

  const handleDelete = async () => {
    try {
      await deleteBrand.mutateAsync(brand.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const productCount = brand._count?.products || 0;

  return (
    <>
      <Card className="h-full gap-2 py-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-base">{brand.name}</CardTitle>
              </div>
              <CardDescription className="text-sm">
                {brand.description || "No description provided"}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setIsEditDialogOpen(true)}
                  className="cursor-pointer"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Package className="w-3 h-3" />
            <span>{productCount} item{productCount !== 1 ? 's' : ''}</span>
          </div>
        </CardContent>
        
        <CardFooter className="pt-0">
          <p className="text-xs text-muted-foreground">
            Created {formatDate(brand.createdAt)}
          </p>
        </CardFooter>
      </Card>

      <BrandFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        brand={brand}
        mode="edit"
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Brand"
        description="Are you sure you want to delete this brand?"
        itemName={brand.name}
        isLoading={deleteBrand.isPending}
        hasProducts={productCount > 0}
        productCount={productCount}
      />
    </>
  );
}
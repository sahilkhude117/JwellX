"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash2, Package, Phone, Mail, MapPin, ShoppingBag } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Supplier } from "@/lib/types/products/suppliers";
import SupplierFormDialog from "./supplier-form-dialog";
import DeleteConfirmationDialog from "./delete-confirmation-dialog";
import { formatDate } from "@/lib/utils/metal-rates";
import { useDeleteSupplier } from "@/hooks/products/use-suppliers";

interface SupplierCardProps {
  supplier: Supplier;
}

export default function SupplierCard({ supplier }: SupplierCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteSupplier = useDeleteSupplier();

  const handleDelete = async () => {
    try {
      await deleteSupplier.mutateAsync(supplier.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const productCount = supplier._count?.inventory || 0;
  const purchaseCount = supplier._count?.purchases || 0;

  return (
    <>
      <Card className="h-full gap-2 py-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-base">{supplier.name}</CardTitle>
              </div>
              <CardDescription className="text-sm">
                {supplier.address || "No address provided"}
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
        
        <CardContent className="pt-0 pb-0 mb-0">
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="w-3 h-3" />
              <span>{supplier.contactNumber}</span>
            </div>
            {supplier.email && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="w-3 h-3" />
                <span>{supplier.email}</span>
              </div>
            )}
            {supplier.gstin && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span> GSTIN: {supplier.gstin}</span>
              </div>
            )}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Package className="w-3 h-3" />
                <span>{productCount} product{productCount !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <ShoppingBag className="w-3 h-3" />
                <span>{purchaseCount} purchase{purchaseCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-0">
          <p className="text-xs text-muted-foreground">
            Created {formatDate(supplier.createdAt)}
          </p>
        </CardFooter>
      </Card>

      <SupplierFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        supplier={supplier}
        mode="edit"
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Supplier"
        description="Are you sure you want to delete this supplier?"
        itemName={supplier.name}
        isLoading={deleteSupplier.isPending}
        hasProducts={productCount > 0 || purchaseCount > 0}
        productCount={productCount}
        purchaseCount={purchaseCount}
      />
    </>
  );
}
"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Layers3, ImageIcon } from "lucide-react";
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
import { Material } from "@/lib/types/products/materials";
import { useDeleteMaterial } from "@/hooks/products/use-materials";
import { formatDate } from "@/lib/utils/metal-rates";
import GlobalDeleteConfirmationDialog, { BaseDeleteConfig } from "@/components/GlobalDeleteConfirmDialog";

interface MaterialCardProps {
  material: Material;
  onEdit: (id: string) => void;
}

const deleteMaterialConfig = {
  material: (name: string): BaseDeleteConfig => ({
      title: "Are you sure?",
      description: `Delete material "${name}"?`,
      itemName: name,
      itemType: "material",
      confirmButtonText: "Delete",
  }),
}

export default function MaterialCard({ material, onEdit }: MaterialCardProps) {
  const deleteMutation = useDeleteMaterial();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    deleteMutation.mutate(material.id);
    setIsDeleteDialogOpen(false);
  };

  const variantCount = material._count?.inventoryItems ?? 0;

  return (
    <>
      <Card className="h-full gap-2 py-4 pb-2 hover:shadow-md transition-shadow">
        <CardHeader className="pb-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-base">{material.name}</CardTitle>
              </div>
              <CardDescription className="text-sm mt-2">
                {material.type} • {material.purity}
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
                  onClick={() => onEdit(material.id)}
                  className="cursor-pointer"
                >
                  <Pencil className="w-4 h-4 mr-2" />
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
          <div className="flex items-center justify-between text-base text-muted-foreground">
            <div className="flex">
              <Layers3 className="w-4 h-4 mr-1 mt-1" />
              <span>
                {variantCount} item{variantCount !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Created {formatDate(material.createdAt)}
            </p>
          </div>
        </CardContent>
      </Card>

      <GlobalDeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        config={deleteMaterialConfig.material(material.name)}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
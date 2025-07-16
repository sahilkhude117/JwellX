// src/components/products/materials/gemstone-card.tsx
"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash2, Gem } from "lucide-react";
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
import { Gemstone } from "@/lib/types/products/materials";
import DeleteConfirmDialog from "./delete-confirm-dialog";
import { useDeleteGemstone } from "@/hooks/products/use-gemstones";
import { formatDate } from "@/lib/utils/metal-rates";

interface GemstoneCardProps {
  gemstone: Gemstone;
  onEdit: (id: string) => void;
}

export default function GemstoneCard({ gemstone, onEdit }: GemstoneCardProps) {
  const deleteMutation = useDeleteGemstone();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    deleteMutation.mutate(gemstone.id);
    setIsDeleteDialogOpen(false);
  };

  const variantCount = gemstone._count?.variantGemstones ?? 0;

  return (
    <>
      <Card className="h-full gap-0 py-4 hover:shadow-md transition-shadow">
        <CardHeader className="gap-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-base">{gemstone.name}</CardTitle>
              </div>
            </div>
            

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onEdit(gemstone.id)}
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
          <CardDescription className="text-sm">
            {gemstone.shape} • {gemstone.size}
          </CardDescription>
          <div className="flex justify-between mt-1 mb-4">
            {gemstone.clarity && (
            <p className="text-xs text-muted-foreground">Clarity: {gemstone.clarity}</p>
            )}
            {gemstone.color && (
              <p className="text-xs text-muted-foreground">Color: {gemstone.color}</p>
            )}
          </div>
          <div className="flex justify-between items-center mt-2 gap-1 text-base text-muted-foreground mt-1">
            <div className="flex">
              <Gem className="w-4 w-4 mr-1" />
              <span>
                {variantCount} variant{variantCount !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Created {formatDate(gemstone.createdAt)}
            </p>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        description={`Delete gemstone "${gemstone.name}"?`}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
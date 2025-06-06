'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ProductDataRow } from "@/lib/types/product";
import { Copy, Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProductActionsProps {
    product: ProductDataRow;
}

export function ProductActions({ product }: ProductActionsProps) {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDuplicate = async (productId: string) => {
         alert('Duplicate action is not implemented yet.');
    }
    
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            alert('Delete action is not implemented yet.');
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product. Please try again.');
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
            router.refresh();
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant={'ghost'} className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={`/products/product-list/${product.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                                View Details
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/products/product-list/${product.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                                Edit
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(product.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setShowDeleteDialog(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This will permanently delete the product "{product.name}", all its variants, 
                    and associated inventory records. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Product'}
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )

}
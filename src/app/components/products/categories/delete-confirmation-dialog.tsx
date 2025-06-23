import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AttributeItem } from '@/lib/types/categories';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  item: AttributeItem | null;
  attributeType: string;
  isLoading?: boolean;
}

export const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  item,
  attributeType,
  isLoading = false,
}: DeleteConfirmationDialogProps) => {
  if (!item) return null;

  const hasProducts = item.productCount > 0;
  
  const getDescription = () => {
    if (hasProducts) {
      return `Are you sure you want to delete the '${item.name}' ${attributeType}? ${item.productCount} product${item.productCount > 1 ? 's are' : ' is'} currently assigned to it. This action cannot be undone.`;
    }
    return `Are you sure you want to delete the '${item.name}' ${attributeType}? This action cannot be undone.`;
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {attributeType}</AlertDialogTitle>
          <AlertDialogDescription className={hasProducts ? 'text-red-600' : ''}>
            {getDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

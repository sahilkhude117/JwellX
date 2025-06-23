import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, Edit, Trash2 } from 'lucide-react';
import { AttributeItem } from '@/lib/types/categories';
import { AttributeFormDialog } from './attribute-form-dialog';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';

interface AttributeManagerProps {
  title: string;
  data: AttributeItem[];
  onAddItem: (name: string) => void;
  onEditItem: (id: string, newName: string) => void;
  onDeleteItem: (id: string) => void;
  isLoading?: boolean;
}

export const AttributeManager = ({
  title,
  data,
  onAddItem,
  onEditItem,
  onDeleteItem,
  isLoading = false,
}: AttributeManagerProps) => {
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AttributeItem | null>(null);

  const handleEdit = (item: AttributeItem) => {
    setSelectedItem(item);
    setFormDialogOpen(true);
  };

  const handleDelete = (item: AttributeItem) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = (name: string) => {
    if (selectedItem) {
      onEditItem(selectedItem.id, name);
    } else {
      onAddItem(name);
    }
    setSelectedItem(null);
  };

  const handleDeleteConfirm = () => {
    if (selectedItem) {
      onDeleteItem(selectedItem.id);
      setSelectedItem(null);
    }
    setDeleteDialogOpen(false);
  };

  const attributeType = title.toLowerCase().replace('product ', '').slice(0, -1);

  return (
    <>
      <Card className="h-fit">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <Button
            onClick={() => {
              setSelectedItem(null);
              setFormDialogOpen(true);
            }}
            size="sm"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Products</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No {title.toLowerCase()} found. Add your first one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={item.productCount > 0 ? "default" : "secondary"}>
                          {item.productCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(item)}
                              disabled={isLoading}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(item)}
                              disabled={isLoading}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AttributeFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSubmit={handleFormSubmit}
        title={attributeType}
        item={selectedItem}
        isLoading={isLoading}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        item={selectedItem}
        attributeType={attributeType}
        isLoading={isLoading}
      />
    </>
  );
};
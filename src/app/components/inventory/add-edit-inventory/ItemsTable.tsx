import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";

interface ItemsTableProps {
  mode: 'material' | 'gemstone';
  items: Array<{
    id: string;
    itemId: string;
    weight: number;
    buyingPrice: number;
  }>;
  materials?: Array<{ id: string; name: string; type: string; defaultRate: number; unit: string }>;
  gemstones?: Array<{ id: string; name: string; shape: string; defaultRate: number; unit: string }>;
  onEdit: (index: number, item: any) => void;
  onDelete: (index: number) => void;
  canDelete?: boolean;
}

export const ItemsTable: React.FC<ItemsTableProps> = ({
  mode,
  items,
  materials = [],
  gemstones = [],
  onEdit,
  onDelete,
  canDelete = true,
}) => {
  const availableItems = mode === 'material' ? materials : gemstones;

  const getItemName = (itemId: string) => {
    const item = availableItems.find(i => i.id === itemId);
    if (!item) return 'Unknown';
    
    if (mode === 'material') {
      return `${item.name} (${item.type})`;
    } else {
      return `${item.name} (${item.shape})`;
    }
  };

  const getWeightUnit = () => {
    return mode === 'material' ? 'g' : 'ct';
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No {mode === 'material' ? 'materials' : 'gemstones'} added yet</p>
        <p className="text-sm">Click "Add New" to add your first item</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Weight</TableHead>
            <TableHead>Buying Price</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={item.id || index}>
              <TableCell className="font-medium">
                {getItemName(item.itemId)}
              </TableCell>
              <TableCell>
                {item.weight} {getWeightUnit()}
              </TableCell>
              <TableCell>
                ₹{item.buyingPrice.toLocaleString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(index, item)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  {canDelete && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import React from "react";

const itemSchema = z.object({
  itemId: z.string().min(1, "Please select an item"),
  weight: z.number().min(0.01, "Weight must be greater than 0"),
  buyingPrice: z.number().min(0.01, "Buying price must be greater than 0"),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface AddEditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'material' | 'gemstone';
  onSubmit: (data: ItemFormData) => void;
  editData?: ItemFormData | null;
  materials?: Array<{ id: string; name: string; type: string; defaultRate: number; unit: string }>;
  gemstones?: Array<{ id: string; name: string; shape: string; defaultRate: number; unit: string }>;
}

export const AddEditItemDialog: React.FC<AddEditItemDialogProps> = ({
  open,
  onOpenChange,
  mode,
  onSubmit,
  editData,
  materials = [],
  gemstones = [],
}) => {
  const items = mode === 'material' ? materials : gemstones;
  const isEdit = !!editData;

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      itemId: editData?.itemId || '',
      weight: editData?.weight || 0,
      buyingPrice: editData?.buyingPrice || 0,
    },
  });

  // Reset form when dialog opens/closes or editData changes
  React.useEffect(() => {
    if (open) {
      form.reset({
        itemId: editData?.itemId || '',
        weight: editData?.weight || 0,
        buyingPrice: editData?.buyingPrice || 0,
      });
    }
  }, [open, editData, form]);

  const handleSubmit = (data: ItemFormData) => {
    onSubmit(data);
    onOpenChange(false);
    if (!isEdit) {
      form.reset({ itemId: '', weight: 0, buyingPrice: 0 });
    }
  };

  const handleItemChange = (itemId: string) => {
    form.setValue('itemId', itemId);
    
    // Auto-fill buying price with default rate
    const selectedItem = items.find(item => item.id === itemId);
    if (selectedItem && !isEdit) {
      form.setValue('buyingPrice', selectedItem.defaultRate);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit' : 'Add'} {mode === 'material' ? 'Material' : 'Gemstone'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="itemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {mode === 'material' ? 'Material' : 'Gemstone'}
                  </FormLabel>
                  <Select 
                    onValueChange={handleItemChange} 
                    value={field.value}
                    disabled={isEdit} // Disable selection in edit mode
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue 
                          placeholder={`Select ${mode === 'material' ? 'material' : 'gemstone'}`} 
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({mode === 'material' ? item.type : item.shape})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Weight ({mode === 'material' ? 'g' : 'ct'})
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="buyingPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buying Price (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEdit ? 'Update' : 'Add'} {mode === 'material' ? 'Material' : 'Gemstone'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
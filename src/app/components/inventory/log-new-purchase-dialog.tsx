// components/inventory/log-new-purchase-dialog.tsx
"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Plus, Trash2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { mockSuppliers, mockProductVariants } from "@/lib/mock/inventory";
import type { Supplier, ProductVariant, PurchaseLogItem } from "@/lib/types/inventory";

const purchaseSchema = z.object({
  purchaseDate: z.date(),
  supplierId: z.string().min(1, "Please select a supplier"),
  referenceNumber: z.string().optional(),
  items: z.array(z.object({
    productVariantId: z.string().min(1, "Please select a product"),
    sku: z.string(),
    productName: z.string(),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitCost: z.number().min(0.01, "Unit cost must be greater than 0"),
  })).min(1, "At least one item is required"),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

interface LogNewPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PurchaseFormData) => void;
}

export function LogNewPurchaseDialog({ 
  open, 
  onOpenChange, 
  onSubmit 
}: LogNewPurchaseDialogProps) {
  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      purchaseDate: new Date(),
      supplierId: "",
      referenceNumber: "",
      items: [{ productVariantId: "", sku: "", productName: "", quantity: 1, unitCost: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const grandTotal = watchedItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

  const handleProductSelect = (index: number, variant: ProductVariant) => {
    form.setValue(`items.${index}.productVariantId`, variant.id);
    form.setValue(`items.${index}.sku`, variant.sku);
    form.setValue(`items.${index}.productName`, variant.name);
  };

  const handleSubmit = (data: PurchaseFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Log a New Inventory Purchase</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Purchase Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          onDateChange={field.onChange}
                          placeholder="Select purchase date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockSuppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
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
                  name="referenceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Reference #</FormLabel>
                      <FormControl>
                        <Input placeholder="Invoice or PO number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Separator />

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Items</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ productVariantId: "", sku: "", productName: "", quantity: 1, unitCost: 0 })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Variant</TableHead>
                        <TableHead className="w-24">Quantity</TableHead>
                        <TableHead className="w-32">Unit Cost (₹)</TableHead>
                        <TableHead className="w-32">Line Total</TableHead>
                        <TableHead className="w-16">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.productVariantId`}
                              render={({ field: productField }) => (
                                <FormItem>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          className="w-full justify-between"
                                        >
                                          {productField.value
                                            ? mockProductVariants.find(
                                                (variant) => variant.id === productField.value
                                              )?.name
                                            : "Select product..."}
                                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 p-0">
                                      <Command>
                                        <CommandInput placeholder="Search products..." />
                                        <CommandEmpty>No product found.</CommandEmpty>
                                        <CommandGroup>
                                          {mockProductVariants.map((variant) => (
                                            <CommandItem
                                              key={variant.id}
                                              onSelect={() => handleProductSelect(index, variant)}
                                            >
                                              <div className="flex flex-col">
                                                <span className="font-medium">{variant.name}</span>
                                                <span className="text-sm text-muted-foreground">
                                                  SKU: {variant.sku} | Stock: {variant.currentStock}
                                                </span>
                                              </div>
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field: quantityField }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      {...quantityField}
                                      onChange={(e) => quantityField.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.unitCost`}
                              render={({ field: costField }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      {...costField}
                                      onChange={(e) => costField.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              disabled
                              value={`₹${((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unitCost || 0)).toLocaleString('en-IN')}`}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <DialogFooter className="flex justify-between items-center">
              <div className="text-lg font-semibold">
                Grand Total: ₹{grandTotal.toLocaleString('en-IN')}
              </div>
              <div className="space-x-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Purchase</Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
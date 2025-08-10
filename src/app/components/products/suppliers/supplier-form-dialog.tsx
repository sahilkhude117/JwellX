"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Supplier, createSupplierSchema, updateSupplierSchema } from "@/lib/types/products/suppliers";
import { useCreateSupplier, useUpdateSupplier } from "@/hooks/products/use-suppliers";
import { toast } from "sonner";

interface SupplierFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
  mode: "create" | "edit";
}

export default function SupplierFormDialog({
  isOpen,
  onClose,
  supplier,
  mode,
}: SupplierFormDialogProps) {
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();

  const schema = mode === "create" ? createSupplierSchema : updateSupplierSchema;
  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      contactNumber: "",
      email: "",
      address: "",
      gstin: "",
    },
  });

  useEffect(() => {
    if (supplier && mode === "edit") {
      form.reset({
        name: supplier.name,
        contactNumber: supplier.contactNumber,
        email: supplier.email || "",
        address: supplier.address || "",
        gstin: supplier.gstin || "",
      });
    } else {
      form.reset({
        name: "",
        contactNumber: "",
        email: "",
        address: "",
        gstin: "",
      });
    }
  }, [supplier, mode, form]);

  const handleSubmit = async (data: FormData) => {
    try {
      if (mode === "create") {
        await createSupplier.mutateAsync({
          name: data.name ?? "",
          contactNumber: data.contactNumber ?? "",
          email: data.email ?? "",
          address: data.address ?? "",
          gstin: data.gstin ?? "",
        });
      } else if (supplier) {
        await updateSupplier.mutateAsync({ id: supplier.id, data });
      }
      onClose();
    } catch (err: any) {
      if (err?.response?.status === 409) {
        form.setError('contactNumber', { 
          message: err.response.error || 'Supplier with this contact number already exists' 
        });
      } else if (err?.response?.status === 400 && err?.response?.data?.details) {
        const details = err.response.data.details;
        details.forEach((e: any) => form.setError(e.path[0], { message: e.message }));
      } else {
        toast.error(err?.message || 'Something went wrong');
      }
    }
  };

  const isLoading = createSupplier.isPending || updateSupplier.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Supplier" : "Edit Supplier"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new supplier to your inventory."
              : "Update the supplier information."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Gold Suppliers Inc."
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="e.g., 9876543210"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="e.g., contact@supplier.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gstin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GSTIN (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 22AAAAA0000A1Z5"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Full address of the supplier..."
                      {...field}
                      disabled={isLoading}
                      rows={3}
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
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {mode === "create" ? "Create Supplier" : "Update Supplier"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
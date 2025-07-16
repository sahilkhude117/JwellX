// src/components/categories/BrandFormDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X } from "lucide-react";
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
import { Brand, createBrandSchema, updateBrandSchema } from "@/lib/types/products/categories";
import { useCreateBrand, useUpdateBrand } from "@/hooks/products/use-brands";
import { toast } from "sonner";

interface BrandFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  brand?: Brand | null;
  mode: "create" | "edit";
}

export default function BrandFormDialog({
  isOpen,
  onClose,
  brand,
  mode,
}: BrandFormDialogProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();

  const form = useForm<z.infer<typeof createBrandSchema> | z.infer<typeof updateBrandSchema>>({
    resolver: zodResolver(mode === "create" ? createBrandSchema : updateBrandSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (brand && mode === "edit") {
      form.reset({
        name: brand.name,
        description: brand.description || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
      });
      setLogoPreview(null);
    }
  }, [brand, mode, form]);

  const handleSubmit = async (
    data: z.infer<typeof createBrandSchema> | z.infer<typeof updateBrandSchema>
  ) => {
    try {
      if (mode === "create") {
        await createBrand.mutateAsync({
          name: (data as any).name ?? "",
          description: (data as any).description ?? "",
        });
      } else if (brand) {
        await updateBrand.mutateAsync({ id: brand.id, data });
      }
      onClose();
    } catch (err: any) {
      if (err?.response?.status === 409) {
        form.setError('name', { message: err.response.error || 'Brand Name already exists' });
      } else if (err?.response?.status === 400 && err?.response?.data?.details) {
        const details = err.response.data.details;
        details.forEach((e: any) => form.setError(e.path[0], { message: e.message }));
      } else {
        toast.error(err?.message || 'Something went wrong');
      }
    }
  };

  const isLoading = createBrand.isPending || updateBrand.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Brand" : "Edit Brand"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new brand to your inventory."
              : "Update the brand information."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Tanishq"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the brand..."
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
                {mode === "create" ? "Create Brand" : "Update Brand"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
// src/components/categories/CategoryFormDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X } from "lucide-react";
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
import { Category, createCategorySchema, updateCategorySchema } from "@/lib/types/products/categories";
import { useCreateCategory, useUpdateCategory } from "@/hooks/products/use-categories";
import { toast } from "sonner";

interface CategoryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  mode: "create" | "edit";
}

export default function CategoryFormDialog({
  isOpen,
  onClose,
  category,
  mode,
}: CategoryFormDialogProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const schema = mode === "create" ? createCategorySchema : updateCategorySchema;
  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (category && mode === "edit") {
      form.reset({
        name: category.name,
        code: category.code,
        description: category.description || "",
        imageUrl: category.imageUrl || "",
      });
      setImagePreview(category.imageUrl || null);
    } else {
      form.reset({
        name: "",
        code: "",
        description: "",
        imageUrl: "",
      });
      setImagePreview(null);
    }
  }, [category, mode, form]);

  const handleSubmit = async (data: FormData) => {
    try {
      if (mode === "create") {
        await createCategory.mutateAsync({
          name: data.name ?? "",
          code: data.code ?? "",
          description: data.description ?? "",
          imageUrl: data.imageUrl ?? "",
        });
      } else if (category) {
        await updateCategory.mutateAsync({ id: category.id, data });
      }
      onClose();
    } catch (err: any) {
      if (err?.response?.status === 409) {
        form.setError('code', { message: err.response.error || 'Code already exists' });
      } else if (err?.response?.status === 400 && err?.response?.data?.details) {
        const details = err.response.data.details;
        details.forEach((e: any) => form.setError(e.path[0], { message: e.message }));
      } else {
        toast.error(err?.message || 'Something went wrong');
      }
    }
  };

  const handleImageUrlChange = (value: string) => {
    form.setValue("imageUrl", value);
    setImagePreview(value || null);
  };

  const isLoading = createCategory.isPending || updateCategory.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Category" : "Edit Category"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new product category to your inventory."
              : "Update the category information."}
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
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Rings"
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
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., RING"
                        {...field}
                        disabled={isLoading}
                        style={{ textTransform: "uppercase" }}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the category..."
                      {...field}
                      disabled={isLoading}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...field}
                        disabled={isLoading}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                      />
                      {imagePreview && (
                        <div className="relative w-32 h-32 border border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={() => setImagePreview(null)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70 text-white"
                            onClick={() => handleImageUrlChange("")}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Optional image URL for the category
                  </FormDescription>
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
                {mode === "create" ? "Create Category" : "Update Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
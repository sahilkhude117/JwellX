"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateMaterial, useMaterial, useUpdateMaterial } from "@/hooks/products/use-materials";
import { MaterialType } from "@/lib/types/products/materials";

import {
  Dialog,
  DialogContent,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.nativeEnum(MaterialType),
  purity: z.string().min(1, "Purity is required"),
  unit: z.string().min(1, "Unit is required"),
});

type FormValues = z.infer<typeof schema>;

export default function MaterialFormDialog({
  open,
  id,
  onOpenChange,
}: {
  open: boolean;
  id?: string;
  onOpenChange: (open: boolean) => void;
}) {
  const editMode = Boolean(id);
  const createMutation = useCreateMaterial();
  const updateMutation = useUpdateMaterial();
  const { data: material } = useMaterial(id ?? "");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      type: MaterialType.GOLD,
      purity: "",
      unit: "g",
    },
  });

  useEffect(() => {
    if (editMode && material?.data) {
      form.reset({
        name: material.data.name,
        type: material.data.type,
        purity: material.data.purity,
        unit: material.data.unit,
      });
    }
  }, [material, editMode, form]);

  async function onSubmit(values: FormValues) {
    try {
      if (editMode) {
        await updateMutation.mutateAsync({ id: id!, data: values });
      } else {
        await createMutation.mutateAsync(values);
      }
      onOpenChange(false);
      form.reset();
    } catch (err: any) {
      if (err?.response?.status === 400 && err?.response?.data?.details) {
        const details = err.response.data.details;
        details.forEach((e: any) => form.setError(e.path[0], { message: e.message }));
      } else if (err?.response?.status === 400) {
        form.setError("name", { message: err.response.data.error });
      } else {
        toast({ title: "Error", description: err?.message || "Something went wrong", variant: "destructive" });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editMode ? "Edit Material" : "Add Material"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(MaterialType).map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
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
              name="purity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purity</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
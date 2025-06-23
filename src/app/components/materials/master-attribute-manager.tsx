'use client';

import { useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MasterAttributeItem } from "@/lib/types/materials";
import { AddEditDialog } from "./add-edit-dialog";
import { boolean } from "zod";

interface MasterAttributeManagerProps {
  title: string;
  data: MasterAttributeItem[];
  onAddItem: (name: string) => void;
  onEditItem: (id: string, newName: string) => void;
  onDeleteItem: (id: string) => void;
}

export function MasterAttributeManager({
    title,
    data,
    onAddItem,
    onEditItem,
    onDeleteItem,
}: MasterAttributeManagerProps) {
    const [addEditDialog, setAddEditDialog] = useState<{
        open: boolean;
        mode: 'add' | 'edit';
        item?: MasterAttributeItem;
    }>({ open: false, mode: 'add' });

    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item?: MasterAttributeItem;
    }>({ open: false });

    const handleAdd = () => {
        setAddEditDialog({ open: true, mode: "add" });
    };

    const handleEdit = (item: MasterAttributeItem) => {
        setAddEditDialog({ open: true, mode: "edit", item });
    };

    const handleDelete = (item: MasterAttributeItem) => {
        setDeleteDialog({ open: true, item });
    };

    const handleSave = (name: string) => {
        if (addEditDialog.mode === "add") {
            onAddItem(name);
        } else if (addEditDialog.item) {
            onEditItem(addEditDialog.item.id, name);
        }
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            onDeleteItem(deleteDialog.item.id);
            setDeleteDialog({ open: false });
        }
    };

    const getDeleteMessage = (item?: MasterAttributeItem) => {
        if (!item) return "";

        if (item.usedInVariantsCount > 0) {
            return `Are you sure you want to delete '${item.name}'? It is currently used in ${item.usedInVariantsCount} product variants. Deleting it could cause data inconsistencies. This action cannot be undone.`;
        } else {
            return `Are you sure you want to delete '${item.name}'? This action cannot be undone.`;
        }
    };

    const getDeleteButtonText = (item?: MasterAttributeItem) => {
        if (!item) return "Delete";
        return item.usedInVariantsCount > 0 ? "I understand, delete anyway" : "Delete";
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{title}</CardTitle>
                        <Button onClick={handleAdd} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                                Add New
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Used In # Variants</TableHead>
                                <TableHead className="w-[50px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.usedInVariantsCount}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant={'ghost'} size={'icon'}>
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(item)}>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDelete(item)}
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AddEditDialog
                open={addEditDialog.open}
                onOpenChange={(open) =>
                    setAddEditDialog((prev) => ({ ...prev, open }))
                }
                title={
                    addEditDialog.mode === "add"
                        ? `Add New ${title.slice(0, -1)}`
                        : `Edit ${title.slice(0, -1)}`
                }
                initialName={addEditDialog.item?.name || ""}
                onSave={handleSave}
            />

            <AlertDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {getDeleteButtonText(deleteDialog.item)}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {getDeleteButtonText(deleteDialog.item)}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
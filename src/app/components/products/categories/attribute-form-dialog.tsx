'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AttributeItem } from '@/lib/types/categories';

interface AttributeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => void;
  title: string;
  item?: AttributeItem | null;
  isLoading?: boolean;
}

export const AttributeFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  title,
  item,
  isLoading = false,
}: AttributeFormDialogProps) => {
    const [name, setName] = useState('');
    const [errors, setErrors] = useState<{ name?: string }>({});

    useEffect(() => {
        if (item) {
            setName(item.name);
        } else {
            setName('');
        }
        setErrors({});
    }, [item, open]);

    const validateForm = () => {
        const newErrors: { name?: string } = {};
        
        if (!name.trim()) {
            newErrors.name = 'Name is required';
        } else if (name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        } else if (name.trim().length > 50) {
            newErrors.name = 'Name must be less than 50 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (validateForm()) {
            onSubmit(name.trim());
            onOpenChange(false);
        }
    };

    const isEditing = !!item;
    const dialogTitle = isEditing ? `Edit ${title}` : `Add New ${title}`;

    return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
                {isEditing 
                    ? `Update the ${title.toLowerCase()} name below.`
                    : `Enter the name for the new ${title.toLowerCase()}.`
                }
            </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={`Enter ${title.toLowerCase()} name...`}
                        className={errors.name ? 'border-red-500' : ''}
                        disabled={isLoading}
                    />
                    {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
        </Dialog>
    );

}

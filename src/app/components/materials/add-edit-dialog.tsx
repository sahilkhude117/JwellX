'use client';

import { useState, useEffect } from "react";
import { 
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    initialName?: string;
    onSave: (name: string) => void;
}

export function AddEditDialog({
    open,
    onOpenChange,
    title,
    initialName = '',
    onSave,
}: AddEditDialogProps) {
    const [name, setName] = useState(initialName);

    useEffect(() => {
        setName(initialName);
    }, [initialName, open]);

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
            onOpenChange(false);
            setName('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter'){
            handleSave();
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Input
                        placeholder="Enter name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!name.trim()}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
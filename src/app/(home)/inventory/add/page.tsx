'use client';

import { InventoryForm } from "@/app/components/inventory/forms/InventoryForm";
import { FormMode } from "@/lib/types/inventory/inventory";
import { useRouter } from "next/navigation";

export default function AddInventoryPage() {
    const router = useRouter();

    const handleSuccess = () => {
        router.push('/inventory');
    }

    const mode: FormMode = {
        mode: 'add'
    };

    return <InventoryForm mode={mode} onSuccess={handleSuccess} />
}
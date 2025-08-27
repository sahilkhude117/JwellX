'use client';

import { InventoryForm } from "@/app/components/inventory/forms/InventoryForm";
import { FormMode } from "@/lib/types/inventory/inventory";
import { useParams, useRouter } from "next/navigation";

export default function EditInventoryPage() {
    const router = useRouter();
    const params = useParams();
    const itemId = params.id as string;

    const handleSuccess = () => {
        router.push('/inventory');
    }

    const mode: FormMode = {
        mode: 'edit',
        itemId
    };

    return <InventoryForm mode={mode} onSuccess={handleSuccess} />
}
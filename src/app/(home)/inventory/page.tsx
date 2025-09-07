'use client'
import { InventoryStats } from "@/app/components/inventory/inventory-stats"
import { InventoryTable } from "@/app/components/inventory/inventory-table"
import { InventoryItem } from "@/lib/types/inventory/inventory"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function InventoryPage() {
  const router = useRouter();
  const handleCreateNew = () => {
    router.push(`/inventory/add`);
  }

  const handleViewItem = () => {
    toast("testing handle new item")
  }

  const handleEditItem = (item: InventoryItem) => {
    router.push(`/inventory/edit/${item.id}`);
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div>
        <InventoryStats/>
      </div>
      <div className="bg-card rounded-lg border">
        <div className="p-6">
          <InventoryTable
            onCreateNew={handleCreateNew}
            onViewItem={handleViewItem}
            onEditItem={handleEditItem}
          />
        </div>
      </div>
    </div>
  );
}
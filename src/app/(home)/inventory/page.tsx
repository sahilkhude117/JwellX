'use client'
import { InventoryStats } from "@/app/components/inventory/inventory-stats"
import { InventoryTable } from "@/app/components/inventory/inventory-table"
import { InventoryItem } from "@/lib/types/inventory/inventory"
import { toast } from "sonner"

const handleCreateNew = () => {
  toast("new creation test")
}

const handleViewItem = () => {
  toast("testing handle new item")
}

const handleEditItem = (item: InventoryItem) => {
  toast("testing handle edit item")
}

export default function InventoryPage() {
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
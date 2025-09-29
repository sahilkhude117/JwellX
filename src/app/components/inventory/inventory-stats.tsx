// components/inventory/InventoryDashboard.tsx
import React from 'react';
import { useRouter } from 'next/navigation';
import { GlobalStatsCards } from '@/components/stats-card/GlobalStatsCards';
import { useInventoryStatsHook } from '@/hooks/inventory/use-inventory-stats';

export const InventoryStats: React.FC = () => {
  const inventoryStatsHook = useInventoryStatsHook();
  const router = useRouter();

  const handleAddNew = () => {
    router.push('/inventory/add');
  };

  return (
    <div className="space-y-6 mb-6">
      <GlobalStatsCards
        statsHook={inventoryStatsHook}
        title="Inventory Analytics"
        showTimePeriods={true}
        addNewButton={{
          label: "Add New",
          onClick: handleAddNew,
        }}
      />
    </div>
  );
};
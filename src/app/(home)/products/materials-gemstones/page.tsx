"use client";

import { useState } from "react";
import { MasterAttributeManager } from "@/app/components/materials/master-attribute-manager";
import { mockMaterials, mockGemstones } from "@/lib/mock/materials";
import { MasterAttributeItem } from "@/lib/types/materials";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<MasterAttributeItem[]>(mockMaterials);
  const [gemstones, setGemstones] = useState<MasterAttributeItem[]>(mockGemstones);

  const handleAddMaterial = (name: string) => {
    const newMaterial: MasterAttributeItem = {
      id: `mat_${Date.now()}`,
      name,
      usedInVariantsCount: 0,
    };
    setMaterials((prev) => [...prev, newMaterial]);
    console.log('Adding Material:', name);
  };

  const handleEditMaterial = (id: string, newName: string) => {
    setMaterials((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: newName } : item))
    );
    console.log('Editing Material:', id, newName);
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((item) => item.id !== id));
    console.log('Deleting Material:', id);
  };

  const handleAddGemstone = (name: string) => {
    const newGemstone: MasterAttributeItem = {
      id: `gem_${Date.now()}`,
      name,
      usedInVariantsCount: 0,
    };
    setGemstones((prev) => [...prev, newGemstone]);
    console.log('Adding Gemstone:', name);
  };

  const handleEditGemstone = (id: string, newName: string) => {
    setGemstones((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: newName } : item))
    );
    console.log('Editing Gemstone:', id, newName);
  };

  const handleDeleteGemstone = (id: string) => {
    setGemstones((prev) => prev.filter((item) => item.id !== id));
    console.log('Deleting Gemstone:', id);
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 max-w-7xl">
      <div className="mb-6 border rounded-lg bg-background p-4">
          <h1 className="text-3xl font-bold mb-2">Materials & Gemstones Management</h1>
          <p className="text-muted-foreground">Manage the master list of precious metals and gemstones available for creating product variants.</p>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <MasterAttributeManager
          title="Precious Metals"
          data={materials}
          onAddItem={handleAddMaterial}
          onEditItem={handleEditMaterial}
          onDeleteItem={handleDeleteMaterial}
        />
        <MasterAttributeManager
          title="Gemstones"
          data={gemstones}
          onAddItem={handleAddGemstone}
          onEditItem={handleEditGemstone}
          onDeleteItem={handleDeleteGemstone}
        />
      </div>
    </div>
  );
}
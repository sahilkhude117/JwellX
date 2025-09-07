"use client";

import { useState, Suspense } from "react";
import { Plus, Search, LayoutGrid, List, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useMaterials } from "@/hooks/products/use-materials";
import { useGemstones } from "@/hooks/products/use-gemstones";

import MaterialFormDialog  from "@/app/components/products/materials/material-form-dialog";
import GemstoneFormDialog  from "@/app/components/products/materials/gemstone-form-dialog";
import MaterialCard        from "@/app/components/products/materials/material-card";
import GemstoneCard        from "@/app/components/products/materials/gemstone-card";
import { GemstonesSkeleton, MaterialsSkeleton } from "@/app/components/products/materials/skeletons/materials";
import { DataPagination } from "@/app/components/Pagination";
import { GemstoneShape, MaterialType } from "@/lib/types/products/materials";

function MaterialsGemstonesContent() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [materialDialog, setMaterialDialog] = useState<{ open: boolean; id?: string }>({ open: false });
  const [gemstoneDialog, setGemstoneDialog] = useState<{ open: boolean; id?: string }>({ open: false });

  /* pagination state */
  const [materialPage, setMaterialPage]   = useState(1);
  const [materialLimit, setMaterialLimit] = useState(10);
  const [gemstonePage, setGemstonePage]   = useState(1);
  const [gemstoneLimit, setGemstoneLimit] = useState(10);

  const [materialType, setMaterialType] = useState<MaterialType | undefined>(undefined);
  const [gemstoneShape, setGemstoneShape] = useState<GemstoneShape | undefined>(undefined);

  /* data fetching */
  const {
    data: materialData,
    isLoading: materialLoading,
    error: materialError,
  } = useMaterials({ page: materialPage, limit: materialLimit, search, type: materialType });

  const {
    data: gemstoneData,
    isLoading: gemstoneLoading,
    error: gemstoneError,
  } = useGemstones({ page: gemstonePage, limit: gemstoneLimit, search, shape: gemstoneShape });

  /* empty-state helper */
  const emptyIcon = (type: "materials" | "gemstones") =>
    type === "materials" ? (
      <LayoutGrid className="h-8 w-8 text-gray-400" />
    ) : (
      <Gem className="h-8 w-8 text-gray-400" />
    );


  return (
    <div className="min-h-[calc(100vh-8rem)] p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Materials & Gemstones</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage raw materials and gemstones used in your products
            </p>
          </div>
        </div>

        {/* search & actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search materials or gemstones..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              {viewMode === "grid" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
            </Button>
            <Button onClick={() => setMaterialDialog({ open: true })} className="bg-black">
              <Plus className="h-4 w-4" />
              Add Material
            </Button>
            <Button onClick={() => setGemstoneDialog({ open: true })} variant="outline">
              <Plus className="h-4 w-4" />
              Add Gemstone
            </Button>
          </div>
        </div>

        {/* tabs */}
        <Tabs defaultValue="materials" className="w-full">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Materials
            </TabsTrigger>
            <TabsTrigger value="gemstones" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Gemstones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="mt-6">
            {materialError ? (
              <Alert>
                <AlertDescription>Failed to load materials. Please try again later.</AlertDescription>
              </Alert>
            ) : materialLoading ? (
              <MaterialsSkeleton viewMode={viewMode} />
            ) : !materialData?.data?.length ? (
              <>
                {!materialLoading && !materialError ? (
                  <div className="mb-4 max-w-xs">
                    <Select 
                      value={materialType ?? "all"} 
                      onValueChange={(v) => {
                        setMaterialType(v === 'all' ? undefined : (v as MaterialType));
                        setMaterialPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {Object.values(MaterialType).map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.charAt(0) + t.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {emptyIcon("materials")}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {search ? `No materials match "${search}"` : "Get started by adding your first material"}
                  </p>
                  <Button onClick={() => setMaterialDialog({ open: true })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Material
                  </Button>
                </div>
              </>
            ) : (
              <>
                {!materialLoading && !materialError ? (
                  <div className="mb-4 max-w-xs">
                    <Select 
                      value={materialType ?? "all"} 
                      onValueChange={(v) => {
                        setMaterialType(v === 'all' ? undefined : (v as MaterialType));
                        setMaterialPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {Object.values(MaterialType).map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.charAt(0) + t.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
                <div
                  className={`grid gap-4 ${viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                  }`}
                >
                  {materialData.data.map((m) => (
                    <MaterialCard key={m.id} material={m} onEdit={(id) => setMaterialDialog({ open: true, id })} />
                  ))}
                </div>
                <DataPagination
                  page={materialPage}
                  limit={materialLimit}
                  total={materialData.pagination.total}
                  onPageChange={setMaterialPage}
                  onLimitChange={setMaterialLimit}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="gemstones" className="mt-6">
            {gemstoneError ? (
              <Alert>
                <AlertDescription>Failed to load gemstones. Please try again later.</AlertDescription>
              </Alert>
            ) : gemstoneLoading ? (
              <GemstonesSkeleton viewMode={viewMode} />
            ) : !gemstoneData?.data?.length ? (
              <>
                {!gemstoneLoading && !gemstoneError ? (
                    <div className="mb-4 max-w-xs">
                      <Select 
                        value={gemstoneShape ?? 'all'} 
                        onValueChange={(v) => {
                          setGemstoneShape(v === 'all' ? undefined : (v as GemstoneShape));
                          setGemstonePage(1);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="All shapes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All shapes</SelectItem>
                          {Object.values(GemstoneShape).map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.charAt(0) + s.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                ) : null}
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {emptyIcon("gemstones")}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No gemstones found</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {search ? `No gemstones match "${search}"` : "Get started by adding your first gemstone"}
                  </p>
                  <Button onClick={() => setGemstoneDialog({ open: true })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Gemstone
                  </Button>
                </div>
              </>
            ) : (
              <>
                {!gemstoneLoading && !gemstoneError && gemstoneData?.data?.length ? (
                    <div className="mb-4 max-w-xs">
                      <Select 
                        value={gemstoneShape ?? 'all'} 
                        onValueChange={(v) => {
                          setGemstoneShape(v === 'all' ? undefined : (v as GemstoneShape));
                          setGemstonePage(1);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="All shapes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All shapes</SelectItem>
                          {Object.values(GemstoneShape).map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.charAt(0) + s.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                ) : null}
                <div
                  className={`grid gap-4 ${viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                  }`}
                >
                  {gemstoneData.data.map((g) => (
                    <GemstoneCard key={g.id} gemstone={g} onEdit={(id) => setGemstoneDialog({ open: true, id })} />
                  ))}
                </div>
                <DataPagination
                  page={gemstonePage}
                  limit={gemstoneLimit}
                  total={gemstoneData.pagination.total}
                  onPageChange={setGemstonePage}
                  onLimitChange={setGemstoneLimit}
                />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* dialogs */}
      <MaterialFormDialog
        open={materialDialog.open}
        id={materialDialog.id}
        onOpenChange={(open) => setMaterialDialog({ open, id: undefined })}
      />
      <GemstoneFormDialog
        open={gemstoneDialog.open}
        id={gemstoneDialog.id}
        onOpenChange={(open) => setGemstoneDialog({ open, id: undefined })}
      />
    </div>
  );
}

export default function MaterialsGemstonesPage() {
  return (
    <Suspense fallback={<MaterialsSkeleton viewMode="grid" />}>
      <MaterialsGemstonesContent />
    </Suspense>
  );
}
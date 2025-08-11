'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGemstones } from '@/hooks/products/use-lookup';
import { GemstoneOption } from '@/lib/types/products/create-products';

interface SizePresetsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productSku: string | undefined;
  hasGemstones: boolean;
}

export default function SizePresetsModal({
  open,
  onOpenChange,
  productSku,
  hasGemstones
}: SizePresetsModalProps) {
  const [sizeRange, setSizeRange] = useState('5, 6, 7, 8');
  const [applyGemstones, setApplyGemstones] = useState(true);
  const [gemstoneSpecs, setGemstoneSpecs] = useState({
    gemstoneId: '',
    caratWeight: 1.0,
    color: '',
    clarity: '',
    cut: '',
    rate: 5000
  });
  
  const { data: gemstonesData, isLoading: isGemstonesLoading } = useGemstones();
  const gemstones: GemstoneOption[] = gemstonesData?.gemstones || [];

  const handleCreateSizeVariants = () => {
    // This would be handled by the parent component
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Size Variants</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="size-range">Size Range</Label>
            <Input
              id="size-range"
              value={sizeRange}
              onChange={e => setSizeRange(e.target.value)}
              placeholder="e.g., 5, 6, 7, 8"
            />
            <p className="text-sm text-muted-foreground">
              Comma-separated sizes (e.g., 5, 6, 7, 8)
            </p>
          </div>
          {hasGemstones && (
            <div className="space-y-4 border p-4 rounded-md bg-muted/50">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="apply-gemstones" 
                  checked={applyGemstones} 
                  onCheckedChange={setApplyGemstones} 
                />
                <Label htmlFor="apply-gemstones" className="font-normal">
                  Apply same gemstone specs to all sizes
                </Label>
              </div>
              {applyGemstones && (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <Label>Gemstone</Label>
                    <div className="relative">
                      <Select
                        value={gemstoneSpecs.gemstoneId}
                        onValueChange={(value) => {
                          const selectedGemstone = gemstones.find(g => g.id === value);
                          setGemstoneSpecs(prev => ({
                            ...prev,
                            gemstoneId: value,
                            rate: selectedGemstone?.defaultRate || 5000
                          }));
                        }}
                      >
                        <SelectTrigger disabled={isGemstonesLoading}>
                          <SelectValue placeholder="Select gemstone" />
                        </SelectTrigger>
                        <SelectContent>
                          {isGemstonesLoading ? (
                            <div className="p-2 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Loading gemstones...
                            </div>
                          ) : gemstones.length === 0 ? (
                            <div className="p-2 text-center text-sm text-muted-foreground">
                              No gemstones found
                            </div>
                          ) : (
                            gemstones.map((gemstone) => (
                              <SelectItem key={gemstone.id} value={gemstone.id}>
                                {gemstone.name} ({gemstone.shape})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Carat Weight</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={gemstoneSpecs.caratWeight}
                      onChange={e => setGemstoneSpecs(prev => ({ 
                        ...prev, 
                        caratWeight: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Input
                      value={gemstoneSpecs.color}
                      onChange={e => setGemstoneSpecs(prev => ({ ...prev, color: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Clarity</Label>
                    <Input
                      value={gemstoneSpecs.clarity}
                      onChange={e => setGemstoneSpecs(prev => ({ ...prev, clarity: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Rate per Carat ($)</Label>
                    <Input
                      type="number"
                      value={gemstoneSpecs.rate}
                      onChange={e => setGemstoneSpecs(prev => ({ 
                        ...prev, 
                        rate: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button 
              type="button"
              onClick={handleCreateSizeVariants}
              disabled={sizeRange.trim() === ''}
            >
              Create {sizeRange.split(',').filter(s => s.trim()).length} Variants
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
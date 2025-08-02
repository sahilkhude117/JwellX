// components/add-product/Summary.tsx
'use client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, AlertCircle, PieChart } from 'lucide-react';

export default function Summary({ product }: { product: any }) {
  // Validation checks
  const hasHighWastage = product.variants.some((v: any) => 
    Number(v.wastage) > 15
  );
  
  const missingPurityCert = product.hsnCode === '7113' && 
    !product.variants.some((v: any) => 
      v.materials.some((m: any) => m.purity)
    );

  return (
    <div className="space-y-6 bg-card p-6 rounded-lg border">
      <h2 className="text-xl font-semibold">Summary & Validation</h2>
      
      {/* Validation Alerts */}
      {hasHighWastage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>High Wastage Detected</AlertTitle>
          <AlertDescription>
            Some variants have wastage less than 15%. Please confirm these values are correct.
          </AlertDescription>
        </Alert>
      )}
      
      {missingPurityCert && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Purity Certification Required</AlertTitle>
          <AlertDescription>
            HSN 7113 (Gold Jewelry) requires purity certification documentation.
          </AlertDescription>
        </Alert>
      )}

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h3 className="font-semibold mb-3">Cost Breakdown</h3>
          <div className="bg-muted rounded-lg p-4 h-64 flex items-center justify-center">
            <div className="text-center">
              <PieChart className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Cost distribution visualization</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-sm mr-2"></div>
              <span>Material: 65%</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-sm mr-2"></div>
              <span>Gemstones: 30%</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-amber-500 rounded-sm mr-2"></div>
              <span>Making: 5%</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Product Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span>Total Variants:</span>
              <Badge variant="secondary">{product.variants.length}</Badge>
            </div>
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span>With Gemstones:</span>
              <Badge variant={product.hasGemstones ? "default" : "secondary"}>
                {product.hasGemstones ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span>Customizable:</span>
              <Badge variant={product.isCustomizable ? "default" : "secondary"}>
                {product.isCustomizable ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span>HSN Compliance:</span>
              <Badge variant={product.hsnCode ? "default" : "destructive"}>
                {product.hsnCode ? 'Valid' : 'Missing'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline">Cancel</Button>
        <Button size="lg" className="px-8">
          Save & Add Similar Product
        </Button>
      </div>
    </div>
  );
}
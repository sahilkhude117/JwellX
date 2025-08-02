// components/add-product/ProductDetails.tsx
'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Camera, ChevronDown, Copy, Loader2 } from 'lucide-react';

// Mock HSN codes for jewelry
const HSN_CODES = [
  { code: '7113', description: 'Gold Jewelry' },
  { code: '7115', description: 'Silver Jewelry' },
  { code: '7116', description: 'Platinum Jewelry' },
  { code: '7117', description: 'Pearl Jewelry' },
] as const;

// Description templates
const DESCRIPTION_TEMPLATES = {
  ring: 'Elegant [material] [purity] ring featuring a [carat]ct [color]-[clarity] [gemstone] set in [setting] style.',
  necklace: 'Handcrafted [material] [purity] necklace with [gemstone] accents, [length] chain length.',
  gemstone: 'Natural [gemstone] gemstone weighing [carat]ct with [color] color and [clarity] clarity.',
} as const;

export default function ProductDetails({
  product,
  onUpdate,
}: {
  product: { name: string; sku: string; description: string; hsnCode: string };
  onUpdate: (updates: Partial<typeof product>) => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const generateName = () => {
    setGenerating(true);
    setTimeout(() => {
      const name = `18K Gold Solitaire Ring 1.0ct D-VS1`;
      onUpdate({ name });
      setGenerating(false);
    }, 500);
  };

  const applyTemplate = (template: string) => {
    const category = 'ring'; // In real app, get from product.category
    const content = DESCRIPTION_TEMPLATES[category as keyof typeof DESCRIPTION_TEMPLATES] || 
                   'Handcrafted jewelry piece';
    
    onUpdate({ description: content });
    setSelectedTemplate(template);
    setTemplateOpen(false);
  };

  return (
    <div className="space-y-6 bg-card p-6 rounded-lg border">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Product Details</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={generateName}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            Auto-Generate Name
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={product.name}
              onChange={e => onUpdate({ name: e.target.value })}
              placeholder="e.g., 18K Gold Solitaire Ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={product.sku}
              onChange={e => onUpdate({ sku: e.target.value })}
              placeholder="e.g., RING-GOLD-18K-SOL-1.0CT"
            />
          </div>

          <div className="space-y-2">
            <Label>HSN Code</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  value={product.hsnCode}
                  onChange={e => onUpdate({ hsnCode: e.target.value })}
                  className="block w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-8"
                >
                  <option value="">Select HSN code...</option>
                  {HSN_CODES.map((hsn) => (
                    <option key={hsn.code} value={hsn.code}>
                      {hsn.code} - {hsn.description}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {product.hsnCode && (
                <Badge variant="secondary" className="self-center whitespace-nowrap">
                  {HSN_CODES.find(h => h.code === product.hsnCode)?.description}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Description</Label>
            <div className="relative">
              <Textarea
                value={product.description}
                onChange={e => onUpdate({ description: e.target.value })}
                placeholder="Enter product description..."
                className="min-h-[120px]"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-2 right-2 h-8 w-8"
                onClick={() => setTemplateOpen(!templateOpen)}
              >
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${templateOpen ? 'rotate-180' : ''}`} 
                />
              </Button>
            </div>
            
            {templateOpen && (
              <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md p-2 space-y-1">
                {Object.entries(DESCRIPTION_TEMPLATES).map(([key, template]) => (
                  <Button
                    key={key}
                    variant="ghost"
                    className="w-full justify-start text-left"
                    onClick={() => applyTemplate(key)}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)} Template
                  </Button>
                ))}
              </div>
            )}
            
            {selectedTemplate && (
              <Badge variant="outline" className="mt-1">
                Using {selectedTemplate} template
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <Label>Product Image</Label>
            <Button variant="outline" className="w-full h-24 border-dashed">
              <Camera className="mr-2 h-4 w-4" />
              Take Photo or Upload Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
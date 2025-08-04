'use client';

import { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Command, CommandInput, CommandList, CommandItem } from '@/components/ui/command';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateProductFormData } from '@/lib/types/products/create-products';

// Jewelry-specific attribute options
const OCCASIONS = ['Wedding', 'Anniversary', 'Birthday', 'Engagement', 'Valentine'] as const;
const GENDERS = ['Unisex', 'Women', 'Men', 'Kids'] as const;
const STYLES = ['Vintage', 'Modern', 'Classic', 'Bohemian', 'Art Deco'] as const;

// Color-coded tag styles
const TAG_COLORS = {
  Wedding: 'bg-pink-100 text-pink-800',
  Anniversary: 'bg-amber-100 text-amber-800',
  Birthday: 'bg-blue-100 text-blue-800',
  Engagement: 'bg-rose-100 text-rose-800',
  Valentine: 'bg-red-100 text-red-800',
  Unisex: 'bg-slate-100 text-slate-800',
  Women: 'bg-purple-100 text-purple-800',
  Men: 'bg-cyan-100 text-cyan-800',
  Kids: 'bg-green-100 text-green-800',
  Vintage: 'bg-amber-100 text-amber-800',
  Modern: 'bg-slate-100 text-slate-800',
  Classic: 'bg-gray-100 text-gray-800',
  Bohemian: 'bg-rose-100 text-rose-800',
  'Art Deco': 'bg-indigo-100 text-indigo-800',
} as const;

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function Attributes() {
  const { control, watch, setValue } = useFormContext<CreateProductFormData>();
  const { fields: attributes, append, remove } = useFieldArray({
    control,
    name: 'attributes',
  });

  const [openOccasion, setOpenOccasion] = useState(false);
  const [openGender, setOpenGender] = useState(false);
  const [openStyle, setOpenStyle] = useState(false);
  const [hasGemstones, setHasGemstones] = useState(false);
  const [isCustomizable, setIsCustomizable] = useState(false);

  // Get current attribute values
  const getAttributeValues = (attributeName: string): string[] => {
    return attributes
      .filter(attr => attr.name === attributeName)
      .map(attr => attr.value);
  };

  const toggleAttribute = (category: string, value: string) => {
    const currentValues = getAttributeValues(category);
    
    if (currentValues.includes(value)) {
      // Remove the attribute
      const indexToRemove = attributes.findIndex(
        attr => attr.name === category && attr.value === value
      );
      if (indexToRemove !== -1) {
        remove(indexToRemove);
      }
    } else {
      // Add the attribute
      append({
        id: generateId(),
        name: category,
        value: value,
      });
    }
  };

  const toggleGemstones = (checked: boolean) => {
    setHasGemstones(checked);
    
    // Update or add hasGemstones attribute
    const existingIndex = attributes.findIndex(attr => attr.name === 'hasGemstones');
    if (existingIndex !== -1) {
      remove(existingIndex);
    }
    
    if (checked) {
      append({
        id: generateId(),
        name: 'hasGemstones',
        value: 'true',
      });
    }
  };

  const toggleCustomizable = (checked: boolean) => {
    setIsCustomizable(checked);
    
    // Update or add isCustomizable attribute
    const existingIndex = attributes.findIndex(attr => attr.name === 'isCustomizable');
    if (existingIndex !== -1) {
      remove(existingIndex);
    }
    
    if (checked) {
      append({
        id: generateId(),
        name: 'isCustomizable',
        value: 'true',
      });
    }
  };

  const occasionValues = getAttributeValues('occasion');
  const genderValues = getAttributeValues('gender');
  const styleValues = getAttributeValues('style');

  return (
    <div className="space-y-6 bg-card p-6 rounded-lg border">
      <h2 className="text-xl font-semibold">Attributes</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Occasion */}
        <div className="space-y-2">
          <Label>Occasion</Label>
          <Popover open={openOccasion} onOpenChange={setOpenOccasion}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                {occasionValues.length > 0
                  ? `${occasionValues.length} selected`
                  : 'Select occasions...'}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[200px]">
              <Command>
                <CommandInput placeholder="Search occasion..." />
                <CommandList>
                  {OCCASIONS.map((occasion) => (
                    <CommandItem
                      key={occasion}
                      value={occasion}
                      onSelect={() => toggleAttribute('occasion', occasion)}
                      className="flex items-center justify-between"
                    >
                      <span>{occasion}</span>
                      {occasionValues.includes(occasion) && (
                        <span className="text-primary">✓</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="flex flex-wrap gap-2 mt-2">
            {occasionValues.map((tag) => (
              <Badge
                key={tag}
                className={`cursor-pointer ${TAG_COLORS[tag as keyof typeof TAG_COLORS]}`}
                onClick={() => toggleAttribute('occasion', tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label>Gender</Label>
          <Popover open={openGender} onOpenChange={setOpenGender}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                {genderValues.length > 0
                  ? `${genderValues.length} selected`
                  : 'Select gender...'}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[200px]">
              <Command>
                <CommandInput placeholder="Search gender..." />
                <CommandList>
                  {GENDERS.map((gender) => (
                    <CommandItem
                      key={gender}
                      value={gender}
                      onSelect={() => toggleAttribute('gender', gender)}
                      className="flex items-center justify-between"
                    >
                      <span>{gender}</span>
                      {genderValues.includes(gender) && (
                        <span className="text-primary">✓</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="flex flex-wrap gap-2 mt-2">
            {genderValues.map((tag) => (
              <Badge
                key={tag}
                className={`cursor-pointer ${TAG_COLORS[tag as keyof typeof TAG_COLORS]}`}
                onClick={() => toggleAttribute('gender', tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Style */}
        <div className="space-y-2">
          <Label>Style</Label>
          <Popover open={openStyle} onOpenChange={setOpenStyle}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                {styleValues.length > 0
                  ? `${styleValues.length} selected`
                  : 'Select styles...'}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[200px]">
              <Command>
                <CommandInput placeholder="Search style..." />
                <CommandList>
                  {STYLES.map((style) => (
                    <CommandItem
                      key={style}
                      value={style}
                      onSelect={() => toggleAttribute('style', style)}
                      className="flex items-center justify-between"
                    >
                      <span>{style}</span>
                      {styleValues.includes(style) && (
                        <span className="text-primary">✓</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="flex flex-wrap gap-2 mt-2">
            {styleValues.map((tag) => (
              <Badge
                key={tag}
                className={`cursor-pointer ${TAG_COLORS[tag as keyof typeof TAG_COLORS]}`}
                onClick={() => toggleAttribute('style', tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Special Attributes */}
      <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="has-gemstones"
            checked={hasGemstones}
            onCheckedChange={toggleGemstones}
          />
          <Label htmlFor="has-gemstones" className="font-normal">
            Product contains gemstones
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is-customizable"
            checked={isCustomizable}
            onCheckedChange={toggleCustomizable}
          />
          <Label htmlFor="is-customizable" className="font-normal">
            Customizable (e.g., size, length)
          </Label>
        </div>
      </div>
    </div>
  );
}
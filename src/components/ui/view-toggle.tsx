// components/ui/view-toggle.tsx
'use client';

import { Grid3X3, List } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState, useEffect } from 'react';

export function useViewToggle(storageKey: string) {
  const [view, setView] = useState<'table' | 'grid'>('table');

  useEffect(() => {
    const savedView = localStorage.getItem(storageKey) as 'table' | 'grid';
    if (savedView) {
      setView(savedView);
    }
  }, [storageKey]);

  const handleViewChange = (newView: 'table' | 'grid') => {
    setView(newView);
    localStorage.setItem(storageKey, newView);
  };

  return { view, setView: handleViewChange };
}

interface ViewToggleProps {
  value: 'table' | 'grid';
  onChange: (value: 'table' | 'grid') => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <TooltipProvider>
      <ToggleGroup 
        type="single" 
        value={value} 
        onValueChange={(v) => v && onChange(v as 'table' | 'grid')}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value="table" aria-label="Table view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>
            <p>Table view</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Grid3X3 className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>
            <p>Grid view</p>
          </TooltipContent>
        </Tooltip>
      </ToggleGroup>
    </TooltipProvider>
  );
}
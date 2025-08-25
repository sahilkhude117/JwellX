// components/ui/TimePeriodTabs.tsx
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { 
  TimePeriod, 
  CustomTimePeriod, 
  PredefinedTimePeriod 
} from "@/lib/types/stats";
import { 
  TIME_PERIOD_CONFIGS, 
  getTimePeriodLabel, 
  validateCustomTimePeriod 
} from "@/lib/utils/stats";

interface TimePeriodTabsProps {
  currentPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  availableTimePeriods: TimePeriod[];
  onAddCustomPeriod: (period: CustomTimePeriod) => void;
  onRemoveCustomPeriod: (periodId: string) => void;
  className?: string;
}

export const TimePeriodTabs: React.FC<TimePeriodTabsProps> = ({
  currentPeriod,
  onPeriodChange,
  availableTimePeriods,
  onAddCustomPeriod,
  onRemoveCustomPeriod,
  className
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPeriodValue = (): string => {
    if (typeof currentPeriod === 'string') {
      return currentPeriod;
    }
    return `custom-${currentPeriod.label}`;
  };

  const handleTabChange = (value: string) => {
    if (value.startsWith('custom-')) {
      const customLabel = value.replace('custom-', '');
      const customPeriod = availableTimePeriods.find(
        p => typeof p !== 'string' && p.label === customLabel
      ) as CustomTimePeriod;
      
      if (customPeriod) {
        onPeriodChange(customPeriod);
      }
    } else {
      onPeriodChange(value as PredefinedTimePeriod);
    }
  };

  const handleCreateCustomPeriod = () => {
    if (!startDate || !endDate || !customLabel.trim()) {
      setError('Please fill in all fields');
      return;
    }

    const validationError = validateCustomTimePeriod(startDate, endDate);
    if (validationError) {
      setError(validationError);
      return;
    }

    const customPeriod: CustomTimePeriod = {
      type: 'custom',
      startDate,
      endDate,
      label: customLabel.trim()
    };

    onAddCustomPeriod(customPeriod);
    onPeriodChange(customPeriod);
    
    // Reset form
    setCustomLabel('');
    setStartDate(undefined);
    setEndDate(undefined);
    setError(null);
    setIsDialogOpen(false);
  };

  const handleRemoveCustomPeriod = (period: CustomTimePeriod, e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveCustomPeriod(period.label);
  };

  const predefinedPeriods = availableTimePeriods.filter(
    p => typeof p === 'string'
  ) as PredefinedTimePeriod[];

  const customPeriods = availableTimePeriods.filter(
    p => typeof p !== 'string'
  ) as CustomTimePeriod[];

  return (
    <div className={cn('space-y-4', className)}>
      <Tabs value={getCurrentPeriodValue()} onValueChange={handleTabChange}>
        <div className="flex items-center justify-between">
          <TabsList className="grid-cols-5 w-auto">
            {predefinedPeriods.map((period) => (
              <TabsTrigger key={period} value={period}>
                {TIME_PERIOD_CONFIGS[period].label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Custom Range
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Custom Time Period</DialogTitle>
                <DialogDescription>
                  Create a custom date range for your stats analysis.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Period Name</Label>
                  <Input
                    id="label"
                    placeholder="e.g., Q1 2024"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {startDate ? (
                            startDate.toLocaleDateString()
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => {
                            setStartDate(date);
                            setStartCalendarOpen(false);
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {endDate ? (
                            endDate.toLocaleDateString()
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => {
                            setEndDate(date);
                            setEndCalendarOpen(false);
                          }}
                          disabled={(date) =>
                            date > new Date() || 
                            date < new Date("1900-01-01") ||
                            (!!startDate && date <= startDate)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateCustomPeriod}>
                  Add Period
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Custom periods tabs */}
        {customPeriods.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {customPeriods.map((period) => (
              <div
                key={`custom-${period.label}`}
                className={cn(
                  "relative flex items-center px-3 py-1 text-sm rounded-md border cursor-pointer",
                  typeof currentPeriod !== 'string' && currentPeriod.label === period.label
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => onPeriodChange(period)}
              >
                <span className="mr-6">{period.label}</span>
                <button
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 hover:bg-black/10 rounded"
                  onClick={(e) => handleRemoveCustomPeriod(period, e)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Tabs>
    </div>
  );
};
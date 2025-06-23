'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { TransactionType, PaymentMethod } from '@/lib/types/transaction';
import { DateRange } from 'react-day-picker';

interface TransactionsFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
}

export interface FilterState {
  dateRange?: DateRange;
  paymentMethod?: PaymentMethod;
  transactionType?: TransactionType;
  processedBy?: string;
  search?: string;
}

export function TransactionsFilters({ onFiltersChange }: TransactionsFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({});

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(filters);
  };

  const resetFilters = () => {
    const emptyFilters: FilterState = {};
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle>Filter Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Date Range</Label>
            <DatePickerWithRange
              date={filters.dateRange}
              onDateChange={(dateRange) => handleFilterChange('dateRange', dateRange)}
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select
              value={filters.paymentMethod}
              onValueChange={(value) => handleFilterChange('paymentMethod', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <Select
              value={filters.transactionType}
              onValueChange={(value) => handleFilterChange('transactionType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SALE_PAYMENT">Sale Payment</SelectItem>
                <SelectItem value="ORDER_ADVANCE">Order Advance</SelectItem>
                <SelectItem value="REPAIR_PAYMENT">Repair Payment</SelectItem>
                <SelectItem value="REFUND">Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Processed By</Label>
            <Select
              value={filters.processedBy}
              onValueChange={(value) => handleFilterChange('processedBy', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Amit Kumar">Amit Kumar</SelectItem>
                <SelectItem value="Priya Mehta">Priya Mehta</SelectItem>
                <SelectItem value="Rajesh Singh">Rajesh Singh</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Search</Label>
            <Input
              placeholder="Search by Transaction ID or Document Number"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={applyFilters}>Apply Filters</Button>
          <Button variant="ghost" onClick={resetFilters}>Reset</Button>
        </div>
      </CardContent>
    </Card>
  );
}
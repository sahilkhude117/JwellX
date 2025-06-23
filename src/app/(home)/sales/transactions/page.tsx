'use client';

import { useState, useMemo } from 'react';
import { TransactionsFilters, FilterState } from '@/app/components/sales/transactions/transaction-filters';
import { TransactionsTable } from '@/app/components/sales/transactions/transactions-table';
import { mockTransactions } from '@/lib/mock/transactions';
import { TransactionLogItem } from '@/lib/types/transaction';
import { isWithinInterval } from 'date-fns';

export default function TransactionsPage() {
  const [filters, setFilters] = useState<FilterState>({});

  const filteredTransactions = useMemo(() => {
    let filtered = [...mockTransactions];

    // Filter by date range
    if (filters.dateRange?.from && filters.dateRange?.to) {
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.timestamp);
        return isWithinInterval(transactionDate, {
          start: filters.dateRange!.from!,
          end: filters.dateRange!.to!,
        });
      });
    }

    // Filter by payment method
    if (filters.paymentMethod) {
      filtered = filtered.filter(transaction => 
        transaction.paymentMethod === filters.paymentMethod
      );
    }

    // Filter by transaction type
    if (filters.transactionType) {
      filtered = filtered.filter(transaction => 
        transaction.type === filters.transactionType
      );
    }

    // Filter by processed by
    if (filters.processedBy) {
      filtered = filtered.filter(transaction => 
        transaction.processedBy.name === filters.processedBy
      );
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.id.toLowerCase().includes(searchLower) ||
        transaction.associatedDocument.number.toLowerCase().includes(searchLower) ||
        (transaction.gatewayTransactionId && 
         transaction.gatewayTransactionId.toLowerCase().includes(searchLower))
      );
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [filters]);

  return (
    <div className="container max-w-7xl mx-auto p-4 max-w-7xl">
      <div className="mb-6 border rounded-lg bg-background p-4">
          <h1 className="text-3xl font-bold mb-2">Transactions</h1>
          <p className="text-muted-foreground">A detailed, unchangeable log of all payments and refunds processed through the system.</p>
      </div>

      <TransactionsFilters onFiltersChange={setFilters} />
      
      <TransactionsTable transactions={filteredTransactions} />
    </div>
  );
}
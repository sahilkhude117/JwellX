'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { TransactionLogItem, PaymentMethod, TransactionType } from '@/lib/types/transaction';
import Link from 'next/link';
import { format } from 'date-fns';

interface TransactionsTableProps {
  transactions: TransactionLogItem[];
}

const ITEMS_PER_PAGE = 10;

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'CASH':
        return <Banknote className="h-4 w-4" />;
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return <CreditCard className="h-4 w-4" />;
      case 'UPI':
        return <Smartphone className="h-4 w-4" />;
      case 'BANK_TRANSFER':
        return <Building2 className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getTransactionTypeVariant = (type: TransactionType) => {
    switch (type) {
      case 'SALE_PAYMENT':
        return 'default';
      case 'ORDER_ADVANCE':
        return 'secondary';
      case 'REPAIR_PAYMENT':
        return 'outline';
      case 'REFUND':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getTransactionTypeLabel = (type: TransactionType) => {
    switch (type) {
      case 'SALE_PAYMENT':
        return 'Sale';
      case 'ORDER_ADVANCE':
        return 'Advance';
      case 'REPAIR_PAYMENT':
        return 'Repair';
      case 'REFUND':
        return 'Refund';
      default:
        return type;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Transaction ID', 'Type', 'Document', 'Payment Method', 'Processed By', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(transaction => [
        format(new Date(transaction.timestamp), 'dd/MM/yyyy HH:mm'),
        transaction.id,
        getTransactionTypeLabel(transaction.type),
        transaction.associatedDocument.number,
        transaction.paymentMethod.replace('_', ' '),
        transaction.processedBy.name,
        transaction.amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions-ledger.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 bg-background rounded-xl p-4 border">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, transactions.length)} of {transactions.length} transactions
        </div>
        <Button onClick={exportToCSV} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Associated Doc.</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Processed By</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {format(new Date(transaction.timestamp), 'MMM dd, HH:mm')}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-mono text-sm">{transaction.id}</div>
                    {transaction.gatewayTransactionId && (
                      <div className="font-mono text-xs text-muted-foreground">
                        {transaction.gatewayTransactionId}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getTransactionTypeVariant(transaction.type)}>
                    {getTransactionTypeLabel(transaction.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/dashboard/sales/invoices/${transaction.associatedDocument.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {transaction.associatedDocument.number}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getPaymentMethodIcon(transaction.paymentMethod)}
                    <span>{transaction.paymentMethod.replace('_', ' ')}</span>
                  </div>
                </TableCell>
                <TableCell>{transaction.processedBy.name}</TableCell>
                <TableCell className="text-right">
                  <span
                    className={
                      transaction.amount > 0
                        ? 'text-green-600 font-medium'
                        : 'text-red-600 font-medium'
                    }
                  >
                    {formatCurrency(transaction.amount)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {currentTransactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`font-medium text-lg ${
                    transaction.amount > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatCurrency(transaction.amount)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(transaction.timestamp), 'MMM dd, HH:mm')}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={getTransactionTypeVariant(transaction.type)}>
                  {getTransactionTypeLabel(transaction.type)}
                </Badge>
                <Link
                  href={`/dashboard/sales/invoices/${transaction.associatedDocument.id}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                >
                  {transaction.associatedDocument.number}
                </Link>
              </div>
              <div className="text-sm text-muted-foreground">
                Method: {transaction.paymentMethod.replace('_', ' ')} | By: {transaction.processedBy.name}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">
                {transaction.id}
                {transaction.gatewayTransactionId && (
                  <div>{transaction.gatewayTransactionId}</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
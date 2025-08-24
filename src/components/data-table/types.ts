import { ColumnDef } from "@tanstack/react-table";
import { ReactNode } from "react";

export interface TableAction<TData> {
    label: string;
    icon?: ReactNode;
    onClick: (row: TData) => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    disabled?: (row: TData) => boolean;
}

export interface BulkAction<TData> {
    label: string;
    icon?: ReactNode;
    onClick: (selectedRows: TData[]) => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    disabled?: boolean;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: "search" | "select" | "multi-select" | "date-range" | "number-range" | "toggle" | "custom-selector";
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: any;
}

export interface TableConfig<TData> {
    columns: ColumnDef<TData>[];
    data: TData[];
    totalCount: number;
    loading: boolean;
    filters?: FilterConfig[];
    bulkActions?: BulkAction<TData>[];
    actions?: TableAction<TData>[];
    emptyState?: {
        title: string;
        description: string;
        action?: { 
            label: string;
            onClick: () => void;
        };
    };
    enableSorting?: boolean;
    enableSelection?: boolean;
    enablePagination?: boolean;
    pageSize?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    onFiltersChange?: (filters: Record<string, any>) => void;
}
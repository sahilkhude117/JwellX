"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZES = [10, 20, 30, 50];

interface DataPaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  sizes?: number[];
}

export function DataPagination({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  sizes = PAGE_SIZES,
}: DataPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages === 1) return null;

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm">
          Page {page} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm">Rows:</span>
        <Select
          value={String(limit)}
          onValueChange={(v) => {
            onLimitChange(Number(v));
            onPageChange(1); // reset to first page
          }}
        >
          <SelectTrigger className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sizes.map((s) => (
              <SelectItem key={s} value={String(s)}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
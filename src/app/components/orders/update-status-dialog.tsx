'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import { CustomOrderRowData, CustomOrderStatus, statusColors } from '@/lib/types/orders';

interface UpdateStatusDialogProps {
  order: CustomOrderRowData;
  onStatusUpdate: (orderId: string, newStatus: CustomOrderStatus) => void;
}

const statusFlow: Record<CustomOrderStatus, CustomOrderStatus[]> = {
  QUOTED: ['ADVANCE_PENDING', 'CANCELLED'],
  ADVANCE_PENDING: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['QUALITY_CHECK', 'CANCELLED'],
  QUALITY_CHECK: ['READY_FOR_DELIVERY', 'IN_PROGRESS'],
  READY_FOR_DELIVERY: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

const statusDescriptions: Record<CustomOrderStatus, string> = {
  QUOTED: 'Quote provided to customer',
  ADVANCE_PENDING: 'Waiting for advance payment',
  IN_PROGRESS: 'Order is being crafted',
  QUALITY_CHECK: 'Final quality inspection',
  READY_FOR_DELIVERY: 'Ready for customer pickup/delivery',
  COMPLETED: 'Order completed and delivered',
  CANCELLED: 'Order cancelled',
};

export function UpdateStatusDialog({ order, onStatusUpdate }: UpdateStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<CustomOrderStatus>(order.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const availableStatuses = statusFlow[order.status] || [];
  const canUpdate = availableStatuses.length > 0;

  const handleUpdate = async () => {
    if (selectedStatus === order.status) return;
    
    setIsUpdating(true);
    try {
      onStatusUpdate(order.id, selectedStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Update Order Status</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Current Order Info */}
        <div className="rounded-lg border p-4 bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">{order.orderNumber}</span>
            <Badge className={statusColors[order.status]}>
              {order.status.replace('_', ' ')}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            <div>{order.customer.name}</div>
            <div className="truncate">{order.description}</div>
          </div>
        </div>

        {/* Status Selection */}
        <div className="space-y-2">
          <Label>New Status</Label>
          {canUpdate ? (
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as CustomOrderStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {/* Current status (disabled) */}
                <SelectItem value={order.status} disabled>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[order.status]} variant="outline">
                      {order.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-muted-foreground">(Current)</span>
                  </div>
                </SelectItem>
                
                {/* Available next statuses */}
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[status]}>
                        {status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-3 border rounded-md bg-muted/50">
              <div className="text-sm text-muted-foreground">
                {order.status === 'COMPLETED' 
                  ? 'This order is completed and cannot be updated.'
                  : 'This order is cancelled and cannot be updated.'
                }
              </div>
            </div>
          )}
        </div>

        {/* Status Description */}
        {selectedStatus && (
          <div className="rounded-lg border p-3 bg-blue-50">
            <div className="text-sm">
              <span className="font-medium">Status Description:</span>
              <div className="mt-1 text-muted-foreground">
                {statusDescriptions[selectedStatus]}
              </div>
            </div>
          </div>
        )}

        {/* Workflow Guide */}
        <div className="rounded-lg border p-3 bg-muted/20">
          <div className="text-sm">
            <span className="font-medium">Typical Workflow:</span>
            <div className="mt-2 flex flex-wrap gap-1">
              {(['QUOTED', 'ADVANCE_PENDING', 'IN_PROGRESS', 'QUALITY_CHECK', 'READY_FOR_DELIVERY', 'COMPLETED'] as CustomOrderStatus[]).map((status, index, arr) => (
                <div key={status} className="flex items-center">
                  <Badge 
                    variant="outline"
                    className={cn(
                      "text-xs",
                      status === order.status ? statusColors[status] : "text-muted-foreground"
                    )}
                  >
                    {status.replace('_', ' ')}
                  </Badge>
                  {index < arr.length - 1 && (
                    <span className="mx-1 text-muted-foreground">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => setSelectedStatus(order.status)}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleUpdate}
          disabled={isUpdating || selectedStatus === order.status || !canUpdate}
        >
          {isUpdating ? 'Updating...' : 'Update Status'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
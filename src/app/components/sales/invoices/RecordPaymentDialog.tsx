import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InvoiceRowData } from "@/lib/types/invoice";

interface RecordPaymentDialogProps {
  invoice: InvoiceRowData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentRecorded: (invoiceId: string, amount: number) => void;
}

export function RecordPaymentDialog({ invoice, open, onOpenChange, onPaymentRecorded }: RecordPaymentDialogProps) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const handleConfirm = () => {
    const paymentAmount = parseFloat(amount) * 100; // Convert to paise
    if (paymentAmount > 0) {
      onPaymentRecorded(invoice.id, paymentAmount);
      setAmount("");
      setPaymentMethod("");
      onOpenChange(false);
    }
  };

  const remainingAmount = invoice.status === 'PARTIAL' ? invoice.netAmount * 0.5 : invoice.netAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment for {invoice.invoiceNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Amount Due: ₹{(remainingAmount / 100).toLocaleString('en-IN')}</Label>
          </div>
          <div>
            <Label htmlFor="amount">Amount being paid now</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!amount || !paymentMethod}>
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
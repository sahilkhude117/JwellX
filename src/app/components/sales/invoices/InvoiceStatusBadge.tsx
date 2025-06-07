import { Badge } from "@/components/ui/badge";
import { InvoiceStatus } from "@/lib/types/invoice";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const getStatusConfig = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID':
        return { variant: 'default', className: 'bg-green-100 text-green-800 border-green-200' };
      case 'PENDING':
        return { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'PARTIAL':
        return { variant: 'outline', className: 'bg-blue-100 text-blue-800 border-blue-200' };
      default:
        return { variant: 'default', className: '' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant as any} className={config.className}>
      {status}
    </Badge>
  );
}
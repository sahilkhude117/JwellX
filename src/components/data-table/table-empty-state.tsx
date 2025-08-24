import React from "react";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

interface TableEmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export const TableEmptyState: React.FC<TableEmptyStateProps> = ({
  title,
  description,
  action,
  icon = <Package className="h-12 w-12 text-muted-foreground" />,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
};
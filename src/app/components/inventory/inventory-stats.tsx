import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInventoryStats } from "@/hooks/inventory/use-inventory";
import { formatCurrency, formatWeight } from "@/lib/utils/inventory/utils";
import { AlertTriangle, DollarSign, Package, TrendingUp } from "lucide-react";

interface InventoryStatsProps {
    className?: string;
}

export function InventoryStats({ className }: InventoryStatsProps) {
    const { data: stats, isLoading, error } = useInventoryStats();

    if (isLoading) {
        return <InventoryStatsSkeleton />;
    }

    if (error || !stats) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-destructive">
                    <CardHeader>
                        <CardDescription>Failed to load inventory stats</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const statsCards = [
        {
            title: "Total Items",
            value: stats.totalItems.toLocaleString(),
            description: `${stats.totalItems} in stock`,
            icon: Package,
            trend: stats.totalItems,
        },
        {
            title: "Total Value",
            value: formatCurrency(stats.totalValue),
            description: "Current inventory value",
            icon: DollarSign,
            trend: stats.totalValue,
        },
        {
            title: "Total Weight",
            value: formatWeight(stats.outOfStockItems),
            description: "Gross Weight",
            icon: TrendingUp,
            trend: stats.outOfStockItems,
        },
        {
            title: "Low Stock Items",
            value: stats.lowStockItems.toString(),
            description: "Items below threshold",
            icon: AlertTriangle,
            variant: stats.lowStockItems > 0 ? "destructive" : "secondary",
        },
    ];

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
            {statsCards.map((stat, index) => (
                <Card key={index} className="relative">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                        </CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-muted-foreground">{stat.description}</p>
                            {stat.trend !== undefined && (
                                <Badge
                                    variant={stat.trend >= 0 ? 'default' : 'secondary'}
                                    className="text-xs"
                                >
                                    {stat.trend >= 0 ? "+" : "" }{stat.trend}%
                                </Badge>
                            )}
                            {stat.variant && (
                                <Badge variant={stat.variant as any} className="text-xs">
                                    {stat.variant === "destructive" ? "Action needed" : "Normal"}
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function InventoryStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24 mb-2" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
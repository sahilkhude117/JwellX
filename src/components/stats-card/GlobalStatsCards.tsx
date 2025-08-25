// components/stats/GlobalStatsCards.tsx
import React from 'react';
import { InventoryStatsHookReturn } from "@/lib/types/stats";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { StatCard } from "./StatCard";
import { TimePeriodTabs } from "./TimePeriodTabs";
import { Skeleton } from "../ui/skeleton";

interface GlobalStatsCardsProps {
    statsHook: InventoryStatsHookReturn;
    title?: string;
    className?: string;
    showTimePeriods?: boolean;
}

// Loading skeleton for stats cards
const StatsLoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: 4 }, (_, index) => (
      <div key={`skeleton-${index}`} className="border rounded-lg p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-12 w-20" />
        </div>
      </div>
    ))}
  </div>
);

export const GlobalStatsCards: React.FC<GlobalStatsCardsProps> = ({
    statsHook,
    title = "Analytics Overview",
    className,
    showTimePeriods = true
}) => {
    const {
        data,
        isLoading,
        error,
        refetch,
        isRefetching,
        timePeriod,
        setTimePeriod,
        availableTimePeriods,
        addCustomTimePeriod,
        removeCustomTimePeriod
    } = statsHook;

    const handleRefresh = () => {
        refetch();
    };

    return (
        <div className={cn('space-y-6', className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                    {data?.lastUpdated && (
                        <p className="text-sm text-gray-500 mt-1">
                            Last updated: {new Date(data.lastUpdated).toLocaleString()}
                        </p>
                    )}
                </div>
                <Button
                    onClick={handleRefresh}
                    disabled={isLoading || isRefetching}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                >
                    <RefreshCw 
                        className={cn(
                            "h-4 w-4",
                            (isLoading || isRefetching) && "animate-spin"
                        )} 
                    />
                    <span>
                        {isRefetching ? "Refreshing..." : "Refresh"}
                    </span>
                </Button>
            </div>

            {/* Time Period Selector */}
            {showTimePeriods && (
                <TimePeriodTabs
                    currentPeriod={timePeriod}
                    onPeriodChange={setTimePeriod}
                    availableTimePeriods={availableTimePeriods}
                    onAddCustomPeriod={addCustomTimePeriod}
                    onRemoveCustomPeriod={removeCustomTimePeriod}
                />
            )}

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Error loading statistics: {error}
                    </AlertDescription>
                </Alert>
            )}

            {/* Stats Grid */}
            <div className="space-y-4">
                {isLoading && !data ? (
                    <StatsLoadingSkeleton />
                ) : data?.stats?.length ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {data.stats.map((stat) => (
                                <StatCard
                                    key={stat.id}
                                    data={stat}
                                    isLoading={isRefetching}
                                    error={error}
                                />
                            ))}
                        </div>
                        
                        {/* Stats Summary */}
                        <div className="bg-gray-50 rounded-lg p-4 mt-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                Period Summary
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Time Period:</span>
                                    <p className="font-medium">
                                        {typeof timePeriod === 'string' 
                                            ? timePeriod.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                                            : timePeriod.label
                                        }
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Total Stats:</span>
                                    <p className="font-medium">{data.stats.length}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Positive Trends:</span>
                                    <p className="font-medium text-green-600">
                                        {data.stats.filter(s => s.trend.isPositive).length}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Negative Trends:</span>
                                    <p className="font-medium text-red-600">
                                        {data.stats.filter(s => !s.trend.isPositive).length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : !isLoading ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-lg mb-2">No statistics available</div>
                        <p className="text-gray-500 text-sm">
                            Try refreshing or check back later
                        </p>
                        <Button
                            onClick={handleRefresh}
                            variant="outline"
                            className="mt-4"
                        >
                            Retry
                        </Button>
                    </div>
                ) : null}
            </div>
        </div>
    );
};
// components/stats/GlobalStatsCards.tsx
import React from 'react';
import { BaseStat, StatsHookReturn } from "@/lib/types/stats";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { AlertCircle, Plus } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { StatCard } from './StatCard';
import { TimePeriodTabs } from './TimePeriodTabs';
import { Skeleton } from "../ui/skeleton";

interface GlobalStatsCardsProps<T extends BaseStat = any> {
    statsHook: StatsHookReturn<T>;
    title?: string;
    className?: string;
    showTimePeriods?: boolean;
    addNewButton?: {
        label: string;
        onClick: () => void;
    };
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

export const GlobalStatsCards = <T extends BaseStat = any>({
    statsHook,
    title = "Analytics Overview",
    className,
    showTimePeriods = true,
    addNewButton,
}: GlobalStatsCardsProps<T>) => {
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
        removeCustomTimePeriod,
        shopCreatedAt
    } = statsHook;

    return (
        <div className={cn('space-y-6', className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                    {data?.lastUpdated ? (
                        <p className="text-sm text-gray-500 mt-1">
                            Last updated: {new Date(data.lastUpdated).toLocaleString()}
                        </p>
                        ) : isLoading ? (
                        <div className="text-sm text-gray-500 mt-1">
                            Last updated: <Skeleton className="h-3 w-16 inline-block" />
                        </div>
                    ) : null}
                </div>
                {addNewButton && (
                    <Button
                        onClick={addNewButton.onClick}
                        className="bg-black hover:bg-gray-800 text-white cursor-pointer"
                        size="lg"
                    >   
                        <Plus size={4}/>
                        {addNewButton.label}
                    </Button>
                )}
            </div>

            {/* Time Period Selector */}
            {showTimePeriods && (
                <TimePeriodTabs
                    currentPeriod={timePeriod}
                    onPeriodChange={setTimePeriod}
                    availableTimePeriods={availableTimePeriods}
                    onAddCustomPeriod={addCustomTimePeriod}
                    onRemoveCustomPeriod={removeCustomTimePeriod}
                    shopCreatedAt={shopCreatedAt}
                    onRefresh={refetch}
                    isRefreshing={isRefetching}
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
                    </>
                ) : !isLoading ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-lg mb-2">No statistics available</div>
                        <p className="text-gray-500 text-sm">
                            Try refreshing or check back later
                        </p>
                        <Button
                            onClick={() => refetch()}
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
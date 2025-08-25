// components/ui/StatCard.tsx
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ResponsiveContainer, 
  Area, 
  AreaChart, 
  Tooltip, 
  TooltipProps 
} from 'recharts';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { StatCardData } from '@/lib/types/stats';
import { formatValue, formatDateForDisplay } from '@/lib/utils/stats';
import { cn } from '@/lib/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface StatCardProps {
  data?: StatCardData;
  isLoading?: boolean;
  error?: string | null;
}

// Custom tooltip component for chart
interface CustomTooltipProps extends TooltipProps<number, string> {
  unit?: { prefix?: string; suffix?: string };
  isValueApprox?: boolean;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ 
  active, 
  payload, 
  label,
  unit,
  isValueApprox 
}) => {
  if (!active || !payload || !payload.length) return null;

  const value = payload[0].value as number;
  const timestamp = payload[0].payload?.timestamp;
  const formattedValue = formatValue(value, isValueApprox, unit);
  const formattedDate = timestamp ? formatDateForDisplay(timestamp) : label;

  return (
    <div className="bg-blue-50 p-3 border border-gray-200 rounded-lg shadow-lg text-sm min-w-max">
      <p className="font-semibold text-gray-900 whitespace-nowrap">
        {formattedValue.display}
      </p>
      <p className="text-gray-600 text-xs whitespace-nowrap">
        {formattedDate}
      </p>
    </div>
  );
};

export const StatCard: React.FC<StatCardProps> = ({ 
  data, 
  isLoading = false, 
  error = null 
}) => {
  const [showFullValue, setShowFullValue] = useState(false);

  const renderValue = () => {
    if (isLoading) {
      return <Skeleton className="h-8 w-24" />;
    }
    
    if (error) {
      return (
        <div className="text-red-500 font-semibold text-2xl">
          --
        </div>
      );
    }

    if (!data) return null;

    const formatted = formatValue(
      data.value, 
      data.isValueApprox || false, 
      data.unit
    );

    return (
      <div className="flex items-center gap-2">
        <HoverCard open={formatted.isApprox ? undefined : false}>
          <HoverCardTrigger asChild>
            <div 
              className={cn(
                "font-semibold text-2xl text-gray-900 cursor-pointer",
                formatted.isApprox && ""
              )}
              onClick={() => formatted.isApprox && setShowFullValue(!showFullValue)}
            >
              {showFullValue ? formatted.full : formatted.display}
            </div>
          </HoverCardTrigger>
          {formatted.isApprox && (
            <HoverCardContent className="w-auto p-2">
              <div className="text-sm">
                <p className="font-medium">Full value:</p>
                <p>{formatted.full}</p>
              </div>
            </HoverCardContent>
          )}
        </HoverCard>
        
        {formatted.isApprox && (
          <Info className="h-3 w-3 text-gray-400" />
        )}
      </div>
    );
  };

  const renderTrend = () => {
    if (isLoading) {
      return <Skeleton className="h-4 w-16" />;
    }
    
    if (error || !data?.trend) {
      return (
        <div className="flex items-center text-gray-400 text-sm">
          <TrendingDown className="h-3 w-3 mr-1" />
          --
        </div>
      );
    }
    
    const { trend, timePeriod } = data;
    const periodText = typeof timePeriod === 'string' 
      ? `from last ${timePeriod}` 
      : `from ${timePeriod.label}`;

    return (
      <div className={cn(
        "flex items-center text-sm mt-1",
        trend.isPositive ? "text-green-600" : "text-red-500"
      )}>
        {trend.isPositive ? (
          <TrendingUp className="h-3 w-3 mr-1" />
        ) : (
          <TrendingDown className="h-3 w-3 mr-1" />
        )}
        <span>{trend.percentage}% {periodText}</span>
      </div>
    );
  };

  const renderChart = () => {
    if (isLoading) {
      return <Skeleton className="h-12 w-20" />;
    }
    
    if (error || !data?.chartData?.length || !data?.showGraph) {
      return (
        <div className="h-12 w-20 bg-gray-50 rounded flex items-center justify-center">
          <div className="text-gray-400 text-xs">No data</div>
        </div>
      );
    }
    
    const isPositiveTrend = data.trend.isPositive;
    const chartColor = isPositiveTrend ? "#10b981" : "#ef4444";
    const gradientId = `gradient-${data.id}`;
    
    return (
      <div className="h-12 w-20 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data.chartData}
            margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ 
                r: 3, 
                fill: chartColor, 
                stroke: '#ffffff', 
                strokeWidth: 2 
              }}
            />
            
            <Tooltip 
              content={
                <CustomTooltip 
                  unit={data.unit}
                  isValueApprox={data.isValueApprox}
                />
              }
              cursor={{
                stroke: chartColor,
                strokeWidth: 1,
                strokeDasharray: '4 4'
              }}
              position={{ y: -70}}
              offset={10}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const IconComponent = data?.icon;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {isLoading ? (
              <Skeleton className="h-9 w-9 rounded-lg" />
            ) : (
              IconComponent && (
                <div className="p-2 bg-blue-50 rounded-lg">
                  <IconComponent className="h-5 w-5 text-blue-600" />
                </div>
              )
            )}
            <div className="flex-1">
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </>
              ) : (
                <>
                  <h3 className="font-bold text-gray-900 text-base">
                    {data?.title || 'Loading...'}
                  </h3>
                  <p className="text-gray-500 text-xs">
                    {data?.description || 'Please wait...'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            {renderValue()}
            {renderTrend()}
          </div>
          <div className="ml-4">
            {renderChart()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
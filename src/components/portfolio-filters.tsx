'use client';

import React, { useState } from 'react';
import { Calendar, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FilterState, Holding, Trade } from '@/types/portfolio';
import { getUniqueSectors } from '@/lib/portfolio-calculator';

interface PortfolioFiltersProps {
  holdings: Holding[];
  trades: Trade[];
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  className?: string;
}

export default function PortfolioFilters({
  holdings,
  trades,
  filters,
  onFiltersChange,
  className = ""
}: PortfolioFiltersProps) {
  const [showDateInputs, setShowDateInputs] = useState(false);

  // Get unique sectors from holdings
  const uniqueSectors = React.useMemo(() => getUniqueSectors(holdings), [holdings]);

  // Get date range from trades
  const dateRange = React.useMemo(() => {
    if (trades.length === 0) return { min: '', max: '' };
    
    const dates = trades.map(trade => trade.date).sort();
    return {
      min: dates[0],
      max: dates[dates.length - 1]
    };
  }, [trades]);

  const handleSectorChange = (value: string) => {
    onFiltersChange({
      selectedSector: value === 'all' ? '' : value,
      currentPage: 1 // Reset to first page when filtering
    });
  };

  const handleDateRangeChange = (type: 'from' | 'to', value: string) => {
    onFiltersChange({
      dateRange: {
        ...filters.dateRange,
        [type]: value || null
      },
      currentPage: 1 // Reset to first page when filtering
    });
  };

  const handleClearDateRange = () => {
    onFiltersChange({
      dateRange: {
        from: null,
        to: null
      },
      currentPage: 1
    });
  };

  const handleClearAllFilters = () => {
    onFiltersChange({
      selectedSector: '',
      dateRange: {
        from: null,
        to: null
      },
      searchTerm: '',
      currentPage: 1
    });
  };

  const hasActiveFilters = 
    filters.selectedSector || 
    filters.dateRange.from || 
    filters.dateRange.to || 
    filters.searchTerm;

  const activeFilterCount = 
    (filters.selectedSector ? 1 : 0) +
    (filters.dateRange.from || filters.dateRange.to ? 1 : 0) +
    (filters.searchTerm ? 1 : 0);

  return (
    <Card className={`border-slate-200/60 bg-white/80 backdrop-blur-sm ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg text-slate-900">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Filter className="h-4 w-4 text-slate-600" />
            </div>
            <span className="font-semibold">Filters</span>
            {activeFilterCount > 0 && (
              <Badge className="ml-2 bg-slate-600 text-white border-0">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllFilters}
              className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            >
              Clear all
              <X className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sector Filter */}
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-2 block">
            Sector
          </label>
          <Select
            value={filters.selectedSector || 'all'}
            onValueChange={handleSectorChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              {uniqueSectors.map(sector => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">
              Date Range
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDateInputs(!showDateInputs)}
              className="text-slate-600 hover:text-slate-700 hover:bg-slate-100 p-1"
            >
              <Calendar className="h-4 w-4" />
              {showDateInputs ? 'Hide' : 'Show'}
            </Button>
          </div>

          {showDateInputs && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">From</label>
                  <Input
                    type="date"
                    value={filters.dateRange.from || ''}
                    onChange={(e) => handleDateRangeChange('from', e.target.value)}
                    min={dateRange.min}
                    max={filters.dateRange.to || dateRange.max}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">To</label>
                  <Input
                    type="date"
                    value={filters.dateRange.to || ''}
                    onChange={(e) => handleDateRangeChange('to', e.target.value)}
                    min={filters.dateRange.from || dateRange.min}
                    max={dateRange.max}
                    className="text-sm"
                  />
                </div>
              </div>
              
              {(filters.dateRange.from || filters.dateRange.to) && (
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {filters.dateRange.from && filters.dateRange.to
                      ? `${filters.dateRange.from} to ${filters.dateRange.to}`
                      : filters.dateRange.from
                      ? `From ${filters.dateRange.from}`
                      : `Until ${filters.dateRange.to}`
                    }
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearDateRange}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Quick Date Range Buttons */}
          {!showDateInputs && trades.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  const fromDate = thirtyDaysAgo.toISOString().split('T')[0];
                  
                  onFiltersChange({
                    dateRange: {
                      from: fromDate,
                      to: null
                    },
                    currentPage: 1
                  });
                }}
                className="text-xs"
              >
                Last 30 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const ninetyDaysAgo = new Date();
                  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                  const fromDate = ninetyDaysAgo.toISOString().split('T')[0];
                  
                  onFiltersChange({
                    dateRange: {
                      from: fromDate,
                      to: null
                    },
                    currentPage: 1
                  });
                }}
                className="text-xs"
              >
                Last 3 months
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onFiltersChange({
                    dateRange: {
                      from: dateRange.min,
                      to: dateRange.max
                    },
                    currentPage: 1
                  });
                }}
                className="text-xs"
              >
                All time
              </Button>
            </div>
          )}
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-3 border-t">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Active Filters:
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.selectedSector && (
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                >
                  Sector: {filters.selectedSector}
                  <button
                    onClick={() => handleSectorChange('all')}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(filters.dateRange.from || filters.dateRange.to) && (
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                >
                  Date: {
                    filters.dateRange.from && filters.dateRange.to
                      ? `${filters.dateRange.from} to ${filters.dateRange.to}`
                      : filters.dateRange.from
                      ? `From ${filters.dateRange.from}`
                      : `Until ${filters.dateRange.to}`
                  }
                  <button
                    onClick={handleClearDateRange}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.searchTerm && (
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                >
                  Search: "{filters.searchTerm}"
                  <button
                    onClick={() => onFiltersChange({ searchTerm: '', currentPage: 1 })}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="pt-3 border-t text-xs text-gray-500">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Available sectors:</span> {uniqueSectors.length}
            </div>
            <div>
              <span className="font-medium">Date range:</span>{' '}
              {dateRange.min && dateRange.max 
                ? `${dateRange.min} to ${dateRange.max}`
                : 'No data'
              }
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

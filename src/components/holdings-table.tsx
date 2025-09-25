'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Holding, FilterState } from '@/types/portfolio';
import { 
  filterHoldings, 
  paginateData, 
  formatCurrency, 
  formatPercentage, 
  formatNumber, 
  debounce 
} from '@/lib/portfolio-calculator';

interface HoldingsTableProps {
  holdings: Holding[];
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  isLoading?: boolean;
}

export default function HoldingsTable({ 
  holdings, 
  filters, 
  onFiltersChange,
  isLoading = false 
}: HoldingsTableProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(filters.searchTerm);

  // Debounced search to avoid excessive filtering
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      onFiltersChange({ searchTerm });
    }, 300),
    [onFiltersChange]
  );

  const handleSearchChange = useCallback((value: string) => {
    setLocalSearchTerm(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  // Filter and paginate data
  const { filteredData, paginatedData } = useMemo(() => {
    const filtered = filterHoldings(
      holdings,
      filters.searchTerm,
      filters.selectedSector,
      filters.sortBy,
      filters.sortDirection
    );

    const paginated = paginateData(
      filtered,
      filters.currentPage,
      filters.itemsPerPage
    );

    return {
      filteredData: filtered,
      paginatedData: paginated
    };
  }, [holdings, filters]);

  const handleSort = useCallback((column: keyof Holding) => {
    const newDirection = 
      filters.sortBy === column && filters.sortDirection === 'desc' 
        ? 'asc' 
        : 'desc';
    
    onFiltersChange({
      sortBy: column,
      sortDirection: newDirection,
      currentPage: 1 // Reset to first page when sorting
    });
  }, [filters.sortBy, filters.sortDirection, onFiltersChange]);

  const handlePageChange = useCallback((newPage: number) => {
    onFiltersChange({ currentPage: newPage });
  }, [onFiltersChange]);

  const getSortIcon = (column: keyof Holding) => {
    if (filters.sortBy !== column) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    return filters.sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  const columns: Array<{
    key: keyof Holding;
    label: string;
    sortable: boolean;
    align?: 'left' | 'center' | 'right';
    format?: (value: any, holding: Holding) => React.ReactNode;
  }> = [
    {
      key: 'symbol',
      label: 'Symbol',
      sortable: true,
      format: (value, holding) => (
        <div>
          <span className="font-medium">{value}</span>
          <div className="text-sm text-gray-500">{holding.sector}</div>
        </div>
      )
    },
    {
      key: 'sharesHeld',
      label: 'Shares',
      sortable: true,
      align: 'right',
      format: (value) => formatNumber(value, 2)
    },
    {
      key: 'avgCostBasis',
      label: 'Avg Cost',
      sortable: true,
      align: 'right',
      format: (value) => formatCurrency(value)
    },
    {
      key: 'currentPrice',
      label: 'Current Price',
      sortable: true,
      align: 'right',
      format: (value) => formatCurrency(value)
    },
    {
      key: 'currentValue',
      label: 'Market Value',
      sortable: true,
      align: 'right',
      format: (value) => formatCurrency(value)
    },
    {
      key: 'unrealizedGainLoss',
      label: 'Gain/Loss',
      sortable: true,
      align: 'right',
      format: (value, holding) => (
        <div className={`font-medium ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <div>{formatCurrency(value)}</div>
          <div className="text-sm">
            {formatPercentage(holding.unrealizedGainLossPercent)}
          </div>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-slate-900 font-semibold">
            Holdings <span className="text-slate-500 font-normal">({filteredData.length})</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search holdings..."
                value={localSearchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 w-64 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium mb-2">No holdings found</p>
            {filters.searchTerm && (
              <p className="text-sm text-slate-500">
                Try adjusting your search terms or filters
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    {columns.map((column) => (
                      <TableHead 
                        key={column.key} 
                        className={`${column.align === 'right' ? 'text-right' : 
                                   column.align === 'center' ? 'text-center' : 'text-left'}`}
                      >
                        {column.sortable ? (
                          <Button
                            variant="ghost"
                            onClick={() => handleSort(column.key)}
                            className="h-auto p-0 font-medium hover:bg-transparent"
                          >
                            {column.label}
                            {getSortIcon(column.key)}
                          </Button>
                        ) : (
                          column.label
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.items.map((holding, index) => (
                    <TableRow key={holding.symbol} className="hover:bg-slate-50/80 transition-colors">
                      {columns.map((column) => (
                        <TableCell 
                          key={column.key}
                          className={`${column.align === 'right' ? 'text-right' : 
                                     column.align === 'center' ? 'text-center' : 'text-left'}`}
                        >
                          {column.format ? 
                            column.format(holding[column.key], holding) : 
                            holding[column.key]
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {paginatedData.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {paginatedData.startIndex + 1} to {paginatedData.endIndex} of{' '}
                  {paginatedData.totalItems} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(filters.currentPage - 1)}
                    disabled={filters.currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, paginatedData.totalPages) }, (_, i) => {
                      const pageNumber = Math.max(1, Math.min(
                        paginatedData.totalPages - 4,
                        filters.currentPage - 2
                      )) + i;
                      
                      if (pageNumber > paginatedData.totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNumber}
                          variant={pageNumber === filters.currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNumber)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(filters.currentPage + 1)}
                    disabled={filters.currentPage >= paginatedData.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Table Info */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-500">
              <div>
                {filters.itemsPerPage} items per page
              </div>
              <div>
                {filters.sortBy && (
                  <span>
                    Sorted by {filters.sortBy} ({filters.sortDirection})
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

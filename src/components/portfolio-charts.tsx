'use client';

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import { Holding, PortfolioHistoryPoint } from '@/types/portfolio';
import { formatCurrency, formatPercentage } from '@/lib/portfolio-calculator';

interface PortfolioChartsProps {
  holdings: Holding[];
  portfolioHistory: PortfolioHistoryPoint[];
  isLoading?: boolean;
}

// Predefined colors for consistent chart styling
const COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#ec4899', // pink
  '#6b7280', // gray
  '#14b8a6', // teal
  '#f43f5e', // rose
];

export default function PortfolioCharts({ holdings, portfolioHistory, isLoading = false }: PortfolioChartsProps) {
  // Prepare pie chart data (allocation by current value)
  const pieChartData = useMemo(() => {
    const totalValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
    
    return holdings
      .filter(holding => holding.currentValue > 0)
      .map((holding, index) => ({
        name: holding.symbol,
        value: holding.currentValue,
        percentage: totalValue > 0 ? (holding.currentValue / totalValue) * 100 : 0,
        sector: holding.sector,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [holdings]);

  // Prepare sector allocation data
  const sectorData = useMemo(() => {
    const sectorTotals = holdings.reduce((acc, holding) => {
      const sector = holding.sector;
      if (!acc[sector]) {
        acc[sector] = 0;
      }
      acc[sector] += holding.currentValue;
      return acc;
    }, {} as Record<string, number>);

    const totalValue = Object.values(sectorTotals).reduce((sum, value) => sum + value, 0);

    return Object.entries(sectorTotals)
      .map(([sector, value], index) => ({
        name: sector,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [holdings]);

  // Prepare line chart data
  const lineChartData = useMemo(() => {
    return portfolioHistory.map(point => ({
      date: new Date(point.date).toLocaleDateString(),
      fullDate: point.date,
      value: point.value,
      trades: point.trades
    }));
  }, [portfolioHistory]);

  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">{data.sector}</p>
          <p className="text-sm font-medium text-blue-600">
            {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-gray-500">
            {data.percentage.toFixed(1)}% of portfolio
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for line chart
  const LineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm font-medium text-blue-600">
            Portfolio Value: {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-gray-500">
            {data.trades} trade{data.trades !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-dashed border-slate-300 bg-slate-50/30">
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 rounded-full flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium mb-2">No data available</p>
              <p className="text-sm text-slate-500">Upload trading data to see portfolio allocation</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-dashed border-slate-300 bg-slate-50/30">
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 rounded-full flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium mb-2">No data available</p>
              <p className="text-sm text-slate-500">Upload trading data to see portfolio history</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Holdings Allocation Pie Chart */}
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 font-semibold">Portfolio Allocation by Holding</CardTitle>
            <p className="text-sm text-slate-600">Current market value distribution</p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => {
                      const { percentage } = props;
                      return percentage ? `${percentage.toFixed(1)}%` : '';
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend for holdings */}
            <div className="mt-4 grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {pieChartData.slice(0, 8).map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <Badge variant="outline" className="text-xs">
                    {item.name}
                  </Badge>
                  <span className="text-gray-500 ml-auto">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sector Allocation Pie Chart */}
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 font-semibold">Portfolio Allocation by Sector</CardTitle>
            <p className="text-sm text-slate-600">Sector diversification overview</p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => {
                      const { name, percentage } = props;
                      return name && percentage ? `${name}: ${percentage.toFixed(1)}%` : '';
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`sector-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm font-medium text-blue-600">
                              {formatCurrency(data.value)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {data.percentage.toFixed(1)}% of portfolio
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Value Over Time */}
      {lineChartData.length > 1 && (
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 font-semibold">Portfolio Value Over Time</CardTitle>
            <p className="text-sm text-slate-600">Historical portfolio value based on current prices</p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip content={<LineTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Data Points</p>
                <p className="font-medium">{lineChartData.length}</p>
              </div>
              <div>
                <p className="text-gray-600">Date Range</p>
                <p className="font-medium">
                  {lineChartData.length > 0 && 
                    `${lineChartData[0].date} to ${lineChartData[lineChartData.length - 1].date}`
                  }
                </p>
              </div>
              <div>
                <p className="text-gray-600">Current Value</p>
                <p className="font-medium">
                  {lineChartData.length > 0 && 
                    formatCurrency(lineChartData[lineChartData.length - 1].value)
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

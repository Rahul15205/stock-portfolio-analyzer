'use client';

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PortfolioMetrics } from '@/types/portfolio';
import { formatCurrency, formatPercentage } from '@/lib/portfolio-calculator';

interface PortfolioSummaryProps {
  metrics: PortfolioMetrics;
  isLoading?: boolean;
}

export default function PortfolioSummary({ metrics, isLoading = false }: PortfolioSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-32 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Portfolio Value',
      value: formatCurrency(metrics.totalValue),
      description: `Cost basis: ${formatCurrency(metrics.totalCost)}`,
      icon: DollarSign,
      color: 'slate',
      trend: metrics.totalGainLoss >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'P&L',
      value: formatCurrency(metrics.totalGainLoss),
      description: formatPercentage(metrics.totalGainLossPercent),
      icon: metrics.totalGainLoss >= 0 ? TrendingUp : TrendingDown,
      color: metrics.totalGainLoss >= 0 ? 'emerald' : 'rose',
      trend: metrics.totalGainLoss >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Holdings',
      value: metrics.numUniqueSymbols.toString(),
      description: `${metrics.numUniqueSymbols} positions`,
      icon: Target,
      color: 'indigo',
      trend: 'neutral'
    },
    {
      title: 'Status',
      value: metrics.totalValue > 0 ? 'Active' : 'Empty',
      description: `${metrics.totalValue > 0 ? 'Monitoring' : 'No data'}`,
      icon: Activity,
      color: metrics.totalValue > 0 ? 'emerald' : 'slate',
      trend: 'neutral'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={index} className="group transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-slate-200/60 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 tracking-wide">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${
                  card.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                  card.color === 'rose' ? 'bg-rose-100 text-rose-600' :
                  card.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                  card.color === 'slate' ? 'bg-slate-100 text-slate-600' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  <IconComponent className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 mb-1">{card.value}</div>
                <p className={`text-xs font-medium ${
                  card.trend === 'positive' ? 'text-emerald-600' :
                  card.trend === 'negative' ? 'text-rose-600' :
                  'text-slate-500'
                }`}>
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Highlights */}
      {(metrics.topPerformer || metrics.worstPerformer) && (
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Performance Leaders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Top Performer */}
              {metrics.topPerformer && (
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200/60">
                  <div>
                    <p className="text-sm font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                      <span className="text-lg">📈</span>
                      Best Performer
                    </p>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-emerald-600 text-white border-0 font-medium">
                        {metrics.topPerformer.symbol}
                      </Badge>
                      <span className="text-xl font-bold text-emerald-700">
                        {formatPercentage(metrics.topPerformer.gainLossPercent)}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-200 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-emerald-700" />
                  </div>
                </div>
              )}

              {/* Worst Performer */}
              {metrics.worstPerformer && (
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-rose-50 to-rose-100/50 rounded-xl border border-rose-200/60">
                  <div>
                    <p className="text-sm font-semibold text-rose-800 mb-2 flex items-center gap-2">
                      <span className="text-lg">📉</span>
                      Underperformer
                    </p>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-rose-600 text-white border-0 font-medium">
                        {metrics.worstPerformer.symbol}
                      </Badge>
                      <span className="text-xl font-bold text-rose-700">
                        {formatPercentage(metrics.worstPerformer.gainLossPercent)}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-rose-200 rounded-lg">
                    <TrendingDown className="h-6 w-6 text-rose-700" />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {metrics.numUniqueSymbols === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Portfolio Data
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              Upload a CSV file with your trading data to see your portfolio metrics and performance analysis.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

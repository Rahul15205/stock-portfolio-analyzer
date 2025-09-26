'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  Upload, 
  Save, 
  Trash2, 
  Settings,
  Info,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

// Components
import CSVUpload from '@/components/csv-upload';
import PortfolioSummary from '@/components/portfolio-summary';
import HoldingsTable from '@/components/holdings-table';
import PortfolioCharts from '@/components/portfolio-charts';
import PortfolioFilters from '@/components/portfolio-filters';

// Types and utilities
import { 
  AppState, 
  FilterState, 
  ParsedCSVResult, 
  Trade, 
  Holding, 
  PortfolioMetrics, 
  PortfolioHistoryPoint 
} from '@/types/portfolio';
import { 
  calculateHoldings, 
  calculatePortfolioMetrics, 
  calculatePortfolioHistory
} from '@/lib/portfolio-calculator';
import { 
  saveAppState, 
  loadAppState, 
  saveFilters, 
  loadFilters, 
  clearAllStoredData,
  debouncedSaveAppState,
  isLocalStorageAvailable
} from '@/lib/local-storage';

// Initial filter state
const initialFilters: FilterState = {
  searchTerm: '',
  selectedSector: '',
  dateRange: { from: null, to: null },
  sortBy: 'currentValue',
  sortDirection: 'desc',
  currentPage: 1,
  itemsPerPage: 10
};

// Initial app state
const initialAppState: AppState = {
  trades: [],
  holdings: [],
  portfolioMetrics: {
    totalValue: 0,
    totalCost: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
    numUniqueSymbols: 0,
    topPerformer: null,
    worstPerformer: null
  },
  portfolioHistory: [],
  filters: initialFilters,
  isLoading: false,
  error: null
};

export default function Home() {
  const [appState, setAppState] = useState<AppState>(initialAppState);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showStorageInfo, setShowStorageInfo] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  // Initialize app with saved data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load saved data
        const savedState = loadAppState();
        const savedFilters = loadFilters();

        if (savedState?.trades && savedState.trades.length > 0) {
          const trades = savedState.trades;
          const holdings = calculateHoldings(trades);
          const portfolioMetrics = calculatePortfolioMetrics(holdings);
          const portfolioHistory = calculatePortfolioHistory(trades);

          setAppState(prev => ({
            ...prev,
            trades,
            holdings,
            portfolioMetrics,
            portfolioHistory,
            filters: savedFilters || initialFilters
          }));
        } else if (savedFilters) {
          setAppState(prev => ({
            ...prev,
            filters: savedFilters
          }));
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setAppState(prev => ({ ...prev, error: 'Failed to load saved data' }));
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  // Auto-save trades when they change
  useEffect(() => {
    if (isInitialized && appState.trades.length > 0) {
      debouncedSaveAppState({ trades: appState.trades });
      setLastSavedTime(new Date());
    }
  }, [appState.trades, isInitialized]);

  // Save filters when they change
  useEffect(() => {
    if (isInitialized) {
      saveFilters(appState.filters);
    }
  }, [appState.filters, isInitialized]);

  // Handle CSV data parsed
  const handleDataParsed = useCallback((result: ParsedCSVResult) => {
    setAppState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (result.isValid && result.trades.length > 0) {
        const holdings = calculateHoldings(result.trades);
        const portfolioMetrics = calculatePortfolioMetrics(holdings);
        const portfolioHistory = calculatePortfolioHistory(result.trades);

        setAppState(prev => ({
          ...prev,
          trades: result.trades,
          holdings,
          portfolioMetrics,
          portfolioHistory,
          isLoading: false,
          error: null
        }));
      } else {
        setAppState(prev => ({
          ...prev,
          isLoading: false,
          error: `CSV parsing failed with ${result.errors.length} errors`
        }));
      }
    } catch (error) {
      console.error('Failed to process CSV data:', error);
      setAppState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to process the uploaded data'
      }));
    }
  }, []);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: Partial<FilterState>) => {
    setAppState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }));
  }, []);

  // Clear all data
  const handleClearAllData = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearAllStoredData();
      setAppState(initialAppState);
      setLastSavedTime(null);
    }
  }, []);

  // Manual save
  const handleManualSave = useCallback(() => {
    if (appState.trades.length > 0) {
      const success = saveAppState({ trades: appState.trades });
      if (success) {
        setLastSavedTime(new Date());
      }
    }
  }, [appState.trades]);

  // Loading screen
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading portfolio analyzer...</p>
        </div>
      </div>
    );
  }

  const hasData = appState.trades.length > 0;

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                  Portfolio Tracker
                </h1>
                <p className="text-sm text-slate-600">
                  Professional stock analysis dashboard
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Storage status */}
              {isLocalStorageAvailable() && (
                <>
                  {lastSavedTime && (
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Saved {lastSavedTime.toLocaleTimeString()}
                    </Badge>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowStorageInfo(!showStorageInfo)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {hasData && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleManualSave}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearAllData}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Storage info alert */}
      {showStorageInfo && isLocalStorageAvailable() && (
        <Alert className="max-w-7xl mx-auto mt-4 mx-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="text-sm">
              <p className="font-medium mb-2">Local Storage Status:</p>
              <ul className="space-y-1">
                <li>• Auto-save is enabled for portfolio data</li>
                <li>• Data persists between browser sessions</li>
                <li>• Filters and preferences are automatically saved</li>
                <li>• Data older than 30 days is automatically cleared</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {appState.error && (
        <Alert variant="destructive" className="max-w-7xl mx-auto mt-4 mx-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{appState.error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {!hasData ? (
            /* Upload Section - No Data */
            <div className="max-w-3xl mx-auto">
              <CSVUpload 
                onDataParsed={handleDataParsed} 
                isLoading={appState.isLoading}
              />
            </div>
          ) : (
            /* Dashboard - Has Data */
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="holdings">Holdings</TabsTrigger>
                <TabsTrigger value="charts">Charts</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <PortfolioSummary 
                  metrics={appState.portfolioMetrics} 
                  isLoading={appState.isLoading}
                />
                
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <HoldingsTable 
                      holdings={appState.holdings}
                      filters={appState.filters}
                      onFiltersChange={handleFiltersChange}
                      isLoading={appState.isLoading}
                    />
                  </div>
                  <div>
                    <PortfolioFilters
                      holdings={appState.holdings}
                      trades={appState.trades}
                      filters={appState.filters}
                      onFiltersChange={handleFiltersChange}
                    />
                  </div>
                </div>
              </TabsContent>
              
              {/* Holdings Tab */}
              <TabsContent value="holdings" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-4">
                  <div className="lg:col-span-3">
                    <HoldingsTable 
                      holdings={appState.holdings}
                      filters={appState.filters}
                      onFiltersChange={handleFiltersChange}
                      isLoading={appState.isLoading}
                    />
                  </div>
                  <div>
                    <PortfolioFilters
                      holdings={appState.holdings}
                      trades={appState.trades}
                      filters={appState.filters}
                      onFiltersChange={handleFiltersChange}
                    />
                  </div>
                </div>
              </TabsContent>
              
              {/* Charts Tab */}
              <TabsContent value="charts" className="space-y-6">
                <PortfolioCharts 
                  holdings={appState.holdings}
                  portfolioHistory={appState.portfolioHistory}
                  isLoading={appState.isLoading}
                />
              </TabsContent>
              
              {/* Upload Tab */}
              <TabsContent value="upload" className="space-y-6">
                <div className="max-w-3xl mx-auto">
                  <CSVUpload 
                    onDataParsed={handleDataParsed} 
                    isLoading={appState.isLoading}
                  />
                  
                  {hasData && (
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle className="text-lg">Current Data Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Total Trades</p>
                            <p className="font-medium">{appState.trades.length}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Holdings</p>
                            <p className="font-medium">{appState.holdings.length}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Portfolio Value</p>
                            <p className="font-medium">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD'
                              }).format(appState.portfolioMetrics.totalValue)}
                            </p>
                          </div>
                        </div>
                        <Alert className="mt-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Uploading a new CSV will replace your current data. 
                            Your data is automatically saved to browser storage.
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-slate-200/60 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="text-sm text-slate-600">
              <p className="font-medium">Portfolio Tracker</p>
              <p className="mt-1 text-slate-500">Professional investment analysis tools</p>
            </div>
            <div className="mt-4 sm:mt-0 text-xs text-slate-400">
              <p>© 2025 Portfolio Tracker</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

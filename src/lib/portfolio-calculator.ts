import { 
  Trade, 
  Holding, 
  PortfolioMetrics, 
  PortfolioHistoryPoint,
  SECTOR_MAPPING,
  MOCK_CURRENT_PRICES
} from '@/types/portfolio';

export function calculateHoldings(trades: Trade[]): Holding[] {
  if (trades.length === 0) return [];

  // Group trades by symbol
  const tradesBySymbol = trades.reduce((acc, trade) => {
    if (!acc[trade.symbol]) {
      acc[trade.symbol] = [];
    }
    acc[trade.symbol].push(trade);
    return acc;
  }, {} as Record<string, Trade[]>);

  const holdings: Holding[] = [];

  Object.entries(tradesBySymbol).forEach(([symbol, symbolTrades]) => {
    // Sort trades by date
    const sortedTrades = symbolTrades.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let totalShares = 0;
    let totalCost = 0;

    // Calculate net shares and total cost basis
    sortedTrades.forEach(trade => {
      const tradeValue = Math.abs(trade.shares) * trade.price;
      
      if (trade.shares > 0) {
        // Buying shares - add to cost basis
        totalCost += tradeValue;
        totalShares += trade.shares;
      } else {
        // Selling shares - use FIFO to reduce cost basis
        const sellShares = Math.abs(trade.shares);
        const currentAvgCost = totalShares > 0 ? totalCost / totalShares : 0;
        const soldValue = sellShares * currentAvgCost;
        
        totalCost = Math.max(0, totalCost - soldValue);
        totalShares += trade.shares; // trade.shares is negative for sells
      }
    });

    // Only include symbols with non-zero holdings
    if (totalShares > 0) {
      const avgCostBasis = totalCost / totalShares;
      const currentPrice = MOCK_CURRENT_PRICES[symbol] || avgCostBasis * 1.05; // Default to 5% gain if no mock price
      const currentValue = totalShares * currentPrice;
      const unrealizedGainLoss = currentValue - totalCost;
      const unrealizedGainLossPercent = totalCost > 0 ? (unrealizedGainLoss / totalCost) * 100 : 0;
      const sector = SECTOR_MAPPING[symbol] || SECTOR_MAPPING.default;

      holdings.push({
        symbol,
        sharesHeld: totalShares,
        avgCostBasis,
        currentPrice,
        currentValue,
        unrealizedGainLoss,
        unrealizedGainLossPercent,
        sector
      });
    }
  });

  return holdings.sort((a, b) => b.currentValue - a.currentValue);
}

export function calculatePortfolioMetrics(holdings: Holding[]): PortfolioMetrics {
  if (holdings.length === 0) {
    return {
      totalValue: 0,
      totalCost: 0,
      totalGainLoss: 0,
      totalGainLossPercent: 0,
      numUniqueSymbols: 0,
      topPerformer: null,
      worstPerformer: null
    };
  }

  const totalValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
  const totalCost = holdings.reduce((sum, holding) => sum + (holding.sharesHeld * holding.avgCostBasis), 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  // Find top and worst performers
  const sortedByPerformance = [...holdings].sort((a, b) => b.unrealizedGainLossPercent - a.unrealizedGainLossPercent);
  
  const topPerformer = sortedByPerformance.length > 0 ? {
    symbol: sortedByPerformance[0].symbol,
    gainLossPercent: sortedByPerformance[0].unrealizedGainLossPercent
  } : null;

  const worstPerformer = sortedByPerformance.length > 0 ? {
    symbol: sortedByPerformance[sortedByPerformance.length - 1].symbol,
    gainLossPercent: sortedByPerformance[sortedByPerformance.length - 1].unrealizedGainLossPercent
  } : null;

  return {
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent,
    numUniqueSymbols: holdings.length,
    topPerformer,
    worstPerformer
  };
}

export function calculatePortfolioHistory(trades: Trade[]): PortfolioHistoryPoint[] {
  if (trades.length === 0) return [];

  // Sort trades by date
  const sortedTrades = trades.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Group trades by date
  const tradesByDate = sortedTrades.reduce((acc, trade) => {
    if (!acc[trade.date]) {
      acc[trade.date] = [];
    }
    acc[trade.date].push(trade);
    return acc;
  }, {} as Record<string, Trade[]>);

  const history: PortfolioHistoryPoint[] = [];
  let cumulativeTrades: Trade[] = [];

  // Get all unique dates and sort them
  const dates = Object.keys(tradesByDate).sort();

  dates.forEach(date => {
    // Add trades from this date to cumulative trades
    cumulativeTrades = [...cumulativeTrades, ...tradesByDate[date]];
    
    // Calculate holdings up to this date
    const holdings = calculateHoldings(cumulativeTrades);
    const totalValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
    
    history.push({
      date,
      value: totalValue,
      trades: tradesByDate[date].length
    });
  });

  return history;
}

export function filterHoldings(
  holdings: Holding[],
  searchTerm: string,
  selectedSector: string,
  sortBy: keyof Holding,
  sortDirection: 'asc' | 'desc'
): Holding[] {
  let filtered = holdings;

  // Apply search filter
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(holding => 
      holding.symbol.toLowerCase().includes(term) ||
      holding.sector.toLowerCase().includes(term)
    );
  }

  // Apply sector filter
  if (selectedSector && selectedSector !== 'all') {
    filtered = filtered.filter(holding => holding.sector === selectedSector);
  }

  // Apply sorting
  filtered.sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    let comparison = 0;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return filtered;
}

export function paginateData<T>(data: T[], page: number, itemsPerPage: number): { 
  items: T[], 
  totalPages: number, 
  totalItems: number,
  startIndex: number,
  endIndex: number
} {
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const items = data.slice(startIndex, endIndex);

  return {
    items,
    totalPages,
    totalItems,
    startIndex,
    endIndex
  };
}

export function getUniqueSectors(holdings: Holding[]): string[] {
  const sectors = new Set(holdings.map(holding => holding.sector));
  return Array.from(sectors).sort();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function formatPercentage(value: number, decimalPlaces: number = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimalPlaces)}%`;
}

export function formatNumber(value: number, decimalPlaces: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  }).format(value);
}

// Utility function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

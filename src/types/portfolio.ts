// Core data structures for the portfolio analyzer

export interface Trade {
  symbol: string;
  shares: number;
  price: number;
  date: string; // ISO date string
}

export interface Holding {
  symbol: string;
  sharesHeld: number;
  avgCostBasis: number;
  currentPrice: number;
  currentValue: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
  sector: string;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  numUniqueSymbols: number;
  topPerformer: {
    symbol: string;
    gainLossPercent: number;
  } | null;
  worstPerformer: {
    symbol: string;
    gainLossPercent: number;
  } | null;
}

export interface PortfolioHistoryPoint {
  date: string;
  value: number;
  trades: number;
}

export interface CSVError {
  row: number;
  field: string;
  message: string;
}

export interface ParsedCSVResult {
  trades: Trade[];
  errors: CSVError[];
  isValid: boolean;
}

export interface FilterState {
  searchTerm: string;
  selectedSector: string;
  dateRange: {
    from: string | null;
    to: string | null;
  };
  sortBy: keyof Holding;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  itemsPerPage: number;
}

export interface AppState {
  trades: Trade[];
  holdings: Holding[];
  portfolioMetrics: PortfolioMetrics;
  portfolioHistory: PortfolioHistoryPoint[];
  filters: FilterState;
  isLoading: boolean;
  error: string | null;
}

// Mock sector mapping
export const SECTOR_MAPPING: Record<string, string> = {
  'AAPL': 'Technology',
  'MSFT': 'Technology',
  'GOOGL': 'Technology',
  'AMZN': 'Consumer Discretionary',
  'TSLA': 'Consumer Discretionary',
  'META': 'Technology',
  'NVDA': 'Technology',
  'JPM': 'Financials',
  'JNJ': 'Healthcare',
  'UNH': 'Healthcare',
  'V': 'Financials',
  'PG': 'Consumer Staples',
  'HD': 'Consumer Discretionary',
  'MA': 'Financials',
  'BAC': 'Financials',
  'DIS': 'Communication Services',
  'ADBE': 'Technology',
  'CRM': 'Technology',
  'NFLX': 'Communication Services',
  'KO': 'Consumer Staples',
  'PFE': 'Healthcare',
  'XOM': 'Energy',
  'CVX': 'Energy',
  'WMT': 'Consumer Staples',
  'VZ': 'Communication Services',
  'T': 'Communication Services',
  'INTC': 'Technology',
  'IBM': 'Technology',
  'ORCL': 'Technology',
  'default': 'Other'
};

// Mock current prices (in a real app, this would come from an API)
export const MOCK_CURRENT_PRICES: Record<string, number> = {
  'AAPL': 175.00,
  'MSFT': 340.00,
  'GOOGL': 125.00,
  'AMZN': 145.00,
  'TSLA': 240.00,
  'META': 320.00,
  'NVDA': 450.00,
  'JPM': 150.00,
  'JNJ': 160.00,
  'UNH': 520.00,
  'V': 250.00,
  'PG': 155.00,
  'HD': 330.00,
  'MA': 420.00,
  'BAC': 35.00,
  'DIS': 95.00,
  'ADBE': 580.00,
  'CRM': 220.00,
  'NFLX': 450.00,
  'KO': 58.00,
  'PFE': 28.00,
  'XOM': 110.00,
  'CVX': 155.00,
  'WMT': 165.00,
  'VZ': 40.00,
  'T': 20.00,
  'INTC': 25.00,
  'IBM': 195.00,
  'ORCL': 115.00
};

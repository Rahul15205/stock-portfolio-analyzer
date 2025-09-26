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

// Mock sector mapping for Indian stocks
export const SECTOR_MAPPING: Record<string, string> = {
  'RELIANCE': 'Energy & Petrochemicals',
  'TCS': 'Information Technology',
  'HDFCBANK': 'Financial Services',
  'INFY': 'Information Technology',
  'HINDUNILVR': 'Consumer Goods',
  'ICICIBANK': 'Financial Services',
  'KOTAKBANK': 'Financial Services',
  'HDFC': 'Financial Services',
  'ITC': 'Consumer Goods',
  'BHARTIARTL': 'Telecommunications',
  'SBIN': 'Financial Services',
  'LT': 'Construction & Engineering',
  'ASIANPAINT': 'Consumer Goods',
  'MARUTI': 'Automobiles',
  'AXISBANK': 'Financial Services',
  'NESTLEIND': 'Consumer Goods',
  'ULTRACEMCO': 'Construction Materials',
  'SUNPHARMA': 'Pharmaceuticals',
  'TITAN': 'Consumer Goods',
  'POWERGRID': 'Utilities',
  'NTPC': 'Utilities',
  'ONGC': 'Energy',
  'COALINDIA': 'Energy',
  'WIPRO': 'Information Technology',
  'TECHM': 'Information Technology',
  'HCLTECH': 'Information Technology',
  'DRREDDY': 'Pharmaceuticals',
  'CIPLA': 'Pharmaceuticals',
  'BAJFINANCE': 'Financial Services',
  'M&M': 'Automobiles',
  'TATAMOTORS': 'Automobiles',
  'default': 'Other'
};

// Mock current prices for Indian stocks (in INR)
export const MOCK_CURRENT_PRICES: Record<string, number> = {
  'RELIANCE': 2450.00,
  'TCS': 3450.00,
  'HDFCBANK': 1650.00,
  'INFY': 1450.00,
  'HINDUNILVR': 2450.00,
  'ICICIBANK': 950.00,
  'KOTAKBANK': 1750.00,
  'HDFC': 2650.00,
  'ITC': 450.00,
  'BHARTIARTL': 850.00,
  'SBIN': 550.00,
  'LT': 3450.00,
  'ASIANPAINT': 2850.00,
  'MARUTI': 10500.00,
  'AXISBANK': 950.00,
  'NESTLEIND': 18500.00,
  'ULTRACEMCO': 7500.00,
  'SUNPHARMA': 1050.00,
  'TITAN': 2850.00,
  'POWERGRID': 250.00,
  'NTPC': 180.00,
  'ONGC': 180.00,
  'COALINDIA': 220.00,
  'WIPRO': 450.00,
  'TECHM': 1050.00,
  'HCLTECH': 1250.00,
  'DRREDDY': 5500.00,
  'CIPLA': 1250.00,
  'BAJFINANCE': 6500.00,
  'M&M': 1450.00,
  'TATAMOTORS': 450.00
};

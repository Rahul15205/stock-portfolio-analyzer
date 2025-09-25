import { AppState, FilterState } from '@/types/portfolio';

const STORAGE_KEYS = {
  APP_STATE: 'portfolio-analyzer-state',
  FILTERS: 'portfolio-analyzer-filters',
  PREFERENCES: 'portfolio-analyzer-preferences'
} as const;

// Type for stored app state (exclude functions and computed values)
interface StoredAppState {
  trades: AppState['trades'];
  lastUpdated: number;
}

interface StoredFilters {
  filters: FilterState;
  lastUpdated: number;
}

interface UserPreferences {
  theme: 'light' | 'dark';
  itemsPerPage: number;
  defaultSortBy: string;
  defaultSortDirection: 'asc' | 'desc';
  showCompactView: boolean;
  autoSave: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  itemsPerPage: 10,
  defaultSortBy: 'currentValue',
  defaultSortDirection: 'desc',
  showCompactView: false,
  autoSave: true
};

// Check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const testKey = '__localStorage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

// Generic localStorage wrapper with error handling
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isLocalStorageAvailable()) return null;
    
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get ${key} from localStorage:`, error);
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    if (!isLocalStorageAvailable()) return false;
    
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`Failed to set ${key} in localStorage:`, error);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    if (!isLocalStorageAvailable()) return false;
    
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove ${key} from localStorage:`, error);
      return false;
    }
  }
};

// App State Management
export const saveAppState = (state: Pick<AppState, 'trades'>): boolean => {
  const storedState: StoredAppState = {
    trades: state.trades,
    lastUpdated: Date.now()
  };

  return safeLocalStorage.setItem(
    STORAGE_KEYS.APP_STATE, 
    JSON.stringify(storedState)
  );
};

export const loadAppState = (): Partial<AppState> | null => {
  const stored = safeLocalStorage.getItem(STORAGE_KEYS.APP_STATE);
  if (!stored) return null;

  try {
    const parsedState: StoredAppState = JSON.parse(stored);
    
    // Validate the stored state structure
    if (!Array.isArray(parsedState.trades)) {
      throw new Error('Invalid trades data');
    }

    // Check if data is not too old (e.g., older than 30 days)
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    if (Date.now() - parsedState.lastUpdated > maxAge) {
      console.info('Stored portfolio data is older than 30 days, clearing it');
      clearAppState();
      return null;
    }

    return {
      trades: parsedState.trades
    };
  } catch (error) {
    console.warn('Failed to parse stored app state:', error);
    clearAppState(); // Clear corrupted data
    return null;
  }
};

export const clearAppState = (): boolean => {
  return safeLocalStorage.removeItem(STORAGE_KEYS.APP_STATE);
};

// Filter State Management
export const saveFilters = (filters: FilterState): boolean => {
  const storedFilters: StoredFilters = {
    filters,
    lastUpdated: Date.now()
  };

  return safeLocalStorage.setItem(
    STORAGE_KEYS.FILTERS, 
    JSON.stringify(storedFilters)
  );
};

export const loadFilters = (): FilterState | null => {
  const stored = safeLocalStorage.getItem(STORAGE_KEYS.FILTERS);
  if (!stored) return null;

  try {
    const parsedFilters: StoredFilters = JSON.parse(stored);
    
    // Reset pagination when loading saved filters
    return {
      ...parsedFilters.filters,
      currentPage: 1
    };
  } catch (error) {
    console.warn('Failed to parse stored filters:', error);
    safeLocalStorage.removeItem(STORAGE_KEYS.FILTERS);
    return null;
  }
};

export const clearFilters = (): boolean => {
  return safeLocalStorage.removeItem(STORAGE_KEYS.FILTERS);
};

// User Preferences Management
export const savePreferences = (preferences: Partial<UserPreferences>): boolean => {
  const currentPrefs = loadPreferences();
  const updatedPrefs = { ...currentPrefs, ...preferences };

  return safeLocalStorage.setItem(
    STORAGE_KEYS.PREFERENCES, 
    JSON.stringify(updatedPrefs)
  );
};

export const loadPreferences = (): UserPreferences => {
  const stored = safeLocalStorage.getItem(STORAGE_KEYS.PREFERENCES);
  if (!stored) return DEFAULT_PREFERENCES;

  try {
    const parsedPrefs: Partial<UserPreferences> = JSON.parse(stored);
    return { ...DEFAULT_PREFERENCES, ...parsedPrefs };
  } catch (error) {
    console.warn('Failed to parse stored preferences:', error);
    return DEFAULT_PREFERENCES;
  }
};

export const clearPreferences = (): boolean => {
  return safeLocalStorage.removeItem(STORAGE_KEYS.PREFERENCES);
};

// Clear all stored data
export const clearAllStoredData = (): boolean => {
  const results = [
    clearAppState(),
    clearFilters(),
    clearPreferences()
  ];

  return results.every(result => result);
};

// Get storage usage info
export const getStorageInfo = (): {
  isAvailable: boolean;
  appStateSize: number;
  filtersSize: number;
  preferencesSize: number;
  totalSize: number;
} => {
  if (!isLocalStorageAvailable()) {
    return {
      isAvailable: false,
      appStateSize: 0,
      filtersSize: 0,
      preferencesSize: 0,
      totalSize: 0
    };
  }

  const getItemSize = (key: string): number => {
    const item = safeLocalStorage.getItem(key);
    return item ? new Blob([item]).size : 0;
  };

  const appStateSize = getItemSize(STORAGE_KEYS.APP_STATE);
  const filtersSize = getItemSize(STORAGE_KEYS.FILTERS);
  const preferencesSize = getItemSize(STORAGE_KEYS.PREFERENCES);

  return {
    isAvailable: true,
    appStateSize,
    filtersSize,
    preferencesSize,
    totalSize: appStateSize + filtersSize + preferencesSize
  };
};

// Auto-save functionality with debouncing
let autoSaveTimeout: NodeJS.Timeout | null = null;

export const debouncedSaveAppState = (
  state: Pick<AppState, 'trades'>, 
  delay: number = 1000
): void => {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }

  autoSaveTimeout = setTimeout(() => {
    const preferences = loadPreferences();
    if (preferences.autoSave) {
      saveAppState(state);
    }
  }, delay);
};

// Export storage availability for conditional features
export { isLocalStorageAvailable };

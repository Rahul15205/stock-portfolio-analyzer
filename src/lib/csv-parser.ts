import Papa from 'papaparse';
import { Trade, CSVError, ParsedCSVResult } from '@/types/portfolio';

interface CSVRow {
  symbol?: string;
  shares?: string;
  price?: string;
  date?: string;
}

export function parseCSV(file: File): Promise<ParsedCSVResult> {
  return new Promise((resolve) => {
    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().trim(),
      complete: (results) => {
        const trades: Trade[] = [];
        const errors: CSVError[] = [];

        results.data.forEach((row, index) => {
          const rowNumber = index + 2; // +2 because index is 0-based and we have a header row
          const validatedRow = validateRow(row, rowNumber);
          
          if (validatedRow.errors.length > 0) {
            errors.push(...validatedRow.errors);
          } else {
            trades.push(validatedRow.trade!);
          }
        });

        resolve({
          trades,
          errors,
          isValid: errors.length === 0
        });
      },
      error: (error) => {
        resolve({
          trades: [],
          errors: [{ row: 0, field: 'file', message: `Failed to parse CSV: ${error.message}` }],
          isValid: false
        });
      }
    });
  });
}

interface ValidatedRow {
  trade: Trade | null;
  errors: CSVError[];
}

function validateRow(row: CSVRow, rowNumber: number): ValidatedRow {
  const errors: CSVError[] = [];

  // Validate symbol
  const symbol = row.symbol?.trim().toUpperCase();
  if (!symbol) {
    errors.push({
      row: rowNumber,
      field: 'symbol',
      message: 'Symbol is required'
    });
  } else if (!/^[A-Z0-9&]{1,15}$/.test(symbol)) {
    errors.push({
      row: rowNumber,
      field: 'symbol',
      message: 'Symbol must be 1-15 uppercase letters, numbers, or & symbol'
    });
  }

  // Validate shares
  const sharesStr = row.shares?.trim();
  let shares: number = 0;
  if (!sharesStr) {
    errors.push({
      row: rowNumber,
      field: 'shares',
      message: 'Shares is required'
    });
  } else {
    shares = parseFloat(sharesStr);
    if (isNaN(shares) || shares === 0) {
      errors.push({
        row: rowNumber,
        field: 'shares',
        message: 'Shares must be a non-zero number'
      });
    }
  }

  // Validate price
  const priceStr = row.price?.trim();
  let price: number = 0;
  if (!priceStr) {
    errors.push({
      row: rowNumber,
      field: 'price',
      message: 'Price is required'
    });
  } else {
    price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0) {
      errors.push({
        row: rowNumber,
        field: 'price',
        message: 'Price must be a positive number'
      });
    }
  }

  // Validate date
  const dateStr = row.date?.trim();
  let date: string = '';
  if (!dateStr) {
    errors.push({
      row: rowNumber,
      field: 'date',
      message: 'Date is required'
    });
  } else {
    // Try to parse the date and convert to ISO string
    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getTime())) {
      errors.push({
        row: rowNumber,
        field: 'date',
        message: 'Date must be in a valid format (e.g., 2024-06-12 or 06/12/2024)'
      });
    } else {
      // Check if date is not in the future
      if (parsedDate > new Date()) {
        errors.push({
          row: rowNumber,
          field: 'date',
          message: 'Date cannot be in the future'
        });
      } else {
        date = parsedDate.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
      }
    }
  }

  if (errors.length === 0) {
    return {
      trade: {
        symbol: symbol!,
        shares,
        price,
        date
      },
      errors: []
    };
  }

  return {
    trade: null,
    errors
  };
}

export function generateSampleCSV(): string {
  const sampleData = [
    ['symbol', 'shares', 'price', 'date'],
    ['AAPL', '10', '172.35', '2024-06-12'],
    ['TSLA', '5', '225.40', '2024-06-13'],
    ['AAPL', '-3', '180.00', '2024-07-01'],
    ['MSFT', '15', '340.50', '2024-06-15'],
    ['GOOGL', '8', '125.75', '2024-06-20'],
    ['NVDA', '2', '420.00', '2024-07-05'],
    ['AAPL', '5', '175.20', '2024-07-10'],
    ['TSLA', '-2', '235.80', '2024-07-12']
  ];

  return sampleData.map(row => row.join(',')).join('\n');
}

export function downloadSampleCSV(): void {
  const csvContent = generateSampleCSV();
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sample-trades.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

# Stock Portfolio Analyzer 📊

A comprehensive frontend-only web application for analyzing stock trading portfolios. Upload CSV files containing trade data and get detailed insights with interactive charts, sortable tables, and advanced filtering options.

![Portfolio Analyzer Demo](https://via.placeholder.com/800x400?text=Portfolio+Analyzer+Demo)

## 🚀 Features

### Core Features
- **📤 CSV Upload & Parsing**: Drag-and-drop or click to upload CSV files with robust validation
- **📊 Portfolio Aggregation**: Automatic calculation of holdings, cost basis, and performance metrics
- **🔍 Interactive Dashboard**: Comprehensive overview with key metrics and performance indicators
- **📈 Data Visualization**: Beautiful charts showing portfolio allocation and historical performance
- **🏷️ Holdings Table**: Sortable, searchable table with pagination support
- **🔎 Advanced Filtering**: Filter by sector, date range, and search terms

### Bonus Features ✨
- **💾 Persistent Storage**: Automatic saving to localStorage with intelligent data management
- **📱 Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **⚡ Performance Optimizations**: Debounced search, efficient pagination, and optimized rendering
- **🔒 Error Handling**: Graceful handling of invalid CSV formats with detailed error messages
- **⌨️ TypeScript**: Fully typed codebase for better development experience
- **🎨 Modern UI**: Built with shadcn/ui components and Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **CSV Parsing**: Papaparse
- **Icons**: Lucide React
- **Date Handling**: Native JavaScript Date API

## 📋 CSV Format Requirements

The application expects CSV files with the following structure:

```csv
symbol,shares,price,date
AAPL,10,172.35,2024-06-12
TSLA,5,225.40,2024-06-13
AAPL,-3,180.00,2024-07-01
MSFT,15,340.50,2024-06-15
```

### Field Specifications:
- **symbol**: Stock ticker (1-5 uppercase letters, e.g., AAPL)
- **shares**: Number of shares (positive for buy, negative for sell)
- **price**: Price per share (positive number)
- **date**: Trade date (YYYY-MM-DD or MM/DD/YYYY format)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stock-portfolio-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm run start
```

## 📖 Usage Guide

### 1. Upload Your Trading Data
- Click the upload area or drag and drop a CSV file
- Download the sample CSV to see the expected format
- The system will validate your data and show any errors

### 2. View Portfolio Overview
- See total portfolio value, gain/loss, and key metrics
- Identify top and worst performing stocks
- View sector diversification

### 3. Analyze Holdings
- Sort holdings by any column (value, gains, shares, etc.)
- Search for specific symbols or sectors
- Use pagination for large portfolios

### 4. Explore Interactive Charts
- **Portfolio Allocation**: Pie charts showing distribution by holding and sector
- **Historical Performance**: Line chart showing portfolio value over time

### 5. Apply Filters
- Filter by sector to focus on specific market segments
- Use date range filters to analyze specific time periods
- Combine multiple filters for detailed analysis

## 🏗️ Architecture & Design Decisions

### Frontend-Only Architecture
- **No Backend Required**: All processing happens in the browser
- **Client-Side Storage**: Uses localStorage for data persistence
- **Mock Data**: Current prices are simulated (easily extensible to real APIs)

### State Management
- **React useState**: Centralized app state management
- **Custom Hooks**: Reusable logic for filtering and pagination
- **Optimistic Updates**: Immediate UI feedback for better UX

### Performance Optimizations
- **Debounced Search**: Prevents excessive re-renders during typing
- **Memoized Calculations**: Expensive portfolio calculations are cached
- **Virtualized Tables**: Ready for large datasets (implemented via pagination)
- **Code Splitting**: Automatic bundling optimization via Next.js

### Error Handling
- **CSV Validation**: Row-by-row validation with detailed error reporting
- **Graceful Degradation**: App continues to work even with storage issues
- **User Feedback**: Clear error messages and loading states

### Responsive Design
- **Mobile-First**: Designed for mobile devices first
- **Flexible Layouts**: Uses CSS Grid and Flexbox for adaptive layouts
- **Touch-Friendly**: Optimized for touch interactions on mobile devices

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles and Tailwind imports
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main application component
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── csv-upload.tsx       # CSV file upload component
│   ├── holdings-table.tsx   # Interactive holdings table
│   ├── portfolio-charts.tsx # Chart visualizations
│   ├── portfolio-filters.tsx# Filtering controls
│   └── portfolio-summary.tsx# Dashboard summary
├── lib/
│   ├── csv-parser.ts        # CSV parsing and validation
│   ├── local-storage.ts     # Storage management utilities
│   ├── portfolio-calculator.ts # Portfolio calculation logic
│   └── utils.ts             # Utility functions
└── types/
    └── portfolio.ts         # TypeScript type definitions
```

## 🧮 Calculation Methods

### Holdings Calculation
- **Net Shares**: Aggregates buy/sell transactions by symbol
- **Average Cost Basis**: FIFO (First In, First Out) method for cost tracking
- **Current Value**: Shares × Mock Current Price
- **Unrealized Gain/Loss**: Current Value - Total Cost Basis

### Portfolio Metrics
- **Total Value**: Sum of all holdings' current values
- **Total Cost**: Sum of all holdings' cost basis
- **Performance**: Calculated as percentage gain/loss from cost basis
- **Top/Worst Performers**: Ranked by percentage gain/loss

### Historical Data
- **Time Series**: Portfolio value calculated at each trade date
- **Current Price Simulation**: Uses mock prices for demonstration
- **Trade Impact**: Shows effect of trades on portfolio value over time

## 🔧 Customization

### Adding Real Price Data
Replace the mock prices in `src/types/portfolio.ts`:

```typescript
// Replace MOCK_CURRENT_PRICES with API calls
export async function getCurrentPrice(symbol: string): Promise<number> {
  const response = await fetch(`/api/prices/${symbol}`);
  return response.json();
}
```

### Extending Portfolio Metrics
Add new calculations in `src/lib/portfolio-calculator.ts`:

```typescript
export function calculateCustomMetric(holdings: Holding[]): number {
  // Your custom calculation logic
}
```

### Adding New Chart Types
Extend `src/components/portfolio-charts.tsx` with additional Recharts components.

## 📱 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Features Used**: ES2020, localStorage, File API, CSS Grid

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui**: For the beautiful UI component library
- **Recharts**: For the powerful charting capabilities
- **Tailwind CSS**: For the utility-first CSS framework
- **Next.js Team**: For the amazing React framework
- **Lucide**: For the comprehensive icon library

## 📞 Support

If you have any questions or run into issues:
- Check the [Issues](../../issues) page for known problems
- Create a new issue for bugs or feature requests
- Review the code comments for implementation details

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies**

'use client';

import React, { useCallback, useState } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { parseCSV, downloadSampleCSV } from '@/lib/csv-parser';
import { ParsedCSVResult, CSVError } from '@/types/portfolio';

interface CSVUploadProps {
  onDataParsed: (result: ParsedCSVResult) => void;
  isLoading?: boolean;
}

export default function CSVUpload({ onDataParsed, isLoading = false }: CSVUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseErrors, setParseErrors] = useState<CSVError[]>([]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setParseErrors([{
        row: 0,
        field: 'file',
        message: 'Please upload a CSV file'
      }]);
      return;
    }

    setFileName(file.name);
    setParseErrors([]);
    setUploadProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 100);

    try {
      const result = await parseCSV(file);
      setUploadProgress(100);
      setParseErrors(result.errors);
      onDataParsed(result);
    } catch (error) {
      setParseErrors([{
        row: 0,
        field: 'file',
        message: 'Failed to process file. Please try again.'
      }]);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  }, [onDataParsed]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  return (
    <Card className="w-full border-slate-200/60 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-slate-900">
          <div className="p-2 bg-slate-100 rounded-lg">
            <FileText className="h-5 w-5 text-slate-600" />
          </div>
          <span className="font-semibold">Import Trading Data</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200
            ${isDragOver 
              ? 'border-slate-400 bg-slate-50/80 scale-[1.02]' 
              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50'
            }
            ${isLoading ? 'pointer-events-none opacity-50' : 'cursor-pointer group'}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('csv-file-input')?.click()}
        >
          <input
            id="csv-file-input"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileInput}
            disabled={isLoading}
          />
          
          <div className={`mx-auto h-16 w-16 mb-6 rounded-full flex items-center justify-center transition-colors ${
            isDragOver ? 'bg-slate-100 text-slate-600' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600'
          }`}>
            <Upload className="h-8 w-8" />
          </div>
          
          <div className="space-y-3">
            <p className="text-lg font-semibold text-slate-900">
              {isDragOver ? 'Drop your CSV file here' : 'Upload your trading data'}
            </p>
            <p className="text-sm text-slate-600">
              Drag & drop or click to select a CSV file
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
              <span>Format:</span>
              <code className="bg-white px-2 py-0.5 rounded text-slate-700">symbol, shares, price, date</code>
            </div>
          </div>

          {uploadProgress > 0 && (
            <div className="mt-4 space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-gray-600">
                {uploadProgress === 100 ? 'Processing complete!' : `Processing... ${uploadProgress}%`}
              </p>
            </div>
          )}
        </div>

        {fileName && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-md">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              File uploaded: {fileName}
            </span>
          </div>
        )}

        {parseErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Found {parseErrors.length} error{parseErrors.length > 1 ? 's' : ''}:</p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {parseErrors.slice(0, 5).map((error, index) => (
                    <p key={index} className="text-sm">
                      {error.row > 0 && `Row ${error.row}, `}{error.field}: {error.message}
                    </p>
                  ))}
                  {parseErrors.length > 5 && (
                    <p className="text-sm italic">
                      ... and {parseErrors.length - 5} more errors
                    </p>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={downloadSampleCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Sample CSV
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>CSV Format Requirements for Indian Stocks:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>symbol:</strong> NSE/BSE stock symbol (1-15 characters, e.g., RELIANCE, TCS, HDFCBANK)</li>
            <li><strong>shares:</strong> Number of shares (positive for buy, negative for sell)</li>
            <li><strong>price:</strong> Price per share in INR (positive number)</li>
            <li><strong>date:</strong> Trade date (YYYY-MM-DD or MM/DD/YYYY format)</li>
          </ul>
          <div className="mt-2 p-2 bg-blue-50 rounded-md">
            <p className="text-blue-800 font-medium text-xs">💡 Indian Stock Examples:</p>
            <p className="text-blue-700 text-xs">RELIANCE, TCS, HDFCBANK, INFY, HINDUNILVR, ICICIBANK, ITC, BHARTIARTL, SBIN, LT</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

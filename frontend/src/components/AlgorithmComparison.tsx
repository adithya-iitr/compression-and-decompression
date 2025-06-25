import React, { useEffect, useState } from 'react';
import { BarChart3, Zap, Clock } from 'lucide-react';
import { FileData } from '../../../types';

interface AlgorithmComparisonProps {
  file: FileData;
}

interface ComparisonResult {
  algorithm: string;
  compressionRatio: number;
  compressionTime: number;
  compressedSize: number;
}
const BASE_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:8000/api'
    : '/api';
const compressUrl=`${BASE_URL}/compress`
const decompressUrl=`${BASE_URL}/decompress`


export function AlgorithmComparison({ file }: AlgorithmComparisonProps) {
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const calculateCompressionRatio = (originalSize: number, compressedSize: number): number => {
    if (!originalSize || !compressedSize) return 0;
    return ((originalSize - compressedSize) / originalSize) * 100;
  };

  const runComparison = async () => {
    setIsComparing(true);
    const comparisonResults: ComparisonResult[] = [];

    for (const algorithm of ['huffman', 'rle', 'lz77']) {
      try {
        const response = await fetch(compressUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filePath: file.path,
            algorithm,
            originalExtension: file.name.split('.').pop(),
          }),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const ratio = calculateCompressionRatio(file.size, data.compressedSize);

        comparisonResults.push({
          algorithm: algorithm.toUpperCase(),
          compressionRatio: ratio,
          compressionTime: data.compressionTime || 0,
          compressedSize: data.compressedSize || 0,
        });
      } catch (err) {
        console.error(`[${algorithm.toUpperCase()} ERROR]`, err);
      }
    }

    setResults(comparisonResults);
    setIsComparing(false);
  };

  useEffect(() => {
    if (file?.path) runComparison();
  }, [file]);

  if (!file) return null;

  const bestCompression = results.reduce(
    (best, curr) => (curr.compressionRatio > best.compressionRatio ? curr : best),
    results[0] || { compressionRatio: -Infinity }
  );

  const fastestAlgorithm = results.reduce(
    (fastest, curr) => (curr.compressionTime < fastest.compressionTime ? curr : fastest),
    results[0] || { compressionTime: Infinity }
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Algorithm Comparison</h3>
        </div>
        <button
          onClick={runComparison}
          disabled={isComparing}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {isComparing ? 'Comparing...' : 'Refresh'}
        </button>
      </div>

      {isComparing ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Running comparison...</span>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-6">
          {/* Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Best Compression</span>
              </div>
              <p className="text-lg font-semibold text-green-900">{bestCompression?.algorithm}</p>
              <p className="text-sm text-green-700">
                {bestCompression.compressionRatio >= 0
                  ? `${bestCompression.compressionRatio.toFixed(1)}% reduction`
                  : `${Math.abs(bestCompression.compressionRatio).toFixed(1)}% increase`}
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Fastest Algorithm</span>
              </div>
              <p className="text-lg font-semibold text-blue-900">{fastestAlgorithm?.algorithm}</p>
              <p className="text-sm text-blue-700">
                {fastestAlgorithm?.compressionTime.toFixed(2)}ms
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Compression Efficiency</h4>
            {results.map((result) => (
              <div key={result.algorithm} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{result.algorithm}</span>
                  <span
                    className={`text-sm ${
                      result.compressionRatio >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {result.compressionRatio >= 0 ? '+' : '-'}
                    {Math.abs(result.compressionRatio).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      result.compressionRatio >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min(Math.abs(result.compressionRatio), 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto mt-6">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 font-medium text-gray-600">Algorithm</th>
                  <th className="py-2 font-medium text-gray-600 text-right">Ratio</th>
                  <th className="py-2 font-medium text-gray-600 text-right">Compression Time (ms)</th>
                  <th className="py-2 font-medium text-gray-600 text-right">Size</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.algorithm} className="border-b border-gray-100">
                    <td className="py-2 text-gray-900">{result.algorithm}</td>
                    <td
                      className={`py-2 text-right font-medium ${
                        result.compressionRatio >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {result.compressionRatio >= 0 ? '+' : '-'}
                      {Math.abs(result.compressionRatio).toFixed(1)}%
                    </td>
                    <td className="py-2 text-right text-gray-600">
                      {result.compressionTime.toFixed(2)}
                    </td>
                    <td className="py-2 text-right text-gray-600">
                      {(result.compressedSize / 1024).toFixed(1)} KB
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No comparison results available</div>
      )}
    </div>
  );
}

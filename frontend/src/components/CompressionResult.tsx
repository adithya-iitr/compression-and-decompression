import React from 'react';
import {
  Download,
  Clock,
  Minimize2,
  Maximize2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { CompressionResult } from '../../../types';
import { formatFileSize } from '../utils/fileUtils';

interface CompressionResultsProps {
  result: CompressionResult;
  onCompress: () => void;
  isCompressing: boolean;
}

export function CompressionResults({
  result,
  onCompress,
  isCompressing,
}: CompressionResultsProps) {
  const handleDownloadCompressed = async () => {
    if (!result?.compressedFilePath) {
      alert('No compressed file available for download.');
      return;
    }
  
    try {
      const filePathParts = result.compressedFilePath.split('/');
      const filename = filePathParts[filePathParts.length - 1]; // Extract just the filename
      console.log(filename)
      const response = await fetch(`http://localhost:8000/api/download/${filename}`);
      console.log(response)
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
  
      const blob = await response.blob();
  
      const originalExtension = result.filename.split('.').pop();
      const baseName = result.filename.replace(/\.[^/.]+$/, '');
      const downloadName = `${baseName}__${originalExtension}_compressed.${result.algorithm.toLowerCase()}`;
  
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[DOWNLOAD ERROR]', err);
      alert('Download failed.');
    }
  };
  
  
  const compressionRatio = ((result.originalSize - result.compressedSize) / result.originalSize) * 100;
  const compressionImproved = compressionRatio > 0;
  const processingTime = result.compressionTime

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Compression Results</h3>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Original Size</p>
                <p className="text-lg font-semibold text-blue-900">
                  {formatFileSize(result.originalSize)}
                </p>
              </div>
              <Maximize2 className="w-5 h-5 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Compressed Size</p>
                <p className="text-lg font-semibold text-green-900">
                  {formatFileSize(result.compressedSize)}
                </p>
              </div>
              <Minimize2 className="w-5 h-5 text-green-500" />
            </div>
          </div>

          <div className={`rounded-xl p-4 ${compressionImproved ? 'bg-emerald-50' : 'bg-red-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${compressionImproved ? 'text-emerald-600' : 'text-red-600'}`}>
                  Compression Ratio
                </p>
                <p className={`text-lg font-semibold ${compressionImproved ? 'text-emerald-900' : 'text-red-900'}`}>
                  {compressionRatio > 0 ? '+' : ''}{compressionRatio.toFixed(2)}%
                </p>
              </div>
              {compressionImproved ? (
                <TrendingDown className="w-5 h-5 text-emerald-500" />
              ) : (
                <TrendingUp className="w-5 h-5 text-red-500" />
              )}
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Processing Time</p>
                <p className="text-lg font-semibold text-purple-900">
                  {processingTime.toFixed(2)}ms
                </p>
              </div>
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Algorithm Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Algorithm:</span> {result.algorithm}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium">File:</span> {result.filename}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
          <div className="flex gap-2">
            <button
              onClick={onCompress}
              disabled={isCompressing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-40 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <Minimize2 className="w-4 h-4" />
              <span>{isCompressing ? 'Compressing...' : 'Recompress'}</span>
            </button>
            <button
              onClick={handleDownloadCompressed}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-40 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Compressed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compression Analysis */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Compression Analysis</h4>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Efficiency Rating</span>
              <span className={`text-sm font-semibold ${
                compressionImproved ? 'text-green-600' : 'text-red-600'
              }`}>
                {compressionImproved ? 'Excellent' : 'Poor'} 
                ({Math.abs(compressionRatio).toFixed(2)}% {compressionImproved ? 'reduction' : 'increase'})
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  compressionImproved ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ 
                  width: `${Math.min(Math.abs(compressionRatio), 100)}%` 
                }}
              ></div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {compressionImproved ? (
              <p>✅ This algorithm worked well for your file type. The compression reduced the file size significantly.</p>
            ) : (
              <p>⚠️ This algorithm may not be optimal for your file type. Consider trying a different compression method.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

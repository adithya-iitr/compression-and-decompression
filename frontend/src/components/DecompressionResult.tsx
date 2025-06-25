import React from 'react';
import {
  Download,
  Clock,
  FileText,
  Maximize2,
} from 'lucide-react';
import { formatFileSize } from '../utils/fileUtils';

interface DecompressionResult {
  originalSize: number;
  decompressedSize: number;
  decompressionTime: number;
  algorithm: string | null;
  originalData: string;
  filename: string;
  decompressedFilePath: string;
}

interface DecompressionResultsProps {
  result: DecompressionResult;
  onDecompress: () => void;
  isDecompressing: boolean;
}
const BASE_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:8000/api'
    : '/api';

export function DecompressionResults({
  result,
  onDecompress,
  isDecompressing,
}: DecompressionResultsProps) {
  const handleDownloadDecompressed = async () => {
    if (!result?.decompressedFilePath) {
      alert('No decompressed file available for download.');
      return;
    }

    try {
      const filePathParts = result.decompressedFilePath.split('/');
      const filename = filePathParts[filePathParts.length - 1];

      const response = await fetch(`${BASE_URL}/download/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const blob = await response.blob();
      const baseName = result.filename.replace(/\.[^/.]+$/, '');
      const downloadName = `${baseName}__decompressed`;

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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Decompression Results</h3>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Compressed Size</p>
                <p className="text-lg font-semibold text-blue-900">
                  {formatFileSize(result.originalSize)}
                </p>
              </div>
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Decompressed Size</p>
                <p className="text-lg font-semibold text-green-900">
                  {formatFileSize(result.decompressedSize)}
                </p>
              </div>
              <Maximize2 className="w-5 h-5 text-green-500" />
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Decompression Time</p>
                <p className="text-lg font-semibold text-purple-900">
                  {result.decompressionTime.toFixed(2)}ms
                </p>
              </div>
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Info Block */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Algorithm:</span> {result.algorithm || 'Unknown'}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium">File:</span> {result.filename}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
          <div className="flex gap-2">
            <button
              onClick={onDecompress}
              disabled={isDecompressing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 px-40 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <Maximize2 className="w-4 h-4" />
              <span>{isDecompressing ? 'Decompressing...' : 'Redecompress'}</span>
            </button>
            <button
              onClick={handleDownloadDecompressed}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-40 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Decompressed</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

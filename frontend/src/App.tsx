import React, { useState } from 'react';
import { Archive, FileText, Zap } from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { AlgorithmSelector } from './components/AlgorithmSelector';
import { CompressionResults } from './components/CompressionResult';
import { AlgorithmComparison } from './components/AlgorithmComparison';
import { calculateCompressionRatio } from './utils/fileUtils';
import { FileData, CompressionResult, DecompressionResult } from '../../types';
import { DecompressionResults } from './components/DecompressionResult';
import axios from 'axios'
import ModeToggle from './ui/button';
// Type declaration for Vite's import.meta.env
declare global {
  interface ImportMeta {
    readonly env: {
      readonly MODE: string;
      readonly [key: string]: string | undefined;
    };
  }
}
const compressionAlgorithms: any = [
  {
    name: 'Huffman Coding',
    key: 'huffman',
    description: 'Variable-length encoding based on character frequency',
    bestFor: 'Text files with varied character frequencies',
  },
  {
    name: 'Run-Length Encoding',
    key: 'rle',
    description: 'Replaces sequences of identical characters with count and character',
    bestFor: 'Data with many repeated sequences',
  },
  {
    name: 'LZ77',
    key: 'lz77',
    description: 'Dictionary-based compression using sliding window',
    bestFor: 'General-purpose compression with repeated patterns',
  },
];
// const BASE_URL =
//   import.meta.env.MODE === 'development'
//     ? 'http://localhost:8000/api/'
//     : '/api/';
// function joinUrl(base: string, path: string) {
//   return base.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');
// }
// const compressUrl = joinUrl(BASE_URL, 'compress');
const compressUrl='http://localhost:8000/api/compress'

function App() {
  const [currentFile, setCurrentFile] = useState<FileData | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('huffman');
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [isDecompressing, setIsDecompressing] = useState(false);
  const [decompressionResult, setDecompressionResult] = useState<DecompressionResult | null>(null);

  const handleFileUpload = (file: FileData) => {
    setCurrentFile(file);
    setCompressionResult(null);
    setShowComparison(false);
  };

  const handleClearFile = () => {
    setCurrentFile(null);
    setCompressionResult(null);
    setShowComparison(false);
  };


  const handleCompress = async () => {
    if (!currentFile) return;
  
    setIsCompressing(true);
    try {
      console.log(compressUrl)
      const response = await axios.post('http://localhost:8000/api/compress', {
        filePath: currentFile.path,
        algorithm: selectedAlgorithm, // 'huffman' | 'rle' | 'lz77'
        originalExtension: currentFile.name.split('.').pop() || 'txt',
      });
  
      const {
        compressedSize,
        compressionTime,
        compressedFilePath,
      } = response.data;
  
      const ratio = calculateCompressionRatio(currentFile.size, compressedSize);
  
      setCompressionResult({
        originalSize: currentFile.size,
        compressedSize,
        compressionRatio: ratio,
        compressionTime,
        algorithm: selectedAlgorithm,
        originalData: currentFile.content || '',
        filename: currentFile.name,
        compressedFilePath: `/uploads/${compressedFilePath}`, // ✅ Just the final output file path
      });
  
    } catch (error) {
      console.error('[COMPRESSION+DECOMPRESSION ERROR]', error);
      alert('Compression-Decompression failed. Please try again.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDecompress = async () => {
    if (!currentFile) return;
  
    setIsDecompressing(true);
    try {
      // Infer algorithm from file extension
      const extension = currentFile.name.split('.').pop()?.toLowerCase();
      let inferredAlgorithm: 'huffman' | 'rle' | 'lz77' | null = null;
  
      if (extension === 'huff') inferredAlgorithm = 'huffman';
      else if (extension === 'rle') inferredAlgorithm = 'rle';
      else if (extension === 'lz77') inferredAlgorithm = 'lz77';
  
      if (!inferredAlgorithm) {
        alert('Unsupported or unknown compression format. Cannot infer algorithm.');
        setIsDecompressing(false);
        return;
      }
  
      const response = await axios.post('http://localhost:8000/api/decompress', {
        filePath: currentFile.path,
        algorithm: inferredAlgorithm,
      });
  
      const {
        decompressedSize,
        decompressionTime,
        decompressedFilePath,
      } = response.data;
  
      setDecompressionResult({
        originalSize: currentFile.size,
        decompressedSize,
        decompressionTime,
        algorithm: inferredAlgorithm,
        originalData: currentFile.content || '',
        filename: currentFile.name,
        decompressedFilePath: `/uploads/${decompressedFilePath}`,
      });
  
    } catch (error) {
      console.error('[DECOMPRESSION ERROR]', error);
      alert('Decompression failed. Please try again.');
    } finally {
      setIsDecompressing(false);
    }
  };
  
  
  const mode=localStorage.getItem('mode');
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Archive className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                {(mode=='compress')?<h1 className="text-xl font-bold text-gray-900">File Compressor</h1>:<h1 className="text-xl font-bold text-gray-900">File Decompressor</h1>}
                <p className="text-sm text-gray-600">Advanced compression algorithms</p>
              </div>
            </div>
            <ModeToggle/>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span>{currentFile ? '1 file loaded' : 'No file selected'}</span>
              </div>
              
              {currentFile && (
                <button
                  disabled={mode=='decompress'}
                  onClick={() => setShowComparison(!showComparison)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    showComparison 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {showComparison ? 'Hide' : 'Show'} Comparison
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {mode=='compress' &&
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - File Upload & Algorithm Selection */}
            <div className="lg:col-span-1 space-y-8">
              <FileUploader 
                onFileUpload={handleFileUpload}
                currentFile={currentFile}
                onClear={handleClearFile}
              />
              
              {currentFile && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <AlgorithmSelector
                    algorithms={compressionAlgorithms}
                    selectedAlgorithm={selectedAlgorithm}
                    onAlgorithmSelect={setSelectedAlgorithm}
                  />
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleCompress}
                      disabled={isCompressing || !currentFile}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center space-x-2"
                    >
                      <Zap className="w-5 h-5" />
                      <span>{isCompressing ? 'Compressing...' : 'Compress File'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Results & Analysis */}
            <div className="lg:col-span-2 space-y-8">
              {compressionResult && (
                <CompressionResults
                  result={compressionResult}
                  onCompress={handleCompress}
                  isCompressing={isCompressing}
                />
              )}

              {showComparison && currentFile && (
                <AlgorithmComparison
                  file={currentFile}
                />
              )}

              {!currentFile && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Archive className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Welcome to File Compressor
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Upload a text file to get started with advanced compression algorithms. 
                    Compare different techniques and see how they perform on your data.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span>Huffman Coding</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Archive className="w-4 h-4 text-green-500" />
                      <span>Run-Length Encoding</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <FileText className="w-4 h-4 text-purple-500" />
                      <span>LZ77 Algorithm</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      }
      {mode=='decompress' && 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - File Upload & Algorithm Selection */}
          <div className="lg:col-span-1 space-y-8">
            <FileUploader 
              onFileUpload={handleFileUpload}
              currentFile={currentFile}
              onClear={handleClearFile}
            />
            
            {currentFile && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <button
                    onClick={handleDecompress}
                    disabled={isDecompressing || !currentFile}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-5 h-5" />
                    <span>{isDecompressing ? 'Decompressing...' : 'Decompress File'}</span>
                  </button>
                </div>
            )}
          </div>

          {/* Right Column - Results & Analysis */}
          <div className="lg:col-span-2 space-y-8">
            {decompressionResult && (
              <DecompressionResults
                result={decompressionResult}
                onDecompress={handleDecompress}
                isDecompressing={isDecompressing}
              />
            )}

            {!currentFile && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Archive className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Welcome to File Decompressor
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Upload a text file to get started with advanced compression algorithms. 
                  Compare different techniques and see how they perform on your data.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                  <div className="flex items-center justify-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span>Huffman Coding</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Archive className="w-4 h-4 text-green-500" />
                    <span>Run-Length Encoding</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    <span>LZ77 Algorithm</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      }
      {/* Footer */}
      <div className="bg-white/50 backdrop-blur-sm border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>Explore the efficiency of different compression algorithms with real-time analysis</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
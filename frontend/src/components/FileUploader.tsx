import React, { useCallback, useState } from 'react';
import { Upload, File, X, Image as ImageIcon, FileText, File as GenericFile, FileCode, FileSearch } from 'lucide-react';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  content?: string;
  previewUrl?: string; // for image/pdf blob URL
}

interface FileUploaderProps {
  onFileUpload: (file: UploadedFile) => void;
  currentFile: UploadedFile | null;
  onClear: () => void;
}
const BASE_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:8000/api'
    : '/api';

export function FileUploader({ onFileUpload, currentFile, onClear }: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadToBackend = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');
    return await response.json();
  };

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setIsLoading(true);
    try {
      const uploaded = await uploadToBackend(file);

      // For images or PDFs, create blob URL
      const previewableTypes = ['image/', 'application/pdf'];
      if (previewableTypes.some(t => uploaded.type.startsWith(t))) {
        uploaded.previewUrl = URL.createObjectURL(file);
      }

      onFileUpload(uploaded);
    } catch (e) {
      setError('Error uploading file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [onFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileSelect(files[0]);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const formatFileSize = (size: number) => {
    return size < 1024
      ? `${size} B`
      : size < 1024 * 1024
      ? `${(size / 1024).toFixed(1)} KB`
      : `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-green-500" />;
    if (type === 'application/pdf') return <FileText className="w-8 h-8 text-red-500" />;
    if (type.startsWith('text/')) return <FileCode className="w-8 h-8 text-blue-500" />;
    if (type.startsWith('application/octet-stream')) return <GenericFile className="w-8 h-8 text-gray-500" />;
    return <GenericFile className="w-8 h-8 text-gray-400" />;
  };

  if (currentFile) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Uploaded File</h3>
          <button
            onClick={onClear}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
          <div className="flex-shrink-0">
            {getFileIcon(currentFile.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{currentFile.name}</p>
            <p className="text-sm text-gray-500">
              {formatFileSize(currentFile.size)} • {currentFile.type || 'Unknown type'}
            </p>
          </div>
        </div>

        {currentFile.type.startsWith('text/') && currentFile.content && (
          <div className="mt-4 max-h-64 overflow-y-auto bg-gray-100 p-4 rounded-md text-sm text-gray-800 whitespace-pre-wrap font-mono">
            {currentFile.content}
          </div>
        )}

        {currentFile.type.startsWith('image/') && currentFile.previewUrl && (
          <div className="mt-4">
            <img src={currentFile.previewUrl} alt="Uploaded preview" className="max-h-64 rounded-md border" />
          </div>
        )}

        {currentFile.type === 'application/pdf' && currentFile.previewUrl && (
          <div className="mt-4">
            <embed src={currentFile.previewUrl} type="application/pdf" className="w-full h-96 rounded-md border" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload File</h3>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
          ${isLoading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept="*"
          disabled={isLoading}
        />

        <div className="space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
            isDragOver ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <Upload className={`w-8 h-8 ${isDragOver ? 'text-blue-600' : 'text-gray-600'}`} />
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900">
              {isLoading ? 'Uploading file...' : 'Drop your file here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse • Max 10MB
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}

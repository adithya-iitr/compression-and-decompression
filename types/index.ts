export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  compressionTime: number;
  decompressionTime?: number;
  algorithm: string;
  originalData: string;
  filename: string;
  compressedFilePath?: string; // ✅ optional field for download
}

  
  export interface CompressionAlgorithm {
    name: string;
    key: string;
    description: string;
    bestFor: string;
  }
  
  export interface FileData {
    name: string;
    size: number;
    type: string;
    path: string; // 🔑 Full file path returned from backend
    content?: string; // ✅ Only for text-based previews
    previewUrl?: string; // ✅ For image/pdf rendering in frontend
  }
  
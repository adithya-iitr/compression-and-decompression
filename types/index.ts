export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  compressionTime: number;
  algorithm: string;
  originalData: string;
  filename: string;
  compressedFilePath?: string; // ✅ optional field for download
}
export interface DecompressionResult {
  originalSize: number;                // size of the compressed file before decompression
  decompressedSize: number;           // final size after decompression
  decompressionTime: number;          // in milliseconds
  algorithm: 'huffman' | 'rle' | 'lz77'; // inferred from filename
  filename: string;                   // name of uploaded file
  originalData?: string;              // optional (for text-based preview)
  decompressedFilePath: string;       // relative path to the final decompressed file for download
}

  
export interface CompressionAlgorithm {
  name: string;
  key: string;
  description: string;
  bestFor: string;
  compress: (data: string) => Promise<{ compressed: Uint8Array; time: number }>;
}
  
export interface FileData {
  name: string;
  size: number;
  type: string;
  path: string; // 🔑 Full file path returned from backend
  content?: string; // ✅ Only for text-based previews
  previewUrl?: string; // ✅ For image/pdf rendering in frontend
}
  
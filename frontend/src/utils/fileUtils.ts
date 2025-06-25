export function downloadFile(content: string, filename: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(4)) + ' ' + sizes[i];
}
  
export function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  if (compressedSize === 0) return 0;
  const ratio = originalSize / compressedSize;
  return parseFloat(ratio.toFixed(2)); 
}
export function calculateCompressionEfficiency(originalSize: number, compressedSize: number): number {
  if (originalSize === 0) return 0;
  const efficiency = ((originalSize - compressedSize) / originalSize) * 100;
  return parseFloat(efficiency.toFixed(2)); 
}

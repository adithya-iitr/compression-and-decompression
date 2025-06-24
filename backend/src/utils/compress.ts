import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';

import {
  compressWithHuffman,
  decompressWithHuffman,
} from './algorithms/huffman';

// import {
//   compressWithRLE,
//   decompressWithRLE,
// } from './algorithms/rle';

// import {
//   compressWithLZ77,
//   decompressWithLZ77,
// } from './algorithms/lz77';

type AlgorithmPair = {
  compress: (data: Buffer) => Buffer;
  decompress: (data: Buffer) => Buffer;
};

const algorithmMap: Record<string, AlgorithmPair> = {
  huffman: {
    compress: compressWithHuffman,
    decompress: decompressWithHuffman,
  },
//   rle: {
//     compress: compressWithRLE,
//     decompress: decompressWithRLE,
//   },
//   lz77: {
//     compress: compressWithLZ77,
//     decompress: decompressWithLZ77,
//   },
};

export async function compressAndDecompressFile(
  filePath: string,
  algorithm: string,
  originalExtension: string
): Promise<{
  compressedSize: number;
  compressionTime: number;
  decompressedPath: string;
  decompressionTime: number;
}> {
  if (!(algorithm in algorithmMap)) {
    throw new Error('Unsupported algorithm');
  }

  const inputBuffer = await fs.promises.readFile(filePath);

  const { compress, decompress } = algorithmMap[algorithm];

  // ----------- COMPRESSION ----------
  const t0 = Date.now();
  const compressed = compress(inputBuffer);
  const compressionTime = Date.now() - t0;
  const compressedSize = compressed.length;

  // Optional: write temp compressed file
  const tempCompressedPath = filePath + `.temp_compressed`;
  await fs.promises.writeFile(tempCompressedPath, compressed);

  // ----------- DECOMPRESSION ----------
  const t1 = Date.now();
  const decompressed = decompress(compressed);
  const decompressionTime = Date.now() - t1;

  const outputPath = filePath + `_decompressed.${originalExtension}`;
  await fs.promises.writeFile(outputPath, decompressed);

  return {
    compressedSize,
    compressionTime,
    decompressedPath: outputPath,
    decompressionTime,
  };
}

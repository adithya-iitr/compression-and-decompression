import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';
import { performance } from 'perf_hooks';
import {
  compressWithHuffman,
  decompressWithHuffman,
} from './algorithms/huffman';

import {
  compressWithRLE,
  decompressWithRLE,
} from './algorithms/rle';

import {
  compressWithLZ77,
  decompressWithLZ77,
} from './algorithms/lz77';

type AlgorithmPair = {
  compress: (data: Buffer) => Buffer;
  decompress: (data: Buffer) => Buffer;
};

const algorithmMap: Record<string, AlgorithmPair> = {
  huffman: {
    compress: compressWithHuffman,
    decompress: decompressWithHuffman,
  },
  rle: {
    compress: compressWithRLE,
    decompress: decompressWithRLE,
  },
  lz77: {
    compress: compressWithLZ77,
    decompress: decompressWithLZ77,
  },
};

export async function compressFile(
  filePath: string,
  algorithm: string
): Promise<{
  compressedSize: number;
  compressionTime: number;
  compressedPath: string;
}> {
  if (!(algorithm in algorithmMap)) {
    throw new Error('Unsupported algorithm');
  }

  const inputBuffer = await fs.promises.readFile(filePath);
  const { compress } = algorithmMap[algorithm];

  const t0 = performance.now();
  const compressed = compress(inputBuffer);
  const compressionTime = performance.now() - t0;

  const compressedPath = `${filePath}.compressed.${algorithm}`;
  await fs.promises.writeFile(compressedPath, compressed);

  return {
    compressedSize: compressed.length,
    compressionTime,
    compressedPath,
  };
}

// ---------- DECOMPRESSION ----------
export async function decompressFile(
  filePath: string,
  algorithm: string,
  originalExtension: string
): Promise<{
  decompressionTime: number;
  decompressedPath: string;
}> {
  if (!(algorithm in algorithmMap)) {
    throw new Error('Unsupported algorithm');
  }

  const compressedBuffer = await fs.promises.readFile(filePath);
  const { decompress } = algorithmMap[algorithm];

  const t0 = performance.now();
  const decompressed = decompress(compressedBuffer);
  const decompressionTime = performance.now() - t0;

  const decompressedPath = `${filePath}_decompressed.${originalExtension}`;
  await fs.promises.writeFile(decompressedPath, decompressed);

  return {
    decompressionTime,
    decompressedPath,
  };
}
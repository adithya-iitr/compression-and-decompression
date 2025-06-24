import { CompressionAlgorithm } from '../../../types';

// Huffman Coding Implementation
class HuffmanNode {
  char: string;
  freq: number;
  left?: HuffmanNode;
  right?: HuffmanNode;

  constructor(char: string, freq: number, left?: HuffmanNode, right?: HuffmanNode) {
    this.char = char;
    this.freq = freq;
    this.left = left;
    this.right = right;
  }
}

function buildFrequencyTable(text: string): Map<string, number> {
  const freq = new Map<string, number>();
  for (const char of text) {
    freq.set(char, (freq.get(char) || 0) + 1);
  }
  return freq;
}

function buildHuffmanTree(freq: Map<string, number>): HuffmanNode | null {
  if (freq.size === 0) return null;
  if (freq.size === 1) {
    // const [char, frequency] = freq.entries().next().value;
    // return new HuffmanNode(char, frequency);
  }

  const nodes = Array.from(freq.entries()).map(([char, frequency]) => 
    new HuffmanNode(char, frequency)
  );

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift()!;
    const right = nodes.shift()!;
    const merged = new HuffmanNode('', left.freq + right.freq, left, right);
    nodes.push(merged);
  }

  return nodes[0];
}

function buildCodes(root: HuffmanNode | null, codes: Map<string, string> = new Map(), prefix = ''): Map<string, string> {
  if (!root) return codes;
  
  if (root.char !== '' && !root.left && !root.right) {
    codes.set(root.char, prefix || '0');
    return codes;
  }
  
  if (root.left) buildCodes(root.left, codes, prefix + '0');
  if (root.right) buildCodes(root.right, codes, prefix + '1');
  
  return codes;
}

function huffmanCompress(text: string): { compressed: string; time: number } {
  const start = performance.now();
  
  if (!text) return { compressed: '', time: performance.now() - start };
  
  const freq = buildFrequencyTable(text);
  const root = buildHuffmanTree(freq);
  const codes = buildCodes(root);
  
  let compressed = '';
  for (const char of text) {
    compressed += codes.get(char) || '';
  }
  
  // Store frequency table for decompression
  const freqJson = JSON.stringify(Array.from(freq.entries()));
  const result = `${freqJson}|${compressed}`;
  
  return { compressed: result, time: performance.now() - start };
}

function huffmanDecompress(data: string): { decompressed: string; time: number } {
  const start = performance.now();
  
  if (!data) return { decompressed: '', time: performance.now() - start };
  
  const [freqJson, compressed] = data.split('|');
  if (!freqJson || !compressed) return { decompressed: data, time: performance.now() - start };
  
  try {
    const freq = new Map(JSON.parse(freqJson));
    const root = buildHuffmanTree(freq);
    
    if (!root) return { decompressed: '', time: performance.now() - start };
    
    let decompressed = '';
    let current = root;
    
    for (const bit of compressed) {
      if (bit === '0') current = current.left || root;
      else if (bit === '1') current = current.right || root;
      
      if (current.char !== '' && !current.left && !current.right) {
        decompressed += current.char;
        current = root;
      }
    }
    
    return { decompressed, time: performance.now() - start };
  } catch {
    return { decompressed: data, time: performance.now() - start };
  }
}

// Run-Length Encoding Implementation
function rleCompress(text: string): { compressed: string; time: number } {
  const start = performance.now();
  
  if (!text) return { compressed: '', time: performance.now() - start };
  
  let compressed = '';
  let count = 1;
  let current = text[0];
  
  for (let i = 1; i < text.length; i++) {
    if (text[i] === current && count < 255) {
      count++;
    } else {
      compressed += `${count}${current}`;
      current = text[i];
      count = 1;
    }
  }
  compressed += `${count}${current}`;
  
  return { compressed, time: performance.now() - start };
}

function rleDecompress(data: string): { decompressed: string; time: number } {
  const start = performance.now();
  
  if (!data) return { decompressed: '', time: performance.now() - start };
  
  let decompressed = '';
  let i = 0;
  
  while (i < data.length) {
    let count = '';
    while (i < data.length && /\d/.test(data[i])) {
      count += data[i];
      i++;
    }
    
    if (i < data.length) {
      const char = data[i];
      decompressed += char.repeat(parseInt(count) || 1);
      i++;
    }
  }
  
  return { decompressed, time: performance.now() - start };
}

// Simplified LZ77 Implementation
function lz77Compress(text: string): { compressed: string; time: number } {
  const start = performance.now();
  
  if (!text) return { compressed: '', time: performance.now() - start };
  
  const windowSize = 4096;
  const lookaheadSize = 18;
  let compressed: string[] = [];
  let position = 0;
  
  while (position < text.length) {
    let matchLength = 0;
    let matchDistance = 0;
    
    const windowStart = Math.max(0, position - windowSize);
    const lookaheadEnd = Math.min(text.length, position + lookaheadSize);
    
    for (let i = windowStart; i < position; i++) {
      let length = 0;
      while (
        position + length < lookaheadEnd &&
        text[i + length] === text[position + length]
      ) {
        length++;
      }
      
      if (length > matchLength) {
        matchLength = length;
        matchDistance = position - i;
      }
    }
    
    if (matchLength >= 3) {
      compressed.push(`(${matchDistance},${matchLength})`);
      position += matchLength;
    } else {
      compressed.push(text[position]);
      position++;
    }
  }
  
  return { compressed: compressed.join(''), time: performance.now() - start };
}

function lz77Decompress(data: string): { decompressed: string; time: number } {
  const start = performance.now();
  
  if (!data) return { decompressed: '', time: performance.now() - start };
  
  let decompressed = '';
  let i = 0;
  
  while (i < data.length) {
    if (data[i] === '(' && data.indexOf(')', i) !== -1) {
      const endParen = data.indexOf(')', i);
      const match = data.slice(i + 1, endParen);
      const [distance, length] = match.split(',').map(Number);
      
      if (!isNaN(distance) && !isNaN(length)) {
        const start = decompressed.length - distance;
        for (let j = 0; j < length; j++) {
          decompressed += decompressed[start + j];
        }
        i = endParen + 1;
      } else {
        decompressed += data[i];
        i++;
      }
    } else {
      decompressed += data[i];
      i++;
    }
  }
  
  return { decompressed, time: performance.now() - start };
}

export const compressionAlgorithms: CompressionAlgorithm[] = [
  {
    name: 'Huffman Coding',
    key: 'huffman',
    description: 'Variable-length encoding based on character frequency',
    bestFor: 'Text files with varied character frequencies',
    compress: huffmanCompress,
    decompress: huffmanDecompress,
  },
  {
    name: 'Run-Length Encoding',
    key: 'rle',
    description: 'Replaces sequences of identical characters with count and character',
    bestFor: 'Data with many repeated sequences',
    compress: rleCompress,
    decompress: rleDecompress,
  },
  {
    name: 'LZ77',
    key: 'lz77',
    description: 'Dictionary-based compression using sliding window',
    bestFor: 'General-purpose compression with repeated patterns',
    compress: lz77Compress,
    decompress: lz77Decompress,
  },
];
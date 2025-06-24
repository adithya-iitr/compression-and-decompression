// backend/utils/algorithms/huffman.ts
import { Buffer } from 'buffer';

type HuffmanNode = {
  byte: number | null;
  freq: number;
  left: HuffmanNode | null;
  right: HuffmanNode | null;
};

export function compressWithHuffman(input: Buffer): Buffer {
  const freq: Record<number, number> = {};
  for (const byte of input) freq[byte] = (freq[byte] || 0) + 1;

  const freqBuffer = Buffer.alloc(1024);
  Object.entries(freq).forEach(([byte, count]) => {
    freqBuffer.writeUInt32BE(count, parseInt(byte) * 4);
  });

  const nodes: HuffmanNode[] = Object.entries(freq).map(([byte, freq]) => ({
    byte: parseInt(byte),
    freq,
    left: null,
    right: null,
  }));

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift()!;
    const right = nodes.shift()!;
    nodes.push({ byte: null, freq: left.freq + right.freq, left, right });
  }

  const root = nodes[0];
  const codeMap: Record<number, string> = {};
  const traverse = (node: HuffmanNode, path: string) => {
    if (node.byte !== null) {
      codeMap[node.byte] = path;
      return;
    }
    traverse(node.left!, path + '0');
    traverse(node.right!, path + '1');
  };
  traverse(root, '');

  let bitString = '';
  for (const byte of input) bitString += codeMap[byte];
  const byteArray = [];
  for (let i = 0; i < bitString.length; i += 8) {
    byteArray.push(parseInt(bitString.slice(i, i + 8).padEnd(8, '0'), 2));
  }

  return Buffer.concat([freqBuffer, Buffer.from(byteArray)]);
}

export function decompressWithHuffman(buffer: Buffer): Buffer {
  const freq: number[] = [];
  for (let i = 0; i < 256; i++) {
    freq[i] = buffer.readUInt32BE(i * 4);
  }

  const nodes: HuffmanNode[] = [];
  for (let byte = 0; byte < 256; byte++) {
    if (freq[byte] > 0) {
      nodes.push({ byte, freq: freq[byte], left: null, right: null });
    }
  }

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift()!;
    const right = nodes.shift()!;
    nodes.push({ byte: null, freq: left.freq + right.freq, left, right });
  }

  const root = nodes[0];
  const bitData = buffer.slice(1024);
  let bitString = '';
  for (const byte of bitData) bitString += byte.toString(2).padStart(8, '0');

  const output: number[] = [];
  let node = root;
  for (const bit of bitString) {
    node = bit === '0' ? node.left! : node.right!;
    if (node.byte !== null) {
      output.push(node.byte);
      node = root;
    }
  }

  return Buffer.from(output);
}

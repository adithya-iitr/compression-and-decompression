import { Buffer } from 'buffer';

type HuffmanNode = {
  byte: number | null;
  freq: number;
  left: HuffmanNode | null;
  right: HuffmanNode | null;
};

function buildTree(freqMap: Record<number, number>): HuffmanNode {
  const nodes: HuffmanNode[] = Object.entries(freqMap).map(([byte, freq]) => ({
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

  return nodes[0];
}

function generateCodes(root: HuffmanNode): Record<number, string> {
  const map: Record<number, string> = {};
  const dfs = (node: HuffmanNode, path: string) => {
    if (node.byte !== null) {
      map[node.byte] = path;
      return;
    }
    dfs(node.left!, path + '0');
    dfs(node.right!, path + '1');
  };
  dfs(root, '');
  return map;
}

export function compressWithHuffman(input: Buffer): Buffer {
  const freq: Record<number, number> = {};
  for (const byte of input) freq[byte] = (freq[byte] || 0) + 1;

  const root = buildTree(freq);
  const codeMap = generateCodes(root);

  let bitStr = '';
  for (const byte of input) bitStr += codeMap[byte];

  const byteArray = [];
  for (let i = 0; i < bitStr.length; i += 8) {
    byteArray.push(parseInt(bitStr.slice(i, i + 8).padEnd(8, '0'), 2));
  }

  const freqBuffer = Buffer.alloc(1024);
  for (let i = 0; i < 256; i++) {
    freqBuffer.writeUInt32BE(freq[i] || 0, i * 4);
  }

  const bitLength = Buffer.alloc(4);
  bitLength.writeUInt32BE(bitStr.length, 0);

  return Buffer.concat([freqBuffer, bitLength, Buffer.from(byteArray)]);
}

export function decompressWithHuffman(buffer: Buffer): Buffer {
  const freq: number[] = [];
  for (let i = 0; i < 256; i++) {
    freq[i] = buffer.readUInt32BE(i * 4);
  }

  const root = buildTree(Object.fromEntries(freq.map((f, i) => [i, f]).filter(([_, f]) => f > 0)));

  const bitLength = buffer.readUInt32BE(1024);
  const bitData = buffer.slice(1028);

  let bitStr = '';
  for (const byte of bitData) {
    bitStr += byte.toString(2).padStart(8, '0');
  }
  bitStr = bitStr.slice(0, bitLength); // Trim trailing padding

  const output: number[] = [];
  let node = root;
  for (const bit of bitStr) {
    node = bit === '0' ? node.left! : node.right!;
    if (node.byte !== null) {
      output.push(node.byte);
      node = root;
    }
  }

  return Buffer.from(output);
}

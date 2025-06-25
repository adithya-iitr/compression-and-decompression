import { Buffer } from 'buffer';

// RLE compression: [count, byte]
export function compressWithRLE(input: Buffer): Buffer {
  const result: number[] = [];
  let i = 0;

  while (i < input.length) {
    let count = 1;
    while (i + count < input.length && input[i] === input[i + count] && count < 255) {
      count++;
    }
    result.push(count, input[i]);
    i += count;
  }

  return Buffer.from(result);
}

export function decompressWithRLE(input: Buffer): Buffer {
  const result: number[] = [];

  for (let i = 0; i < input.length; i += 2) {
    const count = input[i];
    const byte = input[i + 1];
    result.push(...new Array(count).fill(byte));
  }

  return Buffer.from(result);
}

import { Buffer } from 'buffer';

interface LZTuple {
  offset: number;
  length: number;
  next: number;
}

export function compressWithLZ77(input: Buffer): Buffer {
  const windowSize = 256;
  const buffer: LZTuple[] = [];

  let i = 0;
  while (i < input.length) {
    let matchLength = 0;
    let matchDistance = 0;
    const maxMatchLength = 15;

    const start = Math.max(0, i - windowSize);
    for (let j = start; j < i; j++) {
      let k = 0;
      while (
        k < maxMatchLength &&
        input[j + k] === input[i + k] &&
        i + k < input.length
      ) {
        k++;
      }

      if (k > matchLength) {
        matchLength = k;
        matchDistance = i - j;
      }
    }

    const nextByte = input[i + matchLength] ?? 0;
    buffer.push({ offset: matchDistance, length: matchLength, next: nextByte });
    i += matchLength + 1;
  }

  // Pack into a Buffer
  const output: number[] = [];
  for (const { offset, length, next } of buffer) {
    output.push(offset, length, next);
  }

  return Buffer.from(output);
}

export function decompressWithLZ77(input: Buffer): Buffer {
  const output: number[] = [];

  for (let i = 0; i < input.length; i += 3) {
    const offset = input[i];
    const length = input[i + 1];
    const next = input[i + 2];

    const start = output.length - offset;
    for (let j = 0; j < length; j++) {
      output.push(output[start + j]);
    }

    output.push(next);
  }

  return Buffer.from(output);
}

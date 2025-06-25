import { Buffer } from 'buffer';

const WINDOW_SIZE = 2048; // sliding window
const MAX_MATCH = 18;     // maximum match length

type Token = { offset: number; length: number; next: number };

function encodeLZ77(data: Buffer): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < data.length) {
    let matchOffset = 0, matchLength = 0;

    const start = Math.max(0, i - WINDOW_SIZE);
    const window = data.slice(start, i);

    for (let j = 0; j < window.length; j++) {
      let length = 0;
      while (
        length < MAX_MATCH &&
        i + length < data.length &&
        window[j + length] === data[i + length]
      ) {
        length++;
      }

      if (length > matchLength) {
        matchLength = length;
        matchOffset = window.length - j;
      }
    }

    const nextByte = data[i + matchLength] || 0;
    tokens.push({ offset: matchOffset, length: matchLength, next: nextByte });
    i += matchLength + 1;
  }

  return tokens;
}

function decodeLZ77(tokens: Token[]): Buffer {
  const output: number[] = [];

  for (const token of tokens) {
    const start = output.length - token.offset;
    for (let i = 0; i < token.length; i++) {
      output.push(output[start + i]);
    }
    output.push(token.next);
  }

  return Buffer.from(output);
}

export function compressWithLZ77(input: Buffer): Buffer {
  const tokens = encodeLZ77(input);
  const result: number[] = [];

  for (const { offset, length, next } of tokens) {
    result.push((offset >> 8) & 0xff, offset & 0xff, length, next);
  }

  return Buffer.from(result);
}

export function decompressWithLZ77(input: Buffer): Buffer {
  const tokens: Token[] = [];
  for (let i = 0; i < input.length; i += 4) {
    const offset = (input[i] << 8) | input[i + 1];
    const length = input[i + 2];
    const next = input[i + 3];
    tokens.push({ offset, length, next });
  }

  return decodeLZ77(tokens);
}

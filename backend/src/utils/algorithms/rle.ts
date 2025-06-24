import { Buffer } from 'buffer';

export function compressWithRLE(input: Buffer): Buffer {
  const compressed: number[] = [];

  let i = 0;
  while (i < input.length) {
    const currentByte = input[i];
    let count = 1;

    while (i + count < input.length && input[i + count] === currentByte && count < 255) {
      count++;
    }

    compressed.push(currentByte, count);
    i += count;
  }

  return Buffer.from(compressed);
}

export function decompressWithRLE(input: Buffer): Buffer {
  const output: number[] = [];

  for (let i = 0; i < input.length; i += 2) {
    const byte = input[i];
    const count = input[i + 1];

    for (let j = 0; j < count; j++) {
      output.push(byte);
    }
  }

  return Buffer.from(output);
}

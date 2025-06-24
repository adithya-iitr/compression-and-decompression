import { Buffer } from 'buffer';

export function compressWithRLE(input: Buffer): Buffer {
  const output: number[] = [];
  let i = 0;

  while (i < input.length) {
    const byte = input[i];
    let count = 1;
    while (i + count < input.length && input[i + count] === byte && count < 255) {
      count++;
    }
    output.push(count, byte);
    i += count;
  }

  return Buffer.from(output);
}

import { Buffer } from 'buffer';

export function compressWithLZ77(input: Buffer): Buffer {
  const windowSize = 255;
  const output: number[] = [];
  let i = 0;

  while (i < input.length) {
    let matchLength = 0;
    let matchDistance = 0;
    const maxLength = Math.min(255, input.length - i);

    for (let distance = 1; distance <= Math.min(i, windowSize); distance++) {
      let length = 0;
      while (
        length < maxLength &&
        input[i - distance + length] === input[i + length]
      ) {
        length++;
      }

      if (length > matchLength) {
        matchLength = length;
        matchDistance = distance;
      }
    }

    if (matchLength >= 3) {
      output.push(255, matchDistance, matchLength);
      i += matchLength;
    } else {
      output.push(input[i]);
      i++;
    }
  }

  return Buffer.from(output);
}

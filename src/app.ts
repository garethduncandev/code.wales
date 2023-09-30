import { ImageCodeBlocks } from './lib/image-code-blocks.js';

const blockWidth = 3;
const blockHeight = 5;
const spacing = 1;

const codeEffectSVG = new ImageCodeBlocks(blockWidth, blockHeight, spacing);

void codeEffectSVG
  .createFromImageSrc('/wales.svg', 'output', 'wales')
  .then(() => {});

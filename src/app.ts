import { ImageCodeBlocks } from './lib/image-code-blocks.js';

const accuracy = 1;
const codeBlockHeight = 5;
const codeBlockMinWidth = 5;
const codeBlockMaxWidth = 30;
const spacing = 2;

const codeEffectSVG = new ImageCodeBlocks(
  accuracy,
  codeBlockHeight,
  codeBlockMinWidth,
  codeBlockMaxWidth,
  spacing,
  true
);

// If loading from a file
// void codeEffectSVG.createFromImageSrc('/wales.svg', 'output').then(() => {});
codeEffectSVG.createFromImgTag('input', 'output');

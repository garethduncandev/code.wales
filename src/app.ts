import { ImageCodeBlocks } from './lib/image-code-blocks.js';

const codeBlockHeight = 13;
const codeBlockMinWidth = codeBlockHeight;
const codeBlockMaxWidth = codeBlockMinWidth * 4;
const padding = codeBlockHeight / 3;

const codeEffectSVG = new ImageCodeBlocks(
  codeBlockHeight,
  codeBlockMinWidth,
  codeBlockMaxWidth,
  padding
);

const img = document.getElementById('input') as HTMLImageElement;
const output = document.getElementById('output');

const svg = codeEffectSVG.create('wales', img);
output?.appendChild(svg);

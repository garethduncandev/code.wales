import { ImageCodeBlocks } from './lib/image-code-blocks.js';
import { HyperLink } from './lib/link.js';

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
const links: HyperLink[] = [
  {
    name: 'GitHub',
    description: 'Source code',
    url: 'https://github.com/garethduncandev/code.wales',
  },
];

const svg = codeEffectSVG.create('wales', img, links);
output?.appendChild(svg);

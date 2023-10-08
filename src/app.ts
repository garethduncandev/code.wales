import Blocks from '@garethduncandev/blocks';

const codeBlockHeight = 13;
const codeBlockMinWidth = codeBlockHeight;
const codeBlockMaxWidth = codeBlockMinWidth * 4;
const padding = codeBlockHeight / 3;
const styleVariationsCount = 3;

const blocks = new Blocks(
  codeBlockHeight,
  codeBlockMinWidth,
  codeBlockMaxWidth,
  padding,
  styleVariationsCount
);

const img = document.getElementById('input') as HTMLImageElement;
const output = document.getElementById('output');

const svg = blocks.create('wales', img);

output?.appendChild(svg);

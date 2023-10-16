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

const output = document.getElementById('output');
const container = document.getElementById('container');
container?.classList.add('loading');
const image = new Image(246, 309);
image.src = '/wales.png';
image.alt = 'Outline of Wales';
image.title = 'Outline of Wales';
image.onload = (): void => {
  const svg = blocks.create('wales', image);
  output?.appendChild(svg);
  container?.classList.remove('loading');
  container?.classList.add('loaded');
};

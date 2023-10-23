import Blocks from '@garethduncandev/blocks';

const codeBlockHeight = 10;
const codeBlockMinWidth = codeBlockHeight;
const padding = codeBlockHeight / 4;

const blocks = new Blocks(
  codeBlockHeight,
  [
    {
      borderRadius: 1,
      color: 'rgb(0, 105, 243)',
      width: codeBlockMinWidth,
    },
    {
      borderRadius: 1,
      color: 'rgb(0, 122, 216)',
      width: codeBlockMinWidth,
    },
    {
      borderRadius: 1,
      color: 'rgb(79, 193, 255)',
      width: codeBlockMinWidth * 2,
    },
    {
      borderRadius: 1,
      color: 'rgb(156, 220, 254)',
      width: codeBlockMinWidth * 2,
    },
    {
      borderRadius: 1,
      color: 'rgb(0, 89, 206)',
      width: codeBlockMinWidth * 2,
    },
    {
      borderRadius: 1,
      color: 'rgb(220, 220, 138)',
      width: codeBlockMinWidth * 3,
    },
    {
      borderRadius: 1,
      color: 'rgb(189, 87, 129)',
      width: codeBlockMinWidth * 3,
    },
    {
      borderRadius: 1,
      color: 'rgb(77, 201, 176)',
      width: codeBlockMinWidth * 3,
    },
    {
      borderRadius: 1,
      color: 'rgb(197, 134, 160)',
      width: codeBlockMinWidth * 4,
    },
    {
      borderRadius: 1,
      color: 'rgb(106, 153, 81)',
      width: codeBlockMinWidth * 4,
    },
  ],
  padding
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
  blocks.animate('wales', svg, 0.2);
  output?.appendChild(svg);
  container?.classList.remove('loading');
  container?.classList.add('loaded');
};

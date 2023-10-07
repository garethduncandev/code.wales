import { CodeEffect } from './lib/code-effect.js';

const codeBlockHeight = 13;
const codeBlockMinWidth = codeBlockHeight;
const codeBlockMaxWidth = codeBlockMinWidth * 4;
const padding = codeBlockHeight / 3;

const codeEffect = new CodeEffect(
  codeBlockHeight,
  codeBlockMinWidth,
  codeBlockMaxWidth,
  padding
);

const img = document.getElementById('input') as HTMLImageElement;
const output = document.getElementById('output');

const svg = codeEffect.create('wales', img);
output?.appendChild(svg);

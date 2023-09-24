import { CodeEffectSVG } from './lib/code-effect-svg.js';

const blockWidth = 3;
const blockHeight = 10;
const spacing = 2;

const codeEffectSVG = new CodeEffectSVG(
  'layer2',
  blockWidth,
  blockHeight,
  'wales',
  spacing
);

codeEffectSVG.createCodeEffect();

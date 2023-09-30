import { ImageCodeBlocks } from './lib/image-code-blocks.js';

const blockWidth = 1;
const blockHeight = 1;
const spacing = 0.1;

const codeEffectSVG = new ImageCodeBlocks(blockWidth, blockHeight, spacing);

codeEffectSVG.createFromImageSrc('/wales.svg', 'output');

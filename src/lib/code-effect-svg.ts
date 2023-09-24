import { Column } from './column.js';
import { imageOnLoadAsync } from './image-async.js';
import { createImageFromSvg } from './image-svg.js';

export class CodeEffectSVG {
  private div!: HTMLElement;

  public constructor(
    private outputElementId: string,
    private blockWidth: number,
    private blockHeight: number,
    private svgId: string,
    private spacing: number
  ) {
    const div = document.getElementById(this.outputElementId);
    if (!div) {
      throw new Error('Could not get div');
    }
    this.div = div;
  }

  public async createCodeEffect(): Promise<void> {
    const svg: SVGMarkerElement = document.getElementById(
      this.svgId
    ) as unknown as SVGMarkerElement;

    const svgWidth = svg.viewBox.baseVal.width;
    const svgHeight = svg.viewBox.baseVal.height;

    const rowsCount = svgHeight / this.blockHeight;
    const columnsCount = svgWidth / this.blockWidth;

    const image = createImageFromSvg(svg);
    await imageOnLoadAsync(image);

    const context = this.createContext(svgWidth, svgHeight);
    context.drawImage(image, 0, 0);

    const grid = this.splitIntoGrid(
      context,
      svgWidth,
      svgHeight,
      rowsCount,
      columnsCount
    );
    this.drawBlocks(grid);
  }

  public createContext(
    canvasWidth: number,
    canvasHeight: number
  ): CanvasRenderingContext2D {
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      throw new Error('Could not get context');
    }
    return context;
  }

  public splitIntoGrid(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    rowsCount: number,
    columnsCount: number
  ): Column[][] {
    //const width = context.canvas.width;
    //const height = context.canvas.height;

    let startY = 0;
    let grid: Column[][] = [];
    for (let y = 0; y < rowsCount; y++) {
      // Loop through 10 items

      // calculate start and end (basically get coords for first and last block)

      let startX = 0;
      let columns: Column[] = [];
      for (let x = 0; x < columnsCount; x++) {
        // get all block positions to then calculate the first and last block position for each line

        var pixelsContainColor = this.areaContainsColour(
          context,
          startX,
          startY,
          this.blockWidth,
          this.blockHeight
        );

        if (!pixelsContainColor) {
          columns.push({
            startX,
            startY,
            fill: false,
            blockWidth: this.blockWidth,
            merged: false,
          });
          startX += this.blockWidth;
          continue;
        }

        columns.push({
          startX,
          startY,
          fill: true,
          blockWidth: this.blockWidth,
          merged: false,
        });

        startX += this.blockWidth;
        if (startX >= width) {
          break;
        }
      }

      grid.push(columns);

      startY += this.blockHeight;
      if (startY >= height) {
        break;
      }
    }

    this.mergeColumns(grid);

    // merge end

    // filter out non merged columns and columns that are not filled

    const filteredGrid: Column[][] = [];
    for (let row of grid) {
      const filteredColumns = row.filter(
        (column) => !column.merged && column.fill
      );
      filteredGrid.push(filteredColumns);
    }

    return filteredGrid;
  }

  /// <summary>
  /// Merge columns e.g. columns that have fill true and next to each other, combine startX values
  /// </summary>
  private mergeColumns(grid: Column[][]) {
    for (let y = 0; y < grid.length; y++) {
      let previousFill = false;
      let currentBlockWidth = 0;
      let blockToMergeWithIndex = -1;
      for (let x = 0; x < grid[y].length; x++) {
        const fill = grid[y][x].fill;
        if (fill && previousFill) {
          const column = grid[y][x];
          column.merged = true;
          // update blockWidth of previous block
          const previousColumn = grid[y][blockToMergeWithIndex];
          previousColumn.blockWidth = currentBlockWidth + this.blockWidth;
          currentBlockWidth = previousColumn.blockWidth;
          previousFill = true;
          continue;
        }
        if (fill) {
          const column = grid[y][x];
          blockToMergeWithIndex = x;
          //previousStartX = column.startX;
          currentBlockWidth = column.blockWidth;
          previousFill = true;
          column.merged = false;
          continue;
        }
        currentBlockWidth = 0;
        previousFill = false;
        blockToMergeWithIndex = -1;
      }
    }
  }

  private areaContainsColour(
    context: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    blockWidth: number,
    blockHeight: number
  ) {
    const pixelData = context.getImageData(
      startX,
      startY,
      blockWidth,
      blockHeight
    ).data;

    var notWhiteOrTransparent = false;
    for (let i = 0; i < pixelData.length; i += 4) {
      const red = pixelData[i];
      const green = pixelData[i + 1];
      const blue = pixelData[i + 2];
      const alpha = pixelData[i + 3];

      // if 100% transparent, ignore even if it has color
      if (alpha === 0) {
        continue;
      }

      if (red < 255 || green < 255 || blue < 255) {
        notWhiteOrTransparent = true;
        break;
      }
    }
    return notWhiteOrTransparent;
  }

  public drawBlocks(grid: Column[][]) {
    // draw rectangles
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const merged = grid[y][x].merged;
        if (merged) {
          // continue;
        }
        const fill = grid[y][x].fill;
        if (fill) {
          const rect = this.createRectangle(
            grid[y][x].startX,
            grid[y][x].startY,
            grid[y][x].blockWidth
          );

          this.div.append(rect);
        }
      }
    }
  }

  private createRectangle(
    startX: number,
    startY: number,
    blockWidth: number
  ): SVGRectElement {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', (blockWidth - this.spacing).toString());
    rect.setAttribute('height', (this.blockHeight - this.spacing).toString());
    rect.setAttribute('x', startX.toString());
    rect.setAttribute('y', startY.toString());
    return rect;
  }
}

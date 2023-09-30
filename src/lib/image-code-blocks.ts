import { Column } from './column.js';
import { imageOnLoadAsync } from './image-async.js';

export class ImageCodeBlocks {
  private div!: HTMLElement;

  public constructor(
    private blockWidth: number,
    private blockHeight: number,
    private spacing: number
  ) {}

  public async createFromImageSrc(
    src: string,
    outputElementId: string,
    svgId: string
  ): Promise<void> {
    const div = document.getElementById(outputElementId);
    if (!div) {
      throw new Error('Could not get div');
    }
    this.div = div;
    const image = new Image();
    image.src = src;
    await imageOnLoadAsync(image);
    this.createFromImage(image, svgId);
  }

  private createFromImage(image: HTMLImageElement, svgId: string): void {
    const context = this.createContext(image.width, image.height);
    context.drawImage(image, 0, 0);
    const rowsCount = image.height / this.blockHeight;
    const columnsCount = image.width / this.blockWidth;
    const grid = this.splitIntoGrid(
      context,
      image.width,
      image.height,
      rowsCount,
      columnsCount
    );

    const codeBlocks = this.generateCodeBlocks(grid);
    const outputSvg = this.createdOutputSVGElement(
      svgId,
      image.width,
      image.height
    );

    outputSvg.getElementById('code-effect-group')?.append(...codeBlocks);

    this.div.appendChild(outputSvg);
  }

  private createdOutputSVGElement(
    svgId: string,
    width: number,
    height: number
  ): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', svgId);
    console.log('look here', svg);
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('xmlns:svg', 'http://www.w3.org/2000/svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('id', 'code-effect-group');
    svg.appendChild(g);
    return svg;
  }

  private createContext(
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

  private splitIntoGrid(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    rowsCount: number,
    columnsCount: number
  ): Column[][] {
    let startY = 0;
    const grid: Column[][] = [];
    for (let y = 0; y < rowsCount; y++) {
      let startX = 0;
      const columns: Column[] = [];
      for (let x = 0; x < columnsCount; x++) {
        // get all block positions to then calculate the first and last block position for each line

        const pixelsContainColor = this.areaContainsColour(
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

    const filteredGrid: Column[][] = [];
    for (const row of grid) {
      const filteredColumns = row.filter(
        (column) => !column.merged && column.fill
      );
      filteredGrid.push(filteredColumns);
    }

    // split each row into random length blocks
    const finalBlocks = this.splitIntoRandomLengthBlocks(filteredGrid);

    return finalBlocks;
  }

  /// <summary>
  /// Merge columns e.g. columns that have fill true and next to each other, combine startX values
  /// </summary>
  private mergeColumns(grid: Column[][]): void {
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

  private splitIntoRandomLengthBlocks(grid: Column[][]): Column[][] {
    // foreach row
    const rows: Column[][] = [];
    for (let y = 0; y < grid.length; y++) {
      // foreach column
      const columns: Column[] = [];
      for (let x = 0; x < grid[y].length; x++) {
        const blockWidth = grid[y][x].blockWidth;

        console.log(x);
        columns.push(grid[y][x]);
      }

      rows.push(columns);
    }

    return rows;
  }

  private areaContainsColour(
    context: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    blockWidth: number,
    blockHeight: number
  ): boolean {
    const pixelData = context.getImageData(
      startX,
      startY + Math.floor(blockHeight / 2),
      blockWidth,
      1
    ).data;

    let notWhiteOrTransparent = false;
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

  private generateCodeBlocks(grid: Column[][]): SVGRectElement[] {
    const rectangles: SVGRectElement[] = [];
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const fill = grid[y][x].fill;
        if (fill) {
          const rect = this.createRectangle(
            grid[y][x].startX,
            grid[y][x].startY,
            grid[y][x].blockWidth,
            this.blockHeight
          );
          rectangles.push(rect);
        }
      }
    }
    return rectangles;
  }

  private createRectangle(
    startX: number,
    startY: number,
    blockWidth: number,
    blockHeight: number
  ): SVGRectElement {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', (blockWidth - this.spacing).toString());
    rect.setAttribute('height', (blockHeight - this.spacing).toString());
    rect.setAttribute('x', startX.toString());
    rect.setAttribute('y', startY.toString());
    return rect;
  }
}

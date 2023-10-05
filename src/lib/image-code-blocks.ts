import { Column } from './column.js';

export class ImageCodeBlocks {
  private outputElement!: HTMLElement;
  private previousClassName: string | undefined = undefined;

  public constructor(
    private accuracy: number,
    private blockHeight: number,
    private codeBlockMinWidth: number,
    private codeBlockMaxWidth: number,
    private spacing: number,
    private monotype: boolean
  ) {
    if (this.monotype) {
      this.accuracy = this.codeBlockMinWidth;
    }
  }

  public createFromImgTag(elementId: string, outputElementId: string): void {
    this.outputElement = this.getOutputElement(outputElementId);
    const img = this.getImageFromImgElement(elementId);
    this.createFromImage(img, outputElementId);
  }

  public async createFromImageSrc(
    src: string,
    outputElementId: string
  ): Promise<void> {
    this.outputElement = this.getOutputElement(outputElementId);
    const image = await this.getImageFromSrc(src);
    this.createFromImage(image, outputElementId);
  }

  private getOutputElement(outputElementId: string): HTMLElement {
    const outputElement = document.getElementById(outputElementId);
    if (!outputElement) {
      throw new Error('Could not get div');
    }
    return outputElement;
  }

  private getImageFromSrc(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = (): void => resolve(image);
      image.onerror = reject;
      image.src = url;
    });
  }

  private getImageFromImgElement(elementId: string): HTMLImageElement {
    const img = document.getElementById(elementId);
    if (!img) {
      throw new Error('Could not get element');
    }
    if (!(img instanceof HTMLImageElement)) {
      throw new Error('Element is not an image');
    }
    return img;
  }

  private createFromImage(
    image: HTMLImageElement,
    outputElementId: string
  ): void {
    const context = this.createContext(image.width, image.height);
    context.drawImage(image, 0, 0);
    const rowsCount = image.height / this.blockHeight;
    const columnsCount = image.width / this.accuracy;
    const grid = this.splitIntoGrid(
      context,
      rowsCount,
      columnsCount,
      this.codeBlockMinWidth,
      this.codeBlockMaxWidth,
      this.monotype
    );

    const codeBlocks = this.generateCodeBlocks(grid);
    const outputSvg = this.createdOutputSVGElement(
      image.width,
      image.height,
      outputElementId
    );

    outputSvg
      .getElementById(`${outputElementId}-code-blocks-group`)
      ?.append(...codeBlocks);

    this.outputElement.appendChild(outputSvg);
  }

  private createdOutputSVGElement(
    width: number,
    height: number,
    outputElementId: string
  ): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('xmlns:svg', 'http://www.w3.org/2000/svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const elementNS = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'g'
    );
    elementNS.setAttribute('id', `${outputElementId}-code-blocks-group`);
    svg.appendChild(elementNS);
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
    rowsCount: number,
    columnsCount: number,
    codeBlockMinWidth: number,
    codeBlockMaxWidth: number,
    monotype: boolean
  ): Column[][] {
    let startY = 0;
    const grid: Column[][] = [];
    for (let y = 0; y < rowsCount; y++) {
      let startX = 0;
      const columns: Column[] = [];
      for (let x = 0; x < columnsCount; x++) {
        const pixelsContainColor = this.areaContainsColour(
          context,
          startX,
          startY,
          this.accuracy,
          this.blockHeight
        );

        columns.push({
          startX,
          startY,
          fill: pixelsContainColor,
          blockWidth: this.accuracy,
          merged: false,
        });
        startX += this.accuracy;
      }
      startY += this.blockHeight;
      grid.push(columns);
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
    const finalBlocks = this.splitIntoRandomLengthBlocks(
      filteredGrid,
      codeBlockMinWidth,
      codeBlockMaxWidth,
      monotype
    );

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
          previousColumn.blockWidth = currentBlockWidth + this.accuracy;
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

  private splitIntoRandomLengthBlocks(
    grid: Column[][],
    codeBlockMinWidth: number,
    codeBlockMaxWidth: number,
    monotype: boolean
  ): Column[][] {
    // foreach row
    const rows: Column[][] = [];
    for (let y = 0; y < grid.length; y++) {
      // foreach column
      const columns: Column[] = [];
      for (let x = 0; x < grid[y].length; x++) {
        const blockWidth = grid[y][x].blockWidth;
        const newBlockWidths = this.randomNumbersWithSum(
          blockWidth,
          codeBlockMinWidth,
          codeBlockMaxWidth,
          monotype
        );

        let newStartX = grid[y][x].startX;

        for (let w = 0; w < newBlockWidths.length; w++) {
          const width = newBlockWidths[w];

          const newColumn: Column = {
            fill: true,
            merged: true,
            startY: grid[y][x].startY,
            startX: newStartX,
            blockWidth: width,
          };

          newStartX += width;
          columns.push(newColumn);
        }
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
            this.blockHeight,
            this.codeBlockMinWidth,
            this.codeBlockMaxWidth
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
    codeBlockWidth: number,
    codeBlockHeight: number,
    codeBlockMinWidth: number,
    codeBlockMaxWidth: number
  ): SVGRectElement {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', (codeBlockWidth - this.spacing).toString());
    rect.setAttribute('height', (codeBlockHeight - this.spacing).toString());
    rect.setAttribute('x', startX.toString());
    rect.setAttribute('y', startY.toString());

    const className = this.calculateRectClassName(
      codeBlockWidth,
      codeBlockMinWidth,
      codeBlockMaxWidth
    );
    rect.setAttribute('class', className);

    return rect;
  }

  private calculateRectClassName(
    blockWidth: number,
    codeBlockMinWidth: number,
    codeBlockMaxWidth: number
  ): string {
    let className: string = '';
    do {
      if (blockWidth === codeBlockMinWidth) {
        className = this.chooseRandomString(['parenthesis', 'space']);
        continue;
      }

      if (blockWidth === codeBlockMaxWidth) {
        className = this.chooseRandomString(['comment', 'function']);
        continue;
      }

      className = this.chooseRandomString([
        'access-modifier',
        'primitive-type',
        'conditional-statement',
        'jump-statement',
        'variable-declaration-const',
        'variable-declaration-let',
      ]);

      continue;
    } while (this.previousClassName === className);
    this.previousClassName = className;
    return className;
  }

  private chooseRandomString(strings: string[]): string {
    const randomIndex = Math.floor(Math.random() * strings.length);
    return strings[randomIndex];
  }

  private randomNumbersWithSum(
    sum: number,
    codeBlockMinWidth: number,
    codeBlockMaxWidth: number,
    monotype: boolean
  ): number[] {
    let availableWidths: number[] = [];
    if (monotype) {
      const numberOfBlocks = Math.floor(sum / codeBlockMinWidth);
      availableWidths = Array.from(Array(numberOfBlocks).keys()).map(
        (m) => m * codeBlockMinWidth
      );
    } else {
      availableWidths = Array.from(Array(sum).keys());
    }

    const numbers: number[] = [];
    let remainingSum = sum;
    while (remainingSum > codeBlockMinWidth) {
      // e.g. if remaining length is 5 and codeBlockMinWidth is 3, then we can only have 2 blocks left
      // leaving us with a 3 and a 2
      // In this case, just add the remaining sum as a block
      // won't be needed if we make all values a multiple of codeBlockMinWidth
      if (remainingSum < codeBlockMinWidth * 2) {
        numbers.push(remainingSum);
        break;
      }

      const randomNumber = this.generateRandomNumber(
        availableWidths,
        codeBlockMinWidth,
        codeBlockMaxWidth
      );

      numbers.push(randomNumber);
      remainingSum -= randomNumber;
    }
    return numbers;
  }

  private generateRandomNumber(
    availableWidths: number[],
    codeBlockMinWidth: number,
    codeBlockMaxWidth: number
  ): number {
    let randomNumber: number;
    do {
      const randomIndex = Math.floor(Math.random() * availableWidths.length);
      randomNumber = availableWidths[randomIndex];
    } while (
      randomNumber < codeBlockMinWidth ||
      randomNumber > codeBlockMaxWidth
    );
    return randomNumber;
  }
}

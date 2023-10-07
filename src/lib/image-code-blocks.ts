import { Column } from './column.js';

export class ImageCodeBlocks {
  private previousClassName: string | undefined = undefined;

  public constructor(
    private blockHeight: number,
    private codeBlockMinWidth: number,
    private codeBlockMaxWidth: number,
    private padding: number
  ) {}

  public create(id: string, image: HTMLImageElement): SVGSVGElement {
    const context = this.createContext(image.width, image.height);
    context.drawImage(image, 0, 0);
    const rowsCount = image.height / this.blockHeight;
    const columnsCount = image.width / this.codeBlockMinWidth;

    const result = this.createSVGRectElements(
      context,
      rowsCount,
      columnsCount,
      this.codeBlockMinWidth,
      this.codeBlockMaxWidth
    );

    const outputSvg = this.createSVGElement(image.width, image.height, id);

    outputSvg.getElementById(`${id}-code-blocks-group`)?.append(...result);

    return outputSvg;
  }

  private createSVGElement(
    width: number,
    height: number,
    id: string
  ): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('xmlns:svg', 'http://www.w3.org/2000/svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const elementNS = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'g'
    );
    elementNS.setAttribute('id', `${id}-code-blocks-group`);
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

  private createSVGRectElements(
    context: CanvasRenderingContext2D,
    rowsCount: number,
    columnsCount: number,
    codeBlockMinWidth: number,
    codeBlockMaxWidth: number
  ): SVGRectElement[] {
    // work through each row
    let startY = 0;

    const svgElements: SVGRectElement[] = [];
    // work through each column
    for (let y = 0; y < rowsCount; y++) {
      // create svg elements
      const svgRowColumnElements = this.createRowColumnSvgElements(
        context,
        columnsCount,
        startY,
        codeBlockMinWidth,
        codeBlockMaxWidth
      );
      svgElements.push(...svgRowColumnElements);

      startY += this.blockHeight;
    }
    return svgElements;
  }

  private createRowColumnSvgElements(
    context: CanvasRenderingContext2D,
    columnsCount: number,
    startY: number,
    codeBlockMinWidth: number,
    codeBlockMaxWidth: number
  ): SVGRectElement[] {
    let columns = this.splitRowIntoColumns(context, columnsCount, startY);

    // merge filled columns next to each other together
    // this allows us to calculate the min and max length to work with
    columns = this.mergeRowColumns(columns);

    // split columns into random length blocks for code effect
    columns = this.splitColumnsIntoRandomLengthColumns(
      columns,
      codeBlockMinWidth,
      codeBlockMaxWidth
    );

    // create svg elements
    const svgRowColumnElements = this.createSvgElements(columns);
    return svgRowColumnElements;
  }

  private splitRowIntoColumns(
    context: CanvasRenderingContext2D,
    columnsCount: number,
    startY: number
  ): Column[] {
    let startX = 0;
    const columns: Column[] = [];
    for (let x = 0; x < columnsCount; x++) {
      const pixelsContainColor = this.areaContainsColour(
        context,
        startX,
        startY,
        this.codeBlockMinWidth,
        this.blockHeight
      );

      columns.push({
        startX,
        startY,
        fill: pixelsContainColor,
        blockWidth: this.codeBlockMinWidth,
      });
      startX += this.codeBlockMinWidth;
    }
    return columns;
  }

  private mergeRowColumns(columns: Column[]): Column[] {
    const mergedColumns: Column[] = [];

    for (let x = 0; x < columns.length; x++) {
      const currentColumn = columns[x];

      if (currentColumn.fill) {
        let nextIndex = x + 1;
        let nextColumn = columns[nextIndex];

        while (
          nextColumn &&
          nextColumn.fill &&
          nextColumn.startX === currentColumn.startX + currentColumn.blockWidth
        ) {
          currentColumn.blockWidth += nextColumn.blockWidth;
          nextIndex++;
          nextColumn = columns[nextIndex];
        }

        mergedColumns.push(currentColumn);
        x = nextIndex - 1;
      } else {
        mergedColumns.push(currentColumn);
      }
    }

    return mergedColumns;
  }

  private splitColumnsIntoRandomLengthColumns(
    columns: Column[],
    codeBlockMinWidth: number,
    codeBlockMaxWidth: number
  ): Column[] {
    const result: Column[] = [];
    for (let x = 0; x < columns.length; x++) {
      const blockWidth = columns[x].blockWidth;
      const newBlockWidths = this.randomNumbersWithSum(
        blockWidth,
        codeBlockMinWidth,
        codeBlockMaxWidth
      );

      let newStartX = columns[x].startX;

      for (let w = 0; w < newBlockWidths.length; w++) {
        const width = newBlockWidths[w];

        const newColumn: Column = {
          fill: true,
          startY: columns[x].startY,
          startX: newStartX,
          blockWidth: width,
        };

        newStartX += width;
        result.push(newColumn);
      }
    }
    return result;
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

  private createSvgElements(columns: Column[]): SVGRectElement[] {
    const rectangles: SVGRectElement[] = [];

    for (let x = 0; x < columns.length; x++) {
      const fill = columns[x].fill;
      if (fill) {
        const rect = this.createRectangle(
          columns[x].startX,
          columns[x].startY,
          columns[x].blockWidth,
          this.blockHeight,
          this.codeBlockMinWidth,
          this.codeBlockMaxWidth
        );
        rectangles.push(rect);
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
    rect.setAttribute('width', (codeBlockWidth - this.padding).toString());
    rect.setAttribute('height', (codeBlockHeight - this.padding).toString());
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
        className = this.chooseRandomString([
          'parenthesis',
          'lambda-expression',
        ]);
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
    codeBlockMaxWidth: number
  ): number[] {
    let availableWidths: number[] = [];

    const numberOfBlocks = Math.floor(sum / codeBlockMinWidth);
    availableWidths = Array.from(Array(numberOfBlocks).keys()).map(
      (m) => m * codeBlockMinWidth
    );
    availableWidths.push(sum - codeBlockMinWidth * numberOfBlocks);

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

export function createImageFromSvg(svg: SVGMarkerElement): HTMLImageElement {
  const svgString = new XMLSerializer().serializeToString(svg);
  const image = new Image();
  image.width = svg.viewBox.baseVal.width;
  image.height = svg.viewBox.baseVal.height;
  image.alt = 'Wales';
  image.src = 'data:image/svg+xml;base64,' + btoa(svgString);
  return image;
}

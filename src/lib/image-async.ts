export function imageOnLoadAsync(
  image: HTMLImageElement
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    image.onload = (): void => {
      resolve(image);
    };
    image.onerror = reject;
  });
}

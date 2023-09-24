export function imageOnLoadAsync(
  image: HTMLImageElement
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    image.onload = () => {
      resolve(image);
    };
    image.onerror = reject;
  });
}

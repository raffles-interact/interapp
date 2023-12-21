import { Buffer } from 'buffer';

interface FileBuffer {
  buffer: Buffer;
  size: number;
  mimetype: string;
}

/***
 * Converts a dataUrl base64 image string into a File byte array
 * dataUrl example:
 * data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIsAAACLCAYAAABRGWr/AAAAAXNSR0IA...etc
 */
export default function dataUrlToBuffer(dataUrl: string): FileBuffer | undefined {
  const arr = dataUrl.split(',');
  if (arr.length < 2) {
    return undefined;
  }
  const mimeArr = arr[0].match(/:(.*?);/);
  if (!mimeArr || mimeArr.length < 2) {
    return undefined;
  }
  const mime = mimeArr[1];
  const buff = Buffer.from(arr[1], 'base64');
  return {
    buffer: buff,
    size: buff.length,
    mimetype: mime,
  };
}

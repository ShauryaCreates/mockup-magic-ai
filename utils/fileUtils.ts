
import { ImageData } from './types';

export const fileToImageData = (file: File): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
        return reject(new Error('File is not an image.'));
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const url = reader.result as string;
      const base64 = url.split(',')[1];
      resolve({
        base64,
        mimeType: file.type,
        url,
      });
    };
    reader.onerror = (error) => reject(error);
  });
};

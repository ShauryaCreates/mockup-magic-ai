
export type AppStep = 'GENERATE' | 'UPLOAD' | 'EDIT';

export interface ImageData {
  base64: string;
  mimeType: string;
  url: string; 
}

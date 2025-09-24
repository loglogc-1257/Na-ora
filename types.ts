export interface ImageFile {
  file: File;
  dataUrl: string;
}

export interface EditedImageResult {
  image: string | null;
  text: string | null;
  originalDataUrl?: string;
}

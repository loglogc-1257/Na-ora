import { ImageFile } from '../types';

/**
 * Parses an aspect ratio string (e.g., "16:9") into a number.
 * @param ratioString - The aspect ratio string.
 * @returns The aspect ratio as a number (width / height).
 */
const parseAspectRatio = (ratioString: string): number => {
  if (!ratioString || ratioString === 'Original') {
    return 0; // Indicates no cropping
  }
  const [width, height] = ratioString.split(':').map(Number);
  if (isNaN(width) || isNaN(height) || height === 0) {
    return 0;
  }
  return width / height;
};

/**
 * Crops an image file to a specific aspect ratio.
 * @param imageFile - The original image file.
 * @param targetRatioString - The target aspect ratio string (e.g., "16:9").
 * @returns A promise that resolves to a new File object representing the cropped image.
 */
export const cropImage = (imageFile: File, targetRatioString: string): Promise<File> => {
  return new Promise((resolve, reject) => {
    const targetAspectRatio = parseAspectRatio(targetRatioString);
    if (targetAspectRatio === 0) {
      // If 'Original' or invalid, return the original file
      resolve(imageFile);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const originalWidth = img.width;
        const originalHeight = img.height;
        const originalAspectRatio = originalWidth / originalHeight;

        let cropWidth, cropHeight, cropX, cropY;

        if (originalAspectRatio > targetAspectRatio) {
          // Original image is wider than target: crop width
          cropHeight = originalHeight;
          cropWidth = cropHeight * targetAspectRatio;
          cropX = (originalWidth - cropWidth) / 2;
          cropY = 0;
        } else {
          // Original image is taller than or same as target: crop height
          cropWidth = originalWidth;
          cropHeight = cropWidth / targetAspectRatio;
          cropY = (originalHeight - cropHeight) / 2;
          cropX = 0;
        }

        const canvas = document.createElement('canvas');
        canvas.width = cropWidth;
        canvas.height = cropHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }

        ctx.drawImage(
          img,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          cropWidth,
          cropHeight
        );

        canvas.toBlob((blob) => {
          if (!blob) {
            return reject(new Error('Canvas toBlob failed'));
          }
          const croppedFile = new File([blob], imageFile.name, {
            type: imageFile.type,
            lastModified: Date.now(),
          });
          resolve(croppedFile);
        }, imageFile.type);
      };
      
      if(e.target?.result && typeof e.target.result === 'string') {
        img.src = e.target.result;
      } else {
        reject(new Error('Could not read image data URL.'));
      }
    };
  });
};

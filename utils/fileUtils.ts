
export const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URI prefix (e.g., "data:image/png;base64,")
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to read file as base64 string.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });

export const dataURLtoFile = (dataUrl: string, filename: string): Promise<File> => {
    return new Promise((resolve, reject) => {
        const arr = dataUrl.split(',');
        if (arr.length < 2) {
            return reject(new Error('Invalid dataURL'));
        }
        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch) {
            return reject(new Error('Could not parse MIME type from dataURL'));
        }
        const mime = mimeMatch[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        resolve(new File([u8arr], filename, {type:mime}));
    });
}

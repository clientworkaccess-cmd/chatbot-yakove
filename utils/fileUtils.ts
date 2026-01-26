
/**
 * Converts a file object to a base64 encoded string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Validates file size and type.
 */
export const validateFile = (file: File, maxSize: number): { isValid: boolean; error?: string } => {
  if (file.size > maxSize) {
    return { isValid: false, error: `File size exceeds the limit of ${maxSize / (1024 * 1024)}MB` };
  }
  return { isValid: true };
};

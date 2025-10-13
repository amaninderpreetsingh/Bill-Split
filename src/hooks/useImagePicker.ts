import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { usePlatform } from './usePlatform';

/**
 * Unified image picker for web and mobile
 * Uses native camera on mobile, file input on web
 */
export function useImagePicker() {
  const { isNative } = usePlatform();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  /**
   * Pick an image from camera or gallery on mobile
   * Returns base64 image string
   */
  const pickImage = async (): Promise<string | null> => {
    try {
      if (isNative) {
        // Mobile: Use native camera
        const photo = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Prompt, // Prompt user: camera or gallery
        });

        if (photo.base64String) {
          const base64Image = `data:image/${photo.format};base64,${photo.base64String}`;
          setImagePreview(base64Image);
          return base64Image;
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      return null;
    }

    return null;
  };

  const clearImage = () => {
    setImagePreview(null);
  };

  return {
    imagePreview,
    pickImage,
    clearImage,
  };
}

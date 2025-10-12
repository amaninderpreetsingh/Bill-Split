import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useToast } from './use-toast';

export function useFileUpload() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const { toast } = useToast();

  const pickImageFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      toast({
        title: 'Permission required',
        description: 'Camera access is needed to scan receipts',
        variant: 'destructive',
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImageUri(null);
  };

  return {
    imageUri,
    pickImageFromCamera,
    pickImageFromGallery,
    removeImage,
    setImageUri,
  };
}

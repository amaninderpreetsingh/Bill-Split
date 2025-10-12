import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { colors, spacing, borderRadius, fontSize } from '../../theme/colors';

interface ReceiptUploaderProps {
  imageUri: string | null;
  onImageSelected: (uri: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export function ReceiptUploader({
  imageUri,
  onImageSelected,
  onAnalyze,
  isAnalyzing,
}: ReceiptUploaderProps) {
  const pickImage = async (useCamera: boolean) => {
    try {
      // Request permissions
      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          `You need to grant ${useCamera ? 'camera' : 'photo library'} permissions to use this feature.`
        );
        return;
      }

      // Launch camera or image picker
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
          });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const removeImage = () => {
    onImageSelected('');
  };

  if (imageUri) {
    return (
      <Card style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
          <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
            <Ionicons name="close-circle" size={32} color={colors.destructive} />
          </TouchableOpacity>
        </View>
        <Button
          title={isAnalyzing ? 'Analyzing...' : 'Analyze Receipt'}
          onPress={onAnalyze}
          disabled={isAnalyzing}
          isLoading={isAnalyzing}
          style={styles.analyzeButton}
        />
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.uploadContainer}>
        <Ionicons name="camera-outline" size={48} color={colors.gray400} />
        <Text style={styles.uploadTitle}>Upload Receipt</Text>
        <Text style={styles.uploadDescription}>
          Take a photo or choose from your gallery
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            title="Take Photo"
            onPress={() => pickImage(true)}
            leftIcon={<Ionicons name="camera" size={20} color={colors.white} />}
            style={styles.actionButton}
          />
          <Button
            title="Choose from Gallery"
            onPress={() => pickImage(false)}
            variant="outline"
            leftIcon={<Ionicons name="images" size={20} color={colors.primary} />}
            style={styles.actionButton}
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  uploadContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  uploadTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.gray900,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  uploadDescription: {
    fontSize: fontSize.sm,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.sm,
  },
  actionButton: {
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.gray100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
  },
  analyzeButton: {
    width: '100%',
  },
});

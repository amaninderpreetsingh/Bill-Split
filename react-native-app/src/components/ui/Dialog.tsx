import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, shadow } from '../../theme/colors';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  style?: any;
}

interface DialogHeaderProps {
  children: React.ReactNode;
}

interface DialogTitleProps {
  children: React.ReactNode;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
    >
      <View style={styles.overlay}>
        {children}
      </View>
    </Modal>
  );
}

export function DialogContent({ children, style }: DialogContentProps) {
  return (
    <View style={[styles.content, style]}>
      <ScrollView style={styles.scrollView}>
        {children}
      </ScrollView>
    </View>
  );
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return (
    <View style={styles.header}>
      {children}
    </View>
  );
}

export function DialogTitle({ children }: DialogTitleProps) {
  return (
    <Text style={styles.title}>
      {children}
    </Text>
  );
}

export function DialogDescription({ children }: DialogDescriptionProps) {
  return (
    <Text style={styles.description}>
      {children}
    </Text>
  );
}

interface DialogTriggerProps {
  children: React.ReactElement;
  onPress: () => void;
}

export function DialogTrigger({ children, onPress }: DialogTriggerProps) {
  return React.cloneElement(children, { onPress });
}

interface DialogCloseProps {
  onClose: () => void;
}

export function DialogClose({ onClose }: DialogCloseProps) {
  return (
    <TouchableOpacity
      onPress={onClose}
      style={styles.closeButton}
    >
      <Ionicons name="close" size={24} color={colors.gray400} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  content: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
    ...shadow.lg,
  },
  scrollView: {
    maxHeight: 384,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.gray900,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.gray600,
    marginTop: spacing.xs,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
});

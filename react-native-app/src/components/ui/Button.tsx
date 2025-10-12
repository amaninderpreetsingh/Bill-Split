import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps, View, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../../theme/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

export function Button({
  title,
  variant = 'default',
  size = 'default',
  isLoading = false,
  leftIcon,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const buttonStyles = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    (disabled || isLoading) && styles.disabled,
    style,
  ];

  const textColor = variant === 'default' ? colors.white : colors.primary;

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'default' ? colors.white : colors.primary} />
      ) : (
        <View style={styles.content}>
          {leftIcon}
          <Text style={[styles.text, { color: textColor }, leftIcon && styles.textWithIcon]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  size_sm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  size_default: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
  },
  size_lg: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  variant_default: {
    backgroundColor: colors.primary,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    fontSize: fontSize.md,
  },
  textWithIcon: {
    marginLeft: spacing.xs,
  },
});

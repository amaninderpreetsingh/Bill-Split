import React from 'react';
import { View, Text, ViewProps, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../../theme/colors';

interface BadgeProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline';
}

export function Badge({ children, variant = 'default', style, ...props }: BadgeProps) {
  const badgeStyle = [styles.badge, styles[`variant_${variant}`], style];
  const textColor =
    variant === 'default' ? colors.white : colors.gray700;

  return (
    <View style={badgeStyle} {...props}>
      <Text style={[styles.text, { color: textColor }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
  },
  variant_default: {
    backgroundColor: colors.primary,
  },
  variant_secondary: {
    backgroundColor: colors.gray200,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
});

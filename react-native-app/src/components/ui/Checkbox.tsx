import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius } from '../../theme/colors';

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Checkbox({ checked, onCheckedChange, disabled = false }: CheckboxProps) {
  const checkboxStyle = [
    styles.checkbox,
    checked ? styles.checked : styles.unchecked,
    disabled && styles.disabled,
  ];

  return (
    <TouchableOpacity
      onPress={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
      style={checkboxStyle}
    >
      {checked && (
        <Ionicons name="checkmark" size={16} color={colors.white} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unchecked: {
    backgroundColor: colors.white,
    borderColor: colors.gray300,
  },
  disabled: {
    opacity: 0.5,
  },
});

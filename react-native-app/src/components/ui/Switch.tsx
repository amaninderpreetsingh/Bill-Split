import React from 'react';
import { Switch as RNSwitch, SwitchProps as RNSwitchProps } from 'react-native';
import { colors } from '../../theme/colors';

interface SwitchProps extends Omit<RNSwitchProps, 'onValueChange'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function Switch({ checked, onCheckedChange, ...props }: SwitchProps) {
  return (
    <RNSwitch
      value={checked}
      onValueChange={onCheckedChange}
      trackColor={{ false: colors.gray200, true: colors.primaryLight }}
      thumbColor={checked ? colors.primary : colors.gray100}
      ios_backgroundColor={colors.gray200}
      {...props}
    />
  );
}

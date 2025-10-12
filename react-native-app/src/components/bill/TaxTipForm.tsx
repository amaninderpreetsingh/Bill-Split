import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BillData } from '../../logic/types/bill.types';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { colors, spacing, fontSize } from '../../theme/colors';

interface TaxTipFormProps {
  billData: BillData | null;
  onUpdate: (tax: number, tip: number) => void;
}

export function TaxTipForm({ billData, onUpdate }: TaxTipFormProps) {
  const [taxText, setTaxText] = useState('');
  const [tipText, setTipText] = useState('');
  const [errors, setErrors] = useState({ tax: '', tip: '' });

  useEffect(() => {
    if (billData) {
      setTaxText(billData.tax > 0 ? billData.tax.toString() : '');
      setTipText(billData.tip > 0 ? billData.tip.toString() : '');
    }
  }, [billData]);

  const validate = (): boolean => {
    const newErrors = { tax: '', tip: '' };
    let isValid = true;

    if (taxText.trim()) {
      const tax = parseFloat(taxText);
      if (isNaN(tax) || tax < 0) {
        newErrors.tax = 'Tax must be a positive number';
        isValid = false;
      }
    }

    if (tipText.trim()) {
      const tip = parseFloat(tipText);
      if (isNaN(tip) || tip < 0) {
        newErrors.tip = 'Tip must be a positive number';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleUpdate = () => {
    if (validate()) {
      const tax = taxText.trim() ? parseFloat(taxText) : 0;
      const tip = tipText.trim() ? parseFloat(tipText) : 0;
      onUpdate(tax, tip);
    }
  };

  if (!billData) {
    return null;
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Tax & Tip</Text>

      <View style={styles.row}>
        <Input
          label="Tax"
          placeholder="0.00"
          value={taxText}
          onChangeText={setTaxText}
          keyboardType="decimal-pad"
          error={errors.tax}
          style={styles.input}
        />

        <Input
          label="Tip"
          placeholder="0.00"
          value={tipText}
          onChangeText={setTipText}
          keyboardType="decimal-pad"
          error={errors.tip}
          style={styles.input}
        />
      </View>

      <Button title="Update" onPress={handleUpdate} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  input: {
    flex: 1,
  },
});

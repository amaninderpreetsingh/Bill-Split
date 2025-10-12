import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { BillItem } from '../../logic/types/bill.types';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { colors, spacing, fontSize } from '../../theme/colors';

interface ItemEditorFormProps {
  item?: BillItem | null;
  onSave: (name: string, price: number) => void;
  onCancel: () => void;
}

export function ItemEditorForm({ item, onSave, onCancel }: ItemEditorFormProps) {
  const [name, setName] = useState('');
  const [priceText, setPriceText] = useState('');
  const [errors, setErrors] = useState({ name: '', price: '' });

  useEffect(() => {
    if (item) {
      setName(item.name);
      setPriceText(item.price.toString());
    } else {
      setName('');
      setPriceText('');
    }
  }, [item]);

  const validate = (): boolean => {
    const newErrors = { name: '', price: '' };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Item name is required';
      isValid = false;
    }

    const price = parseFloat(priceText);
    if (!priceText.trim()) {
      newErrors.price = 'Price is required';
      isValid = false;
    } else if (isNaN(price) || price <= 0) {
      newErrors.price = 'Price must be a positive number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (validate()) {
      const price = parseFloat(priceText);
      onSave(name.trim(), price);
      setName('');
      setPriceText('');
      setErrors({ name: '', price: '' });
    }
  };

  const handleCancel = () => {
    setName('');
    setPriceText('');
    setErrors({ name: '', price: '' });
    onCancel();
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{item ? 'Edit Item' : 'Add New Item'}</Text>

      <Input
        label="Item Name"
        placeholder="e.g., Pizza"
        value={name}
        onChangeText={setName}
        error={errors.name}
      />

      <Input
        label="Price"
        placeholder="0.00"
        value={priceText}
        onChangeText={setPriceText}
        keyboardType="decimal-pad"
        error={errors.price}
      />

      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          onPress={handleCancel}
          variant="outline"
          style={styles.button}
        />
        <Button
          title={item ? 'Save Changes' : 'Add Item'}
          onPress={handleSave}
          style={styles.button}
        />
      </View>
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
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  button: {
    flex: 1,
  },
});

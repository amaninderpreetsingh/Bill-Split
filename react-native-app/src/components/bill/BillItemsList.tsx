import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { BillData, BillItem } from '../../logic/types/bill.types';
import { Person } from '../../logic/types/person.types';
import { ItemAssignment } from '../../logic/types/assignment.types';
import { BillItemCard } from './BillItemCard';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles/BillItemsList.styles';

interface BillItemsListProps {
  billData: BillData | null;
  people: Person[];
  itemAssignments: ItemAssignment;
  onAssignmentToggle: (itemId: string, personId: string) => void;
  onEditItem?: (item: BillItem) => void;
  onDeleteItem?: (itemId: string) => void;
  onAddItem?: () => void;
}

export function BillItemsList({
  billData,
  people,
  itemAssignments,
  onAssignmentToggle,
  onEditItem,
  onDeleteItem,
  onAddItem,
}: BillItemsListProps) {
  if (!billData || billData.items.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Ionicons name="receipt-outline" size={64} color={colors.gray300} />
        <Text style={styles.emptyTitle}>No Items Yet</Text>
        <Text style={styles.emptyDescription}>
          Upload a receipt or manually add items to get started
        </Text>
        {onAddItem && (
          <Button
            title="Add Item"
            onPress={onAddItem}
            leftIcon={<Ionicons name="add" size={20} color={colors.white} />}
            style={styles.addButton}
          />
        )}
      </Card>
    );
  }

  const getAssignedPeople = (itemId: string): Person[] => {
    const assignment = itemAssignments[itemId];
    if (!assignment || assignment.assignedTo.length === 0) return [];
    return people.filter((p) => assignment.assignedTo.includes(p.id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bill Items</Text>
        {onAddItem && (
          <Button
            title="Add Item"
            onPress={onAddItem}
            size="sm"
            leftIcon={<Ionicons name="add" size={18} color={colors.white} />}
          />
        )}
      </View>

      <FlatList
        data={billData.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BillItemCard
            item={item}
            assignedPeople={getAssignedPeople(item.id)}
            allPeople={people}
            onAssignmentToggle={onAssignmentToggle}
            onEdit={onEditItem}
            onDelete={onDeleteItem}
          />
        )}
        scrollEnabled={false}
        ListFooterComponent={
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Bill Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>${billData.subtotal.toFixed(2)}</Text>
            </View>
            {billData.tax > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax:</Text>
                <Text style={styles.summaryValue}>${billData.tax.toFixed(2)}</Text>
              </View>
            )}
            {billData.tip > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tip:</Text>
                <Text style={styles.summaryValue}>${billData.tip.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${billData.total.toFixed(2)}</Text>
            </View>
          </Card>
        }
      />
    </View>
  );
}

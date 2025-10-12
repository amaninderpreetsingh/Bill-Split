import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BillItem } from '../../logic/types/bill.types';
import { Person } from '../../logic/types/person.types';
import { Card } from '../ui/Card';
import { colors, spacing, borderRadius, fontSize } from '../../theme/colors';

interface BillItemCardProps {
  item: BillItem;
  assignedPeople: Person[];
  allPeople: Person[];
  onAssignmentToggle: (itemId: string, personId: string) => void;
  onEdit?: (item: BillItem) => void;
  onDelete?: (itemId: string) => void;
}

export function BillItemCard({
  item,
  assignedPeople,
  allPeople,
  onAssignmentToggle,
  onEdit,
  onDelete,
}: BillItemCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        </View>
        {(onEdit || onDelete) && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}>
                <Ionicons name="pencil" size={18} color={colors.gray600} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionButton}>
                <Ionicons name="trash-outline" size={18} color={colors.destructive} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.peopleContainer}>
        <Text style={styles.label}>Assigned to:</Text>
        <View style={styles.badgeContainer}>
          {allPeople.length === 0 ? (
            <Text style={styles.emptyText}>Add people to assign items</Text>
          ) : (
            allPeople.map((person) => {
              const isAssigned = assignedPeople.some((p) => p.id === person.id);
              return (
                <TouchableOpacity
                  key={person.id}
                  style={[
                    styles.badge,
                    isAssigned ? styles.badgeActive : styles.badgeInactive,
                  ]}
                  onPress={() => onAssignmentToggle(item.id, person.id)}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      isAssigned ? styles.badgeTextActive : styles.badgeTextInactive,
                    ]}
                  >
                    {person.name}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </View>

      {assignedPeople.length > 1 && (
        <View style={styles.splitInfo}>
          <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
          <Text style={styles.splitText}>
            Split {assignedPeople.length} ways (${(item.price / assignedPeople.length).toFixed(2)} each)
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.xs / 2,
  },
  itemPrice: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.xs,
  },
  peopleContainer: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.gray700,
    marginBottom: spacing.xs,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  badgeInactive: {
    backgroundColor: colors.white,
    borderColor: colors.gray300,
  },
  badgeText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  badgeTextActive: {
    color: colors.white,
  },
  badgeTextInactive: {
    color: colors.gray700,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.gray500,
    fontStyle: 'italic',
  },
  splitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight + '20',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  splitText: {
    fontSize: fontSize.sm,
    color: colors.primary,
  },
});

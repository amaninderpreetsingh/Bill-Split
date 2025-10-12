import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Group } from '../../logic/types/group.types';
import { Card } from '../ui/Card';
import { colors, spacing, fontSize, borderRadius } from '../../theme/colors';
import { formatDistanceToNow } from 'date-fns';

interface GroupCardProps {
  group: Group;
  onPress: () => void;
}

export function GroupCard({ group, onPress }: GroupCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.name}>{group.name}</Text>
        </View>

        {group.description ? (
          <Text style={styles.description}>{group.description}</Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.stat}>
            <Ionicons name="people" size={16} color={colors.gray600} />
            <Text style={styles.statText}>
              {group.memberIds.length} {group.memberIds.length === 1 ? 'member' : 'members'}
            </Text>
          </View>

          <View style={styles.stat}>
            <Ionicons name="time-outline" size={16} color={colors.gray600} />
            <Text style={styles.statText}>
              {formatDistanceToNow(group.updatedAt, { addSuffix: true })}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.gray900,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.gray600,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: fontSize.sm,
    color: colors.gray600,
  },
});

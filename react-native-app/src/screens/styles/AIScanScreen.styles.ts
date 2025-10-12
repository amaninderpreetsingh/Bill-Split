import { StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  hero: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.xs,
    color: colors.gray900,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.gray600,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.lg,
    padding: spacing.xs / 2,
  },
  tabButton: {
    flex: 1,
  },
  placeholderText: {
    textAlign: 'center',
    color: colors.gray600,
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  addFirstButton: {
    marginTop: spacing.sm,
  },
  featuresContainer: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  featureCard: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.primary}19`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.gray900,
  },
  featureDescription: {
    fontSize: fontSize.md,
    color: colors.gray600,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.gray600,
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.gray900,
    marginBottom: spacing.lg,
  },
  backButton: {
    marginTop: spacing.md,
  },
  backButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  backText: {
    fontSize: fontSize.md,
    color: colors.gray700,
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
  placeholderCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
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
});

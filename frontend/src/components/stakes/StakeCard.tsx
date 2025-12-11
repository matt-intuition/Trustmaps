import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, borderRadius, shadows, textStyles, typography } from '../../utils/theme';

interface StakeCardProps {
  targetName: string;
  targetType: 'list' | 'creator';
  amount: number;
  earnedRevenue: number;
  apr?: number;
  onPress?: () => void;
  onUnstake?: () => void;
}

export const StakeCard: React.FC<StakeCardProps> = ({
  targetName,
  targetType,
  amount,
  earnedRevenue,
  apr,
  onPress,
  onUnstake,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      accessibilityLabel={`Stake on ${targetName}`}
      accessibilityRole="button"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.targetName} numberOfLines={1}>
            {targetName}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {targetType === 'list' ? 'List' : 'Creator'}
            </Text>
          </View>
        </View>

        {apr !== undefined && (
          <View style={styles.aprContainer}>
            <Text style={styles.aprValue}>{apr.toFixed(1)}%</Text>
            <Text style={styles.aprLabel}>APR</Text>
          </View>
        )}
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Staked</Text>
          <Text style={styles.statValue}>{amount} TRUST</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Earned</Text>
          <Text style={[styles.statValue, styles.earnedValue]}>
            {earnedRevenue.toFixed(2)} TRUST
          </Text>
        </View>
      </View>

      {/* Action Button */}
      {onUnstake && (
        <Pressable
          style={({ pressed }) => [
            styles.unstakeButton,
            pressed && styles.unstakeButtonPressed,
          ]}
          onPress={(e) => {
            e.stopPropagation();
            onUnstake();
          }}
          accessibilityLabel="Unstake"
          accessibilityRole="button"
        >
          <Text style={styles.unstakeButtonText}>Unstake</Text>
        </Pressable>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing[4],
    gap: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardPressed: {
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  headerLeft: {
    flex: 1,
    gap: spacing[2],
  },
  targetName: {
    ...textStyles.h4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent[50],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.medium,
    color: colors.accent[700],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aprContainer: {
    alignItems: 'flex-end',
  },
  aprValue: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.bold,
    color: colors.success,
    lineHeight: typography.sizes.xl * 1.2,
  },
  aprLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing[4],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  statItem: {
    flex: 1,
    gap: spacing[1],
  },
  statLabel: {
    ...textStyles.label,
    color: colors.text.tertiary,
  },
  statValue: {
    ...textStyles.h4,
    fontFamily: typography.fonts.semibold,
  },
  earnedValue: {
    color: colors.success,
  },
  unstakeButton: {
    minHeight: 44, // Accessibility minimum
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  unstakeButtonPressed: {
    backgroundColor: colors.neutral[200],
  },
  unstakeButtonText: {
    ...textStyles.button,
    color: colors.text.primary,
  },
});

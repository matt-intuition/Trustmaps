import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '../../utils/theme';

interface BadgeProps {
  label: string;
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'error' | 'rating';
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  /** Score (for rating variant only) */
  score?: number;
  /** Dot color (for rating variant only) */
  dotColor?: 'success' | 'warning' | 'error';
}

export function Badge({
  label,
  variant = 'neutral',
  icon,
  style,
  score,
  dotColor = 'success',
}: BadgeProps) {
  // Variant colors: background (50 shade) + text (700 shade for light mode)
  const getVariantStyles = () => {
    switch (variant) {
      case 'neutral':
        return {
          backgroundColor: colors.neutral[100], // Light gray
          color: colors.neutral[700], // Dark gray text
        };

      case 'accent':
        return {
          backgroundColor: colors.accent[50], // Lightest indigo
          color: colors.accent[700], // Dark indigo text
        };

      case 'success':
        return {
          backgroundColor: '#D1FAE5', // Light green (success.50)
          color: '#047857', // Dark green text (success.700)
        };

      case 'warning':
        return {
          backgroundColor: '#FEF3C7', // Light amber (warning.50)
          color: '#B45309', // Dark amber text (warning.700)
        };

      case 'error':
        return {
          backgroundColor: '#FEE2E2', // Light red (error.50)
          color: '#B91C1C', // Dark red text (error.700)
        };

      case 'rating':
        return {
          backgroundColor: colors.neutral[0], // White background
          color: colors.neutral[700], // Dark gray text
        };

      default:
        return {
          backgroundColor: colors.neutral[100],
          color: colors.neutral[700],
        };
    }
  };

  const getDotColor = () => {
    switch (dotColor) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      default:
        return colors.success;
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: variantStyles.backgroundColor },
        variant === 'rating' && styles.ratingBadge,
        style,
      ]}
    >
      {/* Colored dot for rating variant */}
      {variant === 'rating' && (
        <View
          style={[
            styles.dot,
            { backgroundColor: getDotColor() },
          ]}
        />
      )}

      {/* Icon for other variants */}
      {variant !== 'rating' && icon && (
        <Ionicons
          name={icon}
          size={12}
          color={variantStyles.color}
          style={styles.icon}
        />
      )}

      {/* Score (for rating variant) */}
      {variant === 'rating' && score !== undefined && (
        <Text style={[styles.score, { color: variantStyles.color }]}>
          {score.toFixed(2)}
        </Text>
      )}

      {/* Label */}
      <Text style={[styles.text, { color: variantStyles.color }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    paddingHorizontal: spacing[2], // 8px horizontal padding
    borderRadius: borderRadius.full, // Pill shape (9999)
    alignSelf: 'flex-start', // Don't stretch full width
  },
  ratingBadge: {
    borderWidth: 1,
    borderColor: colors.neutral[200],
    paddingHorizontal: spacing[3], // More padding for rating variant
  },
  icon: {
    marginRight: spacing[1], // 4px between icon and text
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing[2], // 8px between dot and score
  },
  score: {
    fontFamily: typography.fonts.bold, // Bold for score
    fontSize: typography.sizes.xs, // 12px
    lineHeight: typography.sizes.xs * typography.lineHeights.normal, // 18px
    marginRight: spacing[1], // 4px between score and label
  },
  text: {
    fontFamily: typography.fonts.medium, // Inter_500Medium
    fontSize: typography.sizes.xs, // 12px
    lineHeight: typography.sizes.xs * typography.lineHeights.normal, // 18px
  },
});

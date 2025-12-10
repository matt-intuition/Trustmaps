import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '../../utils/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'flat' | 'elevated' | 'interactive';
  padding?: keyof typeof spacing;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({
  children,
  variant = 'elevated',
  padding = 4, // Default: spacing[4] = 16px
  onPress,
  style,
}: CardProps) {
  // Variant styles for different card types
  const getVariantStyles = (pressed?: boolean) => {
    switch (variant) {
      case 'flat':
        // Flat: No shadow, border only
        return {
          ...shadows.none,
          borderWidth: 1,
          borderColor: colors.neutral[200],
        };

      case 'elevated':
        // Elevated: Subtle shadow (shadows.sm)
        return {
          ...shadows.sm,
          borderWidth: 1,
          borderColor: colors.neutral[200],
        };

      case 'interactive':
        // Interactive: Hover effect + cursor pointer
        if (pressed) {
          return {
            ...shadows.sm, // Shadow reduces on press
            borderWidth: 1,
            borderColor: colors.accent[200],
            transform: [{ scale: 0.98 }], // Slight scale down
          };
        }
        return {
          ...shadows.base, // Elevated shadow on hover
          borderWidth: 1,
          borderColor: colors.neutral[200],
        };

      default:
        return {
          ...shadows.sm,
          borderWidth: 1,
          borderColor: colors.neutral[200],
        };
    }
  };

  // If interactive variant or onPress provided, wrap in Pressable
  if (variant === 'interactive' || onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          { padding: spacing[padding] },
          getVariantStyles(pressed),
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  // Otherwise, render as static View
  return (
    <View
      style={[
        styles.card,
        { padding: spacing[padding] },
        getVariantStyles(),
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, // White (#FFFFFF)
    borderRadius: borderRadius.md, // 12px
    overflow: 'hidden', // Clip content to border radius
  },
});

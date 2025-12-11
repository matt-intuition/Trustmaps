/**
 * CategoryChip Component
 *
 * Pill-shaped filter chip with colored icon (inspired by SuppCo category filters).
 * Active state: filled background, white text. Inactive: outline, neutral text.
 *
 * Use for:
 * - Category filters (All, Food, Travel, Nightlife, etc.)
 * - Tag filters
 * - Multi-select options
 */

import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';

export interface CategoryChipProps {
  /** Label text */
  label: string;
  /** Icon name */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Icon color (default: neutral) */
  iconColor?: string;
  /** Active state */
  active?: boolean;
  /** Press handler */
  onPress: () => void;
  /** Custom style */
  style?: ViewStyle;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  icon,
  iconColor = colors.neutral[600],
  active = false,
  onPress,
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active ? styles.chipActive : styles.chipInactive,
        pressed && styles.chipPressed,
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={14}
          color={active ? colors.neutral[0] : iconColor}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.label,
          active ? styles.labelActive : styles.labelInactive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: spacing[4], // 16px horizontal padding
    borderRadius: borderRadius.full, // Full pill shape
    borderWidth: 1,
  },
  chipInactive: {
    backgroundColor: colors.neutral[0], // White background
    borderColor: colors.neutral[300], // Light gray border
  },
  chipActive: {
    backgroundColor: colors.accent[500], // Indigo filled
    borderColor: colors.accent[500], // Indigo border
  },
  chipPressed: {
    opacity: 0.8,
  },
  icon: {
    marginRight: spacing[2], // 8px between icon and text
  },
  label: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm, // 14px
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  labelInactive: {
    color: colors.text.secondary,
  },
  labelActive: {
    color: colors.neutral[0], // White text
  },
});

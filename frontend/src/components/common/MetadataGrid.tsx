/**
 * MetadataGrid Component
 *
 * Displays key information in a scannable grid format (inspired by SuppCo's product metadata).
 * Automatically responsive: 2 columns on mobile, 4 columns on tablet+.
 *
 * Use for:
 * - List details (places count, sales, stakers, price)
 * - Place details (servings, price per serving, format)
 * - User stats (TRUST, Staked, Followers, Following)
 */

import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../utils/theme';

export interface MetadataItem {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
}

export interface MetadataGridProps {
  /** Array of metadata items to display */
  items: MetadataItem[];
  /** Number of columns (default: responsive 2/4) */
  columns?: number;
  /** Compact mode with smaller spacing */
  compact?: boolean;
}

export const MetadataGrid: React.FC<MetadataGridProps> = ({
  items,
  columns,
  compact = false,
}) => {
  const { width } = useWindowDimensions();

  // Responsive column count (2 on mobile, 4 on tablet+)
  const columnCount = columns || (width >= 768 ? 4 : 2);

  return (
    <View style={[styles.grid, { gap: compact ? spacing[2] : spacing[3] }]}>
      {items.map((item, index) => (
        <View
          key={index}
          style={[
            styles.item,
            {
              width: `${100 / columnCount - 2}%`, // Account for gap
              paddingVertical: compact ? spacing[2] : spacing[3],
            },
          ]}
        >
          {item.icon && (
            <Ionicons
              name={item.icon}
              size={14}
              color={colors.text.tertiary}
              style={styles.icon}
            />
          )}
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  item: {
    alignItems: 'flex-start',
  },
  icon: {
    marginBottom: spacing[1],
  },
  label: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    lineHeight: typography.sizes.xs * typography.lineHeights.normal,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[1],
  },
  value: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.sm,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
    color: colors.text.primary,
  },
});

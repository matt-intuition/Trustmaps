import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../utils/theme';

interface Stat {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
}

interface ListStatsBarProps {
  stats: Stat[];
  compact?: boolean; // More compact spacing for smaller cards
  style?: any;
}

export function ListStatsBar({ stats, compact = false, style }: ListStatsBarProps) {
  return (
    <View style={[styles.container, compact && styles.compact, style]}>
      {stats.map((stat, index) => (
        <View key={index} style={styles.stat}>
          <Ionicons
            name={stat.icon}
            size={compact ? 12 : 14}
            color={colors.neutral[500]}
            style={styles.icon}
          />
          <Text
            style={[
              styles.statText,
              compact && styles.statTextCompact,
            ]}
            numberOfLines={1}
          >
            {stat.value} {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing[3], // 12px between stats
  },
  compact: {
    gap: spacing[2], // 8px for compact mode
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing[1], // 4px between icon and text
  },
  statText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm, // 14px
    color: colors.text.secondary, // neutral.600
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  statTextCompact: {
    fontSize: typography.sizes.xs, // 12px for compact
  },
});

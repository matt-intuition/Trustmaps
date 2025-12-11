/**
 * TabBar Component
 *
 * Horizontal tab navigation with animated underline indicator.
 * Perfect for detail screens (Overview/Reviews/Map, Products/Schedule/Nutrients, etc.)
 *
 * Use for:
 * - List detail screens
 * - Profile sections
 * - Settings categories
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { colors, typography, spacing } from '../../utils/theme';

export interface Tab {
  label: string;
  value: string;
}

export interface TabBarProps {
  /** Array of tabs */
  tabs: Tab[];
  /** Currently active tab value */
  activeTab: string;
  /** Change handler */
  onChange: (tabValue: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onChange,
}) => {
  const activeIndex = tabs.findIndex((tab) => tab.value === activeTab);

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {tabs.map((tab, index) => {
          const isActive = tab.value === activeTab;

          return (
            <Pressable
              key={tab.value}
              onPress={() => onChange(tab.value)}
              style={({ pressed }) => [
                styles.tab,
                pressed && styles.tabPressed,
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Animated underline indicator */}
      <View style={styles.indicatorContainer}>
        <View
          style={[
            styles.indicator,
            {
              width: `${100 / tabs.length}%`,
              transform: [{ translateX: activeIndex * (100 / tabs.length) }],
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[4], // 16px vertical
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPressed: {
    opacity: 0.7,
  },
  tabLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm, // 14px
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
    color: colors.text.tertiary,
  },
  tabLabelActive: {
    color: colors.accent[500],
    fontFamily: typography.fonts.semibold,
  },
  indicatorContainer: {
    height: 2,
    width: '100%',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    height: 2,
    backgroundColor: colors.accent[500],
  },
});

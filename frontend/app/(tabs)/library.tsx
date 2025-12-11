import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../src/utils/theme';

/**
 * Library Screen - 3-Tab Structure
 *
 * Tabs:
 * 1. My Lists - Lists created by the user (full edit control)
 * 2. Saved Lists - Free lists the user has bookmarked (read-only)
 * 3. Purchased Lists - Paid lists the user has bought (read-only)
 *
 * Design: Clean tab navigation with underline indicator
 */

type TabType = 'my-lists' | 'saved' | 'purchased';

interface TabConfig {
  key: TabType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabConfig[] = [
  { key: 'my-lists', label: 'My Lists', icon: 'create' },
  { key: 'saved', label: 'Saved', icon: 'heart' },
  { key: 'purchased', label: 'Purchased', icon: 'cart' },
];

export default function LibraryScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('my-lists');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'my-lists':
        return (
          <View style={styles.emptyState}>
            <Ionicons name="create-outline" size={64} color={colors.neutral[400]} />
            <Text style={styles.emptyTitle}>No lists yet</Text>
            <Text style={styles.emptyDescription}>
              Create your first list to share your favorite places with others
            </Text>
          </View>
        );
      case 'saved':
        return (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color={colors.neutral[400]} />
            <Text style={styles.emptyTitle}>No saved lists</Text>
            <Text style={styles.emptyDescription}>
              Save free lists from the marketplace to access them quickly
            </Text>
          </View>
        );
      case 'purchased':
        return (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={64} color={colors.neutral[400]} />
            <Text style={styles.emptyTitle}>No purchases yet</Text>
            <Text style={styles.emptyDescription}>
              Purchase premium lists from the marketplace to unlock all places
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={isActive ? colors.accent[500] : colors.neutral[500]}
                style={styles.tabIcon}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.tabIndicator} />}
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing[6], // 24px
    paddingVertical: spacing[4], // 16px
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes['2xl'], // 24px
    color: colors.text.primary,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    backgroundColor: colors.surface,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3], // 12px
    position: 'relative',
  },
  tabActive: {
    // Active state handled by indicator and text color
  },
  tabIcon: {
    marginRight: spacing[1], // 4px
  },
  tabLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm, // 14px
    color: colors.neutral[500],
  },
  tabLabelActive: {
    color: colors.accent[500],
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.accent[500],
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6], // 24px
    paddingVertical: spacing[12], // 48px
  },
  emptyTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.lg, // 18px
    color: colors.text.primary,
    marginTop: spacing[4], // 16px
    marginBottom: spacing[2], // 8px
    textAlign: 'center',
  },
  emptyDescription: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.base, // 16px
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
});

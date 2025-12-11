import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius, shadows } from '../../src/utils/theme';
import { apiClient } from '../../src/api/client';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';

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

interface LibraryList {
  id: string;
  title: string;
  description?: string | null;
  city?: string | null;
  category?: string | null;
  isFree: boolean;
  price?: number | null;
  placeCount: number;
  isPublic: boolean;
  createdAt: string;
}

const TABS: TabConfig[] = [
  { key: 'my-lists', label: 'My Lists', icon: 'create' },
  { key: 'saved', label: 'Saved', icon: 'heart' },
  { key: 'purchased', label: 'Purchased', icon: 'cart' },
];

export default function LibraryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('my-lists');
  const [myLists, setMyLists] = useState<LibraryList[]>([]);
  const [savedLists, setSavedLists] = useState<LibraryList[]>([]);
  const [purchasedLists, setPurchasedLists] = useState<LibraryList[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data based on active tab
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);

      switch (activeTab) {
        case 'my-lists':
          const myListsResponse = await apiClient.get('/lists');
          setMyLists(myListsResponse.lists || []);
          break;
        case 'saved':
          const savedResponse = await apiClient.get('/lists/saved');
          setSavedLists(savedResponse.lists || []);
          break;
        case 'purchased':
          const purchasedResponse = await apiClient.get('/lists/purchased');
          setPurchasedLists(purchasedResponse.lists || []);
          break;
      }
    } catch (error) {
      console.error('Error fetching library data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleListPress = (listId: string) => {
    router.push(`/list/${listId}` as any);
  };

  const renderListItem = (list: LibraryList) => (
    <Card
      key={list.id}
      variant="interactive"
      padding={4}
      style={styles.listCard}
      onPress={() => handleListPress(list.id)}
    >
      <View style={styles.listHeader}>
        <Text style={styles.listTitle} numberOfLines={2}>
          {list.title}
        </Text>
        {list.isFree ? (
          <Badge label="FREE" variant="success" size="sm" />
        ) : (
          <Badge label={`${list.price || 0} TRUST`} variant="accent" size="sm" />
        )}
      </View>

      {list.description && (
        <Text style={styles.listDescription} numberOfLines={2}>
          {list.description}
        </Text>
      )}

      <View style={styles.listMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="location" size={14} color={colors.text.tertiary} />
          <Text style={styles.metaText}>{list.placeCount} places</Text>
        </View>
        {list.city && (
          <View style={styles.metaItem}>
            <Ionicons name="map" size={14} color={colors.text.tertiary} />
            <Text style={styles.metaText}>{list.city}</Text>
          </View>
        )}
        {list.category && (
          <View style={styles.metaItem}>
            <Ionicons name="pricetag" size={14} color={colors.text.tertiary} />
            <Text style={styles.metaText}>{list.category}</Text>
          </View>
        )}
      </View>
    </Card>
  );

  const renderEmptyState = (icon: keyof typeof Ionicons.glyphMap, title: string, description: string) => (
    <View style={styles.emptyState}>
      <Ionicons name={icon} size={64} color={colors.neutral[400]} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );

  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent[500]} />
        </View>
      );
    }

    let lists: LibraryList[] = [];
    let emptyIcon: keyof typeof Ionicons.glyphMap = 'create-outline';
    let emptyTitle = '';
    let emptyDescription = '';

    switch (activeTab) {
      case 'my-lists':
        lists = myLists;
        emptyIcon = 'create-outline';
        emptyTitle = 'No lists yet';
        emptyDescription = 'Create your first list to share your favorite places with others';
        break;
      case 'saved':
        lists = savedLists;
        emptyIcon = 'heart-outline';
        emptyTitle = 'No saved lists';
        emptyDescription = 'Save free lists from the marketplace to access them quickly';
        break;
      case 'purchased':
        lists = purchasedLists;
        emptyIcon = 'cart-outline';
        emptyTitle = 'No purchases yet';
        emptyDescription = 'Purchase premium lists from the marketplace to unlock all places';
        break;
    }

    if (lists.length === 0) {
      return renderEmptyState(emptyIcon, emptyTitle, emptyDescription);
    }

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: spacing[6],
          paddingBottom: 100, // Space for bottom tab bar
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {lists.map((list) => renderListItem(list))}
      </ScrollView>
    );
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

      {/* Content - ScrollView directly without wrapping View */}
      {renderTabContent()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[12],
  },
  listCard: {
    marginBottom: spacing[4],
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
    gap: spacing[2],
  },
  listTitle: {
    flex: 1,
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    lineHeight: typography.sizes.lg * 1.3,
  },
  listDescription: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * 1.5,
    marginBottom: spacing[3],
  },
  listMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  metaText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
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

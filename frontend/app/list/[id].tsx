import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/utils/theme';
import TabBar from '../../src/components/common/TabBar';
import Avatar from '../../src/components/common/Avatar';
import Badge from '../../src/components/common/Badge';
import MetadataGrid from '../../src/components/common/MetadataGrid';
import Button from '../../src/components/common/Button';
import { apiClient } from '../../src/api/client';

type TabType = 'overview' | 'places' | 'reviews';

interface Place {
  id: string;
  name: string;
  address: string;
  category?: string;
}

interface ListDetail {
  id: string;
  title: string;
  description?: string;
  category?: string;
  isFree: boolean;
  price?: number;
  placeCount: number;
  trustRank: number;
  averageRating?: number;
  totalStaked: number;
  totalSales: number;
  creator: {
    id: string;
    username: string;
    displayName: string;
    profileImage?: string;
    creatorReputation: number;
  };
  places: Array<{
    id: string;
    place: Place;
    order: number;
    notes?: string;
  }>;
  _count: {
    purchases: number;
    stakes: number;
  };
}

interface ListMeta {
  isOwner: boolean;
  hasAccess: boolean;
  isSaved: boolean;
  totalPlaces: number;
  previewPlaces: number;
}

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [list, setList] = useState<ListDetail | null>(null);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchListDetail();
  }, [id]);

  const fetchListDetail = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/lists/${id}`);
      setList(response.data.list);
      setMeta(response.data.meta);
    } catch (error: any) {
      console.error('Error fetching list:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load list');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!list || !meta) return;

    try {
      setActionLoading(true);
      if (meta.isSaved) {
        await apiClient.delete(`/api/lists/${id}/save`);
        setMeta({ ...meta, isSaved: false });
        Alert.alert('Success', 'List removed from saved');
      } else {
        await apiClient.post(`/api/lists/${id}/save`);
        setMeta({ ...meta, isSaved: true });
        Alert.alert('Success', 'List saved successfully');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save list');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!list) return;

    Alert.alert(
      'Purchase List',
      `Purchase "${list.title}" for ${list.price} TRUST tokens?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: async () => {
            try {
              setActionLoading(true);
              const response = await apiClient.post(`/api/lists/${id}/purchase`);
              Alert.alert('Success', 'List purchased successfully!');
              fetchListDetail(); // Refresh to show full content
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Purchase failed');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderOverviewTab = () => {
    if (!list) return null;

    return (
      <View style={styles.tabContent}>
        {/* Creator Info */}
        <View style={styles.creatorSection}>
          <Avatar
            name={list.creator.displayName}
            imageUrl={list.creator.profileImage}
            size="lg"
          />
          <View style={styles.creatorInfo}>
            <Text style={styles.creatorName}>{list.creator.displayName}</Text>
            <Text style={styles.creatorUsername}>@{list.creator.username}</Text>
            <Badge variant="accent" size="sm" style={styles.repBadge}>
              <Ionicons name="star" size={12} color={colors.accent[700]} />
              <Text> Rep: {list.creator.creatorReputation.toFixed(1)}</Text>
            </Badge>
          </View>
        </View>

        {/* Description */}
        {list.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{list.description}</Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stats</Text>
          <MetadataGrid
            items={[
              { label: 'Places', value: meta?.totalPlaces.toString() || '0', icon: 'location' },
              { label: 'Sales', value: list.totalSales.toString(), icon: 'cart' },
              { label: 'Stakers', value: list._count.stakes.toString(), icon: 'people' },
              { label: 'Trust Rank', value: list.trustRank.toFixed(1), icon: 'trending-up' },
            ]}
          />
        </View>

        {/* Actions */}
        {meta && !meta.isOwner && (
          <View style={styles.actionsSection}>
            {list.isFree ? (
              <Button
                onPress={handleSave}
                variant={meta.isSaved ? 'secondary' : 'primary'}
                loading={actionLoading}
                style={styles.actionButton}
              >
                <Ionicons
                  name={meta.isSaved ? 'heart' : 'heart-outline'}
                  size={20}
                  color={colors.surface}
                />
                <Text style={styles.buttonText}>
                  {meta.isSaved ? 'Saved' : 'Save List'}
                </Text>
              </Button>
            ) : !meta.hasAccess ? (
              <Button
                onPress={handlePurchase}
                variant="primary"
                loading={actionLoading}
                style={styles.actionButton}
              >
                <Ionicons name="cart" size={20} color={colors.surface} />
                <Text style={styles.buttonText}>Purchase for {list.price} TRUST</Text>
              </Button>
            ) : null}
          </View>
        )}

        {meta?.isOwner && (
          <Button
            onPress={() => router.push(`/list/${id}/edit` as any)}
            variant="outline"
            style={styles.actionButton}
          >
            <Ionicons name="pencil" size={20} color={colors.accent[500]} />
            <Text style={styles.editButtonText}>Edit List</Text>
          </Button>
        )}
      </View>
    );
  };

  const renderPlacesTab = () => {
    if (!list || !meta) return null;

    const showLock = !meta.hasAccess && !list.isFree;
    const places = list.places;

    return (
      <View style={styles.tabContent}>
        {places.map((listPlace, index) => (
          <View key={listPlace.id} style={styles.placeCard}>
            <View style={styles.placeHeader}>
              <View style={styles.placeNumber}>
                <Text style={styles.placeNumberText}>{listPlace.order}</Text>
              </View>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>{listPlace.place.name}</Text>
                <Text style={styles.placeAddress}>{listPlace.place.address}</Text>
                {listPlace.place.category && (
                  <Badge variant="neutral" size="sm" style={styles.categoryBadge}>
                    {listPlace.place.category}
                  </Badge>
                )}
                {listPlace.notes && (
                  <Text style={styles.placeNotes}>"{listPlace.notes}"</Text>
                )}
              </View>
            </View>
          </View>
        ))}

        {showLock && meta.totalPlaces > meta.previewPlaces && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={64} color={colors.neutral[400]} />
            <Text style={styles.lockTitle}>
              {meta.totalPlaces - meta.previewPlaces} more places locked
            </Text>
            <Text style={styles.lockDescription}>
              Purchase this list for {list.price} TRUST tokens to unlock all places
            </Text>
            <Button onPress={handlePurchase} variant="primary" loading={actionLoading}>
              <Ionicons name="cart" size={20} color={colors.surface} />
              <Text style={styles.buttonText}>Purchase for {list.price} TRUST</Text>
            </Button>
          </View>
        )}
      </View>
    );
  };

  const renderReviewsTab = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={64} color={colors.neutral[400]} />
          <Text style={styles.emptyTitle}>No reviews yet</Text>
          <Text style={styles.emptyDescription}>
            Be the first to review this list
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent[500]} />
        </View>
      </SafeAreaView>
    );
  }

  if (!list || !meta) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>List not found</Text>
          <Button onPress={() => router.back()} variant="outline">
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {list.title}
          </Text>
          {list.isFree ? (
            <Badge variant="success" size="sm">FREE</Badge>
          ) : (
            <Badge variant="accent" size="sm">{list.price} TRUST</Badge>
          )}
        </View>
      </View>

      {/* Tab Bar */}
      <TabBar
        tabs={[
          { key: 'overview', label: 'Overview' },
          { key: 'places', label: 'Places' },
          { key: 'reviews', label: 'Reviews' },
        ]}
        activeTab={activeTab}
        onChange={(key) => setActiveTab(key as TabType)}
      />

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'places' && renderPlacesTab()}
        {activeTab === 'reviews' && renderReviewsTab()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  errorText: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: spacing[2],
    marginRight: spacing[2],
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  headerTitle: {
    flex: 1,
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing[8],
  },
  tabContent: {
    padding: spacing[6],
  },
  creatorSection: {
    flexDirection: 'row',
    marginBottom: spacing[6],
  },
  creatorInfo: {
    marginLeft: spacing[4],
    flex: 1,
  },
  creatorName: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  creatorUsername: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  repBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing[2],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  description: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  actionsSection: {
    marginTop: spacing[4],
  },
  actionButton: {
    marginTop: spacing[3],
  },
  buttonText: {
    marginLeft: spacing[2],
    color: colors.surface,
  },
  editButtonText: {
    marginLeft: spacing[2],
    color: colors.accent[500],
  },
  placeCard: {
    padding: spacing[4],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  placeHeader: {
    flexDirection: 'row',
  },
  placeNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  placeNumberText: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.sm,
    color: colors.accent[700],
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  placeAddress: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    marginBottom: spacing[2],
  },
  placeNotes: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  lockOverlay: {
    alignItems: 'center',
    padding: spacing[8],
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    marginTop: spacing[4],
  },
  lockTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  lockDescription: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[4],
    maxWidth: 300,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[12],
  },
  emptyTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  emptyDescription: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

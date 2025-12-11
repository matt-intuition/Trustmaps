import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/utils/theme';
import { TabBar } from '../../src/components/common/TabBar';
import { Avatar } from '../../src/components/common/Avatar';
import { Badge } from '../../src/components/common/Badge';
import { MetadataGrid } from '../../src/components/common/MetadataGrid';
import { Button } from '../../src/components/common/Button';
import { Skeleton } from '../../src/components/common/Skeleton';
import { apiClient } from '../../src/api/client';
import { StakeModal } from '../../src/components/stakes/StakeModal';
import { ExportModal } from '../../src/components/export/ExportModal';
import { ReviewForm } from '../../src/components/reviews/ReviewForm';
import { ReviewCard } from '../../src/components/reviews/ReviewCard';
import { StarRating } from '../../src/components/common/StarRating';
import { MapViewComponent, MapMarker } from '../../src/components/common/MapView';
import { BlurredPlaceCard } from '../../src/components/places/BlurredPlaceCard';

type TabType = 'overview' | 'places' | 'reviews' | 'map';

interface Place {
  id: string;
  googlePlaceId?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  category?: string;
  cuisine?: string;
  rating?: number;
  priceLevel?: number;
  photoReference?: string;
  photoUrl?: string;
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
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [stakeModalVisible, setStakeModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    fetchListDetail();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [activeTab]);

  const fetchListDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[ListDetail] Fetching list with ID:', id);
      const response = await apiClient.get(`/lists/${id}`);
      console.log('[ListDetail] Response received:', response);
      console.log('[ListDetail] Response.list:', response.list);
      console.log('[ListDetail] Response.meta:', response.meta);
      setList(response.list);
      setMeta(response.meta);
    } catch (error: any) {
      console.error('[ListDetail] Error fetching list:', error);
      console.error('[ListDetail] Error message:', error.message);
      console.error('[ListDetail] Full error object:', JSON.stringify(error, null, 2));
      const errorMessage = error.message || 'Failed to load list';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!list || !meta) return;

    try {
      setActionLoading(true);
      if (meta.isSaved) {
        await apiClient.delete(`/lists/${id}/save`);
        setMeta({ ...meta, isSaved: false });
        Alert.alert('Success', 'List removed from saved');
      } else {
        await apiClient.post(`/lists/${id}/save`);
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
              const response = await apiClient.post(`/lists/${id}/purchase`);
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

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await apiClient.get(`/reviews/list/${id}`);
      setReviews(response.reviews || []);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const renderOverviewTab = () => {
    if (!list) return null;

    return (
      <View style={styles.tabContent}>
        {/* Creator Info */}
        <View style={styles.creatorSection}>
          <Avatar
            initials={list.creator.displayName?.substring(0, 2).toUpperCase() || '??'}
            imageUrl={list.creator.profileImage}
            size="lg"
          />
          <View style={styles.creatorInfo}>
            <Text style={styles.creatorName}>{list.creator.displayName}</Text>
            <Text style={styles.creatorUsername}>@{list.creator.username}</Text>
            <Badge
              label={`Rep: ${list.creator.creatorReputation.toFixed(1)}`}
              variant="accent"
              icon="star"
              style={styles.repBadge}
            />
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
                title={meta.isSaved ? 'Saved' : 'Save List'}
                onPress={handleSave}
                variant={meta.isSaved ? 'secondary' : 'primary'}
                loading={actionLoading}
                icon={
                  <Ionicons
                    name={meta.isSaved ? 'heart' : 'heart-outline'}
                    size={20}
                    color={colors.surface}
                  />
                }
                style={styles.actionButton}
              />
            ) : !meta.hasAccess ? (
              <Button
                title={`Purchase for ${list.price} TRUST`}
                onPress={handlePurchase}
                variant="primary"
                loading={actionLoading}
                icon={<Ionicons name="cart" size={20} color={colors.surface} />}
                style={styles.actionButton}
              />
            ) : null}

            {/* Stake Button - Show for all non-owners who have access (free lists or purchased) */}
            {(list.isFree || meta.hasAccess) && (
              <Button
                title="Stake TRUST"
                onPress={() => setStakeModalVisible(true)}
                variant="outline"
                icon={<Ionicons name="trending-up" size={20} color={colors.accent[500]} />}
                style={styles.actionButton}
              />
            )}
          </View>
        )}

        {/* Owner Actions */}
        {meta?.isOwner && (
          <View style={styles.actionsSection}>
            <Button
              title="Edit List"
              onPress={() => router.push(`/list/${id}/edit` as any)}
              variant="outline"
              icon={<Ionicons name="pencil" size={20} color={colors.accent[500]} />}
              style={styles.actionButton}
            />
            <Button
              title="Export List"
              onPress={() => setExportModalVisible(true)}
              variant="outline"
              icon={<Ionicons name="download" size={20} color={colors.accent[500]} />}
              style={styles.actionButton}
            />
          </View>
        )}

        {/* Export Button - Show for purchasers */}
        {meta && !meta.isOwner && meta.hasAccess && !list.isFree && (
          <Button
            title="Export List"
            onPress={() => setExportModalVisible(true)}
            variant="outline"
            icon={<Ionicons name="download" size={20} color={colors.accent[500]} />}
            style={styles.actionButton}
          />
        )}
      </View>
    );
  };

  const handlePlacePress = (place: Place) => {
    // Open in Google Maps with coordinates
    const url = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;

    // For web, open in new tab
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  const renderPlacesTab = () => {
    if (!list || !meta) return null;

    const showLock = !meta.hasAccess && !list.isFree;
    const places = list.places;

    return (
      <View style={styles.tabContent}>
        {places.map((listPlace, index) => (
          <Pressable
            key={listPlace.id}
            style={({ pressed }) => [
              styles.placeCard,
              pressed && styles.placeCardPressed,
            ]}
            onPress={() => handlePlacePress(listPlace.place)}
          >
            <View style={styles.placeHeader}>
              <View style={styles.placeNumber}>
                <Text style={styles.placeNumberText}>{listPlace.order}</Text>
              </View>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>{listPlace.place.name}</Text>

                {/* Rating and Price Level */}
                {(listPlace.place.rating || listPlace.place.priceLevel || listPlace.place.cuisine) && (
                  <View style={styles.placeMetaRow}>
                    {listPlace.place.rating && (
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color={colors.warning} />
                        <Text style={styles.ratingText}>{listPlace.place.rating.toFixed(1)}</Text>
                      </View>
                    )}
                    {listPlace.place.priceLevel && (
                      <Text style={styles.priceLevelText}>
                        {'$'.repeat(listPlace.place.priceLevel)}
                      </Text>
                    )}
                    {listPlace.place.cuisine && (
                      <Text style={styles.cuisineText}>{listPlace.place.cuisine}</Text>
                    )}
                  </View>
                )}

                {/* Address */}
                <View style={styles.addressRow}>
                  <Ionicons name="location-outline" size={14} color={colors.text.tertiary} />
                  <Text style={styles.placeAddress}>{listPlace.place.address}</Text>
                </View>

                {/* City and Country */}
                {(listPlace.place.city || listPlace.place.country) && (
                  <Text style={styles.locationText}>
                    {[listPlace.place.city, listPlace.place.country].filter(Boolean).join(', ')}
                  </Text>
                )}

                {/* Category Badge - hide generic "general" category */}
                {listPlace.place.category && listPlace.place.category !== 'general' && (
                  <Badge
                    label={listPlace.place.category}
                    variant="neutral"
                    style={styles.categoryBadge}
                  />
                )}

                {/* Creator Notes */}
                {listPlace.notes && listPlace.notes.trim().length > 0 && (
                  <View style={styles.notesContainer}>
                    <Ionicons name="chatbox-outline" size={14} color={colors.accent[500]} />
                    <Text style={styles.placeNotes}>"{listPlace.notes}"</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Tap to open indicator */}
            <View style={styles.placeFooter}>
              <Ionicons name="location" size={14} color={colors.accent[500]} />
              <Text style={styles.tapToOpenText}>Tap to open in Google Maps</Text>
              <Ionicons name="open-outline" size={14} color={colors.accent[500]} />
            </View>
          </Pressable>
        ))}

        {/* Blurred placeholders for locked places */}
        {showLock && meta.totalPlaces > meta.previewPlaces && (
          <>
            {Array.from({ length: Math.min(meta.totalPlaces - meta.previewPlaces, 5) }).map((_, index) => (
              <BlurredPlaceCard key={`blurred-${index}`} index={meta.previewPlaces + index + 1} />
            ))}

            {/* Unlock CTA */}
            <View style={styles.unlockCTA}>
              <View style={styles.unlockContent}>
                <Ionicons name="lock-closed" size={48} color={colors.neutral[400]} />
                <Text style={styles.unlockTitle}>
                  Unlock {meta.totalPlaces - meta.previewPlaces} more {meta.totalPlaces - meta.previewPlaces === 1 ? 'place' : 'places'}
                </Text>
                <Text style={styles.unlockDescription}>
                  Get full access to all locations in this list
                </Text>
                <Button
                  title={`Purchase for ${list.price} TRUST`}
                  onPress={handlePurchase}
                  variant="primary"
                  loading={actionLoading}
                  icon={<Ionicons name="cart" size={20} color={colors.surface} />}
                  style={styles.unlockButton}
                />
              </View>
            </View>
          </>
        )}
      </View>
    );
  };

  const renderReviewsTab = () => {
    if (!list || !meta) return null;

    const canReview = !meta.isOwner && (list.isFree || meta.hasAccess);

    return (
      <View style={styles.tabContent}>
        {/* Average Rating Summary */}
        {list.averageRating && reviews.length > 0 && (
          <View style={styles.ratingsSummary}>
            <View style={styles.averageRatingBox}>
              <Text style={styles.averageRatingValue}>
                {list.averageRating.toFixed(1)}
              </Text>
              <StarRating rating={Math.round(list.averageRating)} size="small" readonly />
              <Text style={styles.reviewCount}>
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </Text>
            </View>
          </View>
        )}

        {/* Review Form - Show if user can review */}
        {canReview && (
          <View style={styles.reviewFormSection}>
            <Text style={styles.sectionTitle}>Write a Review</Text>
            <ReviewForm
              listId={id as string}
              onReviewSubmitted={() => {
                fetchReviews();
                fetchListDetail(); // Refresh list to update average rating
              }}
            />
          </View>
        )}

        {/* Reviews List */}
        {reviewsLoading ? (
          <View style={styles.loadingContainer}>
            <Skeleton variant="card" height={100} style={{ marginBottom: spacing[3] }} />
            <Skeleton variant="card" height={100} />
          </View>
        ) : reviews.length > 0 ? (
          <View style={styles.reviewsList}>
            <Text style={styles.sectionTitle}>
              Reviews ({reviews.length})
            </Text>
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                userName={review.user.displayName}
                userAvatar={review.user.profileImage}
                rating={review.rating}
                comment={review.comment}
                createdAt={review.createdAt}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.neutral[400]} />
            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.emptyDescription}>
              {canReview
                ? 'Be the first to review this list'
                : 'Check back later for reviews'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderMapTab = () => {
    if (!list || !meta) return null;

    // Only show map if user has access to the places
    if (!meta.hasAccess && !list.isFree && !meta.isOwner) {
      return (
        <View style={styles.tabContent}>
          <View style={styles.lockedContent}>
            <Ionicons name="lock-closed" size={64} color={colors.neutral[400]} />
            <Text style={styles.lockedTitle}>Map Locked</Text>
            <Text style={styles.lockedText}>
              Purchase this list to view locations on the map
            </Text>
            <Button
              title={`Purchase for ${list.price} TRUST`}
              onPress={handlePurchase}
              variant="primary"
              loading={actionLoading}
              icon={<Ionicons name="cart" size={20} color={colors.surface} />}
              style={styles.purchaseButton}
            />
          </View>
        </View>
      );
    }

    // Convert places to map markers
    const markers: MapMarker[] = list.places.map((p) => ({
      id: p.place.id,
      latitude: p.place.latitude,
      longitude: p.place.longitude,
      title: p.place.name,
      description: p.notes || undefined,
      address: p.place.address,
    }));

    return (
      <View style={styles.mapTabContent}>
        <MapViewComponent
          markers={markers}
          style={styles.mapView}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          {/* Header Skeleton */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing[4] }}>
            <Skeleton variant="circle" width={40} height={40} style={{ marginRight: spacing[3] }} />
            <Skeleton variant="text" width="60%" height={24} />
          </View>
          {/* Tab Bar Skeleton */}
          <View style={{ flexDirection: 'row', gap: spacing[3], marginBottom: spacing[6] }}>
            <Skeleton variant="rect" width={80} height={36} />
            <Skeleton variant="rect" width={80} height={36} />
            <Skeleton variant="rect" width={80} height={36} />
          </View>
          {/* Content Skeleton */}
          <Skeleton variant="card" height={200} style={{ marginBottom: spacing[4] }} />
          <Skeleton variant="card" height={150} />
        </View>
      </SafeAreaView>
    );
  }

  if (!list || !meta) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>
            {error || 'List not found'}
          </Text>
          <Text style={styles.errorSubtext}>
            {error ? 'Please check the error message above and try again.' : 'This list may have been deleted or you may not have access.'}
          </Text>
          <Button onPress={() => fetchListDetail()} variant="primary" style={styles.retryButton}>
            Retry
          </Button>
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
            <Badge label="FREE" variant="success" />
          ) : (
            <Badge label={`${list.price} TRUST`} variant="accent" />
          )}
        </View>
      </View>

      {/* Tab Bar */}
      <TabBar
        tabs={[
          { value: 'overview', label: 'Overview' },
          { value: 'places', label: 'Places' },
          { value: 'map', label: 'Map' },
          { value: 'reviews', label: 'Reviews' },
        ]}
        activeTab={activeTab}
        onChange={(value) => setActiveTab(value as TabType)}
      />

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        scrollEnabled={activeTab !== 'map'}
      >
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'places' && renderPlacesTab()}
        {activeTab === 'map' && renderMapTab()}
        {activeTab === 'reviews' && renderReviewsTab()}
      </ScrollView>

      {/* Modals */}
      {list && (
        <>
          <StakeModal
            visible={stakeModalVisible}
            onClose={() => setStakeModalVisible(false)}
            targetType="list"
            targetId={list.id}
            targetName={list.title}
            onSuccess={() => {
              fetchListDetail(); // Refresh to update stake count
            }}
          />
          <ExportModal
            visible={exportModalVisible}
            onClose={() => setExportModalVisible(false)}
            listId={list.id}
            listTitle={list.title}
          />
        </>
      )}
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
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[6],
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
    marginTop: spacing[4],
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  errorSubtext: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    marginBottom: spacing[6],
    textAlign: 'center',
    paddingHorizontal: spacing[6],
  },
  retryButton: {
    marginBottom: spacing[3],
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
    cursor: 'pointer',
  },
  placeCardPressed: {
    backgroundColor: colors.neutral[50],
    borderColor: colors.accent[300],
    transform: [{ scale: 0.98 }],
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
  placeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[2],
    flexWrap: 'wrap',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  ratingText: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  priceLevelText: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.sm,
    color: colors.success,
  },
  cuisineText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.sm,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[1],
    marginBottom: spacing[1],
  },
  placeAddress: {
    flex: 1,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * 1.4,
  },
  locationText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginBottom: spacing[2],
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    marginBottom: spacing[2],
    marginTop: spacing[1],
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    marginTop: spacing[2],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  placeNotes: {
    flex: 1,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.accent[600],
    fontStyle: 'italic',
    lineHeight: typography.sizes.sm * 1.4,
  },
  placeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  tapToOpenText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xs,
    color: colors.accent[500],
  },
  unlockCTA: {
    marginTop: spacing[6],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    paddingTop: spacing[6],
  },
  unlockContent: {
    alignItems: 'center',
    padding: spacing[6],
    backgroundColor: colors.accent[50],
    borderRadius: borderRadius.lg,
  },
  unlockTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    marginTop: spacing[3],
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  unlockDescription: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[4],
    maxWidth: 300,
  },
  unlockButton: {
    minWidth: 200,
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
  stakeButtonText: {
    marginLeft: spacing[2],
    color: colors.accent[500],
  },
  ratingsSummary: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    marginBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  averageRatingBox: {
    alignItems: 'center',
    gap: spacing[2],
  },
  averageRatingValue: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes['3xl'],
    color: colors.text.primary,
  },
  reviewCount: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
  reviewFormSection: {
    marginBottom: spacing[8],
  },
  reviewsList: {
    gap: spacing[4],
  },
  mapTabContent: {
    flex: 1,
    height: 600, // Fixed height for map
  },
  mapView: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
});

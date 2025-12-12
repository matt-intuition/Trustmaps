import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../src/stores/authStore';
import { apiClient } from '../../src/api/client';
import { colors, typography, spacing, borderRadius, shadows, textStyles } from '../../src/utils/theme';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';
import { ProgressCircle } from '../../src/components/common/ProgressCircle';
import { Skeleton } from '../../src/components/common/Skeleton';
import { Avatar } from '../../src/components/common/Avatar';

interface RecommendedList {
  id: string;
  title: string;
  description: string | null;
  category: string;
  isFree: boolean;
  price: number;
  trustRank: number;
  placeCount: number;
  totalStaked: number;
  recommendationReasons: string[];
  creator: {
    id: string;
    username: string;
    displayName: string;
    profileImage: string | null;
  };
}

interface ActivityFeedList {
  id: string;
  title: string;
  category: string;
  isFree: boolean;
  price: number;
  placeCount: number;
  createdAt: string;
  creator: {
    id: string;
    username: string;
    displayName: string;
    profileImage: string | null;
  };
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [recommendations, setRecommendations] = useState<RecommendedList[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedList[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  // Calculate engagement score (0-100)
  const listsCount = user?._count?.createdLists || 0;
  const purchasesCount = user?._count?.purchases || 0;
  const stakesCount = user?._count?.stakes || 0;

  // Simple engagement calculation: each activity type contributes up to 33.3 points
  const listScore = Math.min(listsCount * 10, 33);
  const purchaseScore = Math.min(purchasesCount * 5, 33);
  const stakeScore = Math.min(stakesCount * 5, 34);
  const totalEngagement = listScore + purchaseScore + stakeScore;

  useEffect(() => {
    loadActivityFeed();
    loadRecommendations();
  }, []);

  const loadActivityFeed = async () => {
    try {
      setActivityLoading(true);
      const response = await apiClient.get('/follows/feed', {
        params: { limit: 10 }
      });
      setActivityFeed(response.lists || []);
    } catch (error: any) {
      console.error('Error loading activity feed:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      setRecommendationsLoading(true);
      const response = await apiClient.get('/recommendations', {
        params: { limit: 5 }
      });
      setRecommendations(response.recommendations);
    } catch (error: any) {
      console.error('Error loading recommendations:', error);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  // Helper function to format relative time
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return past.toLocaleDateString();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header - Greeting + TRUST Balance */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.displayName}</Text>
          </View>
          <Badge
            label={`${user?.trustBalance || 0}`}
            variant="accent"
            icon="diamond"
          />
        </View>

        {/* Stats Cards - Engagement score + traditional stats */}
        <View style={styles.statsContainer}>
          {/* Engagement ProgressCircle */}
          <Card
            variant="elevated"
            padding={4}
            style={[styles.statCard, styles.engagementCard]}
          >
            <ProgressCircle
              value={totalEngagement}
              label="Engagement"
              size="md"
              segments={[
                { color: colors.error, percentage: listScore },
                { color: colors.warning, percentage: purchaseScore },
                { color: colors.success, percentage: stakeScore },
              ]}
            />
            <Text style={styles.engagementBreakdown}>
              {listsCount} {listsCount === 1 ? 'list' : 'lists'} • {purchasesCount} {purchasesCount === 1 ? 'purchase' : 'purchases'} • {stakesCount} {stakesCount === 1 ? 'stake' : 'stakes'}
            </Text>
          </Card>

          {/* Purchases */}
          <Card variant="elevated" padding={4} style={styles.statCard}>
            <Ionicons name="cart" size={24} color={colors.accent[500]} />
            <Text style={styles.statValue}>{purchasesCount}</Text>
            <Text style={styles.statLabel}>Purchased</Text>
          </Card>

          {/* Stakes */}
          <Card variant="elevated" padding={4} style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color={colors.accent[500]} />
            <Text style={styles.statValue}>{stakesCount}</Text>
            <Text style={styles.statLabel}>Stakes</Text>
          </Card>
        </View>

        {/* Recent Activity from Following */}
        {activityLoading ? (
          user?._count?.following && user._count.following > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <Skeleton variant="card" height={140} style={{ marginBottom: spacing[4] }} />
              <Skeleton variant="card" height={140} />
            </View>
          ) : null
        ) : activityFeed.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <Ionicons name="time-outline" size={20} color={colors.accent[500]} />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activityScroll}
            >
              {activityFeed.map((list) => (
                <Pressable
                  key={list.id}
                  onPress={() => router.push(`/list/${list.id}` as any)}
                  style={styles.activityCard}
                >
                  <Card variant="elevated" padding={4}>
                    <View style={styles.activityContent}>
                      {/* Creator Info - Prominent */}
                      <View style={styles.activityCreator}>
                        <Avatar
                          imageUrl={list.creator.profileImage || undefined}
                          initials={list.creator.displayName?.substring(0, 2) || '??'}
                          size="sm"
                        />
                        <View style={styles.activityCreatorInfo}>
                          <Text style={styles.activityCreatorName} numberOfLines={1}>
                            {list.creator.displayName}
                          </Text>
                          <Text style={styles.activityTime}>
                            {formatTimeAgo(list.createdAt)}
                          </Text>
                        </View>
                      </View>

                      {/* List Title */}
                      <Text style={styles.activityTitle} numberOfLines={2}>
                        {list.title}
                      </Text>

                      {/* Category Badge */}
                      <Badge label={list.category} variant="neutral" size="sm" />

                      {/* Footer - Place Count & Price */}
                      <View style={styles.activityFooter}>
                        <View style={styles.activityStats}>
                          <Ionicons name="location-outline" size={14} color={colors.text.tertiary} />
                          <Text style={styles.activityStatText}>
                            {list.placeCount} places
                          </Text>
                        </View>

                        {!list.isFree && (
                          <View style={styles.activityPrice}>
                            <Ionicons name="diamond-outline" size={14} color={colors.accent[500]} />
                            <Text style={styles.activityPriceText}>
                              {list.price}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </Card>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : user?._count?.following && user._count.following > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <Ionicons name="time-outline" size={20} color={colors.accent[500]} />
            </View>
            <Card variant="flat" padding={6} style={styles.emptyFeedCard}>
              <Ionicons name="hourglass-outline" size={48} color={colors.neutral[400]} />
              <Text style={styles.emptyFeedText}>
                No recent activity from creators you follow
              </Text>
            </Card>
          </View>
        ) : null}

        {/* Recommended for You */}
        {recommendationsLoading ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <Skeleton variant="card" height={140} style={{ marginBottom: spacing[4] }} />
            <Skeleton variant="card" height={140} />
          </View>
        ) : recommendations.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommended for You</Text>
              <Ionicons name="sparkles" size={20} color={colors.accent[500]} />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendationsScroll}
            >
              {recommendations.map((list) => (
                <Pressable
                  key={list.id}
                  onPress={() => router.push(`/list/${list.id}` as any)}
                  style={styles.recommendationCard}
                >
                  <Card variant="elevated" padding={4}>
                    <View style={styles.recommendationContent}>
                      <Text style={styles.recommendationTitle} numberOfLines={2}>
                        {list.title}
                      </Text>

                      <View style={styles.recommendationCreator}>
                        <Text style={styles.recommendationCreatorText}>
                          by {list.creator.displayName}
                        </Text>
                      </View>

                      <Text style={styles.recommendationReason} numberOfLines={1}>
                        <Ionicons name="information-circle-outline" size={14} />
                        {' '}{list.recommendationReasons[0]}
                      </Text>

                      <View style={styles.recommendationFooter}>
                        <Badge label={list.category} variant="neutral" size="sm" />
                        <View style={styles.recommendationStats}>
                          <Ionicons name="location-outline" size={14} color={colors.text.tertiary} />
                          <Text style={styles.recommendationStatText}>
                            {list.placeCount}
                          </Text>
                        </View>
                      </View>

                      {!list.isFree && (
                        <View style={styles.recommendationPrice}>
                          <Ionicons name="diamond-outline" size={14} color={colors.accent[500]} />
                          <Text style={styles.recommendationPriceText}>
                            {list.price} TRUST
                          </Text>
                        </View>
                      )}
                    </View>
                  </Card>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Quick Actions - Interactive cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <Card
            variant="interactive"
            padding={5}
            style={styles.actionCard}
            onPress={() => router.push('/import')}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="cloud-upload-outline" size={32} color={colors.accent[500]} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Import Your Maps</Text>
              <Text style={styles.actionDescription}>
                Upload your Google Takeout to get started
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </Card>

          <Card
            variant="interactive"
            padding={5}
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/marketplace')}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="compass-outline" size={32} color={colors.accent[500]} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Explore Marketplace</Text>
              <Text style={styles.actionDescription}>
                Discover curated guides from local experts
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // neutral.50
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[6], // 24px
  },
  greeting: {
    ...textStyles.bodySmall, // 14px, normal weight, neutral.600
  },
  userName: {
    ...textStyles.h2, // 25px, bold, neutral.900
    marginTop: spacing[1], // 4px
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[6], // 24px
    gap: spacing[4], // 16px between cards
    marginBottom: spacing[6], // 24px
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  engagementCard: {
    justifyContent: 'center',
    paddingVertical: spacing[5], // Extra vertical padding for ProgressCircle
  },
  engagementBreakdown: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xs, // 12px
    color: colors.text.tertiary,
    marginTop: spacing[3], // 12px below ProgressCircle
    textAlign: 'center',
  },
  statValue: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes['2xl'], // 31px
    color: colors.text.primary, // neutral.900
    marginTop: spacing[2], // 8px
  },
  statLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm, // 14px
    color: colors.text.secondary, // neutral.600
    marginTop: spacing[1], // 4px
  },
  section: {
    padding: spacing[6], // 24px
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  sectionTitle: {
    ...textStyles.h3, // 20px, semibold, neutral.900
  },
  recommendationsScroll: {
    paddingRight: spacing[6],
    gap: spacing[4],
  },
  recommendationCard: {
    width: 280,
  },
  recommendationContent: {
    minHeight: 160,
  },
  recommendationTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    marginBottom: spacing[2],
    lineHeight: 22,
  },
  recommendationCreator: {
    marginBottom: spacing[2],
  },
  recommendationCreatorText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  recommendationReason: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.xs,
    color: colors.accent[600],
    marginBottom: spacing[3],
  },
  recommendationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  recommendationStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  recommendationStatText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
  recommendationPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  recommendationPriceText: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.sm,
    color: colors.accent[500],
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4], // 16px
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md, // 12px
    backgroundColor: colors.accent[50], // Lightest indigo background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4], // 16px
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.lg, // 20px
    color: colors.text.primary, // neutral.900
    marginBottom: spacing[1], // 4px
  },
  actionDescription: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm, // 14px
    color: colors.text.secondary, // neutral.600
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  activityScroll: {
    paddingRight: spacing[6],
    gap: spacing[4],
  },
  activityCard: {
    width: 260,
  },
  activityContent: {
    gap: spacing[3],
    minHeight: 160,
  },
  activityCreator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  activityCreatorInfo: {
    flex: 1,
  },
  activityCreatorName: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  activityTime: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  activityTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    lineHeight: 22,
  },
  activityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  activityStatText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
  activityPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  activityPriceText: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.sm,
    color: colors.accent[500],
  },
  emptyFeedCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFeedText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing[3],
    textAlign: 'center',
  },
});

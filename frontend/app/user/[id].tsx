import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../src/api/client';
import { useAuthStore } from '../../src/stores/authStore';
import { Avatar } from '../../src/components/common/Avatar';
import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { MetadataGrid } from '../../src/components/common/MetadataGrid';
import { ProgressCircle } from '../../src/components/common/ProgressCircle';
import { Skeleton } from '../../src/components/common/Skeleton';
import { colors, typography, spacing, borderRadius, textStyles } from '../../src/utils/theme';

interface CreatorProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  profileImage: string | null;
  creatorReputation: number;
  totalStaked: number;
  totalSales: number;
  totalEarnings: number;
  createdAt: string;
  _count: {
    createdLists: number;
    purchases: number;
    stakes: number;
    stakesReceived: number;
    followers: number;
    following: number;
  };
}

interface CreatorList {
  id: string;
  title: string;
  description: string | null;
  category: string;
  coverImage: string | null;
  isFree: boolean;
  price: number;
  placeCount: number;
  totalStaked: number;
  totalSales: number;
  trustRank: number;
  createdAt: string;
}

export default function CreatorProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [listsLoading, setListsLoading] = useState(true);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [lists, setLists] = useState<CreatorList[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    loadProfile();
    loadLists();
  }, [id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/users/${id}`);
      setProfile(response.user);
      setIsFollowing(response.meta?.isFollowing || false);
    } catch (error: any) {
      console.error('Error loading creator profile:', error);
      Alert.alert('Error', error.message || 'Failed to load creator profile');
    } finally {
      setLoading(false);
    }
  };

  const loadLists = async () => {
    try {
      setListsLoading(true);
      const response = await apiClient.get(`/users/${id}/lists`, {
        params: { sortBy: 'trustRank', limit: 20 }
      });
      setLists(response.lists);
    } catch (error: any) {
      console.error('Error loading creator lists:', error);
    } finally {
      setListsLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      setFollowLoading(true);

      if (isFollowing) {
        // Unfollow
        await apiClient.delete(`/follows/${id}`);
        setIsFollowing(false);

        // Update follower count optimistically
        if (profile) {
          setProfile({
            ...profile,
            _count: {
              ...profile._count,
              followers: Math.max(0, profile._count.followers - 1),
            },
          });
        }
      } else {
        // Follow
        await apiClient.post(`/follows/${id}`);
        setIsFollowing(true);

        // Update follower count optimistically
        if (profile) {
          setProfile({
            ...profile,
            _count: {
              ...profile._count,
              followers: profile._count.followers + 1,
            },
          });
        }
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      Alert.alert('Error', error.message || 'Failed to update follow status');
      // Revert on error
      loadProfile();
    } finally {
      setFollowLoading(false);
    }
  };

  const handleStake = () => {
    // Navigate to staking modal/screen (to be implemented)
    Alert.alert('Stake on Creator', 'Staking on creators coming soon!');
  };

  const handleListPress = (listId: string) => {
    router.push(`/list/${listId}` as any);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <View style={{ alignItems: 'center', marginBottom: spacing[6] }}>
            <Skeleton variant="circle" width={120} height={120} style={{ marginBottom: spacing[4] }} />
            <Skeleton variant="text" width={200} height={28} style={{ marginBottom: spacing[2] }} />
            <Skeleton variant="text" width={120} height={18} />
          </View>
          <Skeleton variant="card" height={120} style={{ marginHorizontal: spacing[6], marginBottom: spacing[6] }} />
          <Skeleton variant="card" height={200} style={{ marginHorizontal: spacing[6] }} />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={64} color={colors.neutral[400]} />
          <Text style={styles.errorText}>Creator not found</Text>
          <Button
            title="Go Back"
            variant="outline"
            onPress={() => router.back()}
            style={{ marginTop: spacing[4] }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Creator Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Avatar
            imageUrl={profile.profileImage || undefined}
            initials={profile.displayName?.substring(0, 2) || '??'}
            size="xl"
            border="thick"
            style={styles.avatar}
          />
          <Text style={styles.displayName}>{profile.displayName}</Text>
          <Text style={styles.username}>@{profile.username}</Text>

          {profile.bio && (
            <Text style={styles.bio}>{profile.bio}</Text>
          )}

          {/* Reputation */}
          <View style={styles.reputationContainer}>
            <ProgressCircle
              value={Math.min((profile.creatorReputation || 0) * 10, 100)}
              label="Reputation"
              size="md"
            />
          </View>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <View style={styles.actionButtons}>
              <Button
                title={isFollowing ? 'Following' : 'Follow'}
                variant={isFollowing ? 'outline' : 'primary'}
                onPress={handleFollow}
                loading={followLoading}
                icon={
                  <Ionicons
                    name={isFollowing ? 'checkmark-circle' : 'person-add-outline'}
                    size={20}
                    color={isFollowing ? colors.accent[500] : colors.text.inverse}
                  />
                }
                style={styles.followButton}
              />
              <Button
                title="Stake"
                variant="outline"
                onPress={handleStake}
                icon={<Ionicons name="trending-up-outline" size={20} color={colors.accent[500]} />}
                style={styles.stakeButton}
              />
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <Card variant="flat" padding={5} style={styles.statsCard}>
          <MetadataGrid
            items={[
              { label: 'Lists', value: profile._count.createdLists || 0, icon: 'map-outline' },
              { label: 'Sales', value: profile.totalSales || 0, icon: 'cart-outline' },
              { label: 'Followers', value: profile._count.followers || 0, icon: 'people-outline' },
              { label: 'Following', value: profile._count.following || 0, icon: 'person-outline' },
            ]}
            columns={2}
          />
        </Card>

        {/* Lists Section */}
        <View style={styles.listsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Published Lists</Text>
            <Text style={styles.sectionCount}>{lists.length}</Text>
          </View>

          {listsLoading ? (
            <View>
              <Skeleton variant="card" height={140} style={{ marginBottom: spacing[4] }} />
              <Skeleton variant="card" height={140} style={{ marginBottom: spacing[4] }} />
              <Skeleton variant="card" height={140} />
            </View>
          ) : lists.length === 0 ? (
            <Card variant="flat" padding={8} style={styles.emptyCard}>
              <Ionicons name="map-outline" size={48} color={colors.neutral[400]} />
              <Text style={styles.emptyText}>No published lists yet</Text>
            </Card>
          ) : (
            lists.map((list) => (
              <TouchableOpacity
                key={list.id}
                onPress={() => handleListPress(list.id)}
                style={styles.listCard}
              >
                <Card variant="elevated" padding={0}>
                  <View style={styles.listContent}>
                    <View style={styles.listInfo}>
                      <Text style={styles.listTitle} numberOfLines={1}>
                        {list.title}
                      </Text>
                      {list.description && (
                        <Text style={styles.listDescription} numberOfLines={2}>
                          {list.description}
                        </Text>
                      )}
                      <View style={styles.listMeta}>
                        <View style={styles.metaItem}>
                          <Ionicons name="location-outline" size={14} color={colors.text.tertiary} />
                          <Text style={styles.metaText}>{list.placeCount} places</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Ionicons name="star-outline" size={14} color={colors.text.tertiary} />
                          <Text style={styles.metaText}>{list.trustRank}</Text>
                        </View>
                        {!list.isFree && (
                          <View style={styles.metaItem}>
                            <Ionicons name="diamond-outline" size={14} color={colors.accent[500]} />
                            <Text style={[styles.metaText, { color: colors.accent[500] }]}>
                              {list.price} TRUST
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
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
    paddingTop: spacing[6],
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  errorText: {
    ...textStyles.h3,
    color: colors.text.secondary,
    marginTop: spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: spacing[6],
  },
  avatar: {
    marginBottom: spacing[4],
  },
  displayName: {
    ...textStyles.h2,
  },
  username: {
    ...textStyles.bodySmall,
    marginTop: spacing[2],
  },
  bio: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing[4],
    paddingHorizontal: spacing[4],
  },
  reputationContainer: {
    marginTop: spacing[4],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[4],
  },
  followButton: {
    flex: 1,
  },
  stakeButton: {
    flex: 1,
  },
  statsCard: {
    marginHorizontal: spacing[6],
    marginBottom: spacing[6],
  },
  listsSection: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
  },
  sectionCount: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.tertiary,
    marginTop: spacing[3],
  },
  listCard: {
    marginBottom: spacing[4],
  },
  listContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  listDescription: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    lineHeight: 20,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  metaText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
});

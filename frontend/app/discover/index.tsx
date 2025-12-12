import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Avatar } from '../../src/components/common/Avatar';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import { Badge } from '../../src/components/common/Badge';
import { Skeleton } from '../../src/components/common/Skeleton';
import { colors, spacing, borderRadius, textStyles, typography } from '../../src/utils/theme';
import { apiClient } from '../../src/api/client';

type SortType = 'reputation' | 'followers' | 'lists' | 'recent';

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  profileImage: string | null;
  creatorReputation: number;
  _count: {
    createdLists: number;
    followers: number;
    following: number;
  };
  meta: {
    isFollowing: boolean;
  };
}

const SORT_OPTIONS: { value: SortType; label: string; icon: string }[] = [
  { value: 'reputation', label: 'Top Reputation', icon: 'star' },
  { value: 'followers', label: 'Most Followers', icon: 'people' },
  { value: 'lists', label: 'Most Lists', icon: 'map' },
  { value: 'recent', label: 'Recently Active', icon: 'time' },
];

export default function DiscoverScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('reputation');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch users
  const fetchUsers = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        sortBy,
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await apiClient.get(`/users?${params}`);

      if (refresh || pageNum === 1) {
        setUsers(response.users);
      } else {
        setUsers((prev) => [...prev, ...response.users]);
      }

      setHasMore(response.pagination.hasMore);
      setPage(pageNum);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      if (Platform.OS === 'web') {
        window.alert(`Error: ${error.message || 'Failed to load users'}`);
      } else {
        Alert.alert('Error', error.message || 'Failed to load users');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Debounced search
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchUsers(1);
    }, 300);

    setSearchTimeout(timeout);
  };

  // Initial load and sort changes
  useEffect(() => {
    fetchUsers(1);
  }, [sortBy]);

  // Refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers(1, true);
  };

  // Load more handler
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchUsers(page + 1);
    }
  };

  // Follow/unfollow handler
  const handleToggleFollow = async (user: UserProfile) => {
    const wasFollowing = user.meta.isFollowing;

    // Optimistic update
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === user.id
          ? {
              ...u,
              _count: {
                ...u._count,
                followers: wasFollowing
                  ? u._count.followers - 1
                  : u._count.followers + 1,
              },
              meta: { isFollowing: !wasFollowing },
            }
          : u
      )
    );

    try {
      if (wasFollowing) {
        await apiClient.delete(`/follows/${user.id}`);
      } else {
        await apiClient.post(`/follows/${user.id}`);
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);

      // Revert optimistic update on error
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === user.id
            ? {
                ...u,
                _count: {
                  ...u._count,
                  followers: wasFollowing
                    ? u._count.followers + 1
                    : u._count.followers - 1,
                },
                meta: { isFollowing: wasFollowing },
              }
            : u
        )
      );

      if (Platform.OS === 'web') {
        window.alert(`Error: ${error.message || 'Failed to update follow status'}`);
      } else {
        Alert.alert('Error', error.message || 'Failed to update follow status');
      }
    }
  };

  // Navigate to user profile
  const handleUserPress = (userId: string) => {
    router.push(`/user/${userId}` as any);
  };

  // Render user card
  const renderUserCard = ({ item: user }: { item: UserProfile }) => (
    <Pressable
      onPress={() => handleUserPress(user.id)}
      style={({ pressed }) => [
        styles.userCard,
        pressed && styles.userCardPressed,
      ]}
    >
      <Card variant="elevated" padding={4}>
        <View style={styles.userContent}>
          <View style={styles.userHeader}>
            <Avatar
              imageUrl={user.profileImage || undefined}
              initials={user.displayName?.substring(0, 2) || '??'}
              size="md"
            />

            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {user.displayName}
              </Text>
              <Text style={styles.userUsername} numberOfLines={1}>
                @{user.username}
              </Text>
            </View>

            <Button
              title={user.meta.isFollowing ? 'Following' : 'Follow'}
              variant={user.meta.isFollowing ? 'outline' : 'primary'}
              size="small"
              onPress={() => handleToggleFollow(user)}
              style={styles.followButton}
              accessibilityLabel={
                user.meta.isFollowing
                  ? `Unfollow ${user.displayName}`
                  : `Follow ${user.displayName}`
              }
            />
          </View>

          {user.bio && (
            <Text style={styles.userBio} numberOfLines={2}>
              {user.bio}
            </Text>
          )}

          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Ionicons name="map-outline" size={14} color={colors.text.tertiary} />
              <Text style={styles.statText}>{user._count.createdLists} lists</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={14} color={colors.text.tertiary} />
              <Text style={styles.statText}>{user._count.followers} followers</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star-outline" size={14} color={colors.text.tertiary} />
              <Text style={styles.statText}>
                {user.creatorReputation.toFixed(1)} rep
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );

  // Render empty state
  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyState}>
        <Ionicons name="people-outline" size={64} color={colors.neutral[300]} />
        <Text style={styles.emptyTitle}>No Creators Found</Text>
        <Text style={styles.emptyDescription}>
          {searchQuery
            ? 'Try adjusting your search or filters'
            : 'Start exploring creators to build your network'}
        </Text>
        {searchQuery && (
          <Button
            title="Clear Search"
            variant="outline"
            onPress={() => {
              setSearchQuery('');
              fetchUsers(1);
            }}
            style={styles.emptyButton}
          />
        )}
      </View>
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <Skeleton variant="card" height={120} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Discover Creators</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search creators by name..."
          value={searchQuery}
          onChangeText={handleSearchChange}
          leftIcon={<Ionicons name="search" size={20} color={colors.text.tertiary} />}
          rightIcon={
            searchQuery ? (
              <Pressable
                onPress={() => {
                  setSearchQuery('');
                  fetchUsers(1);
                }}
              >
                <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
              </Pressable>
            ) : undefined
          }
        />
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        {SORT_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setSortBy(option.value)}
            style={({ pressed }) => [
              styles.sortBadge,
              sortBy === option.value && styles.sortBadgeActive,
              pressed && styles.sortBadgePressed,
            ]}
          >
            <Ionicons
              name={option.icon as any}
              size={14}
              color={sortBy === option.value ? colors.accent[500] : colors.text.tertiary}
            />
            <Text
              style={[
                styles.sortBadgeText,
                sortBy === option.value && styles.sortBadgeTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* User List */}
      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <Skeleton variant="card" height={120} style={{ marginBottom: spacing[4] }} />
          <Skeleton variant="card" height={120} style={{ marginBottom: spacing[4] }} />
          <Skeleton variant="card" height={120} />
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent[500]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...textStyles.h3,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[4],
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  sortBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.surface,
    minHeight: 44,
  },
  sortBadgeActive: {
    borderColor: colors.accent[500],
    backgroundColor: colors.accent[50],
  },
  sortBadgePressed: {
    opacity: 0.7,
  },
  sortBadgeText: {
    ...textStyles.label,
    color: colors.text.tertiary,
    fontSize: typography.sizes.sm,
  },
  sortBadgeTextActive: {
    color: colors.accent[500],
    fontFamily: typography.fonts.semibold,
  },
  loadingContainer: {
    padding: spacing[5],
  },
  listContent: {
    padding: spacing[5],
    paddingTop: spacing[3],
  },
  userCard: {
    marginBottom: spacing[4],
  },
  userCardPressed: {
    opacity: 0.7,
  },
  userContent: {
    gap: spacing[3],
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...textStyles.h4,
  },
  userUsername: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  userBio: {
    ...textStyles.body,
    color: colors.text.secondary,
    lineHeight: typography.sizes.base * 1.5,
  },
  userStats: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  statText: {
    ...textStyles.caption,
  },
  followButton: {
    minWidth: 90,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[10],
    paddingHorizontal: spacing[8],
  },
  emptyTitle: {
    ...textStyles.h3,
    marginTop: spacing[4],
  },
  emptyDescription: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing[2],
    lineHeight: typography.sizes.base * 1.5,
  },
  emptyButton: {
    marginTop: spacing[6],
  },
  loadingFooter: {
    paddingVertical: spacing[4],
  },
});

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../src/api/client';
import { Avatar } from '../../src/components/common/Avatar';
import { Card } from '../../src/components/common/Card';
import { TabBar } from '../../src/components/common/TabBar';
import { Skeleton } from '../../src/components/common/Skeleton';
import { colors, typography, spacing, borderRadius, textStyles } from '../../src/utils/theme';

type TabType = 'following' | 'followers';

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  profileImage: string | null;
  bio: string | null;
  creatorReputation: number;
  followedAt: string;
  _count: {
    createdLists: number;
    followers: number;
  };
}

export default function FollowingScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('following');
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'following') {
        const response = await apiClient.get('/follows/following');
        setFollowing(response.following);
      } else {
        const response = await apiClient.get('/follows/followers');
        setFollowers(response.followers);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleUserPress = (userId: string) => {
    router.push(`/user/${userId}` as any);
  };

  const renderUserCard = (user: UserProfile) => (
    <TouchableOpacity
      key={user.id}
      onPress={() => handleUserPress(user.id)}
      style={styles.userCard}
    >
      <Card variant="elevated" padding={0}>
        <View style={styles.userContent}>
          <Avatar
            imageUrl={user.profileImage || undefined}
            initials={user.displayName?.substring(0, 2) || '??'}
            size="md"
          />

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.displayName}</Text>
            <Text style={styles.userUsername}>@{user.username}</Text>

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

          <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderContent = () => {
    const users = activeTab === 'following' ? following : followers;

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Skeleton variant="card" height={120} style={{ marginBottom: spacing[4] }} />
          <Skeleton variant="card" height={120} style={{ marginBottom: spacing[4] }} />
          <Skeleton variant="card" height={120} />
        </View>
      );
    }

    if (users.length === 0) {
      return (
        <Card variant="flat" padding={8} style={styles.emptyCard}>
          <Ionicons
            name={activeTab === 'following' ? 'person-add-outline' : 'people-outline'}
            size={64}
            color={colors.neutral[400]}
          />
          <Text style={styles.emptyTitle}>
            {activeTab === 'following' ? 'Not Following Anyone Yet' : 'No Followers Yet'}
          </Text>
          <Text style={styles.emptyText}>
            {activeTab === 'following'
              ? 'Discover creators and follow them to see their latest lists in your feed'
              : "When people follow you, they'll appear here"}
          </Text>
          {activeTab === 'following' && (
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push('/(tabs)/marketplace')}
            >
              <Text style={styles.exploreButtonText}>Explore Creators</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.accent[500]} />
            </TouchableOpacity>
          )}
        </Card>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent[500]}
          />
        }
      >
        <View style={styles.usersList}>
          <Text style={styles.totalText}>
            {users.length} {activeTab === 'following' ? 'Following' : 'Followers'}
          </Text>
          {users.map(renderUserCard)}
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Following',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />

      <TabBar
        tabs={[
          { value: 'following', label: 'Following' },
          { value: 'followers', label: 'Followers' },
        ]}
        activeTab={activeTab}
        onChange={(value) => setActiveTab(value as TabType)}
      />

      {renderContent()}
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
    padding: spacing[6],
  },
  scrollView: {
    flex: 1,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing[6],
    minHeight: 400,
  },
  emptyTitle: {
    ...textStyles.h3,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent[50],
  },
  exploreButtonText: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.base,
    color: colors.accent[500],
  },
  usersList: {
    padding: spacing[6],
  },
  totalText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing[4],
  },
  userCard: {
    marginBottom: spacing[4],
  },
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    gap: spacing[3],
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  userUsername: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  userBio: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing[2],
  },
  userStats: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  statText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
});

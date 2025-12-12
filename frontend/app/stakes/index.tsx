import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';
import { TabBar } from '../../src/components/common/TabBar';
import { MetadataGrid } from '../../src/components/common/MetadataGrid';
import { Button } from '../../src/components/common/Button';
import { colors, spacing, borderRadius, textStyles, typography } from '../../src/utils/theme';
import { apiClient } from '../../src/api/client';

type StakeType = 'lists' | 'creators';

interface ListStake {
  id: string;
  listId: string;
  amount: number;
  earnedRevenue: number;
  apr: number;
  list: {
    id: string;
    title: string;
    thumbnail: string | null;
  };
}

interface CreatorStake {
  id: string;
  targetUserId: string;
  amount: number;
  earnedRevenue: number;
  apr: number;
  targetUser: {
    id: string;
    username: string;
    displayName: string;
    profileImage: string | null;
  };
}

export default function StakesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<StakeType>('lists');
  const [listStakes, setListStakes] = useState<ListStake[]>([]);
  const [creatorStakes, setCreatorStakes] = useState<CreatorStake[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStakes = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await apiClient.get('/stakes');
      setListStakes(response.listStakes || []);
      setCreatorStakes(response.creatorStakes || []);
    } catch (error: any) {
      console.error('Error fetching stakes:', error);
      if (Platform.OS === 'web') {
        window.alert(`Error: ${error.message || 'Failed to load stakes'}`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStakes();
  }, []);

  const handleRefresh = () => {
    fetchStakes(true);
  };

  const renderListStake = ({ item }: { item: ListStake }) => (
    <Pressable
      onPress={() => router.push(`/list/${item.listId}` as any)}
      style={({ pressed }) => [
        styles.stakeCard,
        pressed && styles.stakeCardPressed,
      ]}
    >
      <Card variant="elevated" padding={4}>
        <View style={styles.stakeHeader}>
          <View style={styles.stakeTitle}>
            <Ionicons name="map-outline" size={20} color={colors.accent[500]} />
            <Text style={styles.stakeTitleText} numberOfLines={1}>
              {item.list.title}
            </Text>
          </View>
          <Badge
            label={`${item.apr.toFixed(1)}% APR`}
            variant={item.apr > 0 ? 'success' : 'neutral'}
            icon={item.apr > 0 ? 'trending-up' : 'remove'}
          />
        </View>

        <MetadataGrid
          items={[
            { label: 'Staked', value: `${item.amount} TRUST`, icon: 'diamond-outline' },
            { label: 'Earned', value: `${item.earnedRevenue} TRUST`, icon: 'cash-outline' },
          ]}
          columns={2}
        />

        <View style={styles.navigateRow}>
          <Text style={styles.navigateText}>View List</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.accent[500]} />
        </View>
      </Card>
    </Pressable>
  );

  const renderCreatorStake = ({ item }: { item: CreatorStake }) => (
    <Pressable
      onPress={() => router.push(`/creator/${item.targetUserId}` as any)}
      style={({ pressed }) => [
        styles.stakeCard,
        pressed && styles.stakeCardPressed,
      ]}
    >
      <Card variant="elevated" padding={4}>
        <View style={styles.stakeHeader}>
          <View style={styles.stakeTitle}>
            <Ionicons name="person-outline" size={20} color={colors.accent[500]} />
            <Text style={styles.stakeTitleText} numberOfLines={1}>
              {item.targetUser.displayName}
            </Text>
          </View>
          <Badge
            label={`${item.apr.toFixed(1)}% APR`}
            variant={item.apr > 0 ? 'success' : 'neutral'}
            icon={item.apr > 0 ? 'trending-up' : 'remove'}
          />
        </View>

        <MetadataGrid
          items={[
            { label: 'Staked', value: `${item.amount} TRUST`, icon: 'diamond-outline' },
            { label: 'Earned', value: `${item.earnedRevenue} TRUST`, icon: 'cash-outline' },
          ]}
          columns={2}
        />

        <View style={styles.navigateRow}>
          <Text style={styles.navigateText}>View Creator</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.accent[500]} />
        </View>
      </Card>
    </Pressable>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name={activeTab === 'lists' ? 'map-outline' : 'person-outline'}
        size={64}
        color={colors.neutral[300]}
      />
      <Text style={styles.emptyTitle}>No Stakes Yet</Text>
      <Text style={styles.emptyDescription}>
        {activeTab === 'lists'
          ? 'Stake TRUST on lists to earn revenue from their sales'
          : 'Stake TRUST on creators to earn revenue from their content'}
      </Text>
      <Button
        title={activeTab === 'lists' ? 'Browse Marketplace' : 'Discover Creators'}
        onPress={() => router.push(activeTab === 'lists' ? '/(tabs)/marketplace' : '/creators' as any)}
        variant="primary"
        style={styles.emptyButton}
      />
    </View>
  );

  const currentStakes = activeTab === 'lists' ? listStakes : creatorStakes;
  const totalStaked = currentStakes.reduce((sum, stake) => sum + stake.amount, 0);
  const totalEarned = currentStakes.reduce((sum, stake) => sum + stake.earnedRevenue, 0);
  const avgAPR = currentStakes.length > 0
    ? currentStakes.reduce((sum, stake) => sum + stake.apr, 0) / currentStakes.length
    : 0;

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
        <Text style={styles.headerTitle}>My Stakes</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Summary Card */}
      <View style={styles.summaryContainer}>
        <Card variant="elevated" padding={5}>
          <MetadataGrid
            items={[
              { label: 'Total Staked', value: `${totalStaked} TRUST`, icon: 'diamond-outline' },
              { label: 'Total Earned', value: `${totalEarned} TRUST`, icon: 'cash-outline' },
              { label: 'Avg APR', value: `${avgAPR.toFixed(1)}%`, icon: 'trending-up-outline' },
              { label: 'Active Stakes', value: currentStakes.length.toString(), icon: 'analytics-outline' },
            ]}
            columns={2}
          />
        </Card>
      </View>

      {/* Tab Bar */}
      <TabBar
        tabs={[
          { id: 'lists', label: 'On Lists', count: listStakes.length },
          { id: 'creators', label: 'On Creators', count: creatorStakes.length },
        ]}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as StakeType)}
      />

      {/* Stakes List */}
      <FlatList
        data={currentStakes}
        renderItem={activeTab === 'lists' ? renderListStake : renderCreatorStake}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          currentStakes.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
  summaryContainer: {
    padding: spacing[5],
    paddingBottom: spacing[3],
  },
  listContent: {
    padding: spacing[5],
    paddingTop: spacing[3],
    gap: spacing[4],
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing[10],
  },
  stakeCard: {
    marginBottom: spacing[4],
  },
  stakeCardPressed: {
    opacity: 0.7,
  },
  stakeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  stakeTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
    marginRight: spacing[3],
  },
  stakeTitleText: {
    ...textStyles.h4,
    flex: 1,
  },
  navigateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[1],
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  navigateText: {
    ...textStyles.label,
    color: colors.accent[500],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
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
    minWidth: 200,
  },
});

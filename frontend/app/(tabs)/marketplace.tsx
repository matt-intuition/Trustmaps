import { View, Text, StyleSheet, ScrollView, FlatList, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, textStyles } from '../../src/utils/theme';
import { Input } from '../../src/components/common/Input';
import { Badge } from '../../src/components/common/Badge';
import { MarketplaceListCard, MarketplaceList } from '../../src/components/marketplace/MarketplaceListCard';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { apiClient } from '../../src/api/client';

const CATEGORIES = ['All', 'Food & Drink', 'Travel', 'Nightlife', 'Shopping', 'Culture'];
const PRICE_FILTERS = ['All Prices', 'Free Only', 'Paid Only'];

export default function MarketplaceScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState('All Prices');
  const [lists, setLists] = useState<MarketplaceList[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch marketplace lists
  const fetchLists = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        ...(selectedCategory !== 'All' && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery }),
        ...(selectedPriceFilter === 'Free Only' && { isFree: 'true' }),
        ...(selectedPriceFilter === 'Paid Only' && { isFree: 'false' }),
      });

      const response = await fetch(
        `http://localhost:3001/api/lists/marketplace?${params}`,
        {
          headers: {
            Authorization: `Bearer ${apiClient.getToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch marketplace lists');
      }

      const data = await response.json();

      if (refresh || pageNum === 1) {
        setLists(data.lists);
      } else {
        setLists((prev) => [...prev, ...data.lists]);
      }

      setHasMore(data.pagination.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching marketplace lists:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLists(1);
  }, [selectedCategory, searchQuery, selectedPriceFilter]);

  // Refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    fetchLists(1, true);
  };

  // Load more handler
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchLists(page + 1);
    }
  };

  // Handle list press
  const handleListPress = (listId: string) => {
    router.push(`/list/${listId}` as any);
  };

  // Render empty state
  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyState}>
        <Ionicons name="search-outline" size={48} color={colors.neutral[400]} />
        <Text style={[textStyles.body, { color: colors.text.secondary, marginTop: spacing[4] }]}>
          No lists found
        </Text>
        <Text style={[textStyles.bodySmall, { color: colors.text.tertiary, marginTop: spacing[2] }]}>
          Try adjusting your search or filters
        </Text>
      </View>
    );
  };

  // Render footer (loading indicator for pagination)
  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.accent[500]} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={textStyles.h2}>Discover Lists</Text>
        <Text style={[textStyles.bodySmall, { color: colors.text.tertiary, marginTop: spacing[2] }]}>
          Curated city guides from trusted creators
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search lists or cities..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
          size="base"
        />
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((category) => (
          <Pressable
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={styles.categoryButton}
          >
            <Badge
              label={category}
              variant={selectedCategory === category ? 'accent' : 'neutral'}
            />
          </Pressable>
        ))}
      </ScrollView>

      {/* Price Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.priceFiltersContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {PRICE_FILTERS.map((filter) => (
          <Pressable
            key={filter}
            onPress={() => setSelectedPriceFilter(filter)}
            style={styles.categoryButton}
          >
            <Badge
              label={filter}
              variant={selectedPriceFilter === filter ? 'success' : 'neutral'}
            />
          </Pressable>
        ))}
      </ScrollView>

      {/* Lists */}
      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent[500]} />
        </View>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MarketplaceListCard list={item} onPress={handleListPress} />
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent[500]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
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
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
  },
  searchContainer: {
    paddingHorizontal: spacing[6],
    marginTop: spacing[6],
  },
  categoriesContainer: {
    marginTop: spacing[6],
    paddingLeft: spacing[6],
  },
  priceFiltersContainer: {
    marginTop: spacing[3],
    paddingLeft: spacing[6],
  },
  categoriesContent: {
    paddingRight: spacing[6],
  },
  categoryButton: {
    marginRight: spacing[2],
  },
  listContainer: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
    paddingBottom: spacing[10],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[16],
  },
  loadingFooter: {
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
});

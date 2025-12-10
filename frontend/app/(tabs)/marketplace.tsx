import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, textStyles, borderRadius } from '../../src/utils/theme';
import Input from '../../src/components/common/Input';
import Card from '../../src/components/common/Card';
import Badge from '../../src/components/common/Badge';
import { useState } from 'react';

// Mock data for marketplace lists
const MOCK_LISTS = [
  {
    id: '1',
    title: 'Best Coffee Shops in Brooklyn',
    creator: 'Sarah Chen',
    city: 'New York',
    price: 5,
    placeCount: 12,
    coverImage: '☕',
    totalStaked: 250,
    category: 'Food & Drink',
  },
  {
    id: '2',
    title: 'Hidden Gems of Tokyo',
    creator: 'Yuki Tanaka',
    city: 'Tokyo',
    price: 8,
    placeCount: 25,
    coverImage: '🗼',
    totalStaked: 450,
    category: 'Travel',
  },
  {
    id: '3',
    title: 'SF Michelin-Worthy Restaurants',
    creator: 'Marcus Lee',
    city: 'San Francisco',
    price: 10,
    placeCount: 18,
    coverImage: '🍽️',
    totalStaked: 680,
    category: 'Food & Drink',
  },
  {
    id: '4',
    title: 'Berlin Nightlife Guide',
    creator: 'Anna Schmidt',
    city: 'Berlin',
    price: 6,
    placeCount: 15,
    coverImage: '🎵',
    totalStaked: 320,
    category: 'Nightlife',
  },
];

const CATEGORIES = ['All', 'Food & Drink', 'Travel', 'Nightlife', 'Shopping', 'Culture'];

export default function MarketplaceScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredLists = MOCK_LISTS.filter(list => {
    const matchesSearch = list.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         list.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || list.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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

        {/* Lists Grid */}
        <View style={styles.listsGrid}>
          {filteredLists.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={colors.neutral[400]} />
              <Text style={[textStyles.body, { color: colors.text.secondary, marginTop: spacing[4] }]}>
                No lists found
              </Text>
              <Text style={[textStyles.bodySmall, { color: colors.text.tertiary, marginTop: spacing[2] }]}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            filteredLists.map((list) => (
              <Card
                key={list.id}
                variant="interactive"
                style={styles.listCard}
                onPress={() => console.log('View list:', list.id)}
              >
                {/* Cover Image/Emoji */}
                <View style={styles.listCover}>
                  <Text style={styles.coverEmoji}>{list.coverImage}</Text>
                </View>

                {/* List Info */}
                <View style={styles.listInfo}>
                  <Text style={textStyles.h4} numberOfLines={2}>
                    {list.title}
                  </Text>
                  <Text style={[textStyles.caption, { color: colors.text.tertiary, marginTop: spacing[1] }]}>
                    by {list.creator}
                  </Text>

                  {/* Stats Row */}
                  <View style={styles.statsRow}>
                    <View style={styles.stat}>
                      <Ionicons name="location" size={14} color={colors.neutral[500]} />
                      <Text style={[textStyles.caption, { color: colors.text.secondary, marginLeft: spacing[1] }]}>
                        {list.city}
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <Ionicons name="pin" size={14} color={colors.neutral[500]} />
                      <Text style={[textStyles.caption, { color: colors.text.secondary, marginLeft: spacing[1] }]}>
                        {list.placeCount} places
                      </Text>
                    </View>
                  </View>

                  {/* Price & Staking Row */}
                  <View style={styles.priceRow}>
                    <Badge label={`${list.price} TRUST`} variant="accent" />
                    <View style={styles.stakingInfo}>
                      <Ionicons name="diamond" size={12} color={colors.accent[500]} />
                      <Text style={[textStyles.caption, { color: colors.text.tertiary, marginLeft: spacing[1] }]}>
                        {list.totalStaked} staked
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
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
  scrollView: {
    flex: 1,
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
  categoriesContent: {
    paddingRight: spacing[6],
  },
  categoryButton: {
    marginRight: spacing[2],
  },
  listsGrid: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
    paddingBottom: spacing[10],
  },
  listCard: {
    marginBottom: spacing[4],
    padding: 0,
    overflow: 'hidden',
  },
  listCover: {
    height: 120,
    backgroundColor: colors.accent[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverEmoji: {
    fontSize: 48,
  },
  listInfo: {
    padding: spacing[4],
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing[3],
    gap: spacing[4],
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  stakingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[16],
  },
});

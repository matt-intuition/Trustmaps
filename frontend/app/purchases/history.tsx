import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../src/api/client';
import { Avatar } from '../../src/components/common/Avatar';
import { Badge } from '../../src/components/common/Badge';
import { Card } from '../../src/components/common/Card';
import { Skeleton } from '../../src/components/common/Skeleton';
import { colors, typography, spacing, borderRadius, textStyles } from '../../src/utils/theme';

interface Purchase {
  id: string;
  price: number;
  revenueToCreator: number;
  revenueToStakers: number;
  revenueToProtocol: number;
  purchasedAt: string;
  list: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    isFree: boolean;
    price: number;
    coverImage: string | null;
    placeCount: number;
    creator: {
      id: string;
      username: string;
      displayName: string;
      profileImage: string | null;
    };
  };
}

export default function PurchaseHistoryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/lists/purchases/history');
      setPurchases(response.purchases);
    } catch (error: any) {
      console.error('Error loading purchases:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPurchases();
  };

  const handleListPress = (listId: string) => {
    router.push(`/list/${listId}` as any);
  };

  const handleCreatorPress = (creatorId: string) => {
    router.push(`/user/${creatorId}` as any);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            title: 'Purchase History',
            headerShown: true,
            headerBackTitle: 'Back',
          }}
        />
        <View style={styles.loadingContainer}>
          <Skeleton variant="card" height={200} style={{ marginBottom: spacing[4] }} />
          <Skeleton variant="card" height={200} style={{ marginBottom: spacing[4] }} />
          <Skeleton variant="card" height={200} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Purchase History',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />

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
        {purchases.length === 0 ? (
          <Card variant="flat" padding={8} style={styles.emptyCard}>
            <Ionicons name="cart-outline" size={64} color={colors.neutral[400]} />
            <Text style={styles.emptyTitle}>No Purchases Yet</Text>
            <Text style={styles.emptyText}>
              Discover and purchase lists from the Marketplace
            </Text>
            <TouchableOpacity
              style={styles.marketplaceButton}
              onPress={() => router.push('/(tabs)/marketplace')}
            >
              <Text style={styles.marketplaceButtonText}>Browse Marketplace</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.accent[500]} />
            </TouchableOpacity>
          </Card>
        ) : (
          <View style={styles.purchasesList}>
            <Text style={styles.totalText}>
              {purchases.length} {purchases.length === 1 ? 'Purchase' : 'Purchases'}
            </Text>

            {purchases.map((purchase) => (
              <Card key={purchase.id} variant="elevated" padding={0} style={styles.purchaseCard}>
                {/* List Info - Tappable */}
                <TouchableOpacity
                  onPress={() => handleListPress(purchase.list.id)}
                  style={styles.listSection}
                >
                  <View style={styles.listHeader}>
                    <View style={styles.listInfo}>
                      <Text style={styles.listTitle} numberOfLines={1}>
                        {purchase.list.title}
                      </Text>
                      {purchase.list.description && (
                        <Text style={styles.listDescription} numberOfLines={2}>
                          {purchase.list.description}
                        </Text>
                      )}
                      <View style={styles.listMeta}>
                        <Badge
                          label={purchase.list.category}
                          variant="neutral"
                          size="sm"
                        />
                        <View style={styles.metaItem}>
                          <Ionicons name="location-outline" size={14} color={colors.text.tertiary} />
                          <Text style={styles.metaText}>{purchase.list.placeCount} places</Text>
                        </View>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                  </View>
                </TouchableOpacity>

                <View style={styles.divider} />

                {/* Creator Info - Tappable */}
                <TouchableOpacity
                  onPress={() => handleCreatorPress(purchase.list.creator.id)}
                  style={styles.creatorSection}
                >
                  <Avatar
                    imageUrl={purchase.list.creator.profileImage || undefined}
                    initials={purchase.list.creator.displayName?.substring(0, 2) || '??'}
                    size="sm"
                  />
                  <View style={styles.creatorInfo}>
                    <Text style={styles.creatorLabel}>Creator</Text>
                    <Text style={styles.creatorName}>{purchase.list.creator.displayName}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.neutral[400]} />
                </TouchableOpacity>

                <View style={styles.divider} />

                {/* Purchase Details */}
                <View style={styles.detailsSection}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Purchase Date</Text>
                    <Text style={styles.detailValue}>{formatDate(purchase.purchasedAt)}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Price Paid</Text>
                    <View style={styles.priceValue}>
                      <Ionicons name="diamond-outline" size={16} color={colors.accent[500]} />
                      <Text style={[styles.detailValue, { color: colors.accent[500] }]}>
                        {purchase.price} TRUST
                      </Text>
                    </View>
                  </View>

                  {/* Revenue Breakdown */}
                  <View style={styles.breakdownSection}>
                    <Text style={styles.breakdownTitle}>Revenue Distribution</Text>

                    <View style={styles.breakdownRow}>
                      <View style={styles.breakdownLabel}>
                        <View style={[styles.breakdownDot, { backgroundColor: colors.accent[500] }]} />
                        <Text style={styles.breakdownText}>To Creator</Text>
                      </View>
                      <Text style={styles.breakdownValue}>
                        {purchase.revenueToCreator} TRUST
                      </Text>
                    </View>

                    <View style={styles.breakdownRow}>
                      <View style={styles.breakdownLabel}>
                        <View style={[styles.breakdownDot, { backgroundColor: colors.success[500] }]} />
                        <Text style={styles.breakdownText}>To Stakers</Text>
                      </View>
                      <Text style={styles.breakdownValue}>
                        {purchase.revenueToStakers} TRUST
                      </Text>
                    </View>

                    <View style={styles.breakdownRow}>
                      <View style={styles.breakdownLabel}>
                        <View style={[styles.breakdownDot, { backgroundColor: colors.neutral[400] }]} />
                        <Text style={styles.breakdownText}>To Protocol</Text>
                      </View>
                      <Text style={styles.breakdownValue}>
                        {purchase.revenueToProtocol} TRUST
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
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
  marketplaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent[50],
  },
  marketplaceButtonText: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.base,
    color: colors.accent[500],
  },
  purchasesList: {
    padding: spacing[6],
  },
  totalText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing[4],
  },
  purchaseCard: {
    marginBottom: spacing[5],
  },
  listSection: {
    padding: spacing[4],
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  listDescription: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing[3],
    lineHeight: 20,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
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
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginHorizontal: spacing[4],
  },
  creatorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    gap: spacing[3],
  },
  creatorInfo: {
    flex: 1,
  },
  creatorLabel: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
  },
  creatorName: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  detailsSection: {
    padding: spacing[4],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  detailLabel: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  detailValue: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  priceValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  breakdownSection: {
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  breakdownTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  breakdownLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  breakdownValue: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
});

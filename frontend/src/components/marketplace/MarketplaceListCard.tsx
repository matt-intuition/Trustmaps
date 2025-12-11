import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows, textStyles } from '../../utils/theme';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { MetadataGrid } from '../common/MetadataGrid';
import { TrustScoreBadge } from './TrustScoreBadge';
import { ListImageLoader } from './ListImageLoader';
import { ListStatsBar } from './ListStatsBar';

export interface MarketplaceList {
  id: string;
  title: string;
  description?: string | null;
  city?: string | null;
  category?: string | null;
  price: number;
  placeCount: number;
  trustRank: number;
  totalStaked: number;
  totalSales: number;
  averageRating?: number | null;
  imageUrl: string;
  imageType: 'map' | 'photo' | 'gradient';
  isFeatured?: boolean;
  creator: {
    id: string;
    username: string;
    displayName: string;
    creatorReputation: number;
    profileImage?: string | null;
  };
}

interface MarketplaceListCardProps {
  list: MarketplaceList;
  onPress: (listId: string) => void;
}

export function MarketplaceListCard({ list, onPress }: MarketplaceListCardProps) {
  // Metadata grid items
  const metadataItems = [
    { label: 'Places', value: list.placeCount.toString(), icon: 'location' as const },
    { label: 'Sales', value: list.totalSales.toString(), icon: 'cart' as const },
    { label: 'Stakers', value: list.totalStaked > 0 ? Math.ceil(list.totalStaked / 10).toString() : '0', icon: 'people' as const },
    ...(list.averageRating ? [{ label: 'Rating', value: list.averageRating.toFixed(1) }] : []),
  ];

  // Rating label
  const getRatingLabel = (rating: number): string => {
    if (rating >= 8.0) return 'EXCELLENT';
    if (rating >= 6.0) return 'GOOD';
    if (rating >= 4.0) return 'OKAY';
    return 'POOR';
  };

  // Rating dot color
  const getRatingColor = (rating: number): 'success' | 'warning' | 'error' => {
    if (rating >= 8.0) return 'success';
    if (rating >= 6.0) return 'warning';
    return 'error';
  };

  // Creator initials
  const getInitials = (displayName: string): string => {
    const parts = displayName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return displayName.substring(0, 2);
  };

  return (
    <Card
      variant="interactive"
      padding={0}
      style={styles.card}
      onPress={() => onPress(list.id)}
    >
      {/* Image Section with Overlays */}
      <ListImageLoader
        imageUrl={list.imageUrl}
        height={220}
        borderRadiusTop={true}
      >
        {/* Trust Score Badge - Top Right */}
        <View style={styles.trustBadgeContainer}>
          <TrustScoreBadge score={list.trustRank} size="md" />
        </View>

        {/* Category Pill - Bottom Left */}
        {list.category && !list.isFeatured && (
          <View style={styles.categoryContainer}>
            <Badge label={list.category} variant="accent" />
          </View>
        )}

        {/* Featured Badge - Bottom Left */}
        {list.isFeatured && (
          <View style={styles.categoryContainer}>
            <Badge label="TRUSTMAP PICK" variant="accent" icon="star" />
          </View>
        )}
      </ListImageLoader>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={textStyles.h4} numberOfLines={2}>
          {list.title}
        </Text>

        {/* Creator with Avatar */}
        <View style={styles.creatorRow}>
          <Avatar
            imageUrl={list.creator.profileImage || undefined}
            initials={getInitials(list.creator.displayName)}
            size="xs"
          />
          <Text style={[textStyles.caption, styles.creatorName]}>
            {list.creator.displayName}
          </Text>
        </View>

        {/* Metadata Grid */}
        <View style={styles.metadataContainer}>
          <MetadataGrid items={metadataItems} compact />
        </View>

        {/* Price & Rating Row */}
        <View style={styles.priceRow}>
          <Badge
            label={`${list.price} TRUST`}
            variant="accent"
          />
          {list.averageRating !== undefined && list.averageRating !== null && (
            <Badge
              variant="rating"
              score={list.averageRating}
              label={getRatingLabel(list.averageRating)}
              dotColor={getRatingColor(list.averageRating)}
            />
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[4], // 16px between cards
    overflow: 'hidden',
    // Enhanced shadow for more prominent cards
    ...shadows.md,
  },
  trustBadgeContainer: {
    position: 'absolute',
    top: spacing[3], // 12px from top
    right: spacing[3], // 12px from right
  },
  categoryContainer: {
    position: 'absolute',
    bottom: spacing[3], // 12px from bottom
    left: spacing[3], // 12px from left
  },
  content: {
    padding: spacing[4], // 16px padding
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2], // 8px between avatar and name
    marginTop: spacing[2], // 8px below title
  },
  creatorName: {
    color: colors.text.tertiary,
  },
  metadataContainer: {
    marginTop: spacing[3], // 12px below creator
    marginBottom: spacing[2], // 8px above price row
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[2], // 8px below metadata
    paddingTop: spacing[3], // 12px padding top
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});

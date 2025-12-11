import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StarRating } from '../common/StarRating';
import { colors, spacing, borderRadius, textStyles, typography } from '../../utils/theme';
import { formatDistanceToNow } from 'date-fns';

interface ReviewCardProps {
  userName: string;
  userAvatar?: string | null;
  rating: number;
  comment?: string | null;
  createdAt: Date | string;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  userName,
  userAvatar,
  rating,
  comment,
  createdAt,
}) => {
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userName.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <View style={styles.ratingRow}>
            <StarRating rating={rating} size="small" readonly />
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>
        </View>
      </View>

      {/* Comment */}
      {comment && (
        <Text style={styles.comment}>{comment}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.base,
    padding: spacing[4],
    gap: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.semibold,
    color: colors.accent[700],
  },
  userInfo: {
    flex: 1,
    gap: spacing[1],
  },
  userName: {
    ...textStyles.h4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  timeAgo: {
    ...textStyles.caption,
  },
  comment: {
    ...textStyles.body,
    color: colors.text.secondary,
    lineHeight: typography.sizes.base * 1.5,
  },
});

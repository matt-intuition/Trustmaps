import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';

interface BlurredPlaceCardProps {
  index: number;
}

export function BlurredPlaceCard({ index }: BlurredPlaceCardProps) {
  return (
    <Card variant="flat" padding={0} style={styles.container}>
      <View style={styles.content}>
        {/* Blurred content overlay */}
        <View style={styles.blurredOverlay}>
          {/* Number badge */}
          <View style={styles.numberBadge}>
            <Text style={styles.numberText}>{index}</Text>
          </View>

          {/* Blurred placeholder text */}
          <View style={styles.textContainer}>
            <View style={styles.titleBlur} />
            <View style={styles.addressBlur} />
          </View>

          {/* Lock icon */}
          <View style={styles.lockContainer}>
            <Ionicons name="lock-closed" size={20} color={colors.neutral[500]} />
          </View>
        </View>

        {/* Info row */}
        <View style={styles.infoRow}>
          <View style={styles.infoBlur} />
          <View style={styles.infoBlur} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[3],
    opacity: 0.6,
  },
  content: {
    padding: spacing[4],
  },
  blurredOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  numberText: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
  },
  textContainer: {
    flex: 1,
  },
  titleBlur: {
    height: 18,
    width: '70%',
    backgroundColor: colors.neutral[300],
    borderRadius: borderRadius.sm,
    marginBottom: spacing[2],
  },
  addressBlur: {
    height: 14,
    width: '90%',
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.sm,
  },
  lockContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing[2],
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  infoBlur: {
    height: 12,
    width: 60,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.sm,
  },
});

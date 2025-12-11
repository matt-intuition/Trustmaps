/**
 * Avatar Component
 *
 * User avatar with image, initials fallback, and optional status indicator.
 * Supports multiple sizes and border styles.
 *
 * Use for:
 * - User profiles
 * - Creator attribution on list cards
 * - Comment/review authors
 * - Activity feeds
 */

import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, borderRadius } from '../../utils/theme';

export interface AvatarProps {
  /** Image URL */
  imageUrl?: string;
  /** Fallback initials (e.g., "JD" for John Doe) */
  initials?: string;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Border style */
  border?: 'none' | 'thin' | 'thick';
  /** Show online status indicator */
  showStatus?: boolean;
  /** Custom style */
  style?: ViewStyle;
}

const SIZE_CONFIG = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 80,
  xl: 120,
};

const BORDER_WIDTH = {
  none: 0,
  thin: 1,
  thick: 2,
};

// Generate deterministic color from initials (for variety)
const getColorFromInitials = (initials: string): string => {
  const colors = [
    '#6366F1', // Indigo
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#10B981', // Green
    '#3B82F6', // Blue
    '#EF4444', // Red
  ];

  const charCode = initials.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
};

export const Avatar: React.FC<AvatarProps> = ({
  imageUrl,
  initials = '??',
  size = 'md',
  border = 'none',
  showStatus = false,
  style,
}) => {
  const diameter = SIZE_CONFIG[size];
  const borderWidth = BORDER_WIDTH[border];
  const backgroundColor = getColorFromInitials(initials);
  const fontSize = diameter * 0.4; // 40% of diameter for initials

  // Status indicator size based on avatar size
  const statusSize = diameter * 0.25;

  return (
    <View
      style={[
        styles.container,
        {
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          borderWidth,
          borderColor: colors.neutral[200],
        },
        style,
      ]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            {
              width: diameter,
              height: diameter,
              borderRadius: diameter / 2,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.initialsContainer,
            {
              width: diameter,
              height: diameter,
              borderRadius: diameter / 2,
              backgroundColor,
            },
          ]}
        >
          <Text
            style={[
              styles.initials,
              {
                fontSize,
                lineHeight: fontSize * 1.2,
              },
            ]}
          >
            {initials.toUpperCase()}
          </Text>
        </View>
      )}

      {/* Online status indicator */}
      {showStatus && (
        <View
          style={[
            styles.status,
            {
              width: statusSize,
              height: statusSize,
              borderRadius: statusSize / 2,
              borderWidth: Math.max(2, diameter * 0.03), // Border scales with avatar
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  initialsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: typography.fonts.semibold,
    color: '#FFFFFF',
  },
  status: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.success,
    borderColor: colors.neutral[0], // White border
  },
});

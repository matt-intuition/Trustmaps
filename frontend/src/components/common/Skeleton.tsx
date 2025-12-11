/**
 * Skeleton Component
 *
 * Loading placeholder with shimmer animation.
 * Replaces generic ActivityIndicator for better perceived performance.
 *
 * Use for:
 * - List item loading states
 * - Card placeholders while fetching data
 * - Avatar loading
 * - Text content loading
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing } from '../../utils/theme';

export interface SkeletonProps {
  /** Shape variant */
  variant?: 'text' | 'circle' | 'rect' | 'card';
  /** Width (number in px or string like '100%') */
  width?: number | string;
  /** Height (number in px or string like '100%') */
  height?: number;
  /** Number of lines for text variant */
  lines?: number;
  /** Custom style */
  style?: ViewStyle;
}

const DEFAULT_HEIGHTS = {
  text: 16,
  circle: 48,
  rect: 100,
  card: 200,
};

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  width = '100%',
  height,
  lines = 1,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous shimmer animation
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const finalHeight = height || DEFAULT_HEIGHTS[variant];

  // Circle variant
  if (variant === 'circle') {
    const diameter = height || DEFAULT_HEIGHTS.circle;
    return (
      <Animated.View
        style={[
          styles.skeleton,
          {
            width: diameter,
            height: diameter,
            borderRadius: diameter / 2,
            opacity,
          },
          style,
        ]}
      />
    );
  }

  // Text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <View style={style}>
        {Array.from({ length: lines }).map((_, index) => {
          // Last line is 60% width for natural text look
          const lineWidth = index === lines - 1 ? '60%' : width;
          const marginBottom = index < lines - 1 ? spacing[2] : 0;

          return (
            <Animated.View
              key={index}
              style={[
                styles.skeleton,
                styles.text,
                {
                  width: lineWidth,
                  height: finalHeight,
                  opacity,
                  marginBottom,
                },
              ]}
            />
          );
        })}
      </View>
    );
  }

  // Card variant with rounded corners
  if (variant === 'card') {
    return (
      <Animated.View
        style={[
          styles.skeleton,
          styles.card,
          {
            width,
            height: finalHeight,
            opacity,
          },
          style,
        ]}
      />
    );
  }

  // Default rect or single-line text
  return (
    <Animated.View
      style={[
        styles.skeleton,
        variant === 'text' && styles.text,
        {
          width,
          height: finalHeight,
          opacity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.neutral[200],
    overflow: 'hidden',
  },
  text: {
    borderRadius: borderRadius.sm, // 6px - subtle for text
  },
  card: {
    borderRadius: borderRadius.md, // 12px - matches Card component
  },
});

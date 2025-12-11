import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, borderRadius } from '../../utils/theme';

interface TrustScoreBadgeProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  style?: any;
}

export function TrustScoreBadge({ score, size = 'md', style }: TrustScoreBadgeProps) {
  // Clamp score to 0-100
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Determine color based on score
  const getScoreColor = () => {
    if (clampedScore >= 80) {
      return {
        border: '#10B981', // green-500
        background: 'rgba(16, 185, 129, 0.15)',
        text: '#047857', // green-700
      };
    } else if (clampedScore >= 60) {
      return {
        border: '#F59E0B', // amber-500
        background: 'rgba(245, 158, 11, 0.15)',
        text: '#B45309', // amber-700
      };
    } else {
      return {
        border: colors.neutral[400],
        background: 'rgba(156, 163, 175, 0.15)',
        text: colors.neutral[700],
      };
    }
  };

  // Size variants
  const sizes = {
    sm: {
      container: 40,
      fontSize: 14,
      borderWidth: 2,
      labelSize: 9,
    },
    md: {
      container: 56,
      fontSize: 20,
      borderWidth: 3,
      labelSize: 10,
    },
    lg: {
      container: 80,
      fontSize: 28,
      borderWidth: 3,
      labelSize: 11,
    },
  };

  const sizeStyle = sizes[size];
  const scoreColor = getScoreColor();

  return (
    <View
      style={[
        styles.container,
        {
          width: sizeStyle.container,
          height: sizeStyle.container,
          borderRadius: sizeStyle.container / 2,
          borderWidth: sizeStyle.borderWidth,
          borderColor: scoreColor.border,
          backgroundColor: scoreColor.background,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.score,
          {
            fontSize: sizeStyle.fontSize,
            color: scoreColor.text,
            fontFamily: typography.fonts.bold,
          },
        ]}
      >
        {clampedScore}
      </Text>
      <Text
        style={[
          styles.label,
          {
            fontSize: sizeStyle.labelSize,
            color: scoreColor.text,
          },
        ]}
      >
        TRUST
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    // Semi-transparent white background for overlay on images
    backdropFilter: 'blur(10px)',
  },
  score: {
    lineHeight: undefined, // Auto line height for better centering
  },
  label: {
    fontFamily: typography.fonts.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});

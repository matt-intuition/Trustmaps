/**
 * ProgressCircle Component
 *
 * Multi-segment circular progress indicator inspired by SuppCo app.
 * Use for TRUST scores, reputation metrics, staking progress, or any 0-100 value.
 *
 * Features:
 * - Multi-colored segments (like StackScore)
 * - Automatic color coding based on score ranges
 * - Three sizes: sm (60px), md (80px), lg (120px)
 * - Center label with value
 * - Smooth rendering on web and mobile
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography, spacing } from '../../utils/theme';

// Color thresholds for auto-coloring
const getScoreColor = (value: number): string => {
  if (value >= 80) return colors.success; // Green for excellent
  if (value >= 60) return colors.warning; // Amber for good
  return colors.error; // Red for poor
};

export interface ProgressSegment {
  color: string;
  percentage: number; // 0-100
}

export interface ProgressCircleProps {
  /** Current value (0-100) */
  value: number;
  /** Optional label below the value */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom segments for multi-color progress (overrides default single color) */
  segments?: ProgressSegment[];
  /** Show value in center (default: true) */
  showValue?: boolean;
}

const SIZE_CONFIG = {
  sm: {
    diameter: 60,
    strokeWidth: 4,
    fontSize: 16,
    labelFontSize: 10,
  },
  md: {
    diameter: 80,
    strokeWidth: 6,
    fontSize: 20,
    labelFontSize: 12,
  },
  lg: {
    diameter: 120,
    strokeWidth: 8,
    fontSize: 31,
    labelFontSize: 14,
  },
};

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  value,
  label,
  size = 'md',
  segments,
  showValue = true,
}) => {
  const config = SIZE_CONFIG[size];
  const radius = (config.diameter - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = config.diameter / 2;

  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));

  // Calculate segments or use default single segment
  const finalSegments: ProgressSegment[] = segments || [
    { color: getScoreColor(clampedValue), percentage: clampedValue },
  ];

  // Render multiple segments as separate arcs
  let accumulatedPercentage = 0;
  const segmentArcs = finalSegments.map((segment, index) => {
    const segmentLength = (segment.percentage / 100) * circumference;
    const offset = circumference - segmentLength;
    const rotation = (accumulatedPercentage / 100) * 360 - 90; // Start from top (-90deg)

    accumulatedPercentage += segment.percentage;

    return (
      <Circle
        key={index}
        cx={center}
        cy={center}
        r={radius}
        stroke={segment.color}
        strokeWidth={config.strokeWidth}
        strokeDasharray={`${segmentLength} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        fill="none"
        rotation={rotation}
        origin={`${center}, ${center}`}
      />
    );
  });

  return (
    <View style={[styles.container, { width: config.diameter, height: config.diameter }]}>
      <Svg width={config.diameter} height={config.diameter}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.neutral[200]}
          strokeWidth={config.strokeWidth}
          fill="none"
        />
        {/* Colored segments */}
        {segmentArcs}
      </Svg>

      {/* Center content */}
      {showValue && (
        <View style={styles.centerContent}>
          <Text
            style={[
              styles.value,
              {
                fontSize: config.fontSize,
                fontFamily: typography.fonts.bold,
                color: colors.text.primary,
              },
            ]}
          >
            {Math.round(clampedValue)}
          </Text>
          {label && (
            <Text
              style={[
                styles.label,
                {
                  fontSize: config.labelFontSize,
                  fontFamily: typography.fonts.medium,
                  color: colors.text.tertiary,
                },
              ]}
            >
              {label.toUpperCase()}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    lineHeight: undefined, // Let system handle it for tight centering
  },
  label: {
    marginTop: spacing[1],
    letterSpacing: 0.5,
  },
});

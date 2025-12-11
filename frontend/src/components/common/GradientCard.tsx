/**
 * GradientCard Component
 *
 * Premium feature card with gradient background (inspired by SuppCo's "Go Pro" card).
 * Uses LinearGradient for smooth color transitions.
 *
 * Use for:
 * - Premium/Pro feature promotions
 * - Special offers
 * - Highlighted CTAs
 */

import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography, shadows } from '@/utils/theme';
import { Button } from './Button';

export interface GradientCardProps {
  /** Gradient colors (2 colors: [start, end]) */
  gradient: [string, string];
  /** Main title */
  title: string;
  /** Subtitle/description */
  subtitle: string;
  /** CTA button text */
  ctaText: string;
  /** CTA button color (default: #FBBF24 yellow) */
  ctaColor?: string;
  /** On press handler */
  onPress: () => void;
  /** Optional icon in top-right */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Optional dismiss/close callback */
  onDismiss?: () => void;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  gradient,
  title,
  subtitle,
  ctaText,
  ctaColor = '#FBBF24', // Yellow accent
  onPress,
  icon,
  onDismiss,
}) => {
  return (
    <View style={[styles.container, shadows.md]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Dismiss button */}
        {onDismiss && (
          <Pressable
            onPress={onDismiss}
            style={styles.dismissButton}
            hitSlop={spacing[3]}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </Pressable>
        )}

        {/* Icon */}
        {icon && !onDismiss && (
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={24} color="#FFFFFF" />
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {/* CTA Button */}
          <Pressable
            onPress={onPress}
            style={[styles.button, { backgroundColor: ctaColor }]}
          >
            <Text style={styles.buttonText}>{ctaText}</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  gradient: {
    padding: spacing[6],
    minHeight: 180,
    justifyContent: 'space-between',
  },
  dismissButton: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    zIndex: 10,
  },
  iconContainer: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xl,
    lineHeight: typography.sizes.xl * typography.lineHeights.tight,
    color: '#FFFFFF',
    marginBottom: spacing[2],
  },
  subtitle: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.base,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing[5],
  },
  button: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.base,
    alignSelf: 'flex-start',
  },
  buttonText: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.base,
    color: '#000000',
  },
});

import React, { useState } from 'react';
import { View, Image, StyleSheet, ViewStyle, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius } from '../../utils/theme';

interface ListImageLoaderProps {
  imageUrl: string;
  fallbackUrl?: string;
  alt?: string;
  height?: number;
  borderRadiusTop?: boolean; // Apply border radius only to top corners
  style?: ViewStyle;
  children?: React.ReactNode; // For overlays (badges, etc.)
}

export function ListImageLoader({
  imageUrl,
  fallbackUrl,
  alt = 'List image',
  height = 220,
  borderRadiusTop = true,
  style,
  children,
}: ListImageLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(imageUrl);
  const [shimmerAnim] = useState(new Animated.Value(0));

  // Shimmer animation for loading state
  React.useEffect(() => {
    if (isLoading) {
      Animated.loop(
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
      ).start();
    }
  }, [isLoading]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    // If primary URL fails and we have a fallback, try it
    if (!hasError && fallbackUrl && currentUrl !== fallbackUrl) {
      setCurrentUrl(fallbackUrl);
      setHasError(false);
    } else {
      // No fallback or fallback also failed
      setIsLoading(false);
      setHasError(true);
    }
  };

  const borderRadiusStyle = borderRadiusTop
    ? {
        borderTopLeftRadius: borderRadius.lg,
        borderTopRightRadius: borderRadius.lg,
      }
    : {
        borderRadius: borderRadius.md,
      };

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.container, { height }, borderRadiusStyle, style]}>
      {/* Skeleton loader while loading */}
      {isLoading && (
        <Animated.View
          style={[
            styles.skeleton,
            borderRadiusStyle,
            {
              opacity: shimmerOpacity,
            },
          ]}
        />
      )}

      {/* Actual image */}
      {!hasError && (
        <Image
          source={{ uri: currentUrl }}
          style={[styles.image, borderRadiusStyle]}
          onLoad={handleLoad}
          onError={handleError}
          accessibilityLabel={alt}
        />
      )}

      {/* Error fallback - show gradient */}
      {hasError && (
        <LinearGradient
          colors={[colors.neutral[100], colors.neutral[200]]}
          style={[styles.errorGradient, borderRadiusStyle]}
        />
      )}

      {/* Gradient overlay at bottom for text readability */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.4)']}
        style={[styles.gradientOverlay, borderRadiusStyle]}
      />

      {/* Children (badges, overlays, etc.) */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: colors.neutral[100],
    overflow: 'hidden',
  },
  skeleton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.neutral[200],
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  errorGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
});

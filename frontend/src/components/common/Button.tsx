import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  Pressable,
  Platform,
} from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../utils/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'base' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'base',
  loading = false,
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // Size specifications from design system
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: 36,
          paddingHorizontal: spacing[4], // 16px
          minWidth: 88, // Touch target minimum
        };
      case 'lg':
        return {
          height: 52,
          paddingHorizontal: spacing[4], // 16px
          minWidth: 88,
        };
      default: // 'base'
        return {
          height: 44,
          paddingHorizontal: spacing[4], // 16px
          minWidth: 88,
        };
    }
  };

  // Font sizes for each button size
  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return typography.sizes.sm; // 14px
      case 'lg':
        return typography.sizes.lg; // 20px
      default: // 'base'
        return typography.sizes.base; // 16px
    }
  };

  // Variant color schemes - flat colors only, NO gradients
  const getVariantStyles = (pressed: boolean) => {
    if (isDisabled) {
      // Disabled state: neutral.300 background, neutral.400 text
      return {
        button: {
          backgroundColor: colors.neutral[300],
          borderWidth: 0,
        },
        text: {
          color: colors.neutral[400],
        },
      };
    }

    switch (variant) {
      case 'primary':
        // Primary: accent.500 bg → accent.600 (hover) → accent.700 (pressed)
        return {
          button: {
            backgroundColor: pressed ? colors.accent[700] : colors.accent[500],
            borderWidth: 0,
          },
          text: {
            color: colors.text.inverse, // White
          },
        };

      case 'secondary':
        // Secondary: neutral.900 bg → neutral.800 (pressed)
        return {
          button: {
            backgroundColor: pressed ? colors.neutral[800] : colors.neutral[900],
            borderWidth: 0,
          },
          text: {
            color: colors.text.inverse, // White
          },
        };

      case 'outline':
        // Outline: transparent bg, accent.500 border + text
        return {
          button: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: pressed ? colors.accent[600] : colors.accent[500],
          },
          text: {
            color: pressed ? colors.accent[600] : colors.accent[500],
          },
        };

      case 'ghost':
        // Ghost: transparent bg, neutral.600 text
        return {
          button: {
            backgroundColor: pressed ? colors.neutral[100] : 'transparent',
            borderWidth: 0,
          },
          text: {
            color: colors.neutral[600],
          },
        };

      case 'danger':
        // Danger: error red bg → darker on press
        return {
          button: {
            backgroundColor: pressed ? '#DC2626' : colors.error, // Darker red on press
            borderWidth: 0,
          },
          text: {
            color: colors.text.inverse, // White
          },
        };

      default:
        return {
          button: { backgroundColor: colors.accent[500], borderWidth: 0 },
          text: { color: colors.text.inverse },
        };
    }
  };

  const renderContent = (pressed: boolean) => {
    const variantStyles = getVariantStyles(pressed);

    return (
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            color={variantStyles.text.color}
            size={size === 'sm' ? 'small' : 'small'}
          />
        ) : (
          <>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text
              style={[
                styles.text,
                {
                  fontSize: getTextSize(),
                  color: variantStyles.text.color,
                },
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </View>
    );
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        getSizeStyles(),
        getVariantStyles(pressed).button,
        style,
      ]}
    >
      {({ pressed }) => renderContent(pressed)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.base, // 8px
    justifyContent: 'center',
    alignItems: 'center',
    // No shadows - clean, flat design
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing[2], // 8px icon spacing
  },
  text: {
    fontFamily: typography.fonts.medium, // Inter_500Medium
    textAlign: 'center',
    // Line height handled by font
  },
});

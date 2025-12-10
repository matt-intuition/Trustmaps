import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '../../utils/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  size?: 'sm' | 'base' | 'lg';
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  size = 'base',
  editable = true,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isDisabled = !editable;

  // Size specifications from design system
  const getInputHeight = () => {
    switch (size) {
      case 'sm':
        return 44;
      case 'lg':
        return 52;
      default: // 'base'
        return 48;
    }
  };

  // Icon color changes on focus (both left AND right icons)
  const getIconColor = () => {
    if (isDisabled) return colors.neutral[400];
    if (isFocused) return colors.accent[500];
    return colors.neutral[500];
  };

  // Border color based on state
  const getBorderStyle = () => {
    if (error) {
      return {
        borderColor: colors.error,
        borderWidth: 1,
      };
    }
    if (isFocused) {
      return {
        borderColor: colors.accent[500],
        borderWidth: 2, // Thicker border on focus
        // Box-shadow effect for web (subtle glow)
        shadowColor: colors.accent[100],
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 3,
        elevation: 0, // No elevation on Android (visual noise)
      };
    }
    return {
      borderColor: colors.neutral[200],
      borderWidth: 1,
    };
  };

  // Background color based on state
  const getBackgroundColor = () => {
    if (isDisabled) return colors.neutral[100];
    if (props.editable === false) return colors.neutral[50]; // Read-only
    if (isFocused) return colors.accent[50]; // Subtle accent background on focus
    return colors.surface; // White by default
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <View
        style={[
          styles.inputContainer,
          { height: getInputHeight(), backgroundColor: getBackgroundColor() },
          getBorderStyle(),
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={getIconColor()}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          {...props}
          editable={editable}
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            isDisabled && styles.inputDisabled,
          ]}
          placeholderTextColor={colors.neutral[400]}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            activeOpacity={0.7}
            disabled={!onRightIconPress}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={getIconColor()} // Now changes color on focus!
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4], // 16px between fields
  },
  label: {
    fontFamily: typography.fonts.medium, // Inter_500Medium
    fontSize: typography.sizes.sm, // 14px
    color: colors.text.secondary, // neutral.600
    marginBottom: spacing[2], // 8px below label
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.base, // 8px
    paddingHorizontal: spacing[4], // 16px
  },
  input: {
    flex: 1,
    fontFamily: typography.fonts.primary, // Inter_400Regular
    fontSize: typography.sizes.base, // 16px
    color: colors.text.primary, // neutral.900
    paddingVertical: 0,
    // Remove default outline on web
    outlineStyle: 'none',
  },
  inputDisabled: {
    color: colors.neutral[400],
  },
  inputWithLeftIcon: {
    marginLeft: spacing[1], // 4px extra spacing
  },
  inputWithRightIcon: {
    marginRight: spacing[1], // 4px extra spacing
  },
  leftIcon: {
    marginRight: spacing[3], // 12px from edge (icon to input)
  },
  rightIcon: {
    padding: spacing[2], // 8px touchable area
    marginLeft: spacing[3], // 12px from edge (input to icon)
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[2], // 8px above error
  },
  errorText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs, // 12px
    color: colors.error,
    marginLeft: spacing[2], // 8px between icon and text
  },
});

import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, borderRadius, spacing, shadows, typography, textStyles } from '../../utils/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  primaryAction?: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  maxHeight?: number;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  primaryAction,
  secondaryAction,
  maxHeight = 600,
}) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable
          style={styles.overlayPressable}
          onPress={onClose}
          accessibilityLabel="Close modal"
        >
          <Pressable
            style={[styles.modalContainer, { maxHeight }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Pressable
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={spacing[2]}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {children}
            </ScrollView>

            {/* Actions */}
            {(primaryAction || secondaryAction) && (
              <View style={styles.actions}>
                {secondaryAction && (
                  <Pressable
                    onPress={secondaryAction.onPress}
                    style={({ pressed }) => [
                      styles.button,
                      styles.secondaryButton,
                      pressed && styles.buttonPressed,
                    ]}
                    accessibilityLabel={secondaryAction.label}
                    accessibilityRole="button"
                  >
                    <Text style={styles.secondaryButtonText}>
                      {secondaryAction.label}
                    </Text>
                  </Pressable>
                )}
                {primaryAction && (
                  <Pressable
                    onPress={primaryAction.onPress}
                    disabled={primaryAction.disabled || primaryAction.loading}
                    style={({ pressed }) => [
                      styles.button,
                      styles.primaryButton,
                      (primaryAction.disabled || primaryAction.loading) &&
                        styles.buttonDisabled,
                      pressed && !primaryAction.disabled && styles.buttonPressed,
                    ]}
                    accessibilityLabel={primaryAction.label}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        styles.primaryButtonText,
                        (primaryAction.disabled || primaryAction.loading) &&
                          styles.buttonTextDisabled,
                      ]}
                    >
                      {primaryAction.loading ? 'Loading...' : primaryAction.label}
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayPressable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 500,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...textStyles.h3,
    flex: 1,
  },
  closeButton: {
    width: 44, // Minimum touch target
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing[2],
  },
  closeText: {
    fontSize: typography.sizes.lg,
    color: colors.text.secondary,
    fontFamily: typography.fonts.primary,
  },
  content: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flex: 1,
    minHeight: 44, // Minimum touch target
    borderRadius: borderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  primaryButton: {
    backgroundColor: colors.accent[500],
  },
  secondaryButton: {
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    backgroundColor: colors.neutral[300],
  },
  primaryButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
  },
  secondaryButtonText: {
    ...textStyles.button,
    color: colors.text.primary,
  },
  buttonTextDisabled: {
    color: colors.text.disabled,
  },
});

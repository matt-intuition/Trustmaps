/**
 * Haptic Feedback Utility
 *
 * Provides tactile feedback for user interactions.
 * Uses expo-haptics on iOS/Android, gracefully degrades on web.
 *
 * Usage:
 * - Light: Button presses, tab switches, selection
 * - Medium: Success actions, confirmations
 * - Heavy: Errors, important alerts, destructive actions
 * - Selection: Picker/slider value changes
 * - Notification: Background task completion (success/warning/error)
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Light impact feedback
 * Use for: Button presses, tab navigation, chip selection
 */
export const lightImpact = () => {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

/**
 * Medium impact feedback
 * Use for: Successful actions, confirmations, purchases
 */
export const mediumImpact = () => {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

/**
 * Heavy impact feedback
 * Use for: Errors, critical alerts, destructive actions (delete, logout)
 */
export const heavyImpact = () => {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

/**
 * Selection feedback (iOS: subtle click, Android: light vibration)
 * Use for: Scrolling through pickers, adjusting sliders, incremental changes
 */
export const selectionFeedback = () => {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync();
};

/**
 * Notification feedback with type
 * Use for: Background task completion, toast notifications
 */
export const notificationFeedback = (
  type: 'success' | 'warning' | 'error' = 'success'
) => {
  if (Platform.OS === 'web') return;

  const feedbackType = {
    success: Haptics.NotificationFeedbackType.Success,
    warning: Haptics.NotificationFeedbackType.Warning,
    error: Haptics.NotificationFeedbackType.Error,
  }[type];

  Haptics.notificationAsync(feedbackType);
};

/**
 * Convenience wrappers for common scenarios
 */
export const haptics = {
  // Button interactions
  buttonPress: lightImpact,
  buttonPressLight: lightImpact,
  buttonPressHeavy: mediumImpact,

  // Success/Error states
  success: () => notificationFeedback('success'),
  warning: () => notificationFeedback('warning'),
  error: () => notificationFeedback('error'),

  // Navigation
  tabSwitch: lightImpact,
  pageSwipe: selectionFeedback,

  // Selections
  chipSelect: lightImpact,
  filterToggle: lightImpact,
  sliderChange: selectionFeedback,

  // Actions
  purchase: mediumImpact,
  stake: mediumImpact,
  delete: heavyImpact,
  logout: heavyImpact,
};

export default haptics;

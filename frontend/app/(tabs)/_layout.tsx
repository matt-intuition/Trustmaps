import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, shadows, spacing } from '../../src/utils/theme';

/**
 * Tab Navigator - Mobile-First Design
 *
 * Design Specifications:
 * - Height: 64px (web), 60px + safe area bottom (mobile)
 * - Background: surface white (#FFFFFF)
 * - Border: 1px solid neutral.200 (#E5E5E5)
 * - Shadow: shadows.sm (subtle floating feel)
 * - Active color: accent.500 (#6366F1)
 * - Inactive color: neutral.500 (#737373)
 * - Icon size: 24px
 * - Label: xs size (12px), Inter Medium
 * - Touch targets: 44x44px minimum (handled by Expo Router)
 * - Safe area insets: Proper bottom padding on iOS/Android
 * - NO decorative elements, flat colors only
 */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent[500],
        tabBarInactiveTintColor: colors.neutral[500],
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.neutral[200],
          borderTopWidth: 1,
          // Platform-specific heights with proper safe area handling
          height: Platform.select({
            web: 64,
            default: 60 + insets.bottom, // iOS/Android with safe area
          }),
          paddingTop: spacing[2], // 8px
          paddingBottom: Platform.select({
            web: spacing[2], // 8px
            default: insets.bottom > 0 ? insets.bottom : spacing[2], // Use safe area or fallback
          }),
          // Subtle shadow for floating feel
          ...shadows.sm,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fonts.medium, // Inter_500Medium
          fontSize: typography.sizes.xs, // 12px
          marginTop: spacing[1], // 4px gap between icon and label
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Marketplace',
          tabBarIcon: ({ color }) => (
            <Ionicons name="compass" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => (
            <Ionicons name="bookmarks" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

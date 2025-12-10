import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { Button } from '../../src/components/common/Button';
import { Badge } from '../../src/components/common/Badge';
import { Card } from '../../src/components/common/Card';
import { colors, typography, spacing, borderRadius, textStyles } from '../../src/utils/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header - Avatar + Name + Username */}
        <View style={styles.header}>
          {/* Avatar - Flat accent.500 background, 80px */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.displayName}>{user?.displayName}</Text>
          <Text style={styles.username}>@{user?.username}</Text>

          {/* Reputation Badge */}
          <View style={styles.reputationContainer}>
            <Badge
              label={`Reputation: ${user?.creatorReputation}`}
              variant="accent"
              icon="star"
            />
          </View>
        </View>

        {/* Stats Row - 2 column grid */}
        <Card variant="flat" padding={5} style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.trustBalance}</Text>
            <Text style={styles.statLabel}>TRUST Balance</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.totalStaked}</Text>
            <Text style={styles.statLabel}>Staked</Text>
          </View>
        </Card>

        {/* Menu Items - Flat cards, no shadows */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="map-outline" size={20} color={colors.neutral[600]} />
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>My Lists</Text>
              <Text style={styles.menuSubtitle}>{user?._count?.createdLists || 0} lists</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="cart-outline" size={20} color={colors.neutral[600]} />
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Purchases</Text>
              <Text style={styles.menuSubtitle}>{user?._count?.purchases || 0} lists</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="trending-up-outline" size={20} color={colors.neutral[600]} />
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>My Stakes</Text>
              <Text style={styles.menuSubtitle}>{user?._count?.stakes || 0} active</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={20} color={colors.neutral[600]} />
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>
        </View>

        {/* Logout Button - Danger variant */}
        <View style={styles.logoutContainer}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="danger"
            icon={<Ionicons name="log-out-outline" size={20} color={colors.text.inverse} />}
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // neutral.50
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: spacing[6], // 24px
  },
  avatar: {
    width: 80, // Reduced from 96px
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent[500], // Flat indigo
    borderWidth: 2,
    borderColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4], // 16px
  },
  avatarText: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes['2xl'], // 31px
    color: colors.text.inverse, // White
  },
  displayName: {
    ...textStyles.h2, // 25px, bold, neutral.900
  },
  username: {
    ...textStyles.bodySmall, // 14px, normal, neutral.600
    marginTop: spacing[2], // 8px
  },
  reputationContainer: {
    marginTop: spacing[3], // 12px
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing[6], // 24px
    marginBottom: spacing[6], // 24px
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xl, // 25px
    color: colors.text.primary, // neutral.900
    marginBottom: spacing[1], // 4px
  },
  statLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm, // 14px
    color: colors.text.secondary, // neutral.600
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.neutral[200],
  },
  menuSection: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing[6], // 24px
    borderRadius: borderRadius.md, // 12px
    borderWidth: 1,
    borderColor: colors.neutral[200],
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56, // Fixed height
    paddingHorizontal: spacing[4], // 16px
  },
  menuContent: {
    flex: 1,
    marginLeft: spacing[3], // 12px left of content
  },
  menuTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.base, // 16px
    color: colors.text.primary, // neutral.900
  },
  menuSubtitle: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm, // 14px
    color: colors.text.secondary, // neutral.600
    marginTop: spacing[1], // 4px
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginHorizontal: spacing[4], // 16px
  },
  logoutContainer: {
    padding: spacing[6], // 24px
    paddingTop: spacing[8], // 32px margin top
  },
  logoutButton: {
    width: '100%',
  },
});

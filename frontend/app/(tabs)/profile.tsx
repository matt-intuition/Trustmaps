import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../../src/stores/authStore';
import { Button } from '../../src/components/common/Button';
import { Badge } from '../../src/components/common/Badge';
import { Card } from '../../src/components/common/Card';
import { Avatar } from '../../src/components/common/Avatar';
import { ProgressCircle } from '../../src/components/common/ProgressCircle';
import { MetadataGrid } from '../../src/components/common/MetadataGrid';
import { colors, typography, spacing, borderRadius, textStyles } from '../../src/utils/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, loadUser } = useAuthStore();

  // Refresh user data when screen loads
  useEffect(() => {
    loadUser();
  }, []);

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
        {/* Header - Avatar + Name + Username + Reputation */}
        <View style={styles.header}>
          {/* Avatar Component - xl size (120px) */}
          <Avatar
            imageUrl={user?.profileImage || undefined}
            initials={user?.displayName?.substring(0, 2) || '??'}
            size="xl"
            border="thick"
            style={styles.avatar}
          />

          <Text style={styles.displayName}>{user?.displayName}</Text>
          <Text style={styles.username}>@{user?.username}</Text>

          {/* Reputation ProgressCircle - replaces badge */}
          <View style={styles.reputationContainer}>
            <ProgressCircle
              value={Math.min((user?.creatorReputation || 0) * 10, 100)}
              label="Reputation"
              size="md"
            />
          </View>

          {/* Edit Profile Button */}
          <Button
            title="Edit Profile"
            variant="outline"
            onPress={() => router.push('/profile/edit' as any)}
            style={styles.editButton}
          />
        </View>

        {/* Stats Grid - 2x2 MetadataGrid */}
        <Card variant="flat" padding={5} style={styles.statsCard}>
          <MetadataGrid
            items={[
              { label: 'TRUST Balance', value: user?.trustBalance || 0, icon: 'diamond-outline' },
              { label: 'Staked', value: user?.totalStaked || 0, icon: 'trending-up-outline' },
              { label: 'My Lists', value: user?._count?.createdLists || 0, icon: 'map-outline' },
              { label: 'Purchases', value: user?._count?.purchases || 0, icon: 'cart-outline' },
            ]}
            columns={2}
          />
        </Card>

        {/* Menu Items - Flat cards, no shadows */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/library')}
          >
            <Ionicons name="map-outline" size={20} color={colors.neutral[600]} />
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>My Lists</Text>
              <Text style={styles.menuSubtitle}>{user?._count?.createdLists || 0} lists</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/purchases/history' as any)}
          >
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
    marginBottom: spacing[4], // 16px
  },
  displayName: {
    ...textStyles.h2, // 25px, bold, neutral.900
  },
  username: {
    ...textStyles.bodySmall, // 14px, normal, neutral.600
    marginTop: spacing[2], // 8px
  },
  reputationContainer: {
    marginTop: spacing[4], // 16px
  },
  editButton: {
    marginTop: spacing[4], // 16px
    minWidth: 140,
  },
  statsCard: {
    marginHorizontal: spacing[6], // 24px
    marginBottom: spacing[6], // 24px
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

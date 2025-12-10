import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { colors, typography, spacing, borderRadius, shadows, textStyles } from '../../src/utils/theme';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header - Greeting + TRUST Balance */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.displayName}</Text>
          </View>
          <Badge
            label={`${user?.trustBalance || 0}`}
            variant="accent"
            icon="diamond"
          />
        </View>

        {/* Stats Cards - Clean, flat design with accent.500 icons */}
        <View style={styles.statsContainer}>
          <Card
            variant="interactive"
            padding={4}
            style={styles.statCard}
            onPress={() => router.push('/library')}
          >
            <Ionicons name="map" size={24} color={colors.accent[500]} />
            <Text style={styles.statValue}>{user?._count?.createdLists || 0}</Text>
            <Text style={styles.statLabel}>My Lists</Text>
          </Card>

          <Card variant="elevated" padding={4} style={styles.statCard}>
            <Ionicons name="cart" size={24} color={colors.accent[500]} />
            <Text style={styles.statValue}>{user?._count?.purchases || 0}</Text>
            <Text style={styles.statLabel}>Purchased</Text>
          </Card>

          <Card variant="elevated" padding={4} style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color={colors.accent[500]} />
            <Text style={styles.statValue}>{user?._count?.stakes || 0}</Text>
            <Text style={styles.statLabel}>Stakes</Text>
          </Card>
        </View>

        {/* Quick Actions - Interactive cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <Card
            variant="interactive"
            padding={5}
            style={styles.actionCard}
            onPress={() => router.push('/import')}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="cloud-upload-outline" size={32} color={colors.accent[500]} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Import Your Maps</Text>
              <Text style={styles.actionDescription}>
                Upload your Google Takeout to get started
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </Card>

          <Card
            variant="interactive"
            padding={5}
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/marketplace')}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="compass-outline" size={32} color={colors.accent[500]} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Explore Marketplace</Text>
              <Text style={styles.actionDescription}>
                Discover curated guides from local experts
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </Card>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[6], // 24px
  },
  greeting: {
    ...textStyles.bodySmall, // 14px, normal weight, neutral.600
  },
  userName: {
    ...textStyles.h2, // 25px, bold, neutral.900
    marginTop: spacing[1], // 4px
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[6], // 24px
    gap: spacing[4], // 16px between cards
    marginBottom: spacing[6], // 24px
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes['2xl'], // 31px
    color: colors.text.primary, // neutral.900
    marginTop: spacing[2], // 8px
  },
  statLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm, // 14px
    color: colors.text.secondary, // neutral.600
    marginTop: spacing[1], // 4px
  },
  section: {
    padding: spacing[6], // 24px
  },
  sectionTitle: {
    ...textStyles.h3, // 20px, semibold, neutral.900
    marginBottom: spacing[4], // 16px
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4], // 16px
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md, // 12px
    backgroundColor: colors.accent[50], // Lightest indigo background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4], // 16px
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.lg, // 20px
    color: colors.text.primary, // neutral.900
    marginBottom: spacing[1], // 4px
  },
  actionDescription: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm, // 14px
    color: colors.text.secondary, // neutral.600
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
});

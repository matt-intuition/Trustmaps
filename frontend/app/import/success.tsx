import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/common/Button';
import { Badge } from '../../src/components/common/Badge';
import { colors, typography, spacing, textStyles, borderRadius } from '../../src/utils/theme';

export default function SuccessScreen() {
  const router = useRouter();

  // TODO: Get actual import results from route params or state
  const importResults = {
    listsCreated: 1,
    placesImported: 47,
    errors: [],
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Success icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={64} color={colors.surface} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Import Successful!</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Your places have been imported and are now available in your library
        </Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{importResults.listsCreated}</Text>
            <Text style={styles.statLabel}>
              {importResults.listsCreated === 1 ? 'List Created' : 'Lists Created'}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{importResults.placesImported}</Text>
            <Text style={styles.statLabel}>
              {importResults.placesImported === 1 ? 'Place Imported' : 'Places Imported'}
            </Text>
          </View>
        </View>

        {/* Earned TRUST badge */}
        <View style={styles.rewardContainer}>
          <Badge
            label="+10 TRUST earned"
            variant="success"
            icon="diamond"
          />
        </View>

        {/* Action buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="View My Lists"
            onPress={() => router.push('/(tabs)/home')}
            variant="primary"
            size="lg"
            leftIcon="list-outline"
            style={styles.button}
          />
          <Button
            title="Import Another"
            onPress={() => router.push('/import')}
            variant="outline"
            size="lg"
            leftIcon="add-outline"
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing[6],
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing[6],
  },
  iconCircle: {
    width: 128,
    height: 128,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...textStyles.h2,
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginBottom: spacing[8],
    textAlign: 'center',
    maxWidth: 400,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing[5],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    alignSelf: 'stretch',
    maxWidth: 400,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.neutral[200],
    marginHorizontal: spacing[4],
  },
  statValue: {
    ...textStyles.h2,
    color: colors.accent[500],
    marginBottom: spacing[1],
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  rewardContainer: {
    marginBottom: spacing[8],
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 400,
  },
  button: {
    marginBottom: spacing[3],
  },
});

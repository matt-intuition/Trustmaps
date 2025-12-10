import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StepLayout } from '../../src/components/import/StepLayout';
import { ExternalLink } from '../../src/components/import/ExternalLink';
import { Card } from '../../src/components/common/Card';
import { colors, spacing, textStyles, borderRadius } from '../../src/utils/theme';

export default function Step1Screen() {
  const router = useRouter();

  return (
    <StepLayout
      stepNumber={1}
      totalSteps={5}
      title="Navigate to Google Takeout"
      onNext={() => router.push('/import/step-2')}
      onBack={() => router.back()}
    >
      <Card variant="elevated" style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="globe-outline" size={48} color={colors.accent[500]} />
        </View>
        <Text style={styles.cardTitle}>Open Google Takeout</Text>
        <Text style={styles.cardDescription}>
          Google Takeout lets you export your data from Google services, including your saved places from Google Maps.
        </Text>
      </Card>

      <View style={styles.linkContainer}>
        <ExternalLink url="https://takeout.google.com">
          Open Google Takeout
        </ExternalLink>
      </View>

      <View style={styles.noteContainer}>
        <Ionicons name="information-circle" size={20} color={colors.text.secondary} />
        <Text style={styles.noteText}>
          Make sure you're logged into your Google account first
        </Text>
      </View>
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing[6],
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  iconContainer: {
    marginBottom: spacing[4],
  },
  cardTitle: {
    ...textStyles.h3,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  cardDescription: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  linkContainer: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.base,
    gap: spacing[2],
  },
  noteText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    flex: 1,
  },
});

import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StepLayout } from '../../src/components/import/StepLayout';
import { Card } from '../../src/components/common/Card';
import { colors, spacing, textStyles, borderRadius } from '../../src/utils/theme';

export default function Step5Screen() {
  const router = useRouter();

  return (
    <StepLayout
      stepNumber={5}
      totalSteps={5}
      title="Upload Your Export"
      onNext={() => router.push('/import/upload')}
      onBack={() => router.back()}
      nextButtonText="Go to Upload"
    >
      <Card variant="elevated" style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-upload-outline" size={48} color={colors.accent[500]} />
        </View>
        <Text style={styles.cardTitle}>You're Ready!</Text>
        <Text style={styles.cardDescription}>
          Once you've downloaded your Google Takeout ZIP file, you're ready to upload it to Trustmaps.
        </Text>
      </Card>

      <View style={styles.checklist}>
        <Text style={styles.checklistTitle}>Before you continue, make sure:</Text>

        <View style={styles.checkItem}>
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          <Text style={styles.checkText}>
            You've downloaded the ZIP file from Google
          </Text>
        </View>

        <View style={styles.checkItem}>
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          <Text style={styles.checkText}>
            The file is saved somewhere accessible on your device
          </Text>
        </View>

        <View style={styles.checkItem}>
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          <Text style={styles.checkText}>
            You know where to find the ZIP file
          </Text>
        </View>
      </View>

      <View style={styles.noteContainer}>
        <Ionicons name="rocket-outline" size={20} color={colors.accent[500]} />
        <Text style={styles.noteText}>
          The next screen will let you select and upload your ZIP file. We'll preserve all your list names and notes!
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
  checklist: {
    marginBottom: spacing[6],
  },
  checklistTitle: {
    ...textStyles.h4,
    marginBottom: spacing[4],
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
    gap: spacing[3],
  },
  checkText: {
    ...textStyles.body,
    color: colors.text.primary,
    flex: 1,
    paddingTop: 2,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.accent[50],
    borderRadius: borderRadius.base,
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.accent[200],
  },
  noteText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    flex: 1,
  },
});

import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StepLayout } from '../../src/components/import/StepLayout';
import { Card } from '../../src/components/common/Card';
import { colors, spacing, textStyles, borderRadius } from '../../src/utils/theme';

export default function Step4Screen() {
  const router = useRouter();

  return (
    <StepLayout
      stepNumber={4}
      totalSteps={5}
      title="Create & Download Export"
      onNext={() => router.push('/import/step-5')}
      onBack={() => router.back()}
    >
      <Card variant="elevated" style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="download-outline" size={48} color={colors.accent[500]} />
        </View>
        <Text style={styles.cardTitle}>Export Your Data</Text>
        <Text style={styles.cardDescription}>
          Now that you've selected "Saved" under Maps, create and download your export file.
        </Text>
      </Card>

      <View style={styles.instructionsList}>
        <View style={styles.instructionItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={styles.instructionText}>
            Scroll to the bottom and click "Next step"
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={styles.instructionText}>
            Choose your export frequency: "Export once"
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <Text style={styles.instructionText}>
            Select file type: .zip (recommended)
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>4</Text>
          </View>
          <Text style={styles.instructionText}>
            Click "Create export" and wait for email
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>5</Text>
          </View>
          <Text style={styles.instructionText}>
            Download the ZIP file when ready
          </Text>
        </View>
      </View>

      <View style={styles.noteContainer}>
        <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
        <Text style={styles.noteText}>
          Google may take a few minutes to prepare your export. You'll receive an email when it's ready to download.
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
  instructionsList: {
    marginBottom: spacing[6],
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  stepNumberText: {
    ...textStyles.label,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  instructionText: {
    ...textStyles.body,
    color: colors.text.primary,
    flex: 1,
    paddingTop: 6,
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

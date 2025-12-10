import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StepLayout } from '../../src/components/import/StepLayout';
import { Card } from '../../src/components/common/Card';
import { colors, spacing, textStyles, borderRadius } from '../../src/utils/theme';

export default function Step2Screen() {
  const router = useRouter();

  return (
    <StepLayout
      stepNumber={2}
      totalSteps={5}
      title="Deselect All Products"
      onNext={() => router.push('/import/step-3')}
      onBack={() => router.back()}
    >
      <Card variant="elevated" style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-done-outline" size={48} color={colors.accent[500]} />
        </View>
        <Text style={styles.cardTitle}>Deselect All Items</Text>
        <Text style={styles.cardDescription}>
          By default, Google Takeout selects all your data. We only need your Maps data, so click "Deselect all" first.
        </Text>
      </Card>

      <View style={styles.instructionsList}>
        <View style={styles.instructionItem}>
          <View style={styles.bullet} />
          <Text style={styles.instructionText}>
            Look for the "Deselect all" button at the top
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.bullet} />
          <Text style={styles.instructionText}>
            Click it to uncheck all Google products
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.bullet} />
          <Text style={styles.instructionText}>
            This makes the export smaller and faster
          </Text>
        </View>
      </View>

      <View style={styles.noteContainer}>
        <Ionicons name="bulb-outline" size={20} color={colors.accent[500]} />
        <Text style={styles.noteText}>
          Don't worry - we'll select just what we need in the next step
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
    marginBottom: spacing[3],
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent[500],
    marginRight: spacing[3],
    marginTop: 8,
  },
  instructionText: {
    ...textStyles.body,
    color: colors.text.primary,
    flex: 1,
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

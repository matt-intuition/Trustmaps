import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StepLayout } from '../../src/components/import/StepLayout';
import { Card } from '../../src/components/common/Card';
import { colors, spacing, textStyles, borderRadius } from '../../src/utils/theme';

export default function Step3Screen() {
  const router = useRouter();

  return (
    <StepLayout
      stepNumber={3}
      totalSteps={5}
      title='Select "Saved" under Maps'
      onNext={() => router.push('/import/step-4')}
      onBack={() => router.back()}
    >
      <Card variant="elevated" style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="map-outline" size={48} color={colors.accent[500]} />
        </View>
        <Text style={styles.cardTitle}>Find Maps (your places)</Text>
        <Text style={styles.cardDescription}>
          Now scroll down to find "Maps (your places)" and check ONLY the "Saved" option under it.
        </Text>
      </Card>

      <View style={styles.instructionsList}>
        <View style={styles.instructionItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={styles.instructionText}>
            Scroll down the list to find "Maps (your places)"
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={styles.instructionText}>
            Click "All Maps data included" to expand options
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <Text style={styles.instructionText}>
            Check ONLY the "Saved" checkbox
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>4</Text>
          </View>
          <Text style={styles.instructionText}>
            Uncheck everything else under Maps
          </Text>
        </View>
      </View>

      <View style={styles.noteContainer}>
        <Ionicons name="information-circle" size={20} color={colors.accent[500]} />
        <Text style={styles.noteText}>
          The "Saved" option contains all your custom saved lists from Google Maps
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

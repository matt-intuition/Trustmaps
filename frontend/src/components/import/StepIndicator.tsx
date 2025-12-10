import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, textStyles } from '../../utils/theme';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

/**
 * Step progress indicator with dots
 * Shows which step the user is on (1/5, 2/5, etc.)
 */
export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dots}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i + 1 === currentStep && styles.dotCurrent,
              i + 1 < currentStep && styles.dotCompleted,
            ]}
          />
        ))}
      </View>
      <Text style={styles.label}>
        Step {currentStep} of {totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing[6],
    alignItems: 'center',
    gap: spacing[3],
  },
  dots: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.neutral[300],
  },
  dotCurrent: {
    backgroundColor: colors.accent[500],
    borderWidth: 2,
    borderColor: colors.accent[500],
  },
  dotCompleted: {
    backgroundColor: colors.accent[500],
  },
  label: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
});

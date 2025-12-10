import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../common/Button';
import { StepIndicator } from './StepIndicator';
import { colors, spacing, textStyles } from '../../utils/theme';

interface StepLayoutProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack?: () => void;
  nextButtonText?: string;
}

/**
 * Shared layout for wizard steps
 * Includes step indicator, title, content area, and action buttons
 */
export function StepLayout({
  stepNumber,
  totalSteps,
  title,
  children,
  onNext,
  onBack,
  nextButtonText = 'Next',
}: StepLayoutProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StepIndicator currentStep={stepNumber} totalSteps={totalSteps} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>{title}</Text>
        {children}
      </ScrollView>

      <View style={styles.actions}>
        {onBack && (
          <Button variant="ghost" onPress={onBack} style={styles.backButton}>
            Back
          </Button>
        )}
        <Button
          variant="primary"
          onPress={onNext}
          style={styles.nextButton}
        >
          {nextButtonText}
        </Button>
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
  },
  contentContainer: {
    padding: spacing[6],
  },
  title: {
    ...textStyles.h2,
    marginBottom: spacing[6],
  },
  actions: {
    flexDirection: 'row',
    padding: spacing[6],
    gap: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});

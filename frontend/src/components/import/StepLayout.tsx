import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
  const router = useRouter();

  const handleExit = () => {
    router.push('/import');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <StepIndicator currentStep={stepNumber} totalSteps={totalSteps} />
        <Pressable onPress={handleExit} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.neutral[600]} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>{title}</Text>
        {children}
      </ScrollView>

      <View style={styles.actions}>
        {onBack && (
          <Button
            title="Back"
            variant="ghost"
            onPress={onBack}
            style={styles.backButton}
          />
        )}
        <Button
          title={nextButtonText}
          variant="primary"
          onPress={onNext}
          style={styles.nextButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: spacing[6],
    right: spacing[6],
    padding: spacing[2],
    zIndex: 10,
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

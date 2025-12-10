import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, textStyles, borderRadius } from '../../src/utils/theme';

export default function ProcessingScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Uploading file...');

  useEffect(() => {
    // Simulate processing stages
    const stages = [
      { progress: 20, status: 'Uploading file...', duration: 1000 },
      { progress: 40, status: 'Extracting ZIP...', duration: 1500 },
      { progress: 60, status: 'Parsing places...', duration: 2000 },
      { progress: 80, status: 'Geocoding addresses...', duration: 2500 },
      { progress: 100, status: 'Saving to database...', duration: 1500 },
    ];

    let currentStage = 0;

    const processNextStage = () => {
      if (currentStage < stages.length) {
        const stage = stages[currentStage];
        setProgress(stage.progress);
        setStatus(stage.status);

        setTimeout(() => {
          currentStage++;
          if (currentStage < stages.length) {
            processNextStage();
          } else {
            // Navigate to success screen
            setTimeout(() => {
              router.replace('/import/success');
            }, 500);
          }
        }, stage.duration);
      }
    };

    processNextStage();
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <ActivityIndicator size="large" color={colors.accent[500]} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Processing Your Import</Text>

        {/* Status */}
        <Text style={styles.status}>{status}</Text>

        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>

        {/* Progress percentage */}
        <Text style={styles.progressText}>{progress}%</Text>

        {/* Info message */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={colors.accent[500]} />
          <Text style={styles.infoText}>
            This may take a few minutes depending on the number of places in your file.
          </Text>
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
  title: {
    ...textStyles.h2,
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  status: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginBottom: spacing[8],
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    maxWidth: 400,
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing[3],
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent[500],
    borderRadius: borderRadius.full,
  },
  progressText: {
    ...textStyles.h3,
    color: colors.accent[500],
    marginBottom: spacing[8],
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.accent[50],
    borderRadius: borderRadius.base,
    padding: spacing[4],
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.accent[200],
  },
  infoText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing[2],
    flex: 1,
  },
});

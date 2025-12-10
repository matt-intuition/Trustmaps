import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, textStyles, borderRadius } from '../../src/utils/theme';
import { apiClient } from '../../src/api/client';
import { Card } from '../../src/components/common/Card';

const STAGE_MESSAGES = {
  uploading: 'Uploading file...',
  extracting: 'Extracting ZIP archive...',
  detecting: 'Detecting format...',
  parsing: 'Parsing your lists...',
  geocoding: 'Looking up place locations...',
  saving: 'Saving to your library...',
  complete: 'Import complete!',
  error: 'Import failed',
};

type ImportStage = keyof typeof STAGE_MESSAGES;

interface ImportStatus {
  stage: ImportStage;
  progress: number;
  listsProcessed: number;
  placesProcessed: number;
  totalLists: number;
  totalPlaces: number;
  errors: string[];
}

export default function ProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.jobId as string;

  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<ImportStage>('uploading');
  const [stats, setStats] = useState({ lists: 0, places: 0, totalLists: 0, totalPlaces: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      console.error('No jobId provided to processing screen');
      router.replace('/import');
      return;
    }

    let isCancelled = false;

    // Poll backend every 2 seconds
    const pollStatus = async () => {
      try {
        const token = apiClient.getToken();
        const response = await fetch(
          `http://localhost:3001/api/import/status/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }

        const data: ImportStatus = await response.json();

        if (isCancelled) return;

        setProgress(data.progress);
        setStage(data.stage);
        setStats({
          lists: data.listsProcessed,
          places: data.placesProcessed,
          totalLists: data.totalLists,
          totalPlaces: data.totalPlaces,
        });

        // Complete?
        if (data.stage === 'complete') {
          router.replace({
            pathname: '/import/success',
            params: {
              listsCreated: data.listsProcessed.toString(),
              placesImported: data.placesProcessed.toString(),
            },
          });
        }

        // Error?
        if (data.stage === 'error') {
          setError(data.errors.join('\n') || 'Unknown error occurred');
        }
      } catch (err) {
        console.error('Failed to fetch import status:', err);
        if (!isCancelled) {
          setError('Failed to check import status. Please try again.');
        }
      }
    };

    // Initial poll
    pollStatus();

    // Poll every 2 seconds
    const interval = setInterval(pollStatus, 2000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [jobId, router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Importing Your Places</Text>

        <Card variant="elevated" style={styles.card}>
          <ActivityIndicator size="large" color={colors.accent[500]} />

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.percentage}>{Math.round(progress)}%</Text>
          </View>

          <Text style={styles.stage}>{STAGE_MESSAGES[stage]}</Text>

          {stats.totalLists > 0 && (
            <Text style={styles.stats}>
              Processing list {stats.lists} of {stats.totalLists}
              {stats.places > 0 && ` • ${stats.places} places imported`}
            </Text>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={24} color={colors.error} />
              <Text style={styles.error}>{error}</Text>
            </View>
          )}
        </Card>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={colors.accent[500]} />
          <Text style={styles.infoText}>
            This may take several minutes for large collections. Geocoding requires looking up each place's location.
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
  },
  title: {
    ...textStyles.h2,
    textAlign: 'center',
    marginBottom: spacing[8],
  },
  card: {
    padding: spacing[8],
    alignItems: 'center',
    gap: spacing[6],
  },
  progressContainer: {
    width: '100%',
    gap: spacing[2],
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent[500],
  },
  percentage: {
    ...textStyles.caption,
    color: colors.text.secondary,
    textAlign: 'right',
  },
  stage: {
    ...textStyles.body,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  stats: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.accent[50],
    borderRadius: borderRadius.base,
    padding: spacing[4],
    marginTop: spacing[6],
    borderWidth: 1,
    borderColor: colors.accent[200],
  },
  infoText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing[2],
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[4],
    backgroundColor: colors.error + '10',
    borderRadius: borderRadius.base,
    width: '100%',
  },
  error: {
    ...textStyles.bodySmall,
    color: colors.error,
    flex: 1,
  },
});

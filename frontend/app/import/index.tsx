import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { colors, spacing, textStyles, borderRadius } from '../../src/utils/theme';

export default function ImportGettingStartedScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="map-outline" size={64} color={colors.accent[500]} />
          <Text style={styles.title}>Import Your Google Maps</Text>
          <Text style={styles.subtitle}>
            Bring your saved places from Google Maps into Trustmaps
          </Text>
        </View>

        {/* What you'll import */}
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.cardTitle}>What will be imported?</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={styles.featureText}>
                All your custom saved lists from Google Maps
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={styles.featureText}>
                Original list names preserved
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={styles.featureText}>
                Your personal notes for each place
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={styles.featureText}>
                Place details and locations
              </Text>
            </View>
          </View>
        </Card>

        {/* How it works */}
        <View style={styles.processSection}>
          <Text style={styles.processSectionTitle}>How it works</Text>

          <View style={styles.processStep}>
            <View style={styles.processStepNumber}>
              <Text style={styles.processStepNumberText}>1</Text>
            </View>
            <View style={styles.processStepContent}>
              <Text style={styles.processStepTitle}>Export from Google</Text>
              <Text style={styles.processStepDescription}>
                We'll guide you through exporting your data from Google Takeout
              </Text>
            </View>
          </View>

          <View style={styles.processStep}>
            <View style={styles.processStepNumber}>
              <Text style={styles.processStepNumberText}>2</Text>
            </View>
            <View style={styles.processStepContent}>
              <Text style={styles.processStepTitle}>Upload ZIP file</Text>
              <Text style={styles.processStepDescription}>
                Upload the downloaded ZIP file to Trustmaps
              </Text>
            </View>
          </View>

          <View style={styles.processStep}>
            <View style={styles.processStepNumber}>
              <Text style={styles.processStepNumberText}>3</Text>
            </View>
            <View style={styles.processStepContent}>
              <Text style={styles.processStepTitle}>We'll handle the rest</Text>
              <Text style={styles.processStepDescription}>
                Your lists will be imported and ready to explore
              </Text>
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <Button
            variant="primary"
            onPress={() => router.push('/import/step-1')}
            leftIcon="compass-outline"
            size="lg"
          >
            Start Guided Setup
          </Button>

          <Button
            variant="ghost"
            onPress={() => router.push('/import/upload')}
            size="base"
          >
            Skip to Upload
          </Button>
        </View>

        {/* Time estimate */}
        <View style={styles.timeEstimate}>
          <Ionicons name="time-outline" size={16} color={colors.text.tertiary} />
          <Text style={styles.timeEstimateText}>
            Takes about 5-10 minutes
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
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  title: {
    ...textStyles.h2,
    marginTop: spacing[4],
    textAlign: 'center',
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing[2],
    maxWidth: 400,
  },
  card: {
    padding: spacing[6],
    marginBottom: spacing[8],
  },
  cardTitle: {
    ...textStyles.h4,
    marginBottom: spacing[4],
  },
  featureList: {
    gap: spacing[3],
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  featureText: {
    ...textStyles.body,
    color: colors.text.primary,
    flex: 1,
    paddingTop: 2,
  },
  processSection: {
    marginBottom: spacing[8],
  },
  processSectionTitle: {
    ...textStyles.h4,
    marginBottom: spacing[5],
  },
  processStep: {
    flexDirection: 'row',
    marginBottom: spacing[5],
  },
  processStepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  processStepNumberText: {
    ...textStyles.h4,
    color: colors.accent[500],
  },
  processStepContent: {
    flex: 1,
  },
  processStepTitle: {
    ...textStyles.h4,
    marginBottom: spacing[1],
  },
  processStepDescription: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  actions: {
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  timeEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  timeEstimateText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
});

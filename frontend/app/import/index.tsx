import { View, Text, StyleSheet, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/common/Button';
import { colors, typography, spacing, textStyles, borderRadius } from '../../src/utils/theme';

export default function ImportScreen() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/zip',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    setIsUploading(true);

    try {
      // TODO: Upload file to backend /api/import/upload
      // For now, just navigate to processing screen
      router.push('/import/processing');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="cloud-upload-outline" size={64} color={colors.accent[500]} />
          <Text style={styles.title}>Import Your Places</Text>
          <Text style={styles.subtitle}>
            Upload your Google Takeout file to import saved places into Trustmaps
          </Text>
        </View>

        {/* Drag-drop zone (visual only on mobile, functional on web) */}
        <View style={styles.dropZone}>
          <View style={styles.dropZoneInner}>
            <Ionicons name="folder-open-outline" size={48} color={colors.neutral[400]} />
            <Text style={styles.dropZoneText}>
              {selectedFile ? selectedFile.name : 'Select a ZIP file'}
            </Text>
            {selectedFile && (
              <Text style={[textStyles.caption, { color: colors.text.tertiary, marginTop: spacing[2] }]}>
                Size: {(selectedFile.size! / 1024 / 1024).toFixed(2)} MB
              </Text>
            )}
          </View>
        </View>

        {/* File picker button */}
        <Button
          title="Choose File"
          onPress={handleFilePick}
          variant="outline"
          leftIcon="folder-outline"
          size="lg"
          style={styles.filePickerButton}
        />

        {/* Upload button */}
        {selectedFile && (
          <Button
            title="Upload & Import"
            onPress={handleUpload}
            variant="primary"
            loading={isUploading}
            leftIcon="cloud-upload-outline"
            size="lg"
            style={styles.uploadButton}
          />
        )}

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={[textStyles.h4, { marginBottom: spacing[3] }]}>How to get your data:</Text>
          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Go to Google Takeout (takeout.google.com)
            </Text>
          </View>
          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              Select only "Maps (your places)" data
            </Text>
          </View>
          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Download the ZIP file and upload it here
            </Text>
          </View>
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
  },
  subtitle: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing[2],
    maxWidth: 400,
  },
  dropZone: {
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    padding: spacing[8],
    marginBottom: spacing[6],
    backgroundColor: colors.neutral[50],
  },
  dropZoneInner: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  dropZoneText: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing[4],
  },
  filePickerButton: {
    marginBottom: spacing[4],
  },
  uploadButton: {
    marginBottom: spacing[8],
  },
  instructions: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  stepNumberText: {
    ...textStyles.label,
    color: colors.text.inverse,
  },
  stepText: {
    ...textStyles.body,
    color: colors.text.secondary,
    flex: 1,
    paddingTop: 4,
  },
});

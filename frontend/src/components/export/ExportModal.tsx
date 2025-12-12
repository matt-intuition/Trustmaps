import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Modal } from '../common/Modal';
import { colors, spacing, borderRadius, typography, textStyles } from '../../utils/theme';
import { apiClient } from '../../api/client';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  listId: string;
  listTitle: string;
}

type ExportFormat = 'kml' | 'geojson' | 'csv';

const FORMAT_INFO: Record<ExportFormat, { label: string; description: string; icon: string }> = {
  kml: {
    label: 'KML (Google Maps)',
    description: 'Import directly to Google Maps or Google Earth',
    icon: '🗺️',
  },
  geojson: {
    label: 'GeoJSON',
    description: 'Use with mapping libraries and GIS tools',
    icon: '🌍',
  },
  csv: {
    label: 'CSV (Spreadsheet)',
    description: 'Open in Excel, Google Sheets, or Numbers',
    icon: '📊',
  },
};

export const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onClose,
  listId,
  listTitle,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('kml');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      // Get the API URL from the client config
      const baseURL = apiClient.defaults.baseURL || 'http://localhost:3001';
      const token = await apiClient.defaults.headers.common['Authorization'];

      // Construct download URL
      const exportUrl = `${baseURL}/api/export/list/${listId}/${selectedFormat}`;

      if (Platform.OS === 'web') {
        // Web: Download using fetch and blob
        const response = await fetch(exportUrl, {
          headers: {
            Authorization: token as string,
          },
        });

        if (!response.ok) {
          throw new Error('Export failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${listTitle.replace(/[^a-z0-9]/gi, '_')}.${selectedFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        Alert.alert('Success', `Exported to Downloads/${link.download}`);
      } else {
        // Mobile: Download using FileSystem and Sharing
        const filename = `${listTitle.replace(/[^a-z0-9]/gi, '_')}.${selectedFormat}`;
        const fileUri = FileSystem.documentDirectory + filename;

        const downloadResult = await FileSystem.downloadAsync(exportUrl, fileUri, {
          headers: {
            Authorization: token as string,
          },
        });

        if (downloadResult.status !== 200) {
          throw new Error('Export failed');
        }

        // Share the file
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(downloadResult.uri);
        } else {
          Alert.alert('Success', `File saved to ${fileUri}`);
        }
      }

      onClose();
    } catch (error: any) {
      console.error('Export error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to export list'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Export List"
      primaryAction={{
        label: `Export as ${selectedFormat.toUpperCase()}`,
        onPress: handleExport,
        loading,
      }}
      secondaryAction={{
        label: 'Cancel',
        onPress: onClose,
      }}
    >
      <View style={styles.container}>
        <Text style={styles.description}>
          Choose a format to export "{listTitle}"
        </Text>

        {/* Format Options */}
        <View style={styles.formatList}>
          {(Object.keys(FORMAT_INFO) as ExportFormat[]).map((format) => {
            const info = FORMAT_INFO[format];
            const isSelected = selectedFormat === format;

            return (
              <Pressable
                key={format}
                style={({ pressed }) => [
                  styles.formatOption,
                  isSelected && styles.formatOptionSelected,
                  pressed && styles.formatOptionPressed,
                ]}
                onPress={() => setSelectedFormat(format)}
                accessibilityLabel={`Export as ${info.label}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
              >
                {/* Radio Button */}
                <View style={styles.radioContainer}>
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>

                {/* Icon and Text */}
                <View style={styles.formatInfo}>
                  <View style={styles.formatHeader}>
                    <Text style={styles.formatIcon}>{info.icon}</Text>
                    <Text style={styles.formatLabel}>{info.label}</Text>
                  </View>
                  <Text style={styles.formatDescription}>{info.description}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 You can import KML files directly into Google Maps by going to "Your places" → "Maps" → "Create Map" → "Import"
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing[5],
  },
  description: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  formatList: {
    gap: spacing[3],
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: borderRadius.base,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minHeight: 44, // Accessibility minimum
  },
  formatOptionSelected: {
    borderColor: colors.accent[500],
    backgroundColor: colors.accent[50],
  },
  formatOptionPressed: {
    opacity: 0.8,
  },
  radioContainer: {
    paddingTop: spacing[1],
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.neutral[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: colors.accent[500],
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent[500],
  },
  formatInfo: {
    flex: 1,
    gap: spacing[1],
  },
  formatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  formatIcon: {
    fontSize: typography.sizes.lg,
  },
  formatLabel: {
    ...textStyles.h4,
  },
  formatDescription: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
  },
  infoBox: {
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
    borderRadius: borderRadius.base,
  },
  infoText: {
    ...textStyles.bodySmall,
    lineHeight: typography.sizes.sm * 1.6,
  },
});

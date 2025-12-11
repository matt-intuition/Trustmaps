import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiClient } from '../../src/api/client';
import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { colors, typography, spacing, borderRadius, textStyles } from '../../src/utils/theme';

interface ListInfo {
  name: string;
  displayName: string; // User-editable display name
  placeCount: number;
  csvPath: string;
  selected: boolean;
  isPaid: boolean;
  price: number;
}

export default function SelectListsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const filePath = params.filePath as string;

  const [lists, setLists] = useState<ListInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyzeLists();
  }, []);

  const analyzeLists = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ensure apiClient is initialized with token before making request
      await apiClient.init();

      // Call analyze endpoint
      const response = await apiClient.post('/import/analyze', { filePath });

      // Initialize list selection state
      const listsWithState: ListInfo[] = response.lists.map((list: any) => ({
        ...list,
        displayName: list.name, // Start with original name, user can edit
        selected: true, // All selected by default
        isPaid: false,  // Free by default
        price: 0,
      }));

      setLists(listsWithState);
    } catch (err) {
      console.error('Failed to analyze lists:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze lists');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (index: number) => {
    setLists(prev => prev.map((list, i) =>
      i === index ? { ...list, selected: !list.selected } : list
    ));
  };

  const togglePaid = (index: number) => {
    setLists(prev => prev.map((list, i) => {
      if (i === index) {
        const newIsPaid = !list.isPaid;
        return {
          ...list,
          isPaid: newIsPaid,
          price: newIsPaid ? 10 : 0, // Default price when marking as paid
        };
      }
      return list;
    }));
  };

  const updatePrice = (index: number, priceText: string) => {
    const price = parseFloat(priceText) || 0;
    setLists(prev => prev.map((list, i) =>
      i === index ? { ...list, price } : list
    ));
  };

  const updateName = (index: number, newName: string) => {
    setLists(prev => prev.map((list, i) =>
      i === index ? { ...list, displayName: newName } : list
    ));
  };

  const selectAll = () => {
    setLists(prev => prev.map(list => ({ ...list, selected: true })));
  };

  const deselectAll = () => {
    setLists(prev => prev.map(list => ({ ...list, selected: false })));
  };

  const startProcessing = async () => {
    const selectedLists = lists.filter(l => l.selected);

    if (selectedLists.length === 0) {
      Alert.alert('No lists selected', 'Please select at least one list to import.');
      return;
    }

    try {
      setProcessing(true);

      // Ensure apiClient is initialized
      await apiClient.init();

      // Start processing
      const response = await apiClient.post('/import/process', {
        filePath,
        selectedLists: selectedLists.map(l => ({
          name: l.name,
          displayName: l.displayName,
          isPaid: l.isPaid,
          price: l.price,
        })),
      });

      console.log('Processing started:', response);

      // Navigate to processing screen
      router.replace({
        pathname: '/import/processing',
        params: { jobId: response.jobId },
      });

    } catch (err) {
      console.error('Failed to start processing:', err);
      Alert.alert('Error', 'Failed to start processing. Please try again.');
      setProcessing(false);
    }
  };

  const selectedCount = lists.filter(l => l.selected).length;
  const selectedPlaces = lists.filter(l => l.selected).reduce((sum, l) => sum + l.placeCount, 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Analyzing your lists...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Try Again" onPress={analyzeLists} style={styles.retryButton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Select Lists to Import</Text>
          <Text style={styles.headerSubtitle}>
            {selectedCount} of {lists.length} selected • {selectedPlaces} places
          </Text>
        </View>
      </View>

      {/* Bulk Actions */}
      <View style={styles.bulkActions}>
        <TouchableOpacity onPress={selectAll} style={styles.bulkActionButton}>
          <Text style={styles.bulkActionText}>Select All</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={deselectAll} style={styles.bulkActionButton}>
          <Text style={styles.bulkActionText}>Deselect All</Text>
        </TouchableOpacity>
      </View>

      {/* List Items */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.listsContainer}>
          {lists.map((list, index) => (
            <Card key={index} variant="outlined" padding={4} style={styles.listCard}>
              {/* Checkbox */}
              <View style={styles.listHeader}>
                <TouchableOpacity
                  onPress={() => toggleSelect(index)}
                  activeOpacity={0.7}
                  style={styles.checkboxContainer}
                >
                  <View style={[styles.checkbox, list.selected && styles.checkboxSelected]}>
                    {list.selected && (
                      <Ionicons name="checkmark" size={16} color={colors.text.inverse} />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Editable Name */}
                <View style={styles.listInfo}>
                  <TextInput
                    style={[styles.nameInput, !list.selected && styles.nameInputDisabled]}
                    value={list.displayName}
                    onChangeText={(text) => updateName(index, text)}
                    placeholder="Enter list name"
                    editable={list.selected}
                  />
                  <Text style={styles.placeCount}>{list.placeCount} places</Text>
                </View>
              </View>

              {/* Pricing Controls (only if selected) */}
              {list.selected && (
                <View style={styles.pricingControls}>
                  <TouchableOpacity
                    style={styles.paidToggle}
                    onPress={() => togglePaid(index)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.toggleCircle, list.isPaid && styles.toggleCircleOn]}>
                      {list.isPaid && <View style={styles.toggleDot} />}
                    </View>
                    <Text style={styles.paidLabel}>{list.isPaid ? 'Paid' : 'Free'}</Text>
                  </TouchableOpacity>

                  {list.isPaid && (
                    <View style={styles.priceInputContainer}>
                      <Text style={styles.currencySymbol}>$</Text>
                      <TextInput
                        style={styles.priceInput}
                        value={list.price.toString()}
                        onChangeText={(text) => updatePrice(index, text)}
                        keyboardType="decimal-pad"
                        placeholder="0"
                      />
                      <Text style={styles.trustLabel}>TRUST</Text>
                    </View>
                  )}
                </View>
              )}
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View style={styles.footer}>
        <Button
          title={`Import ${selectedCount} ${selectedCount === 1 ? 'List' : 'Lists'}`}
          onPress={startProcessing}
          disabled={selectedCount === 0 || processing}
          loading={processing}
          style={styles.importButton}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  errorText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[6],
  },
  retryButton: {
    minWidth: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    padding: spacing[2],
    marginRight: spacing[2],
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    ...textStyles.h3,
  },
  headerSubtitle: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  bulkActions: {
    flexDirection: 'row',
    padding: spacing[4],
    gap: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  bulkActionButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.accent[500],
  },
  bulkActionText: {
    ...textStyles.bodySmall,
    color: colors.accent[500],
    fontFamily: typography.fonts.semibold,
  },
  scrollView: {
    flex: 1,
  },
  listsContainer: {
    padding: spacing[4],
    gap: spacing[3],
  },
  listCard: {
    marginBottom: spacing[3],
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxContainer: {
    padding: spacing[1],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.accent[500],
    borderColor: colors.accent[500],
  },
  listInfo: {
    flex: 1,
    marginLeft: spacing[2],
  },
  nameInput: {
    ...textStyles.bodyLarge,
    fontFamily: typography.fonts.semibold,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.surface,
  },
  nameInputDisabled: {
    color: colors.text.tertiary,
    backgroundColor: colors.neutral[50],
    borderColor: colors.neutral[100],
  },
  placeCount: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  pricingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[3],
    marginLeft: 34, // Align with name input (24px checkbox + 10px margin)
    gap: spacing[4],
  },
  paidToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleCircle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral[300],
    padding: 2,
    marginRight: spacing[2],
  },
  toggleCircleOn: {
    backgroundColor: colors.accent[500],
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    marginLeft: 'auto',
  },
  paidLabel: {
    ...textStyles.bodySmall,
    fontFamily: typography.fonts.semibold,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  currencySymbol: {
    ...textStyles.body,
    fontFamily: typography.fonts.semibold,
    marginRight: spacing[1],
  },
  priceInput: {
    ...textStyles.body,
    fontFamily: typography.fonts.semibold,
    minWidth: 50,
    padding: 0,
  },
  trustLabel: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing[2],
  },
  footer: {
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    backgroundColor: colors.surface,
  },
  importButton: {
    width: '100%',
  },
});

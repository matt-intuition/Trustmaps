import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Card } from '../../src/components/common/Card';
import { colors, spacing, textStyles, typography } from '../../src/utils/theme';
import { apiClient } from '../../src/api/client';

interface List {
  id: string;
  title: string;
  description: string | null;
  placeCount: number;
  _count: {
    places: number;
  };
  createdAt: string;
}

export default function LibraryScreen() {
  const router = useRouter();
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/lists', {
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });
      const data = await response.json();
      setLists(data.lists);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent[500]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Lists</Text>
      </View>

      {lists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="map-outline" size={64} color={colors.neutral[300]} />
          <Text style={styles.emptyTitle}>No Lists Yet</Text>
          <Text style={styles.emptyText}>Import your Google Maps to get started</Text>
        </View>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <Card variant="interactive" padding={5} style={styles.listCard}>
              <View style={styles.listContent}>
                <Text style={styles.listTitle}>{item.title}</Text>
                {item.description && (
                  <Text style={styles.listDescription}>{item.description}</Text>
                )}
                <View style={styles.listMeta}>
                  <Ionicons name="location" size={16} color={colors.neutral[500]} />
                  <Text style={styles.listMetaText}>
                    {item._count.places} {item._count.places === 1 ? 'place' : 'places'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...textStyles.h2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  emptyTitle: {
    ...textStyles.h3,
    marginTop: spacing[4],
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing[2],
    textAlign: 'center',
  },
  listContainer: {
    padding: spacing[6],
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    ...textStyles.h4,
    marginBottom: spacing[1],
  },
  listDescription: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  listMetaText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
});

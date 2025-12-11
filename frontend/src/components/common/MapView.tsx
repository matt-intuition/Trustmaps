import React, { useState } from 'react';
import { StyleSheet, View, Text, Platform, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  address?: string;
}

interface MapViewComponentProps {
  markers: MapMarker[];
  initialRegion?: any;
  onMarkerPress?: (markerId: string) => void;
  style?: any;
}

export function MapViewComponent({
  markers,
  initialRegion,
  onMarkerPress,
  style
}: MapViewComponentProps) {
  // For web platform, show a list of places with Google Maps links
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.webNotice}>
          <Ionicons name="information-circle" size={24} color={colors.accent[500]} />
          <Text style={styles.webNoticeText}>
            Interactive maps are available on the mobile app. Below are the locations with Google Maps links.
          </Text>
        </View>

        <ScrollView style={styles.webPlacesList}>
          {markers.map((marker, index) => (
            <View key={marker.id} style={styles.webPlaceCard}>
              <View style={styles.webPlaceHeader}>
                <View style={styles.webPlaceNumber}>
                  <Text style={styles.webPlaceNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.webPlaceInfo}>
                  <Text style={styles.webPlaceTitle}>{marker.title}</Text>
                  {marker.description && (
                    <Text style={styles.webPlaceDescription}>{marker.description}</Text>
                  )}
                  {marker.address && (
                    <Text style={styles.webPlaceAddress}>{marker.address}</Text>
                  )}
                  <Text
                    style={styles.webPlaceLink}
                    onPress={() => {
                      const url = `https://www.google.com/maps/search/?api=1&query=${marker.latitude},${marker.longitude}`;
                      if (typeof window !== 'undefined') {
                        window.open(url, '_blank');
                      }
                    }}
                  >
                    Open in Google Maps →
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {markers.length === 0 && (
          <View style={styles.emptyOverlay}>
            <View style={styles.emptyContent}>
              <Ionicons name="location-outline" size={48} color={colors.neutral[400]} />
              <Text style={styles.emptyText}>No locations to display</Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  // For native platforms, use react-native-maps
  // Dynamically import to avoid web bundle issues
  const MapView = require('react-native-maps').default;
  const { Marker, Callout, PROVIDER_GOOGLE } = require('react-native-maps');

  // Calculate initial region from markers if not provided
  const getInitialRegion = (): any => {
    if (initialRegion) return initialRegion;

    if (markers.length === 0) {
      // Default to San Francisco
      return {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    if (markers.length === 1) {
      return {
        latitude: markers[0].latitude,
        longitude: markers[0].longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    // Calculate bounds for multiple markers
    let minLat = markers[0].latitude;
    let maxLat = markers[0].latitude;
    let minLng = markers[0].longitude;
    let maxLng = markers[0].longitude;

    markers.forEach(marker => {
      minLat = Math.min(minLat, marker.latitude);
      maxLat = Math.max(maxLat, marker.latitude);
      minLng = Math.min(minLng, marker.longitude);
      maxLng = Math.max(maxLng, marker.longitude);
    });

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const deltaLat = (maxLat - minLat) * 1.5; // Add 50% padding
    const deltaLng = (maxLng - minLng) * 1.5;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(deltaLat, 0.01),
      longitudeDelta: Math.max(deltaLng, 0.01),
    };
  };

  const [region, setRegion] = useState<Region>(getInitialRegion());

  return (
    <View style={[styles.container, style]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        toolbarEnabled={false}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            description={marker.description}
            onPress={() => onMarkerPress?.(marker.id)}
          >
            <View style={styles.markerContainer}>
              <View style={styles.markerPin}>
                <Ionicons name="location" size={32} color={colors.accent[500]} />
              </View>
            </View>
            <Callout tooltip={false} style={styles.callout}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle} numberOfLines={2}>
                  {marker.title}
                </Text>
                {marker.description && (
                  <Text style={styles.calloutDescription} numberOfLines={3}>
                    {marker.description}
                  </Text>
                )}
                {marker.address && (
                  <View style={styles.calloutAddress}>
                    <Ionicons name="location-outline" size={14} color={colors.text.tertiary} />
                    <Text style={styles.calloutAddressText} numberOfLines={2}>
                      {marker.address}
                    </Text>
                  </View>
                )}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {markers.length === 0 && (
        <View style={styles.emptyOverlay}>
          <View style={styles.emptyContent}>
            <Ionicons name="location-outline" size={48} color={colors.neutral[400]} />
            <Text style={styles.emptyText}>No locations to display</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerPin: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing[1],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  callout: {
    width: 200,
  },
  calloutContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  calloutTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  calloutDescription: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    lineHeight: 18,
  },
  calloutAddress: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[1],
  },
  calloutAddressText: {
    flex: 1,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    lineHeight: 16,
  },
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    marginTop: spacing[3],
  },
  // Web-specific styles
  webNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.accent[50],
    borderRadius: borderRadius.md,
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  webNoticeText: {
    flex: 1,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    lineHeight: 20,
  },
  webPlacesList: {
    flex: 1,
  },
  webPlaceCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  webPlaceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  webPlaceNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  webPlaceNumberText: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.sm,
    color: colors.accent[600],
  },
  webPlaceInfo: {
    flex: 1,
  },
  webPlaceTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  webPlaceDescription: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing[1],
    lineHeight: 18,
  },
  webPlaceAddress: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginBottom: spacing[2],
  },
  webPlaceLink: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.accent[500],
    cursor: 'pointer' as any,
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/utils/theme';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';
import { apiClient } from '../../src/api/client';
import { useAuthStore } from '../../src/stores/authStore';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload a profile image.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setImageLoading(true);

      // Create FormData
      const formData = new FormData();

      // For web, we need to fetch the blob
      if (typeof window !== 'undefined' && uri.startsWith('blob:')) {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('image', blob, 'profile.jpg');
      } else {
        // For React Native
        formData.append('image', {
          uri,
          name: 'profile.jpg',
          type: 'image/jpeg',
        } as any);
      }

      const response = await fetch(`${apiClient.getToken() ? 'http://localhost:3001' : ''}/api/auth/profile/image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiClient.getToken()}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setProfileImage(data.user.profileImage);
      setUser(data.user);
      Alert.alert('Success', 'Profile image updated successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', error.message || 'Failed to upload image');
    } finally {
      setImageLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Validate
      if (!displayName.trim()) {
        Alert.alert('Error', 'Display name is required');
        return;
      }

      if (displayName.length > 50) {
        Alert.alert('Error', 'Display name must be less than 50 characters');
        return;
      }

      if (bio.length > 500) {
        Alert.alert('Error', 'Bio must be less than 500 characters');
        return;
      }

      // Update profile
      const response = await apiClient.put('/auth/profile', {
        displayName: displayName.trim(),
        bio: bio.trim() || null,
      });

      setUser(response.user);
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Profile Image */}
        <View style={styles.imageSection}>
          <Pressable onPress={handlePickImage} style={styles.imageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="person" size={48} color={colors.neutral[400]} />
              </View>
            )}
            <View style={styles.imageOverlay}>
              <Ionicons name="camera" size={24} color={colors.surface} />
            </View>
            {imageLoading && (
              <View style={styles.imageLoadingOverlay}>
                <Text style={styles.imageLoadingText}>Uploading...</Text>
              </View>
            )}
          </Pressable>
          <Text style={styles.imageHint}>Tap to change photo</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Display Name *</Text>
            <Input
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your display name"
              maxLength={50}
            />
            <Text style={styles.hint}>{displayName.length}/50 characters</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <Input
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={4}
              maxLength={500}
              style={styles.bioInput}
            />
            <Text style={styles.hint}>{bio.length}/500 characters</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <Input
              value={user?.username || ''}
              editable={false}
              style={styles.disabledInput}
            />
            <Text style={styles.hint}>Username cannot be changed</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <Input
              value={user?.email || ''}
              editable={false}
              style={styles.disabledInput}
            />
            <Text style={styles.hint}>Email cannot be changed</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={loading}
            variant="primary"
          />
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
            style={styles.cancelButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  imageContainer: {
    position: 'relative',
    marginBottom: spacing[2],
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.neutral[200],
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent[500],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLoadingText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.text.inverse,
  },
  imageHint: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
  form: {
    paddingHorizontal: spacing[6],
  },
  inputGroup: {
    marginBottom: spacing[6],
  },
  label: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  hint: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  disabledInput: {
    backgroundColor: colors.neutral[100],
    color: colors.text.tertiary,
  },
  actions: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
  },
  cancelButton: {
    marginTop: spacing[3],
  },
});

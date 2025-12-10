import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useAuthStore } from '../../stores/authStore';
import { colors, typography, spacing, borderRadius, textStyles } from '../../utils/theme';

export function SignupScreen() {
  const router = useRouter();
  const { signup, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    displayName: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!formData.email || !formData.username || !formData.displayName || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await signup({
        email: formData.email,
        username: formData.username,
        displayName: formData.displayName,
        password: formData.password,
      });
      router.replace('/(tabs)/home');
    } catch (err) {
      Alert.alert('Signup Failed', error || 'Please try again');
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Content card - Centered with max-width */}
          <View style={styles.card}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Ionicons name="compass" size={40} color={colors.accent[500]} />
            </View>

            {/* Heading */}
            <Text style={styles.title}>Join Trustmaps</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Start your journey of discovery
            </Text>

            {/* Form */}
            <View style={styles.form}>
              <Input
                label="Email"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="you@example.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                leftIcon="mail-outline"
              />

              <Input
                label="Username"
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
                placeholder="@username"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon="at-outline"
              />

              <Input
                label="Display Name"
                value={formData.displayName}
                onChangeText={(text) => setFormData({ ...formData, displayName: text })}
                placeholder="John Doe"
                autoCapitalize="words"
                leftIcon="person-outline"
              />

              <Input
                label="Password"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                leftIcon="lock-closed-outline"
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              <Input
                label="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                leftIcon="lock-closed-outline"
              />

              {/* TRUST Badge - Simple, no gradient */}
              <View style={styles.trustBadgeContainer}>
                <Badge
                  label="You'll receive 100 TRUST tokens"
                  variant="success"
                  icon="shield-checkmark"
                />
              </View>

              <Button
                title="Create Account"
                onPress={handleSignup}
                loading={isLoading}
                variant="primary"
                size="base"
                style={styles.signupButton}
              />

              <Text style={styles.termsText}>
                By signing up, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // neutral.50 - flat, no gradients
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing[6], // 24px
    paddingVertical: spacing[8], // 32px vertical
  },
  card: {
    maxWidth: 400, // Design spec: 400px max width
    width: '100%',
    alignSelf: 'center',
    backgroundColor: colors.surface, // White card
    borderRadius: borderRadius.lg, // 16px
    padding: spacing[8], // 32px
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  logoContainer: {
    alignSelf: 'center',
    marginBottom: spacing[4], // 16px
  },
  title: {
    ...textStyles.h2, // 25px, bold, neutral.900
    textAlign: 'center',
  },
  subtitle: {
    ...textStyles.bodySmall, // 14px, normal, neutral.600
    textAlign: 'center',
    marginTop: spacing[3], // 12px below heading
  },
  form: {
    marginTop: spacing[6], // 24px below subtitle
  },
  trustBadgeContainer: {
    alignItems: 'center',
    marginVertical: spacing[4], // 16px spacing
  },
  signupButton: {
    width: '100%',
    marginBottom: spacing[4], // 16px below button
  },
  termsText: {
    ...textStyles.caption, // 12px, normal, neutral.500
    textAlign: 'center',
    lineHeight: typography.sizes.xs * typography.lineHeights.relaxed,
  },
  termsLink: {
    color: colors.accent[500], // accent.500 color
    fontFamily: typography.fonts.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[6], // 24px below form
  },
  footerText: {
    ...textStyles.caption, // 12px, normal, neutral.500
  },
  footerLink: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xs, // 12px
    color: colors.accent[500], // accent.500 color
  },
});

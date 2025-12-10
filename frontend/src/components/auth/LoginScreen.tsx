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
import { useAuthStore } from '../../stores/authStore';
import { colors, typography, spacing, borderRadius, textStyles } from '../../utils/theme';

export function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await login({ email, password });
      router.replace('/(tabs)/home');
    } catch (err) {
      Alert.alert('Login Failed', error || 'Please check your credentials and try again');
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
              <Ionicons name="map" size={40} color={colors.accent[500]} />
            </View>

            {/* Heading */}
            <Text style={styles.title}>Welcome Back</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Sign in to access your curated maps
            </Text>

            {/* Form */}
            <View style={styles.form}>
              <Input
                label="Email or Username"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                leftIcon="person-outline"
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                leftIcon="lock-closed-outline"
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={isLoading}
                variant="primary"
                size="base"
                style={styles.loginButton}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                title="Continue with Google"
                onPress={() => Alert.alert('Coming Soon', 'Google sign-in will be available soon')}
                variant="outline"
                icon={<Ionicons name="logo-google" size={20} color={colors.accent[500]} />}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                <Text style={styles.footerLink}>Sign Up</Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: spacing[2], // 8px below password field
    marginBottom: spacing[6], // 24px above button
  },
  forgotPasswordText: {
    ...textStyles.link, // 16px, medium, accent.500, underlined
    fontSize: typography.sizes.sm, // 14px for this link
  },
  loginButton: {
    width: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[6], // 24px margins
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral[300], // neutral.300 lines
  },
  dividerText: {
    ...textStyles.caption, // 12px, normal, neutral.500
    marginHorizontal: spacing[3], // 12px spacing
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[8], // 32px below form
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

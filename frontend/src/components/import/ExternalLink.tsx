import { Text, Platform, Pressable, StyleSheet, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { colors, textStyles, spacing } from '../../utils/theme';

interface ExternalLinkProps {
  url: string;
  children: string;
}

/**
 * Cross-platform hyperlink component
 * - Web: Opens in new tab via window.open()
 * - Mobile: Opens in system browser via Linking.openURL()
 */
export function ExternalLink({ url, children }: ExternalLinkProps) {
  const handlePress = async () => {
    if (Platform.OS === 'web') {
      // Web: Open in new tab
      (window as any).open(url, '_blank', 'noopener,noreferrer');
    } else {
      // Mobile: Use Linking API
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open URL: ${url}`);
      }
    }
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <Text style={styles.text}>{children}</Text>
      <Ionicons
        name="open-outline"
        size={16}
        color={colors.accent[500]}
        style={styles.icon}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  text: {
    ...textStyles.body,
    color: colors.accent[500],
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  icon: {
    marginLeft: spacing[1],
  },
});

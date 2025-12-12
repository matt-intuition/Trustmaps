import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Platform } from 'react-native';
import { Modal } from '../common/Modal';
import { colors, spacing, borderRadius, typography, textStyles } from '../../utils/theme';
import { useAuthStore } from '../../stores/authStore';
import apiClient from '../../api/client';

interface StakeModalProps {
  visible: boolean;
  onClose: () => void;
  targetType: 'list' | 'creator';
  targetId: string;
  targetName: string;
  onSuccess?: () => void;
}

export const StakeModal: React.FC<StakeModalProps> = ({
  visible,
  onClose,
  targetType,
  targetId,
  targetName,
  onSuccess,
}) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, refreshUser } = useAuthStore();

  const availableBalance = user?.trustBalance || 0;
  const amountNumber = parseInt(amount, 10) || 0;
  const isValid = amountNumber > 0 && amountNumber <= availableBalance;

  const handleStake = async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      const endpoint =
        targetType === 'list'
          ? `/stakes/list/${targetId}`
          : `/stakes/user/${targetId}`;

      await apiClient.post(endpoint, { amount: amountNumber });

      // Refresh user balance
      await refreshUser();

      if (Platform.OS === 'web') {
        window.alert(`Staked ${amountNumber} TRUST on ${targetName}`);
        onClose();
      } else {
        Alert.alert(
          'Success',
          `Staked ${amountNumber} TRUST on ${targetName}`,
          [{ text: 'OK', onPress: onClose }]
        );
      }

      onSuccess?.();
      setAmount('');
    } catch (error: any) {
      console.error('Stake submission error:', error);
      const errorMessage = error.message || 'Failed to stake TRUST';
      if (Platform.OS === 'web') {
        window.alert(`Error: ${errorMessage}`);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title={`Stake on ${targetType === 'list' ? 'List' : 'Creator'}`}
      primaryAction={{
        label: 'Stake TRUST',
        onPress: handleStake,
        disabled: !isValid,
        loading,
      }}
      secondaryAction={{
        label: 'Cancel',
        onPress: handleClose,
      }}
    >
      <View style={styles.container}>
        <Text style={styles.description}>
          Stake TRUST tokens on {targetName} to earn a share of future revenue
          (25% of sales go to stakers).
        </Text>

        {/* Balance Display */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>{availableBalance} TRUST</Text>
        </View>

        {/* Amount Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Amount to Stake</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.input,
                !isValid && amount !== '' && styles.inputError,
              ]}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              placeholderTextColor={colors.text.disabled}
              keyboardType="numeric"
              accessibilityLabel="Stake amount"
              editable={!loading}
            />
            <Text style={styles.inputSuffix}>TRUST</Text>
          </View>

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmounts}>
            {[25, 50, 100].map((quickAmount) => (
              <Text
                key={quickAmount}
                style={styles.quickAmountButton}
                onPress={() => setAmount(Math.min(quickAmount, availableBalance).toString())}
              >
                {quickAmount}
              </Text>
            ))}
            <Text
              style={styles.quickAmountButton}
              onPress={() => setAmount(availableBalance.toString())}
            >
              Max
            </Text>
          </View>

          {/* Validation Message */}
          {!isValid && amount !== '' && (
            <Text style={styles.errorText}>
              {amountNumber > availableBalance
                ? 'Insufficient balance'
                : 'Amount must be greater than 0'}
            </Text>
          )}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How Staking Works</Text>
          <Text style={styles.infoText}>
            • Earn 25% of future sales revenue{'\n'}
            • Higher stake = larger revenue share{'\n'}
            • Unstake anytime to get your TRUST back{'\n'}
            • Boosts {targetType}'s reputation score
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
  balanceContainer: {
    backgroundColor: colors.accent[50],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    ...textStyles.label,
  },
  balanceAmount: {
    ...textStyles.h4,
    color: colors.accent[700],
  },
  inputContainer: {
    gap: spacing[2],
  },
  inputLabel: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  input: {
    flex: 1,
    minHeight: 44, // Accessibility minimum
    backgroundColor: colors.neutral[50],
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing[4],
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.medium,
    color: colors.text.primary,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputSuffix: {
    ...textStyles.label,
    color: colors.text.tertiary,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  quickAmountButton: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.base,
    ...textStyles.label,
    color: colors.accent[600],
    overflow: 'hidden',
  },
  errorText: {
    ...textStyles.bodySmall,
    color: colors.error,
  },
  infoBox: {
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
    borderRadius: borderRadius.base,
    gap: spacing[2],
  },
  infoTitle: {
    ...textStyles.h4,
  },
  infoText: {
    ...textStyles.bodySmall,
    lineHeight: typography.sizes.sm * 1.6,
  },
});

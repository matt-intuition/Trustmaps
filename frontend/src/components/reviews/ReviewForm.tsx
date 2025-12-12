import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Pressable, Platform } from 'react-native';
import { StarRating } from '../common/StarRating';
import { colors, spacing, borderRadius, typography, textStyles, shadows } from '../../utils/theme';
import { apiClient } from '../../api/client';

interface ReviewFormProps {
  listId: string;
  onReviewSubmitted?: () => void;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
  };
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  listId,
  onReviewSubmitted,
  existingReview,
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [loading, setLoading] = useState(false);

  const isValid = rating > 0;
  const isEditing = !!existingReview;

  const handleSubmit = async () => {
    if (!isValid) {
      if (Platform.OS === 'web') {
        window.alert('Please select a rating');
      } else {
        Alert.alert('Error', 'Please select a rating');
      }
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(`/reviews/list/${listId}`, {
        rating,
        comment: comment.trim() || undefined,
      });

      const successMessage = isEditing ? 'Review updated successfully' : 'Review submitted successfully';
      if (Platform.OS === 'web') {
        window.alert(successMessage);
      } else {
        Alert.alert('Success', successMessage);
      }

      if (!isEditing) {
        // Clear form for new reviews
        setRating(0);
        setComment('');
      }

      onReviewSubmitted?.();
    } catch (error: any) {
      console.error('Review submission error:', error);
      const errorMessage = error.message || 'Failed to submit review';
      if (Platform.OS === 'web') {
        window.alert(`Error: ${errorMessage}`);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Rating Section */}
      <View style={styles.section}>
        <Text style={styles.label}>
          Your Rating {!isValid && <Text style={styles.required}>*</Text>}
        </Text>
        <StarRating
          rating={rating}
          onRatingChange={setRating}
          size="large"
        />
      </View>

      {/* Comment Section */}
      <View style={styles.section}>
        <Text style={styles.label}>
          Your Review <Text style={styles.optional}>(optional)</Text>
        </Text>
        <TextInput
          style={styles.textArea}
          value={comment}
          onChangeText={setComment}
          placeholder="Share your experience with this list..."
          placeholderTextColor={colors.text.disabled}
          multiline
          numberOfLines={4}
          maxLength={500}
          textAlignVertical="top"
          accessibilityLabel="Review comment"
          editable={!loading}
        />
        <Text style={styles.charCount}>
          {comment.length} / 500
        </Text>
      </View>

      {/* Submit Button */}
      <Pressable
        style={({ pressed }) => [
          styles.submitButton,
          !isValid && styles.submitButtonDisabled,
          pressed && isValid && styles.submitButtonPressed,
        ]}
        onPress={handleSubmit}
        disabled={!isValid || loading}
        accessibilityLabel={isEditing ? 'Update review' : 'Submit review'}
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.submitButtonText,
            !isValid && styles.submitButtonTextDisabled,
          ]}
        >
          {loading
            ? 'Submitting...'
            : isEditing
            ? 'Update Review'
            : 'Submit Review'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing[5],
  },
  section: {
    gap: spacing[3],
  },
  label: {
    ...textStyles.label,
    color: colors.text.primary,
    fontSize: typography.sizes.base,
  },
  required: {
    color: colors.error,
  },
  optional: {
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  textArea: {
    minHeight: 120,
    backgroundColor: colors.neutral[50],
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.primary,
  },
  charCount: {
    ...textStyles.caption,
    textAlign: 'right',
  },
  submitButton: {
    minHeight: 44, // Accessibility minimum
    backgroundColor: colors.accent[500],
    borderRadius: borderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[3],
    ...shadows.sm,
  },
  submitButtonPressed: {
    backgroundColor: colors.accent[600],
  },
  submitButtonDisabled: {
    backgroundColor: colors.neutral[300],
  },
  submitButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
  },
  submitButtonTextDisabled: {
    color: colors.text.disabled,
  },
});

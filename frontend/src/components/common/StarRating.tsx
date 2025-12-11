import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing } from '../../utils/theme';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: 'small' | 'medium' | 'large';
  readonly?: boolean;
}

const SIZE_MAP = {
  small: 16,
  medium: 24,
  large: 32,
};

const TOUCH_TARGET_SIZE = 44; // Accessibility minimum

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 'medium',
  readonly = false,
}) => {
  const starSize = SIZE_MAP[size];
  const interactive = !readonly && !!onRatingChange;

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isActive = starValue <= rating;

        if (interactive) {
          return (
            <Pressable
              key={starValue}
              onPress={() => onRatingChange!(starValue)}
              style={[
                styles.starButton,
                {
                  width: TOUCH_TARGET_SIZE,
                  height: TOUCH_TARGET_SIZE,
                },
              ]}
              accessibilityLabel={`${starValue} star${starValue > 1 ? 's' : ''}`}
              accessibilityRole="button"
              hitSlop={spacing[1]}
            >
              <Text
                style={[
                  styles.star,
                  {
                    fontSize: starSize,
                    color: isActive ? colors.warning : colors.neutral[300],
                  },
                ]}
              >
                ★
              </Text>
            </Pressable>
          );
        }

        return (
          <Text
            key={starValue}
            style={[
              styles.star,
              {
                fontSize: starSize,
                color: isActive ? colors.warning : colors.neutral[300],
              },
            ]}
          >
            ★
          </Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  starButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    lineHeight: 1,
  },
});

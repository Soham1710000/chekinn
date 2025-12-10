import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/design';

interface TrackSelectorProps {
  selectedTrack: string | null;
  onSelectTrack: (track: string) => void;
}

export function TrackSelector({ selectedTrack, onSelectTrack }: TrackSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>What brings you here today?</Text>
      
      <TouchableOpacity
        style={[
          styles.option,
          selectedTrack === 'cat_mba' && styles.selectedOption,
        ]}
        onPress={() => onSelectTrack('cat_mba')}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.optionText,
          selectedTrack === 'cat_mba' && styles.selectedText,
        ]}>
          CAT / MBA prep
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.option,
          selectedTrack === 'jobs_career' && styles.selectedOption,
        ]}
        onPress={() => onSelectTrack('jobs_career')}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.optionText,
          selectedTrack === 'jobs_career' && styles.selectedText,
        ]}>
          Career decisions
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    lineHeight: Typography.sizes.lg * Typography.lineHeights.base,
  },
  option: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: Colors.background,
    borderColor: Colors.accent,
  },
  optionText: {
    fontSize: Typography.sizes.base,
    color: Colors.text.primary,
    lineHeight: Typography.sizes.base * Typography.lineHeights.base,
  },
  selectedText: {
    fontWeight: Typography.weights.medium,
    color: Colors.accent,
  },
});

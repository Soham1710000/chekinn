import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface TrackSelectorProps {
  selectedTrack: string | null;
  onSelectTrack: (track: string) => void;
}

export function TrackSelector({ selectedTrack, onSelectTrack }: TrackSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's top of mind right now?</Text>
      
      <TouchableOpacity
        style={[
          styles.option,
          selectedTrack === 'cat_mba' && styles.selectedOption,
        ]}
        onPress={() => onSelectTrack('cat_mba')}
      >
        <Text style={styles.emoji}>🎯</Text>
        <Text style={[
          styles.optionText,
          selectedTrack === 'cat_mba' && styles.selectedText,
        ]}>
          CAT / MBA entrance prep
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.option,
          selectedTrack === 'jobs_career' && styles.selectedOption,
        ]}
        onPress={() => onSelectTrack('jobs_career')}
      >
        <Text style={styles.emoji}>💼</Text>
        <Text style={[
          styles.optionText,
          selectedTrack === 'jobs_career' && styles.selectedText,
        ]}>
          Jobs & career decisions
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 24,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
    borderColor: '#4A90E2',
  },
  emoji: {
    fontSize: 32,
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
    color: '#2C3E50',
    flex: 1,
  },
  selectedText: {
    fontWeight: '600',
    color: '#4A90E2',
  },
});

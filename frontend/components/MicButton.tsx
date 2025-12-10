import React from 'react';
import { TouchableOpacity, View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface MicButtonProps {
  isRecording: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function MicButton({ isRecording, onPress, disabled }: MicButtonProps) {
  const handlePress = () => {
    if (!disabled) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onPress();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          isRecording && styles.recording,
          disabled && styles.disabled,
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isRecording ? 'stop' : 'mic'}
          size={36}
          color="#FFFFFF"
        />
      </TouchableOpacity>
      {isRecording && (
        <View style={styles.pulseContainer}>
          <View style={[styles.pulse, styles.pulse1]} />
          <View style={[styles.pulse, styles.pulse2]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  recording: {
    backgroundColor: '#E74C3C',
  },
  disabled: {
    backgroundColor: '#95A5A6',
    opacity: 0.6,
  },
  pulseContainer: {
    position: 'absolute',
    width: 80,
    height: 80,
  },
  pulse: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#E74C3C',
    opacity: 0,
  },
  pulse1: {
    animation: 'pulse 1.5s infinite',
  },
  pulse2: {
    animation: 'pulse 1.5s infinite 0.5s',
  },
});

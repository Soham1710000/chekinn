import React from 'react';
import { TouchableOpacity, View, StyleSheet, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Shadows } from '../constants/design';

interface MicButtonProps {
  isRecording: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function MicButton({ isRecording, onPress, disabled }: MicButtonProps) {
  const handlePress = () => {
    if (!disabled) {
      // Gentle haptic (not aggressive)
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        activeOpacity={0.85} // Gentle interaction
      >
        <Ionicons
          name={isRecording ? 'stop' : 'mic'}
          size={32}
          color={Colors.background}
        />
      </TouchableOpacity>
      {isRecording && (
        <View style={styles.pulseContainer}>
          {/* Subtle breathing animation, not aggressive */}
          <View style={styles.pulse} />
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
    width: 58,                    // 56-60px per spec
    height: 58,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    // Extremely soft shadow (or none)
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  recording: {
    backgroundColor: Colors.error, // Muted terracotta, not red
  },
  disabled: {
    backgroundColor: Colors.text.tertiary,
    opacity: 0.5,
  },
  pulseContainer: {
    position: 'absolute',
    width: 72,
    height: 72,
  },
  pulse: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.error,
    opacity: 0.3,
    // Gentle breathing effect, not pulsing
  },
});

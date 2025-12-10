import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/design';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  // Soften loading messages
  const displayMessage = message
    ?.replace('Transcribing...', 'One moment...')
    .replace('Thinking...', 'Thinking this through...')
    .replace('Loading...', 'Just a moment...')
    .replace('Generating speech...', 'One moment...');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={Colors.accent} />
          {displayMessage && <Text style={styles.message}>{displayMessage}</Text>}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    minWidth: 200,
  },
  message: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.base,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: Typography.sizes.base * Typography.lineHeights.base,
  },
});

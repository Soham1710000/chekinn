import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../types';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/design';

interface ChatBubbleProps {
  message: Message;
  onPlayAudio?: (messageId: string) => void;
}

export function ChatBubble({ message, onPlayAudio }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {message.text}
        </Text>
        
        {message.has_audio_response && onPlayAudio && (
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => onPlayAudio(message.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="volume-high" size={14} color={Colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
    marginHorizontal: Spacing.md,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  userBubble: {
    backgroundColor: Colors.accent,
  },
  assistantBubble: {
    backgroundColor: Colors.surface,
  },
  text: {
    fontSize: Typography.sizes.base,
    lineHeight: Typography.sizes.base * Typography.lineHeights.relaxed,
  },
  userText: {
    color: Colors.background,
  },
  assistantText: {
    color: Colors.text.primary,
  },
  playButton: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../types';

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
        
        {message.is_voice && (
          <View style={styles.voiceIndicator}>
            <Ionicons name="mic" size={12} color={isUser ? '#FFFFFF' : '#4A90E2'} />
            {message.audio_duration && (
              <Text style={[styles.durationText, isUser && styles.userDurationText]}>
                {Math.round(message.audio_duration)}s
              </Text>
            )}
          </View>
        )}
        
        {message.has_audio_response && onPlayAudio && (
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => onPlayAudio(message.id)}
          >
            <Ionicons name="volume-high" size={16} color={isUser ? '#FFFFFF' : '#4A90E2'} />
          </TouchableOpacity>
        )}
      </View>
      
      {message.track && !isUser && (
        <Text style={styles.trackBadge}>
          {message.track === 'cat_mba' ? '🎯 CAT/MBA' : message.track === 'jobs_career' ? '💼 Career' : '🎮 Play'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#4A90E2',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#2C3E50',
  },
  voiceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  durationText: {
    fontSize: 11,
    color: '#4A90E2',
    marginLeft: 4,
  },
  userDurationText: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  playButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  trackBadge: {
    fontSize: 10,
    color: '#7F8C8D',
    marginTop: 2,
    marginLeft: 4,
  },
});

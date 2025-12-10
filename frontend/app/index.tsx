import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore } from '../store/userStore';
import { apiService } from '../services/api';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { Message } from '../types';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/design';

const { width } = Dimensions.get('window');

// Quick start suggestions for empty state
const QUICK_STARTS = [
  {
    id: '1',
    icon: 'school-outline',
    title: 'Talk through CAT vs MBA',
    description: "You're torn between studying more and working more — let's unpack that.",
    prompt: "I'm stuck between preparing CAT again or focusing on my job.",
  },
  {
    id: '2',
    icon: 'compass-outline',
    title: 'Sense-check my next career move',
    description: 'Use me as a sounding board before you jump.',
    prompt: "I want to sense-check my next career move.",
  },
  {
    id: '3',
    icon: 'chatbubble-ellipses-outline',
    title: 'Just vent about prep or work',
    description: 'No advice unless you ask. Just space.',
    prompt: "I need to vent about what's on my mind right now.",
  },
];

export default function ChatScreen() {
  const user = useUserStore((state) => state.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showQuickStarts, setShowQuickStarts] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const { isRecording, startRecording, stopRecording, getAudioBlob, permissionStatus } = useAudioRecording();
  const { isPlaying, loadAndPlay } = useAudioPlayback();

  // Redirect to onboarding if no user
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        router.replace('/onboarding');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Load chat history
  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = async () => {
    if (!user) return;

    try {
      const history = await apiService.getChatHistory(user.id);
      setMessages(history);
      
      // Show quick starts only if no messages
      if (history.length === 0) {
        setTimeout(() => setShowQuickStarts(true), 500);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleSendMessage = async (text: string, isVoice: boolean = false, audioDuration?: number) => {
    if (!user || !text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      conversation_id: '',
      role: 'user',
      text: text.trim(),
      is_voice: isVoice,
      audio_duration: audioDuration,
      has_audio_response: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setShowQuickStarts(false);
    
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    setLoading(true);
    setLoadingMessage('Thinking...');

    try {
      const response = await apiService.sendMessage(user.id, text.trim(), isVoice, audioDuration);
      setMessages((prev) => [...prev, response]);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleMicPress = async () => {
    if (isRecording) {
      setLoading(true);
      setLoadingMessage('Transcribing...');

      try {
        const audioUri = await stopRecording();
        if (!audioUri) {
          throw new Error('No audio recorded');
        }

        const { blob, filename } = await getAudioBlob(audioUri);
        const transcribeResult = await apiService.transcribeAudio(blob, filename);
        
        if (transcribeResult.success && transcribeResult.text) {
          await handleSendMessage(transcribeResult.text, true, transcribeResult.duration);
        } else {
          Alert.alert('Error', 'Failed to transcribe audio. Please try again.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Transcription error:', error);
        Alert.alert('Error', 'Failed to process audio. Please try again.');
        setLoading(false);
      }
    } else {
      try {
        if (permissionStatus !== 'granted') {
          Alert.alert(
            'Microphone Permission',
            'Chekinn needs access to your microphone to record voice notes.',
            [{ text: 'OK' }]
          );
        }
        await startRecording();
      } catch (error) {
        console.error('Recording error:', error);
        Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
      }
    }
  };

  const handleQuickStartPress = (prompt: string) => {
    setInputText(prompt);
    setShowQuickStarts(false);
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Soft Gradient Header */}
        <LinearGradient
          colors={['#F8F7F5', '#FAFAF8', '#FAFAF8']}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <Text style={styles.logoText}>ChekInn</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                onPress={() => router.push('/intros')}
                style={styles.headerIcon}
              >
                <Ionicons name="people-outline" size={22} color={Colors.text.secondary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/profile')}
                style={styles.profileIconButton}
              >
                <View style={styles.avatarCircle}>
                  <Ionicons name="person" size={16} color={Colors.text.secondary} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.greeting}>
            <Text style={styles.greetingLine1}>Hey, {user.name || 'there'}.</Text>
            <Text style={styles.greetingLine2}>What do you want to figure out today?</Text>
          </View>
        </LinearGradient>

        {/* Chat Area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Start Cards - Only show when no messages */}
          {showQuickStarts && messages.length === 0 && (
            <View style={styles.quickStartSection}>
              {QUICK_STARTS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.quickStartCard}
                  onPress={() => handleQuickStartPress(item.prompt)}
                  activeOpacity={0.7}
                >
                  <View style={styles.quickStartIconContainer}>
                    <Ionicons name={item.icon as any} size={20} color={Colors.accent} />
                  </View>
                  <View style={styles.quickStartText}>
                    <Text style={styles.quickStartTitle}>{item.title}</Text>
                    <Text style={styles.quickStartDescription}>{item.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Chat Messages */}
          {messages.map((message, index) => {
            const isUser = message.role === 'user';
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const isSameSpeaker = prevMessage?.role === message.role;
            
            return (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
                  !isSameSpeaker && styles.messageGroupStart,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isUser ? styles.userMessageText : styles.assistantMessageText,
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Composer Bar */}
        <View style={styles.composerContainer}>
          {permissionStatus !== 'granted' && messages.length === 1 && (
            <Text style={styles.voiceHint}>If voice doesn't work here, you can always just type.</Text>
          )}
          
          <View style={styles.composerBar}>
            <TouchableOpacity
              style={[
                styles.micButton,
                isRecording && styles.micButtonRecording,
              ]}
              onPress={handleMicPress}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isRecording ? 'stop' : 'mic'}
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            
            <TextInput
              style={styles.textInput}
              placeholder="Type or say what's on your mind…"
              placeholderTextColor={Colors.text.placeholder}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              returnKeyType="send"
            />
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={() => {
                if (inputText.trim()) {
                  handleSendMessage(inputText, false);
                }
              }}
              disabled={!inputText.trim()}
              activeOpacity={0.8}
            >
              <Ionicons
                name="send"
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        <LoadingOverlay visible={loading} message={loadingMessage} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  
  // Header Styles
  header: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    letterSpacing: 0.3,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    padding: 6,
  },
  profileIconButton: {
    padding: 2,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.text.placeholder,
  },
  greeting: {
    marginTop: 4,
  },
  greetingLine1: {
    fontSize: 22,
    fontWeight: '500',
    color: Colors.text.primary,
    lineHeight: 28,
    marginBottom: 4,
  },
  greetingLine2: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  
  // Chat Area
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 8,
    paddingBottom: 20,
  },
  
  // Quick Start Cards
  quickStartSection: {
    marginBottom: Spacing.betweenSections,
  },
  quickStartCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    ...Shadows.soft,
  },
  quickStartIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickStartText: {
    flex: 1,
  },
  quickStartTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  quickStartDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  
  // Message Bubbles
  messageContainer: {
    marginBottom: 6,
  },
  messageGroupStart: {
    marginTop: 12,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingVertical: Spacing.chatBubbleVertical,
    paddingHorizontal: Spacing.chatBubbleHorizontal,
    borderRadius: BorderRadius.chatBubble,
  },
  userBubble: {
    backgroundColor: Colors.accent,
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: Typography.sizes.base,
    lineHeight: Typography.sizes.base * Typography.lineHeights.chat,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  assistantMessageText: {
    color: Colors.text.primary,
    fontWeight: '400',
  },
  
  // Composer
  composerContainer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
  },
  voiceHint: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 8,
  },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    paddingLeft: 6,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 8,
    ...Shadows.soft,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.gentle,
  },
  micButtonRecording: {
    backgroundColor: Colors.error,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.gentle,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.text.placeholder,
    opacity: 0.5,
  },
});

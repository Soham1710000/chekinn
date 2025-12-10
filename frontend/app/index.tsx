import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useUserStore } from '../store/userStore';
import { apiService } from '../services/api';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { MicButton } from '../components/MicButton';
import { ChatBubble } from '../components/ChatBubble';
import { TrackSelector } from '../components/TrackSelector';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { Message } from '../types';

export default function ChatScreen() {
  const user = useUserStore((state) => state.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showTrackSelector, setShowTrackSelector] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  
  const flashListRef = useRef<FlashList<Message>>(null);
  const { isRecording, startRecording, stopRecording, getAudioBlob, permissionStatus } = useAudioRecording();
  const { isPlaying, loadAndPlay } = useAudioPlayback();

  // Redirect to onboarding if no user
  useEffect(() => {
    // Give a bit more time for the store to load from AsyncStorage
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

  // Show track selector on first message
  useEffect(() => {
    if (user && messages.length === 0 && !selectedTrack && !showTrackSelector) {
      // Show after a brief delay
      setTimeout(() => setShowTrackSelector(true), 1000);
    }
  }, [user, messages.length, selectedTrack]);

  const loadChatHistory = async () => {
    if (!user) return;

    try {
      const history = await apiService.getChatHistory(user.id);
      setMessages(history);
      
      // Set track from last message if available
      const lastTrack = history.reverse().find(m => m.track)?.track;
      if (lastTrack) {
        setSelectedTrack(lastTrack);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleSelectTrack = async (track: string) => {
    if (!user) return;
    
    setSelectedTrack(track);
    setShowTrackSelector(false);
    
    try {
      await apiService.selectTrack(user.id, track);
    } catch (error) {
      console.error('Failed to set track:', error);
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
    
    // Scroll to bottom
    setTimeout(() => {
      flashListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    setLoading(true);
    setLoadingMessage('Thinking...');

    try {
      const response = await apiService.sendMessage(user.id, text.trim(), isVoice, audioDuration);
      setMessages((prev) => [...prev, response]);
      
      // Scroll to bottom
      setTimeout(() => {
        flashListRef.current?.scrollToEnd({ animated: true });
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
      // Stop recording and transcribe
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
      // Start recording
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

  const handleTextSend = () => {
    if (inputText.trim()) {
      handleSendMessage(inputText, false);
    }
  };

  const handlePlayAudio = async (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    try {
      setLoading(true);
      setLoadingMessage('Generating speech...');
      
      const audioBlob = await apiService.synthesizeSpeech(message.text);
      await loadAndPlay(audioBlob);
    } catch (error) {
      console.error('TTS error:', error);
      Alert.alert('Error', 'Failed to play audio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chekinn</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => router.push('/intros')}
              style={styles.headerButton}
            >
              <Ionicons name="people-outline" size={24} color="#2C3E50" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/profile')}
              style={styles.headerButton}
            >
              <Ionicons name="person-outline" size={24} color="#2C3E50" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Track Selector Modal */}
        {showTrackSelector && (
          <View style={styles.trackSelectorOverlay}>
            <View style={styles.trackSelectorCard}>
              <TrackSelector
                selectedTrack={selectedTrack}
                onSelectTrack={handleSelectTrack}
              />
            </View>
          </View>
        )}

        {/* Messages */}
        <View style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Hey {user.name}</Text>
              <Text style={styles.emptySubtitle}>
                {selectedTrack
                  ? "I've got you. What's on your mind?"
                  : "What brings you here?"}
              </Text>
              {!selectedTrack && (
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => setShowTrackSelector(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.startButtonText}>
                    Let's talk
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlashList
              ref={flashListRef}
              data={messages}
              renderItem={({ item }) => (
                <ChatBubble message={item} onPlayAudio={handlePlayAudio} />
              )}
              estimatedItemSize={100}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
            />
          )}
        </View>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          {/* Text Input */}
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor="#95A5A6"
              multiline
              maxLength={500}
              editable={!loading && !isRecording}
            />
            <TouchableOpacity
              onPress={handleTextSend}
              disabled={!inputText.trim() || loading || isRecording}
              style={styles.sendButton}
            >
              <Ionicons
                name="send"
                size={24}
                color={inputText.trim() && !loading && !isRecording ? '#4A90E2' : '#BDC3C7'}
              />
            </TouchableOpacity>
          </View>

          {/* Mic Button */}
          <View style={styles.micContainer}>
            <MicButton
              isRecording={isRecording}
              onPress={handleMicPress}
              disabled={loading && !isRecording}
            />
            {isRecording && (
              <Text style={styles.recordingText}>Recording...</Text>
            )}
          </View>

          {/* Hint Text */}
          {!isRecording && messages.length === 0 && (
            <Text style={styles.hintText}>
              Tap the mic to record a voice note, or type below
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={loading && !isRecording} message={loadingMessage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  trackSelectorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackSelectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
    padding: 4,
  },
  micContainer: {
    alignItems: 'center',
  },
  recordingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '600',
  },
  hintText: {
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'center',
    marginTop: 8,
  },
});

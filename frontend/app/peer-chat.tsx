import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useUserStore } from '../store/userStore';
import { apiService } from '../services/api';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/design';

export default function PeerChatScreen() {
  const { otherUserId, otherUserName } = useLocalSearchParams();
  const user = useUserStore((state) => state.user);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const flashListRef = useRef<FlashList<any>>(null);

  useEffect(() => {
    if (user && otherUserId) {
      loadConversation();
    }
  }, [user, otherUserId]);

  const loadConversation = async () => {
    if (!user || !otherUserId) return;

    try {
      // Create or get conversation
      const conv = await apiService.createPeerConversation(
        user.id,
        otherUserId as string
      );
      setConversationId(conv.conversation_id);

      // Load messages
      const msgs = await apiService.getPeerMessages(conv.conversation_id);
      setMessages(msgs);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const handleSend = async () => {
    if (!user || !otherUserId || !inputText.trim()) return;

    const tempMessage = {
      id: Date.now().toString(),
      from_user_id: user.id,
      to_user_id: otherUserId,
      text: inputText.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInputText('');

    setTimeout(() => {
      flashListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    setLoading(true);

    try {
      const response = await apiService.sendPeerMessage(
        user.id,
        otherUserId as string,
        inputText.trim()
      );

      // Update message with real ID
      setMessages((prev) =>
        prev.map((m) => (m.id === tempMessage.id ? response : m))
      );
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEndChat = async () => {
    if (!user || !conversationId) return;
    
    try {
      setShowEndDialog(false);
      setLoading(true);
      
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/peer/conversations/${conversationId}/end?user_id=${user.id}`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        Alert.alert(
          'Chat Ended',
          'This conversation has been closed.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to end chat');
      }
    } catch (error) {
      console.error('Failed to end chat:', error);
      Alert.alert('Error', 'Failed to end chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.from_user_id === user?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.myMessageBubble : styles.theirMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMe ? styles.myMessageText : styles.theirMessageText,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {otherUserName || 'Chat'}
          </Text>
          <TouchableOpacity
            onPress={() => setShowEndDialog(true)}
            style={styles.endButton}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>
        
        {/* End Chat Confirmation Dialog */}
        {showEndDialog && (
          <View style={styles.dialogOverlay}>
            <View style={styles.dialogContainer}>
              <Text style={styles.dialogTitle}>End this conversation?</Text>
              <Text style={styles.dialogMessage}>
                This will close the chat for both you and {otherUserName}. You won't be able to send more messages.
              </Text>
              <View style={styles.dialogButtons}>
                <TouchableOpacity
                  onPress={() => setShowEndDialog(false)}
                  style={[styles.dialogButton, styles.cancelButton]}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleEndChat}
                  style={[styles.dialogButton, styles.endChatButton]}
                >
                  <Text style={styles.endChatButtonText}>End Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Messages */}
        <View style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Start a conversation
              </Text>
            </View>
          ) : (
            <FlashList
              ref={flashListRef}
              data={messages}
              renderItem={renderMessage}
              estimatedItemSize={100}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
            />
          )}
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor={Colors.text.placeholder}
              multiline
              maxLength={500}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || loading}
              style={styles.sendButton}
            >
              <Ionicons
                name="send"
                size={20}
                color={
                  inputText.trim() && !loading
                    ? Colors.accent
                    : Colors.text.tertiary
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    color: Colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: Spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
    lineHeight: Typography.sizes.base * Typography.lineHeights.base,
  },
  messageContainer: {
    marginVertical: Spacing.xs,
    marginHorizontal: Spacing.md,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  theirMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  myMessageBubble: {
    backgroundColor: Colors.accent,
  },
  theirMessageBubble: {
    backgroundColor: Colors.surface,
  },
  messageText: {
    fontSize: Typography.sizes.base,
    lineHeight: Typography.sizes.base * Typography.lineHeights.relaxed,
  },
  myMessageText: {
    color: Colors.background,
  },
  theirMessageText: {
    color: Colors.text.primary,
  },
  inputContainer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.card,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.text.primary,
    maxHeight: 100,
    lineHeight: Typography.sizes.base * Typography.lineHeights.base,
  },
  sendButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
});

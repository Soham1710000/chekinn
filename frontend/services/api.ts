import axios from 'axios';
import Constants from 'expo-constants';
import { User, Message, Intro, Analytics } from '../types';

// Use environment variable directly
const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // User endpoints
  createUser: async (userData: Partial<User>): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  getUser: async (userId: string): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Chat endpoints
  sendMessage: async (userId: string, text: string, isVoice: boolean = false, audioDuration?: number): Promise<Message> => {
    const response = await api.post('/chat/message', {
      user_id: userId,
      text,
      is_voice: isVoice,
      audio_duration: audioDuration,
    });
    return response.data;
  },

  getChatHistory: async (userId: string, limit: number = 50): Promise<Message[]> => {
    const response = await api.get(`/chat/history/${userId}`, {
      params: { limit },
    });
    return response.data.messages;
  },

  // Audio endpoints
  transcribeAudio: async (audioFile: Blob, filename: string): Promise<{ success: boolean; text: string; duration?: number }> => {
    const formData = new FormData();
    formData.append('file', audioFile as any, filename);

    const response = await api.post('/audio/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  synthesizeSpeech: async (text: string, voice: string = 'alloy'): Promise<Blob> => {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('voice', voice);

    const response = await api.post('/audio/synthesize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });
    return response.data;
  },

  // Track endpoints
  selectTrack: async (userId: string, track: string): Promise<{ success: boolean; track: string }> => {
    const response = await api.post('/track/select', {
      user_id: userId,
      track,
    });
    return response.data;
  },

  // Intro endpoints
  getIntros: async (userId: string): Promise<Intro[]> => {
    const response = await api.get(`/intros/${userId}`);
    return response.data.intros;
  },

  introAction: async (introId: string, action: 'accept' | 'decline'): Promise<{ success: boolean; status: string }> => {
    const response = await api.post('/intros/action', {
      intro_id: introId,
      action,
    });
    return response.data;
  },

  generateIntros: async (userId: string): Promise<{ success: boolean; suggestions_count: number }> => {
    const response = await api.post(`/intros/generate/${userId}`);
    return response.data;
  },

  // Analytics endpoints
  getAnalytics: async (): Promise<Analytics> => {
    const response = await api.get('/analytics');
    return response.data;
  },

  // Peer messaging endpoints
  createPeerConversation: async (fromUserId: string, toUserId: string): Promise<{ conversation_id: string }> => {
    const response = await api.post('/peer/conversations/create', null, {
      params: { from_user_id: fromUserId, to_user_id: toUserId },
    });
    return response.data;
  },

  getPeerConversations: async (userId: string): Promise<any[]> => {
    const response = await api.get(`/peer/conversations/${userId}`);
    return response.data.conversations;
  },

  sendPeerMessage: async (fromUserId: string, toUserId: string, text: string): Promise<any> => {
    const response = await api.post('/peer/messages', {
      from_user_id: fromUserId,
      to_user_id: toUserId,
      text,
    });
    return response.data;
  },

  getPeerMessages: async (conversationId: string, limit: number = 50): Promise<any[]> => {
    const response = await api.get(`/peer/messages/${conversationId}`, {
      params: { limit },
    });
    return response.data.messages;
  },
};

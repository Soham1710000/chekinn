import { create } from 'zustand';
import { User } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  loadUser: () => Promise<void>;
  clearUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  
  setUser: async (user: User) => {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  
  loadUser: async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        set({ user });
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  },
  
  clearUser: async () => {
    await AsyncStorage.removeItem('user');
    set({ user: null });
  },
}));

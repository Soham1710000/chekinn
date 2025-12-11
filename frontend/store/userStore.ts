import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface UserStore {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  loadUser: () => Promise<void>;
}

const USER_STORAGE_KEY = '@chekinn_user';

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: true,
  
  setUser: async (user) => {
    set({ user });
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user to storage:', error);
    }
  },
  
  clearUser: async () => {
    set({ user: null });
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear user from storage:', error);
    }
  },
  
  loadUser: async () => {
    try {
      const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (userJson) {
        const user = JSON.parse(userJson);
        set({ user, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
      set({ isLoading: false });
    }
  },
}));

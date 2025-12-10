import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { LoadingOverlay } from '../components/LoadingOverlay';

export default function ProfileScreen() {
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await clearUser();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          {user.city && <Text style={styles.userInfo}>{user.city}</Text>}
          {user.current_role && <Text style={styles.userInfo}>{user.current_role}</Text>}
        </View>

        {/* Settings Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="mic-outline" size={20} color="#2C3E50" />
              <Text style={styles.settingLabel}>Preferred Mode</Text>
            </View>
            <Text style={styles.settingValue}>
              {user.preferred_mode === 'voice' ? 'Voice' : 'Text'}
            </Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="people-outline" size={20} color="#2C3E50" />
              <Text style={styles.settingLabel}>Open to Introductions</Text>
            </View>
            <Switch
              value={user.open_to_intros}
              onValueChange={(value) => {
                // TODO: Update user preferences via API
                console.log('Open to intros:', value);
              }}
              trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
            />
          </View>
        </View>

        {/* About */}
        {user.intent && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What brings you here</Text>
            <Text style={styles.aboutText}>{user.intent}</Text>
          </View>
        )}

        {/* Navigation Links */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => router.push('/admin')}
          >
            <Ionicons name="bar-chart-outline" size={20} color="#4A90E2" />
            <Text style={styles.linkText}>View Analytics</Text>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#E74C3C" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>

      <LoadingOverlay visible={loading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  userInfo: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 14,
    color: '#2C3E50',
  },
  settingValue: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  aboutText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
  },
  versionText: {
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'center',
  },
});

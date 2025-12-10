import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { apiService } from '../services/api';
import { Intro } from '../types';
import { LoadingOverlay } from '../components/LoadingOverlay';

export default function IntrosScreen() {
  const user = useUserStore((state) => state.user);
  const [intros, setIntros] = useState<Intro[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadIntros();
    }
  }, [user]);

  const loadIntros = async (isRefresh = false) => {
    if (!user) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await apiService.getIntros(user.id);
      setIntros(data);
    } catch (error) {
      console.error('Failed to load intros:', error);
      Alert.alert('Error', 'Failed to load connections');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleIntroAction = async (introId: string, action: 'accept' | 'decline') => {
    try {
      await apiService.introAction(introId, action);
      
      // Update local state
      setIntros((prev) =>
        prev.map((intro) =>
          intro.id === introId
            ? { ...intro, status: action === 'accept' ? 'accepted' : 'declined' }
            : intro
        )
      );

      Alert.alert(
        'Success',
        action === 'accept'
          ? 'Connection accepted! You can start a conversation.'
          : 'Connection declined.'
      );
    } catch (error) {
      console.error('Failed to update intro:', error);
      Alert.alert('Error', 'Failed to update connection. Please try again.');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadIntros(true)} />
        }
      >
        {intros.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#BDC3C7" />
            <Text style={styles.emptyTitle}>No Connections Yet</Text>
            <Text style={styles.emptySubtitle}>
              Keep having conversations! When the time is right, I'll suggest meaningful
              connections with others on similar journeys.
            </Text>
          </View>
        ) : (
          intros.map((intro) => (
            <View key={intro.id} style={styles.introCard}>
              <View style={styles.introHeader}>
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={32} color="#FFFFFF" />
                </View>
                <View style={styles.introInfo}>
                  <Text style={styles.introName}>{intro.other_user.name}</Text>
                  {intro.other_user.city && (
                    <Text style={styles.introDetail}>
                      <Ionicons name="location-outline" size={12} /> {intro.other_user.city}
                    </Text>
                  )}
                  {intro.other_user.current_role && (
                    <Text style={styles.introDetail}>
                      <Ionicons name="briefcase-outline" size={12} /> {intro.other_user.current_role}
                    </Text>
                  )}
                </View>
                <View style={[
                  styles.statusBadge,
                  intro.status === 'accepted' && styles.statusAccepted,
                  intro.status === 'declined' && styles.statusDeclined,
                ]}>
                  <Text style={styles.statusText}>
                    {intro.status === 'pending' ? 'New' : intro.status === 'accepted' ? 'Connected' : 'Declined'}
                  </Text>
                </View>
              </View>

              <Text style={styles.introReason}>{intro.reason}</Text>

              {intro.status === 'pending' && (
                <View style={styles.introActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleIntroAction(intro.id, 'accept')}
                  >
                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Curious</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.declineButton]}
                    onPress={() => handleIntroAction(intro.id, 'decline')}
                  >
                    <Ionicons name="close-circle-outline" size={20} color="#7F8C8D" />
                    <Text style={[styles.actionButtonText, styles.declineText]}>Pass</Text>
                  </TouchableOpacity>
                </View>
              )}

              {intro.status === 'accepted' && (
                <TouchableOpacity
                  style={styles.chatButton}
                  onPress={() => {
                    const otherUserId = intro.from_user_id === user.id ? intro.to_user_id : intro.from_user_id;
                    router.push({
                      pathname: '/peer-chat',
                      params: {
                        otherUserId,
                        otherUserName: intro.other_user.name,
                      },
                    });
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={18} color="#A58673" />
                  <Text style={styles.chatButtonText}>Start conversation</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <LoadingOverlay visible={loading} message="Loading connections..." />
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
    flexGrow: 1,
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
  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  introInfo: {
    flex: 1,
    marginLeft: 12,
  },
  introName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  introDetail: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#F39C12',
  },
  statusAccepted: {
    backgroundColor: '#27AE60',
  },
  statusDeclined: {
    backgroundColor: '#95A5A6',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  introReason: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
    marginBottom: 16,
  },
  introActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: '#4A90E2',
  },
  declineButton: {
    backgroundColor: '#F0F0F0',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  declineText: {
    color: '#7F8C8D',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F5F3EF',
    borderWidth: 1,
    borderColor: '#A58673',
    marginTop: 8,
    gap: 8,
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A58673',
  },
});

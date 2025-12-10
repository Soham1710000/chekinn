import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';
import { Analytics } from '../types';
import { LoadingOverlay } from '../components/LoadingOverlay';

export default function AdminScreen() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await apiService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      Alert.alert('Error', 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading && !analytics) {
    return <LoadingOverlay visible={true} message="Loading analytics..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadAnalytics(true)} />
        }
      >
        {analytics && (
          <>
            {/* Overview Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="people" size={32} color="#4A90E2" />
                  <Text style={styles.statValue}>{analytics.total_users}</Text>
                  <Text style={styles.statLabel}>Total Users</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="pulse" size={32} color="#27AE60" />
                  <Text style={styles.statValue}>{analytics.active_users}</Text>
                  <Text style={styles.statLabel}>Active Users</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="chatbubbles" size={32} color="#F39C12" />
                  <Text style={styles.statValue}>{analytics.total_conversations}</Text>
                  <Text style={styles.statLabel}>Conversations</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="chatbox-ellipses" size={32} color="#9B59B6" />
                  <Text style={styles.statValue}>{analytics.total_messages}</Text>
                  <Text style={styles.statLabel}>Total Messages</Text>
                </View>
              </View>
            </View>

            {/* Voice Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Voice Engagement</Text>
              <View style={styles.row}>
                <View style={styles.rowIcon}>
                  <Ionicons name="mic" size={24} color="#E74C3C" />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>Voice Messages</Text>
                  <Text style={styles.rowValue}>{analytics.total_voice_messages}</Text>
                </View>
                <View style={styles.percentage}>
                  <Text style={styles.percentageText}>
                    {analytics.total_messages > 0
                      ? Math.round((analytics.total_voice_messages / analytics.total_messages) * 100)
                      : 0}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Track Distribution */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Track Distribution</Text>
              {Object.entries(analytics.track_distribution).map(([track, count]) => (
                <View key={track} style={styles.row}>
                  <View style={styles.rowIcon}>
                    <Ionicons
                      name={track === 'cat_mba' ? 'school' : track === 'jobs_career' ? 'briefcase' : 'game-controller'}
                      size={24}
                      color="#4A90E2"
                    />
                  </View>
                  <View style={styles.rowContent}>
                    <Text style={styles.rowLabel}>
                      {track === 'cat_mba' ? 'CAT/MBA' : track === 'jobs_career' ? 'Jobs/Career' : 'Roast/Play'}
                    </Text>
                    <Text style={styles.rowValue}>{count} messages</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Intros Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Connections</Text>
              <View style={styles.row}>
                <View style={styles.rowIcon}>
                  <Ionicons name="git-network" size={24} color="#F39C12" />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>Suggested</Text>
                  <Text style={styles.rowValue}>{analytics.intros_suggested}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.rowIcon}>
                  <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>Accepted</Text>
                  <Text style={styles.rowValue}>{analytics.intros_accepted}</Text>
                </View>
                <View style={styles.percentage}>
                  <Text style={styles.percentageText}>
                    {analytics.intros_suggested > 0
                      ? Math.round((analytics.intros_accepted / analytics.intros_suggested) * 100)
                      : 0}%
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.rowIcon}>
                  <Ionicons name="close-circle" size={24} color="#E74C3C" />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>Declined</Text>
                  <Text style={styles.rowValue}>{analytics.intros_declined}</Text>
                </View>
              </View>
            </View>

            {/* Power Users */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Engagement</Text>
              <View style={styles.row}>
                <View style={styles.rowIcon}>
                  <Ionicons name="trophy" size={24} color="#F39C12" />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>Power Users (50+ messages)</Text>
                  <Text style={styles.rowValue}>{analytics.power_users}</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
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
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rowIcon: {
    width: 40,
    alignItems: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  percentage: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2',
  },
});

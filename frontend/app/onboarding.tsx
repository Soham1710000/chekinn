import React, { useState } from 'react';
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
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../services/api';
import { useUserStore } from '../store/userStore';
import { LoadingOverlay } from '../components/LoadingOverlay';

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState('');
  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useUserStore((state) => state.setUser);

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name');
      return;
    }

    setLoading(true);

    try {
      const user = await apiService.createUser({
        name: name.trim(),
        city: city.trim() || undefined,
        current_role: role.trim() || undefined,
        intent: intent.trim() || undefined,
        open_to_intros: true,
        preferred_mode: 'voice',
      });

      await setUser(user);
      router.replace('/');
    } catch (error) {
      console.error('Failed to create user:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to Chekinn</Text>
            <Text style={styles.subtitle}>
              Your thoughtful companion for CAT/MBA prep and career decisions
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>What's your name? *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#95A5A6"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Where are you based?</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="City (optional)"
                placeholderTextColor="#95A5A6"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>What do you do currently?</Text>
              <TextInput
                style={styles.input}
                value={role}
                onChangeText={setRole}
                placeholder="Student / Job role (optional)"
                placeholderTextColor="#95A5A6"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>What brings you here?</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={intent}
                onChangeText={setIntent}
                placeholder="e.g., Preparing for CAT, considering MBA, exploring career switch"
                placeholderTextColor="#95A5A6"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            You can always update these details later in your profile
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={loading} message="Creating your account..." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    lineHeight: 22,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
    backgroundColor: '#F8F9FA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'center',
    marginTop: 16,
  },
});

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
import { Colors, Spacing, Typography, BorderRadius } from '../constants/design';

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
      console.log('Creating user...');
      const user = await apiService.createUser({
        name: name.trim(),
        city: city.trim() || undefined,
        current_role: role.trim() || undefined,
        intent: intent.trim() || undefined,
        open_to_intros: true,
        preferred_mode: 'voice',
      });

      console.log('User created:', user);
      await setUser(user);
      console.log('User set in store, navigating to main screen...');
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
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrapper}>
            {/* Header - centered, minimal */}
            <View style={styles.header}>
              <Text style={styles.headline}>A quiet place to think things through.</Text>
              <Text style={styles.subtext}>
                You don't need perfect answers — just start where you are.
              </Text>
            </View>

            {/* Form - single column, centered */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>What should I call you?</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g., Soham"
                  placeholderTextColor={Colors.text.placeholder}
                  autoCapitalize="words"
                  autoFocus
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Where are you right now? <Text style={styles.optionalText}>(optional)</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="City, country"
                  placeholderTextColor={Colors.text.placeholder}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  What are you mostly doing these days? <Text style={styles.optionalText}>(optional)</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={role}
                  onChangeText={setRole}
                  placeholder="Studying, working, taking a break…"
                  placeholderTextColor={Colors.text.placeholder}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>What's been on your mind lately?</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={intent}
                  onChangeText={setIntent}
                  placeholder="A decision, an exam, a next step…"
                  placeholderTextColor={Colors.text.placeholder}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Primary CTA - pill-shaped */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleContinue}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Start a check-in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={loading} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  contentWrapper: {
    maxWidth: 380,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 36,
    alignItems: 'center',
  },
  headline: {
    fontSize: 24,
    fontWeight: '500',
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 31,
    marginBottom: 14,
  },
  subtext: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22.5,
    maxWidth: 340,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.text.primary,
    marginBottom: 6,
  },
  optionalText: {
    color: Colors.text.tertiary,
    fontWeight: '400',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: Typography.sizes.base,
    color: Colors.text.primary,
    backgroundColor: Colors.surface,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  button: {
    backgroundColor: Colors.accent,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.base,
    fontWeight: '500',
  },
});

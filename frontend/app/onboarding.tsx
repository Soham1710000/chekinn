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
    padding: Spacing.xl,
    paddingTop: 60,
  },
  header: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  headline: {
    fontSize: Typography.sizes.headline,
    fontWeight: Typography.weights.medium,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: Typography.sizes.headline * Typography.lineHeights.headline,
    marginBottom: Spacing.md,
  },
  subtext: {
    fontSize: Typography.sizes.helper,
    fontWeight: Typography.weights.normal,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.helper * Typography.lineHeights.helper,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.sizes.helper,
    fontWeight: Typography.weights.normal,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.card,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    fontSize: Typography.sizes.base,
    color: Colors.text.primary,
    backgroundColor: Colors.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: Colors.accent,
    padding: Spacing.md,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.background,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
  },
});

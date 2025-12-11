import { useState, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export function useAudioRecording() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(console.error);
      }
    };
  }, [recording]);

  const startRecording = useCallback(async () => {
    try {
      // Check permissions
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting microphone permission...');
        const response = await requestPermission();
        if (response.status !== 'granted') {
          throw new Error('Microphone permission was denied');
        }
      }

      // Set audio mode
      const audioMode: any = {
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      };
      
      // Only add Android-specific settings on Android platform
      if (Platform.OS === 'android' && Audio.AndroidAudioUsage) {
        audioMode.interruptionModeAndroid = Audio.AndroidAudioUsage.VOICE_COMMUNICATION;
      }
      
      await Audio.setAudioModeAsync(audioMode);

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }, [permissionResponse, requestPermission]);

  const stopRecording = useCallback(async () => {
    if (!recording) {
      throw new Error('No active recording');
    }

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      setRecording(null);
      setIsRecording(false);

      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }, [recording]);

  const getAudioBlob = useCallback(async (uri: string): Promise<{ blob: Blob; filename: string }> => {
    try {
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        return { blob, filename: 'audio.webm' };
      } else {
        // For native platforms, read as base64 and convert to blob
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Convert base64 to blob
        const response = await fetch(`data:audio/mp3;base64,${base64}`);
        const blob = await response.blob();

        return { blob, filename: 'audio.mp3' };
      }
    } catch (error) {
      console.error('Failed to get audio blob:', error);
      throw error;
    }
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    getAudioBlob,
    permissionStatus: permissionResponse?.status,
  };
}

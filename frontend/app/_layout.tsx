import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { SplashScreen } from '../components/SplashScreen';

export default function RootLayout() {
  const { isLoading, loadUser } = useUserStore();

  useEffect(() => {
    loadUser();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#2C3E50',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'ChekInn',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="onboarding"
        options={{
          title: 'Welcome',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="intros"
        options={{
          title: 'Connections',
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
      <Stack.Screen
        name="peer-chat"
        options={{
          title: 'Chat',
        }}
      />
      <Stack.Screen
        name="admin"
        options={{
          title: 'Analytics',
        }}
      />
    </Stack>
  );
}

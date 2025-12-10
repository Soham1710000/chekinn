import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useUserStore } from '../store/userStore';

export default function RootLayout() {
  const loadUser = useUserStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, []);

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
          title: 'Chekinn',
          headerShown: true,
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
        name="admin"
        options={{
          title: 'Analytics',
        }}
      />
    </Stack>
  );
}

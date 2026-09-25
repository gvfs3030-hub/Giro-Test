// [LOCAL] — root layout do app Giro
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { AppStateProvider } from '../src/contexts/AppStateContext';
import { FocusPreviewProvider } from '../src/components/FocusPreview';
import { initDatabase } from '../src/database/database';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

function AppContent() {
  const { colors, isDark } = useTheme();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(() => setDbReady(true))
      .catch((e) => {
        console.error('DB init error:', e);
        setDbReady(true); // continue anyway
      });
  }, []);

  if (!dbReady) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Carregando...</Text>
      </View>
    );
  }

  return (
    <FocusPreviewProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="setup" />
        <Stack.Screen name="tabs" />
        <Stack.Screen name="new-sale" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="client-add" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="product-add" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="expense-add" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="client" />
        <Stack.Screen name="product" />
        <Stack.Screen name="order" />
        <Stack.Screen name="installment" />
        <Stack.Screen name="expense" />
        <Stack.Screen name="visit" />
        <Stack.Screen name="products" />
        <Stack.Screen name="financial" />
        <Stack.Screen name="expenses" />
        <Stack.Screen name="routes" />
        <Stack.Screen name="visit-plan" />
        <Stack.Screen name="import-backup" />
        <Stack.Screen name="reports" />
        <Stack.Screen name="assistant" />
        <Stack.Screen name="settings" />
      </Stack>
      <Toast />
    </FocusPreviewProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppStateProvider>
          <AppContent />
        </AppStateProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 16, fontSize: 16 },
});

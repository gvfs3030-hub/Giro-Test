// [LOCAL] — menu "Mais"
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';

const menuItems = [
  { icon: 'cube-outline' as const, label: 'Produtos', route: '/products' },
  { icon: 'wallet-outline' as const, label: 'Financeiro', route: '/financial' },
  { icon: 'receipt-outline' as const, label: 'Despesas', route: '/expenses' },
  { icon: 'map-outline' as const, label: 'Rotas e Visitas', route: '/routes' },
  { icon: 'bar-chart-outline' as const, label: 'Relat\u00f3rios', route: '/reports' },
  { icon: 'bulb-outline' as const, label: 'Assistente', route: '/assistant' },
  { icon: 'settings-outline' as const, label: 'Configura\u00e7\u00f5es', route: '/settings' },
];

export default function MoreScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32 }}>
      <Text style={[styles.title, { color: colors.text }]}>Mais</Text>
      <View style={styles.grid}>
        {menuItems.map((item) => (
          <Pressable
            key={item.route}
            style={({ pressed }) => [
              styles.menuCard,
              { backgroundColor: colors.card, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
            onPress={() => router.push(item.route as any)}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name={item.icon} size={28} color={colors.primary} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '700', paddingHorizontal: 16, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  menuCard: {
    width: '47%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  menuLabel: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});

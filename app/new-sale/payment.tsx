// [LOCAL] — Step 4: pagamento
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useSaleWizard } from '../../src/contexts/SaleWizardContext';
import { PAYMENT_METHODS } from '../../src/constants/theme';
import { formatCurrency, addDays, formatDate, todayDateISO } from '../../src/utils/format';

export default function PaymentStep() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const wizard = useSaleWizard();
  const [method, setMethod] = useState(wizard.state.paymentMethod || 'dinheiro');
  const [installments, setInstallments] = useState('1');

  const total = wizard.getTotal();
  const installmentCount = parseInt(installments) || 1;
  const installmentValue = total / installmentCount;
  const today = todayDateISO();

  const handleNext = () => {
    wizard.setPayment(method, method === 'prazo' ? installmentCount : 1, method === 'prazo' ? today : null);
    router.push('/new-sale/signature');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}><Ionicons name="arrow-back" size={24} color={colors.text} /></Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Pagamento</Text>
        <Text style={[styles.step, { color: colors.textCaption }]}>4/6</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total do Pedido</Text>
        <Text style={[styles.totalValue, { color: colors.primary }]}>{formatCurrency(total)}</Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Forma de Pagamento</Text>
        <View style={styles.methodsGrid}>
          {PAYMENT_METHODS.map((m) => (
            <Pressable
              key={m.value}
              style={[styles.methodCard, { backgroundColor: method === m.value ? colors.primaryLight : colors.surface, borderColor: method === m.value ? colors.primary : colors.border }]}
              onPress={() => setMethod(m.value)}
            >
              <Text style={{ color: method === m.value ? colors.primary : colors.text, fontWeight: '600', fontSize: 16 }}>{m.label}</Text>
            </Pressable>
          ))}
        </View>

        {method === 'prazo' && (
          <View style={styles.installmentSection}>
            <Text style={[styles.label, { color: colors.text }]}>Número de Parcelas</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              value={installments}
              onChangeText={setInstallments}
              keyboardType="numeric"
              maxLength={2}
            />
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>Parcelas</Text>
            {Array.from({ length: installmentCount }, (_, i) => (
              <View key={i} style={[styles.installmentRow, { borderBottomColor: colors.border }]}>
                <Text style={{ color: colors.text }}>Parcela {i + 1}</Text>
                <Text style={{ color: colors.textSecondary }}>{formatDate(addDays(today, 30 * (i + 1)))}</Text>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{formatCurrency(installmentValue)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Pressable style={[styles.nextBtn, { backgroundColor: colors.primary }]} onPress={handleNext}>
          <Text style={styles.nextBtnText}>Próximo</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 20, fontWeight: '700' },
  step: { fontSize: 14 },
  content: { padding: 16, paddingBottom: 120 },
  totalLabel: { fontSize: 16, textAlign: 'center' },
  totalValue: { fontSize: 32, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  methodsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  methodCard: { paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1.5, minWidth: '45%', alignItems: 'center' },
  installmentSection: { marginTop: 24 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 16 },
  installmentRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  bottomBar: { padding: 16, borderTopWidth: 1 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 24 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

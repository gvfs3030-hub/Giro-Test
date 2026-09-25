// [LOCAL] — detalhe do pedido
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { getDatabase } from '../../../src/database/database';
import type { Sale, SaleItem } from '../../../src/types';
import { formatCurrency, formatDateTime, todayISO, paymentDetailLine } from '../../../src/utils/format';
import StatusBadge from '../../../src/components/StatusBadge';
import Card from '../../../src/components/Card';
import { ORDER_STATUS } from '../../../src/constants/theme';
import Toast from 'react-native-toast-message';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function OrderDetailScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [sale, setSale] = useState<(Sale & { clientName?: string }) | null>(null);
  const [items, setItems] = useState<SaleItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      loadOrder();
    }, [id])
  );

  const loadOrder = async () => {
    try {
      const db = await getDatabase();
      const s = await db.getFirstAsync<Sale & { clientName: string }>(
        'SELECT s.*, c.nomeFantasia as clientName FROM sales s LEFT JOIN clients c ON s.clientId = c.id WHERE s.id = ?', [id]
      );
      setSale(s ?? null);
      const it = await db.getAllAsync<SaleItem>('SELECT * FROM sale_items WHERE saleId = ?', [id]);
      setItems(it ?? []);
    } catch (e) { console.error(e); }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const db = await getDatabase();
      await db.runAsync('UPDATE sales SET status = ?, updatedAt = ? WHERE id = ?', [newStatus, todayISO(), id]);
      // If cancelled, restore stock
      if (newStatus === 'cancelado') {
        for (const item of items) {
          await db.runAsync('UPDATE products SET stockCurrent = stockCurrent + ?, updatedAt = ? WHERE id = ?', [item?.quantity ?? 0, todayISO(), item?.productId]);
        }
      }
      Toast.show({ type: 'success', text1: 'Status atualizado', position: 'bottom' });
      loadOrder();
    } catch (e) { console.error(e); }
  };

  const handleGeneratePDF = async () => {
    if (!sale) return;
    try {
      const db = await getDatabase();
      const config = await db.getFirstAsync<{ companyName: string; sellerName: string }>('SELECT companyName, sellerName FROM config WHERE id = 1');
      const itemsHtml = items.map((item) =>
        `<tr><td>${item?.productName ?? ''}</td><td style="text-align:center">${item?.quantity ?? 0} ${item?.unit ?? ''}</td><td style="text-align:right">${formatCurrency(item?.unitPrice)}</td><td style="text-align:center">${item?.discount ?? 0}%</td><td style="text-align:right">${formatCurrency(item?.subtotal)}</td></tr>`
      ).join('');
      const sigData = sale.signatureData ? (() => {
        try {
          const sig = JSON.parse(sale.signatureData as string) as { paths: string[]; width: number; height: number };
          const pathsSvg = (sig.paths ?? []).map((d) => `<path d="${d}" stroke="#1A1A1A" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
          return `<div style="margin-top:24px"><label style="font-size:12px;color:#666;display:block;margin-bottom:6px">Assinatura do cliente</label><svg viewBox="0 0 ${sig.width} ${sig.height}" style="width:220px;height:110px;border:1px solid #eee;border-radius:8px;background:#fff">${pathsSvg}</svg></div>`;
        } catch {
          return '';
        }
      })() : '';
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Arial;margin:0;padding:20px;color:#1A1A1A}.header{background:#00C853;color:#fff;padding:20px;border-radius:8px;margin-bottom:20px}.header h1{margin:0}table{width:100%;border-collapse:collapse;margin:16px 0}th{background:#00C853;color:#fff;padding:10px 8px;text-align:left}td{padding:10px 8px;border-bottom:1px solid #eee}.totals{text-align:right;margin-top:16px}.total{font-size:20px;color:#00C853;font-weight:bold}.footer{margin-top:32px;text-align:center;color:#999;font-size:12px}.footer .thanks{color:#00C853;font-weight:bold;font-size:15px;margin-bottom:4px}</style></head><body><div class="header"><h1>${config?.companyName ?? 'Giro Vendas'}</h1><p>Vendedor: ${config?.sellerName ?? ''}</p></div><p><strong>Pedido:</strong> #${String(sale.orderNumber ?? 0).padStart(3, '0')} | <strong>Cliente:</strong> ${sale.clientName ?? 'Avulso'} | <strong>Data:</strong> ${formatDateTime(sale.createdAt)}</p><table><thead><tr><th>Produto</th><th>Qtd</th><th>Preço</th><th>Desc.</th><th>Subtotal</th></tr></thead><tbody>${itemsHtml}</tbody></table><div class="totals"><p>Subtotal: ${formatCurrency(sale.subtotal)}</p><p>Desconto: -${formatCurrency(sale.totalDiscount)}</p><p class="total">Total: ${formatCurrency(sale.total)}</p><p>Pagamento: ${paymentDetailLine(sale.paymentMethod, sale.installmentCount, sale.interestRate)}</p></div>${sigData}<div class="footer"><p class="thanks">Agradecemos a Preferência!</p><p>Documento gerado pelo Giro Vendas</p></div></body></html>`;
      const { uri } = await Print.printToFileAsync({ html });
      if (Platform.OS !== 'web') {
        await Sharing.shareAsync(uri);
      }
    } catch (e) {
      console.error(e);
      Toast.show({ type: 'error', text1: 'Erro ao gerar PDF', position: 'bottom' });
    }
  };

  if (!sale) return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  const statusInfo = ORDER_STATUS.find((s) => s.value === sale.status) ?? { label: sale.status ?? '', color: '#999' };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}><Ionicons name="arrow-back" size={24} color={colors.text} /></Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Pedido #{String(sale.orderNumber ?? 0).padStart(3, '0')}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusRow}>
          <StatusBadge label={statusInfo.label} color={statusInfo.color} />
          <Text style={{ color: colors.textCaption, fontSize: 14 }}>{formatDateTime(sale.createdAt)}</Text>
        </View>
        <Card style={styles.infoCard}>
          <Text style={[styles.infoLabel, { color: colors.textCaption }]}>Cliente</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{sale.clientName ?? 'Consumidor Avulso'}</Text>
          <Text style={[styles.infoLabel, { color: colors.textCaption, marginTop: 8 }]}>Pagamento</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{paymentDetailLine(sale.paymentMethod, sale.installmentCount, sale.interestRate)}</Text>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Itens</Text>
        {items.map((item) => (
          <View key={item?.id} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 16 }}>{item?.productName}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{item?.quantity} {item?.unit} x {formatCurrency(item?.unitPrice)}{(item?.discount ?? 0) > 0 ? ` (-${item?.discount}%)` : ''}</Text>
            </View>
            <Text style={{ color: colors.text, fontWeight: '700' }}>{formatCurrency(item?.subtotal)}</Text>
          </View>
        ))}

        <View style={styles.totals}>
          <View style={styles.totalRow}><Text style={{ color: colors.textSecondary }}>Subtotal</Text><Text style={{ color: colors.text }}>{formatCurrency(sale.subtotal)}</Text></View>
          <View style={styles.totalRow}><Text style={{ color: colors.warning }}>Desconto</Text><Text style={{ color: colors.warning }}>-{formatCurrency(sale.totalDiscount)}</Text></View>
          <View style={styles.totalRow}><Text style={{ color: colors.text, fontWeight: '700', fontSize: 18 }}>Total</Text><Text style={{ color: colors.primary, fontWeight: '700', fontSize: 18 }}>{formatCurrency(sale.total)}</Text></View>
        </View>

        {sale.observations ? (
          <Card style={styles.obsCard}>
            <Text style={[styles.infoLabel, { color: colors.textCaption }]}>Observações</Text>
            <Text style={{ color: colors.text }}>{sale.observations}</Text>
          </Card>
        ) : null}

        <Pressable style={[styles.pdfBtn, { backgroundColor: colors.primary }]} onPress={handleGeneratePDF}>
          <Ionicons name="document-text" size={20} color="#fff" />
          <Text style={styles.pdfBtnText}>Gerar PDF</Text>
        </Pressable>

        {sale.status !== 'cancelado' && (
          <View style={styles.statusActions}>
            {sale.status === 'pendente' && (
              <Pressable style={[styles.statusBtn, { backgroundColor: colors.primaryLight }]} onPress={() => updateStatus('entregue')}>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>Marcar como Entregue</Text>
              </Pressable>
            )}
            <Pressable style={[styles.statusBtn, { backgroundColor: '#FEE2E2' }]} onPress={() => {
              Alert.alert('Cancelar Pedido', 'O estoque será restaurado. Confirmar?', [
                { text: 'Não', style: 'cancel' },
                { text: 'Cancelar Pedido', style: 'destructive', onPress: () => updateStatus('cancelado') },
              ]);
            }}>
              <Text style={{ color: colors.danger, fontWeight: '700' }}>Cancelar Pedido</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 20, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 48 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  infoCard: { marginBottom: 16 },
  infoLabel: { fontSize: 12 },
  infoValue: { fontSize: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  totals: { marginTop: 16, gap: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  obsCard: { marginTop: 16 },
  pdfBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 56, borderRadius: 24, marginTop: 24 },
  pdfBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  statusActions: { marginTop: 16, gap: 8 },
  statusBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
});

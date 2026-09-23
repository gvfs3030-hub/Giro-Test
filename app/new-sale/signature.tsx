// [LOCAL] — Step 5: assinatura (canvas custom com PanResponder)
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, PanResponder, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useSaleWizard } from '../../src/contexts/SaleWizardContext';
import Svg, { Path } from 'react-native-svg';

export default function SignatureStep() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const wizard = useSaleWizard();
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState('');

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(`M${locationX},${locationY}`);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath((prev) => `${prev} L${locationX},${locationY}`);
      },
      onPanResponderRelease: () => {
        setPaths((prev) => [...prev, currentPath]);
        setCurrentPath('');
      },
    })
  ).current;

  const clearSignature = () => {
    setPaths([]);
    setCurrentPath('');
  };

  const handleConfirm = () => {
    // In real app, would capture the SVG as image. For now, store paths as data.
    wizard.setSignature(paths.length > 0 ? 'signed' : null);
    router.push('/new-sale/confirmation');
  };

  const handleSkip = () => {
    wizard.setSignature(null);
    router.push('/new-sale/confirmation');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}><Ionicons name="arrow-back" size={24} color={colors.text} /></Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Assinatura</Text>
        <Text style={[styles.step, { color: colors.textCaption }]}>5/6</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.instruction, { color: colors.textSecondary }]}>Assine no espaço abaixo (opcional)</Text>

        <View style={[styles.canvasContainer, { backgroundColor: '#fff', borderColor: colors.border }]} {...panResponder.panHandlers}>
          <Svg style={StyleSheet.absoluteFill}>
            {paths.map((p, i) => (
              <Path key={i} d={p} stroke="#1A1A1A" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {currentPath ? <Path d={currentPath} stroke="#1A1A1A" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
          </Svg>
        </View>

        <View style={styles.actions}>
          <Pressable style={[styles.clearBtn, { borderColor: colors.border }]} onPress={clearSignature}>
            <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Limpar</Text>
          </Pressable>
          <Pressable style={[styles.skipBtn]} onPress={handleSkip}>
            <Text style={{ color: colors.textCaption }}>Pular</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Pressable style={[styles.confirmBtn, { backgroundColor: colors.primary }]} onPress={handleConfirm}>
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={styles.confirmBtnText}>Confirmar Pedido</Text>
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
  content: { flex: 1, paddingHorizontal: 16 },
  instruction: { fontSize: 16, textAlign: 'center', marginBottom: 16 },
  canvasContainer: { flex: 1, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', overflow: 'hidden', maxHeight: 300 },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 24, paddingVertical: 16 },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1 },
  skipBtn: { paddingVertical: 8, paddingHorizontal: 16 },
  bottomBar: { padding: 16, borderTopWidth: 1 },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 24 },
  confirmBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});

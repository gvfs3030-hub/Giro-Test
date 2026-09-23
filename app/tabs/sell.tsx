// [LOCAL] — placeholder tab "Vender" que redireciona para nova venda
import { useEffect } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function SellTab() {
  useEffect(() => {
    router.push('/new-sale');
  }, []);
  return <View style={{ flex: 1 }} />;
}

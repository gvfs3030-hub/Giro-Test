// [LOCAL] — layout do wizard de nova venda
import { Stack } from 'expo-router';
import { SaleWizardProvider } from '../../src/contexts/SaleWizardContext';

export default function NewSaleLayout() {
  return (
    <SaleWizardProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
    </SaleWizardProvider>
  );
}

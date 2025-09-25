import { Suspense } from 'react';
import AutomaticTopupClient from '@/components/topup/AutomaticTopupClient';
import NusantaraLoadingScreen from '@/components/ui/NusantaraLoadingScreen';

export default function AutomaticTopupPage() {
  return (
    <Suspense fallback={<NusantaraLoadingScreen />}>
      <AutomaticTopupClient />
    </Suspense>
  );
}

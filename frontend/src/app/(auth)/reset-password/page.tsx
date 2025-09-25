import { Suspense } from 'react';
import ResetPasswordClient from '@/components/auth/ResetPasswordClient';
import NusantaraLoadingScreen from '@/components/ui/NusantaraLoadingScreen';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<NusantaraLoadingScreen />}>
      <ResetPasswordClient />
    </Suspense>
  );
}

import { Suspense } from 'react';
import VerifyEmailForm from '@/components/auth/VerifyEmailForm';
import NusantaraLoadingScreen from '@/components/ui/NusantaraLoadingScreen';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<NusantaraLoadingScreen />}>
      <VerifyEmailForm />
    </Suspense>
  );
}

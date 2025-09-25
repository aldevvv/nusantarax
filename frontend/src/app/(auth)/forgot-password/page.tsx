import { Suspense } from 'react';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import NusantaraLoadingScreen from '@/components/ui/NusantaraLoadingScreen';

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<NusantaraLoadingScreen />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}

import { Suspense } from 'react';
import RegisterForm from '@/components/auth/RegisterForm';
import NusantaraLoadingScreen from '@/components/ui/NusantaraLoadingScreen';

export default function RegisterPage() {
  return (
    <Suspense fallback={<NusantaraLoadingScreen />}>
      <RegisterForm />
    </Suspense>
  );
}

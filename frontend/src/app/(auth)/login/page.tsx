import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import NusantaraLoadingScreen from '@/components/ui/NusantaraLoadingScreen';

export default function LoginPage() {
  return (
    <Suspense fallback={<NusantaraLoadingScreen />}>
      <LoginForm />
    </Suspense>
  );
}

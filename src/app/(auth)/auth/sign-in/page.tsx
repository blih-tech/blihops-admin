import { AuthShell } from '@/components/sections/auth/AuthShell';
import { SignInForm } from '@/components/sections/auth/sign-in/SignInForm';

export default function SignInPage() {
  return (
    <AuthShell>
      <SignInForm />
    </AuthShell>
  );
}

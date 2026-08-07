import { AuthShell } from '@/components/sections/auth/AuthShell';
import { ForgotPasswordForm } from '@/components/sections/auth/forgot-password/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <ForgotPasswordForm />
    </AuthShell>
  );
}

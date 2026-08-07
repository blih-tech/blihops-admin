import { AuthShell } from '@/components/sections/auth/AuthShell';
import { ResetPasswordForm } from '@/components/sections/auth/reset-password/ResetPasswordForm';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const token = typeof sp.token === 'string' ? sp.token : undefined;
  const tokenError = typeof sp.error === 'string' ? sp.error : undefined;
  const tokenInvalid = token === undefined || tokenError !== undefined;

  return (
    <AuthShell>
      <ResetPasswordForm invalidToken={tokenInvalid} token={token ?? ''} />
    </AuthShell>
  );
}

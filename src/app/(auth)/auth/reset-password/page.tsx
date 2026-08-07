import { AuthShell } from '@/components/sections/auth/AuthShell';
import { ResetPasswordForm } from '@/components/sections/auth/reset-password/ResetPasswordForm';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  // TODO: Replace this transient URL-query mock with real token validation
  // once the reset endpoint is wired to blihop-api. For now, append ?invalid=1
  // to the reset-password URL to preview the invalid-token variant.
  const tokenInvalid = typeof sp.invalid === 'string' && sp.invalid === '1';

  return (
    <AuthShell>
      <ResetPasswordForm invalidToken={tokenInvalid} />
    </AuthShell>
  );
}

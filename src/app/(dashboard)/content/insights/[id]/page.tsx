import { InsightForm } from '@/components/sections/content/insights/insight-form';

export default async function EditInsightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InsightForm insightId={id} />;
}

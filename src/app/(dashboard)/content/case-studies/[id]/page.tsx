import { CaseStudyForm } from '@/components/sections/content/case-studies/case-study-form';

export default async function EditCaseStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CaseStudyForm caseStudyId={id} />;
}

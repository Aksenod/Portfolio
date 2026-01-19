import { CasePageClient } from './CasePageClient';
import { getCaseBySlug, getAllPublishedCases } from '@/lib/api/static-data';

interface CasePageProps {
  params: Promise<{ slug: string }>;
}

// Генерируем статические параметры для всех опубликованных кейсов
export async function generateStaticParams() {
  const cases = getAllPublishedCases();
  return cases.map((caseItem) => ({
    slug: caseItem.slug,
  }));
}

export default async function CasePage({ params }: CasePageProps) {
  const { slug } = await params;
  const caseData = getCaseBySlug(slug);

  return <CasePageClient caseData={caseData} />;
}

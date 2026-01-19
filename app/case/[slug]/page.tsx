import { CasePageClient } from './CasePageClient';
import { getCaseBySlug, getAllPublishedCases } from '@/lib/api/static-data';

interface CasePageProps {
  params: Promise<{ slug: string }>;
}

// Генерируем статические параметры для всех опубликованных кейсов
export async function generateStaticParams() {
  const cases = getAllPublishedCases();
  return cases.map((caseItem) => ({
    // Next.js автоматически кодирует slug при генерации статических путей
    slug: caseItem.slug,
  }));
}

export default async function CasePage({ params }: CasePageProps) {
  const { slug } = await params;
  // Next.js автоматически декодирует параметры маршрута
  // Но для надежности декодируем явно, особенно для пробелов и спецсимволов
  const decodedSlug = decodeURIComponent(slug);
  const caseData = getCaseBySlug(decodedSlug);

  return <CasePageClient caseData={caseData} />;
}

import RadialCarousel from '@/components/RadialCarousel';
import { getAllPublishedCases } from '@/lib/api/static-data';

export default function Portfolio() {
  const cases = getAllPublishedCases().slice(0, 5);
  
  return <RadialCarousel initialCases={cases} />;
}

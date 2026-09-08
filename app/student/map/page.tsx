import type { Metadata } from 'next';
import { OpportunityMap } from '@/components/student/OpportunityMap';
import { getStudentWork } from '@/lib/student-work/state';

export const metadata: Metadata = {
  title: 'Mappa opportunità',
  description:
    'Esplora come materie, competenze, professioni e settori si collegano tra loro.',
};

export default async function OpportunityMapPage() {
  const work = await getStudentWork();

  return <OpportunityMap comparedSlugs={work.comparedSlugs} />;
}

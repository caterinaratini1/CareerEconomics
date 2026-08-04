import type { CareerProfile } from '@/lib/content/schema';

/**
 * A fully verified, publishable career.
 *
 * The real content set is entirely drafts by design — no figure is published
 * until a human has sourced it — so without a fixture there would be nothing
 * exercising the verified rendering path or the passing side of the
 * publication gate. This career is deliberately fictional so it can never be
 * mistaken for content, and its "sources" point at example.com.
 */
export const VERIFIED_CAREER: CareerProfile = {
  slug: 'test-lighthouse-keeper',
  canonicalName: 'Lighthouse keeper',
  category: 'public-service',
  status: 'published',
  aliases: [
    { text: 'lighthouse keeper', language: 'en' },
    { text: 'guardiano del faro', language: 'it' },
  ],
  oneSentence:
    'A lighthouse keeper maintains a coastal light and its equipment so that ships can navigate safely at night.',
  plainLanguageSummary:
    'A lighthouse keeper lives at or near a lighthouse and keeps its light, foghorn and generators working. The role is mostly maintenance and monitoring rather than emergency response, and long periods are spent alone. Most lighthouses are now automated, so the job exists in far smaller numbers than it once did and is usually part of a wider coastal maintenance role.',
  whatTheyDo: {
    overview:
      'The work divides into routine maintenance, monitoring, and record keeping. Maintenance covers the optical equipment, the power supply and the building itself, all of which are exposed to salt and weather. Monitoring means checking that the light and any signals are operating to specification. Record keeping covers weather observations and equipment logs, which are used by maritime authorities.',
    concreteExamples: [
      'Cleaning and checking the optical assembly so the light carries its full rated distance.',
      'Testing backup generators and switching to them when mains power fails during a storm.',
      'Recording weather observations at fixed times for the maritime authority.',
    ],
  },
  typicalDay: {
    overview:
      'A day is built around fixed checks at set times, with maintenance work in between and long quiet periods. Weather drives most of the variation: a calm week is routine, and a storm turns the job into continuous monitoring and repair.',
    commonTasks: [
      'Checking the light and signal equipment against specification',
      'Cleaning optical surfaces and housings',
      'Recording weather and equipment observations',
      'Testing and servicing backup power',
    ],
    howMuchItVaries:
      'Varies enormously with weather and with whether the station is staffed continuously or visited periodically as part of a maintenance round.',
  },
  suitability: {
    suitsYouIf: [
      'You are comfortable with long periods alone and with your own routine',
      'You are practical and can fix mechanical and electrical equipment',
    ],
    mayNotSuitYouIf: [
      'You need daily contact with other people',
      'You want a career with clear progression and a wide job market',
    ],
  },
  advantages: [
    {
      title: 'Genuine solitude',
      detail: 'Long uninterrupted periods suit people who work best alone.',
    },
    {
      title: 'Practical, visible work',
      detail: 'The results of maintenance are immediate and physical.',
    },
    {
      title: 'Public-service value',
      detail: 'The equipment you maintain exists to keep people at sea alive.',
    },
  ],
  disadvantages: [
    {
      title: 'Isolation',
      detail:
        'The same solitude that suits some people is genuinely difficult for most.',
    },
    {
      title: 'Very few positions',
      detail:
        'Automation has reduced the number of roles to a handful nationally.',
    },
    {
      title: 'Limited progression',
      detail:
        'There is little career ladder and few adjacent roles to move into.',
    },
  ],
  misconceptions: [
    {
      belief: 'Lighthouse keepers rescue ships in distress.',
      reality:
        'Rescue is the coastguard’s job. A keeper maintains a navigation aid, and would report a distress situation rather than respond to it directly.',
    },
    {
      belief: 'It is a common job you can apply for.',
      reality:
        'Almost all lighthouses are automated. The few remaining roles are usually part of a broader maritime maintenance job rather than a dedicated post.',
    },
  ],
  skills: [
    {
      name: 'Electrical maintenance',
      importance: 'very-high',
      why: 'The light and its backup power are electrical systems you must keep running unaided.',
    },
    {
      name: 'Self-reliance',
      importance: 'very-high',
      why: 'Help may be hours away in bad weather, so problems have to be solved alone.',
    },
    {
      name: 'Record keeping',
      importance: 'moderate',
      why: 'Observations feed into maritime safety records and must be accurate and on time.',
    },
  ],
  relatedCareers: [
    {
      name: 'Coastguard officer',
      howItDiffers:
        'Focuses on rescue and maritime enforcement rather than maintaining equipment.',
    },
    {
      name: 'Marine electrician',
      howItDiffers:
        'Same technical skills applied across vessels and ports, with far more positions available.',
    },
  ],
  countryProfiles: [
    {
      countryCode: 'IT',
      pathway: [
        {
          stepNumber: 1,
          stage: 'Upper secondary school',
          title: 'Complete upper secondary school, ideally technical',
          description:
            'A technical route covering electrical or mechanical systems gives the most directly useful preparation for the maintenance side of the work.',
          requirement: 'usually-expected',
          estimatedDuration: '5 years',
        },
        {
          stepNumber: 2,
          stage: 'Qualification',
          title: 'Gain an electrical or mechanical maintenance qualification',
          description:
            'The role is largely equipment maintenance, so a recognised technical qualification is what employers assess.',
          requirement: 'legally-required',
          estimatedDuration: '2 years',
        },
        {
          stepNumber: 3,
          stage: 'Entry',
          title:
            'Apply to the maritime authority for a coastal maintenance post',
          description:
            'Vacancies are rare and are usually advertised as general coastal maintenance roles rather than as lighthouse keeping specifically.',
          requirement: 'legally-required',
        },
      ],
      educationRoutes: [
        {
          name: 'Technical maintenance qualification',
          requirement: 'legally-required',
          description:
            'A recognised electrical or mechanical qualification is a condition of employment for maintenance roles with the maritime authority.',
        },
        {
          name: 'Prior experience at sea',
          requirement: 'useful-but-optional',
          description:
            'Experience aboard vessels is valued because it demonstrates comfort with isolation and marine conditions.',
        },
      ],
      salary: {
        state: 'verified',
        value: {
          currency: 'EUR',
          basis: 'gross-annual',
          entry: { min: 22000, max: 26000 },
          senior: { min: 30000, max: 36000 },
          factorsAffectingPay: [
            'Whether the post is continuously staffed or part of a maintenance round',
            'Additional allowances for remote or island stations',
          ],
        },
        sourceIds: ['example-authority'],
        verifiedAt: '2026-07-01',
        caveat: 'Figures are illustrative fixture data, not real pay.',
      },
      timeToEnter: {
        state: 'verified',
        value: {
          minYears: 5,
          maxYears: 7,
          notes:
            'Five years of upper secondary school plus a technical qualification, then waiting for a rare vacancy, which is the part that actually determines the timeline.',
        },
        sourceIds: ['example-authority'],
        verifiedAt: '2026-07-01',
      },
      educationSummary: {
        state: 'verified',
        value:
          'A recognised electrical or mechanical maintenance qualification. No university degree is required.',
        sourceIds: ['example-authority'],
        verifiedAt: '2026-07-01',
      },
      regulation: {
        state: 'verified',
        value:
          'Posts sit within the maritime authority and are filled through public-sector recruitment. The maintenance qualification is a condition of employment rather than a licence to practise.',
        sourceIds: ['example-authority'],
        verifiedAt: '2026-07-01',
      },
      competition: {
        state: 'verified',
        value: {
          level: 'high',
          whatThisMeans:
            'Not competitive in the sense of a hard entrance examination, but the number of posts nationally is very small, so vacancies appear rarely and attract many applicants when they do.',
        },
        sourceIds: ['example-statistics'],
        verifiedAt: '2026-07-01',
      },
      workEnvironment: [
        'Coastal and island lighthouse stations',
        'Outdoors in all weather',
      ],
      whatYouCanDoNow: [
        {
          action: 'Learn practical electrical and mechanical repair',
          why: 'The job is maintenance first. Being able to diagnose and fix equipment unaided is the core requirement.',
        },
        {
          action: 'Spend real time alone and see how you find it',
          why: 'Isolation is the part of this job that people most often underestimate about themselves.',
        },
        {
          action:
            'Look at how maritime authority vacancies are actually advertised',
          why: 'It shows that these posts are usually part of wider coastal maintenance roles, which changes what you should prepare for.',
        },
      ],
      lastReviewedAt: '2026-07-01',
      reviewStatus: 'reviewed',
    },
  ],
  sources: [
    {
      id: 'example-authority',
      title: 'Coastal navigation aids: staffing and maintenance',
      publisher: 'Example Maritime Authority',
      url: 'https://example.com/navigation-aids',
      authorityLevel: 'official-government',
      accessedAt: '2026-07-01',
      countryCode: 'IT',
    },
    {
      id: 'example-statistics',
      title: 'Public-sector maritime employment',
      publisher: 'Example Statistics Office',
      url: 'https://example.com/maritime-employment',
      authorityLevel: 'national-statistics',
      accessedAt: '2026-07-01',
    },
  ],
  editorial: {
    lastReviewedAt: '2026-07-01',
    reviewedBy: 'test fixture',
    openQuestions: [],
  },
};

/** Deep clone so a test mutating the fixture cannot affect another test. */
export function makeCareer(
  mutate: (career: CareerProfile) => void = () => {},
): CareerProfile {
  const copy = structuredClone(VERIFIED_CAREER);
  mutate(copy);
  return copy;
}

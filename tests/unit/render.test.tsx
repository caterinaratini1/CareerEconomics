import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ClaimValue } from '@/components/career/ClaimValue';
import { PathwaySteps } from '@/components/career/PathwaySteps';
import { QuickFacts } from '@/components/career/QuickFacts';
import { SourceList } from '@/components/career/SourceList';
import { SearchForm } from '@/components/search/SearchForm';
import type { Claim } from '@/lib/content/claim';
import type { Source } from '@/lib/content/schema';
import { makeCareer, VERIFIED_CAREER } from '../fixtures/career';

const SOURCES: Source[] = VERIFIED_CAREER.sources;
const PROFILE = VERIFIED_CAREER.countryProfiles[0]!;

/**
 * Rendering tests focused on one question: can a reader tell how much to trust
 * what they are looking at?
 *
 * Every assertion here is about a *text* signal, never a colour or a class
 * name. §18 forbids conveying information by colour alone, so a test that
 * passed by checking a CSS class would be testing the wrong thing.
 */

describe('ClaimValue', () => {
  const verified: Claim<string> = {
    state: 'verified',
    value: 'A recognised maintenance qualification.',
    sourceIds: ['example-authority'],
    verifiedAt: '2026-07-01',
  };

  it('shows a verified value with its source and the date it was checked', () => {
    render(
      <ClaimValue claim={verified} sources={SOURCES} label="qualifications">
        {(value) => <p>{value}</p>}
      </ClaimValue>,
    );
    expect(
      screen.getByText('A recognised maintenance qualification.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://example.com/navigation-aids',
    );
    expect(screen.getByText(/Checked 1 July 2026/)).toBeInTheDocument();
  });

  it('marks an unverified value as a draft in words, not only in colour', () => {
    const claim: Claim<string> = {
      state: 'unverified',
      value: 'Probably a technical qualification.',
      note: 'Needs the authority page.',
    };
    render(
      <ClaimValue claim={claim} sources={SOURCES} label="qualifications">
        {(value) => <p>{value}</p>}
      </ClaimValue>,
    );
    expect(
      screen.getByText(/not yet checked against a source/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Needs the authority page/)).toBeInTheDocument();
  });

  it('states the gap rather than hiding the section when nothing is researched', () => {
    // The failure this prevents: an absent section reads as "no such thing",
    // not as "we have not looked into it".
    render(
      <ClaimValue
        claim={{ state: 'not_researched', note: 'Awaiting pay tables.' }}
        sources={SOURCES}
        label="pay for this career"
      >
        {() => <p>should never render</p>}
      </ClaimValue>,
    );
    expect(
      screen.getByText(/have not researched pay for this career yet/i),
    ).toBeInTheDocument();
    expect(screen.queryByText('should never render')).not.toBeInTheDocument();
  });

  it('never renders a value for a claim that has none', () => {
    const { container } = render(
      <ClaimValue
        claim={{ state: 'not_researched', note: 'todo' }}
        sources={SOURCES}
        label="pay"
      >
        {() => <span data-testid="value">42000</span>}
      </ClaimValue>,
    );
    expect(container.querySelector('[data-testid="value"]')).toBeNull();
  });
});

describe('QuickFacts', () => {
  it('shows every fact row, including ones with no data', () => {
    render(<QuickFacts profile={PROFILE} />);
    for (const term of [
      'Typical time to get in',
      'Starting pay',
      'Experienced pay',
      'Education usually needed',
      'How competitive',
      'Where you work',
    ]) {
      expect(screen.getByText(term)).toBeInTheDocument();
    }
  });

  it('formats pay as a range with the tax basis spelled out', () => {
    render(<QuickFacts profile={PROFILE} />);
    expect(
      screen.getByText(/€22,000–€26,000 a year before tax/),
    ).toBeInTheDocument();
  });

  it('says "Not researched" instead of leaving a blank row', () => {
    const career = makeCareer((c) => {
      c.countryProfiles[0]!.salary = { state: 'not_researched', note: 'todo' };
    });
    render(<QuickFacts profile={career.countryProfiles[0]!} />);
    expect(screen.getAllByText('Not researched').length).toBeGreaterThan(0);
  });

  it('flags an unchecked draft value in the facts table', () => {
    const career = makeCareer((c) => {
      c.countryProfiles[0]!.competition = {
        state: 'unverified',
        value: { level: 'high', whatThisMeans: 'x'.repeat(40) },
        note: 'unsourced',
      };
    });
    render(<QuickFacts profile={career.countryProfiles[0]!} />);
    expect(screen.getByText(/unchecked draft/i)).toBeInTheDocument();
  });
});

describe('PathwaySteps', () => {
  it('renders the route as an ordered list so the order is not only visual', () => {
    const { container } = render(<PathwaySteps profile={PROFILE} />);
    const list = container.querySelector('ol');
    expect(list).not.toBeNull();
    expect(within(list!).getAllByRole('listitem')).toHaveLength(
      PROFILE.pathway.length,
    );
  });

  it('labels how compulsory each step is, in words', () => {
    render(<PathwaySteps profile={PROFILE} />);
    expect(screen.getAllByText('Legally required').length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/You cannot do this job without it/).length,
    ).toBeGreaterThan(0);
  });

  it('distinguishes an expected step from a required one', () => {
    render(<PathwaySteps profile={PROFILE} />);
    expect(screen.getByText('Usually expected')).toBeInTheDocument();
    expect(
      screen.getByText(/Not a legal rule, but almost everyone has it/),
    ).toBeInTheDocument();
  });
});

describe('SourceList', () => {
  it('lists sources with publisher, type and the date we checked them', () => {
    render(<SourceList career={VERIFIED_CAREER} />);
    expect(
      screen.getByRole('link', {
        name: 'Coastal navigation aids: staffing and maintenance',
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/we checked it on 1 July 2026/).length).toBe(2);
  });

  it('says plainly when a page has no sources yet', () => {
    const career = makeCareer((c) => {
      c.sources = [];
      c.status = 'draft';
      c.editorial.openQuestions = ['Find the official pay tables.'];
    });
    render(<SourceList career={career} />);
    expect(
      screen.getByText(/No sources are attached to this page yet/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Find the official pay tables/),
    ).toBeInTheDocument();
  });
});

describe('SearchForm', () => {
  it('is a plain GET form, so it works with JavaScript disabled', () => {
    const { container } = render(<SearchForm />);
    const form = container.querySelector('form');
    expect(form).toHaveAttribute('method', 'get');
    expect(form).toHaveAttribute('action', '/careers');
  });

  it('gives the search field a real label and a described hint', () => {
    render(<SearchForm />);
    const input = screen.getByRole('searchbox', {
      name: /what career do you want to know about/i,
    });
    expect(input).toHaveAttribute('name', 'q');
    expect(input).toHaveAccessibleDescription(/diplomat/i);
  });

  it('keeps the previous query in the box after a search', () => {
    render(<SearchForm defaultValue="diplomatico" />);
    expect(screen.getByRole('searchbox')).toHaveValue('diplomatico');
  });

  it('does not steal focus unless explicitly asked to', () => {
    render(<SearchForm />);
    expect(screen.getByRole('searchbox')).not.toHaveFocus();
  });
});

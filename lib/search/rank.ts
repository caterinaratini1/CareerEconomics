import { isFuzzyMatch, normalize, tokenize } from './normalize';

/**
 * Ranking for career search.
 *
 * §12.4 rules out a search service for the MVP, and at 25–100 careers an
 * in-memory scan is not merely acceptable — it is faster than a round trip.
 * What matters is that the *ranking rules* live here as data-in/data-out
 * functions, so Phase 4 can port them to a PostgreSQL `ts_rank` +
 * `similarity()` expression and prove the port with the same test cases.
 */

export interface SearchableCareer {
  slug: string;
  canonicalName: string;
  /** Canonical name plus every alias, in every supported language. */
  aliases: { text: string; language: string }[];
  oneSentence: string;
}

export type MatchType = 'exact' | 'prefix' | 'contains' | 'fuzzy';

/**
 * `T` is unconstrained on purpose. Matching needs the aliases, but the result
 * a page renders does not — the repository searches over
 * `CareerSummary & { aliases }` and returns `SearchHit<CareerSummary>`, which
 * a `T extends SearchableCareer` bound would reject.
 */
export interface SearchHit<T> {
  career: T;
  score: number;
  /** The alias or title that matched, so the UI can explain the result. */
  matchedOn: string;
  matchType: MatchType;
}

/**
 * Weights are ordered by how confident the match makes us, with a deliberate
 * gap between tiers so that no number of weak signals can outrank one strong
 * one. A student typing "diplomatico" should land on Diplomat, never on a
 * career whose description happens to contain the word three times.
 */
const WEIGHTS = {
  exactTitle: 1000,
  exactAlias: 900,
  prefixTitle: 400,
  prefixAlias: 350,
  containsTitle: 200,
  containsAlias: 150,
  fuzzyTitle: 100,
  fuzzyAlias: 80,
  /** Description matches are a last resort — they are noisy by nature. */
  descriptionToken: 10,
} as const;

interface Candidate {
  text: string;
  normalized: string;
  isTitle: boolean;
}

function candidatesFor(career: SearchableCareer): Candidate[] {
  const seen = new Set<string>();
  const out: Candidate[] = [];

  const push = (text: string, isTitle: boolean) => {
    const normalized = normalize(text);
    if (normalized.length === 0 || seen.has(normalized)) return;
    seen.add(normalized);
    out.push({ text, normalized, isTitle });
  };

  push(career.canonicalName, true);
  for (const alias of career.aliases) push(alias.text, false);
  return out;
}

function scoreCandidate(
  query: string,
  candidate: Candidate,
): { score: number; matchType: MatchType } | null {
  const { normalized, isTitle } = candidate;

  if (normalized === query) {
    return {
      score: isTitle ? WEIGHTS.exactTitle : WEIGHTS.exactAlias,
      matchType: 'exact',
    };
  }
  if (normalized.startsWith(query)) {
    // Longer candidates are weaker prefix matches: "arch" should favour
    // "Architect" over "Architectural technologist".
    const lengthPenalty = Math.min(normalized.length - query.length, 40);
    return {
      score:
        (isTitle ? WEIGHTS.prefixTitle : WEIGHTS.prefixAlias) - lengthPenalty,
      matchType: 'prefix',
    };
  }
  if (normalized.includes(query)) {
    return {
      score: isTitle ? WEIGHTS.containsTitle : WEIGHTS.containsAlias,
      matchType: 'contains',
    };
  }

  // Fuzzy matching is per-word: "sofware enginer" should still find
  // "Software engineer", but only if every typed word finds a partner.
  const queryTerms = query.split(' ');
  const candidateTerms = normalized.split(' ');
  const everyTermMatches = queryTerms.every((term) =>
    candidateTerms.some((word) => isFuzzyMatch(term, word)),
  );
  if (everyTermMatches) {
    return {
      score: isTitle ? WEIGHTS.fuzzyTitle : WEIGHTS.fuzzyAlias,
      matchType: 'fuzzy',
    };
  }

  return null;
}

export function searchCareers<T extends SearchableCareer>(
  careers: readonly T[],
  rawQuery: string,
  limit = 20,
): SearchHit<T>[] {
  const query = normalize(rawQuery);
  if (query.length === 0) return [];

  const hits: SearchHit<T>[] = [];

  for (const career of careers) {
    let best: SearchHit<T> | null = null;

    for (const candidate of candidatesFor(career)) {
      const result = scoreCandidate(query, candidate);
      if (result && (!best || result.score > best.score)) {
        best = {
          career,
          score: result.score,
          matchedOn: candidate.text,
          matchType: result.matchType,
        };
      }
    }

    if (!best) {
      // Fall back to the description, scored low enough that it can never
      // displace a title or alias match.
      const descriptionTokens = new Set(tokenize(career.oneSentence));
      const overlap = query
        .split(' ')
        .filter((term) => descriptionTokens.has(term)).length;
      if (overlap > 0) {
        best = {
          career,
          score: overlap * WEIGHTS.descriptionToken,
          matchedOn: career.oneSentence,
          matchType: 'contains',
        };
      }
    }

    if (best) hits.push(best);
  }

  return hits
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.career.canonicalName.localeCompare(b.career.canonicalName, 'it'),
    )
    .slice(0, limit);
}

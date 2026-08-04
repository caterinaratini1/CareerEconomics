/**
 * Search text normalisation.
 *
 * Kept as pure functions with no I/O for two reasons: they are the part of
 * search most likely to be wrong in ways users notice, so they must be
 * directly testable; and Phase 4 moves matching into PostgreSQL, where these
 * exact rules have to be mirrored by an `unaccent` + `lower` expression index.
 * Any change here is a change to that index — see docs/DATA_MODEL.md.
 */

/**
 * Lowercase, strip diacritics, collapse punctuation and whitespace.
 *
 * Diacritic folding is not cosmetic here: an Italian student types "perito"
 * or "informatica" without accents on a phone keyboard as often as with them,
 * and "psicologo" must match "psicòlogo". NFD splits base letters from their
 * combining marks so the marks can be dropped.
 */
export function normalize(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['\u2019\u0060]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function tokenize(input: string): string[] {
  const normalized = normalize(input);
  return normalized.length === 0 ? [] : normalized.split(' ');
}

/**
 * Bounded edit distance, counting an adjacent transposition as one edit.
 *
 * This is optimal string alignment (restricted Damerau-Levenshtein) rather
 * than plain Levenshtein, and the difference is not academic. Transposing two
 * neighbouring letters is the most common typing mistake there is — "medcio"
 * for "medico", "diplomta" for "diplomat" — and plain Levenshtein charges it
 * two edits, the same as two unrelated wrong letters. With a one-edit budget
 * for a six-letter word, that means the single most likely typo is the one
 * case fuzzy matching fails on. Counting it as one edit fixes that without
 * widening the budget and letting genuinely different words match.
 *
 * `maxDistance` lets the function bail out as soon as an entire row exceeds
 * the threshold. Search only ever asks "is this within 2 edits?", so computing
 * the exact distance for wildly different strings is wasted work — and this
 * runs across every alias of every career on each query.
 */
export function boundedEditDistance(
  a: string,
  b: string,
  maxDistance: number,
): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Three rows: transposition needs to look back two rows and two columns.
  let twoBack = new Array<number>(b.length + 1).fill(0);
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  let current = new Array<number>(b.length + 1).fill(0);

  for (let i = 1; i <= a.length; i++) {
    current[0] = i;
    let rowMin = i;

    for (let j = 1; j <= b.length; j++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;

      let value = Math.min(
        (current[j - 1] ?? 0) + 1, // insertion
        (previous[j] ?? 0) + 1, // deletion
        (previous[j - 1] ?? 0) + substitutionCost, // substitution
      );

      // Adjacent transposition: "ab" typed where "ba" was meant.
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, (twoBack[j - 2] ?? 0) + 1);
      }

      current[j] = value;
      if (value < rowMin) rowMin = value;
    }

    // Every path through this row already costs more than we care about.
    if (rowMin > maxDistance) return maxDistance + 1;

    const recycled = twoBack;
    twoBack = previous;
    previous = current;
    current = recycled;
  }

  return previous[b.length] ?? maxDistance + 1;
}

/**
 * Typo tolerance scaled to word length.
 *
 * A fixed edit budget is wrong at both ends: two edits turns "vet" into "net"
 * (a different word), while one edit is stingy for "fisioterapista". Short
 * words get no tolerance, medium words one edit, long words two.
 */
export function allowedEditDistance(term: string): number {
  if (term.length <= 4) return 0;
  if (term.length <= 7) return 1;
  return 2;
}

export function isFuzzyMatch(term: string, candidate: string): boolean {
  const budget = allowedEditDistance(term);
  if (budget === 0) return term === candidate;
  return boundedEditDistance(term, candidate, budget) <= budget;
}

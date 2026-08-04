/**
 * Career search.
 *
 * A plain GET form, submitting to /careers. No client JavaScript at all.
 *
 * That is a deliberate choice rather than a stopgap. §8 asks for a
 * no-JavaScript fallback and keyboard operability; §19 asks for limited
 * JavaScript on a basic phone; and school networks are exactly where a
 * JS-dependent search box fails quietly. A GET form gives keyboard navigation,
 * screen-reader support, a shareable result URL a teacher can put on the board,
 * and a working back button — none of which a typeahead dropdown provides for
 * free.
 *
 * Phase 4 may add a progressive-enhancement layer on top. It must not replace
 * this: the form has to keep working with scripting off.
 */
export function SearchForm({
  defaultValue = '',
  autoFocus = false,
}: {
  defaultValue?: string;
  autoFocus?: boolean;
}) {
  return (
    <form action="/careers" method="get" role="search" className="w-full">
      <label htmlFor="career-search" className="block font-medium">
        What career do you want to know about?
      </label>
      <p id="career-search-hint" className="text-ink-muted mt-1 text-sm">
        Try a job title in English or Italian — for example{' '}
        <span className="font-medium">diplomat</span> or{' '}
        <span className="font-medium">medico</span>. Small spelling mistakes are
        fine.
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          id="career-search"
          name="q"
          type="search"
          defaultValue={defaultValue}
          aria-describedby="career-search-hint"
          autoComplete="off"
          // Only set on the dedicated search page, where the field is the
          // sole purpose of the page; never on the homepage, where it would
          // move the caret away from content the reader is part-way through.
          autoFocus={autoFocus}
          placeholder="e.g. diplomat, doctor, sviluppatore"
          className="border-rule bg-paper text-ink focus:border-accent min-w-0 flex-1 rounded border px-3 py-2.5 text-base"
        />
        <button
          type="submit"
          className="bg-accent rounded px-5 py-2.5 font-medium text-white"
        >
          Search
        </button>
      </div>
    </form>
  );
}

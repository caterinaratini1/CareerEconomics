/**
 * Career search.
 *
 * A plain GET form, submitting to /student/careers. No client JavaScript at
 * all.
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
    <form
      action="/student/careers"
      method="get"
      role="search"
      className="w-full"
    >
      <label htmlFor="career-search" className="block font-medium">
        Quale lavoro vuoi conoscere?
      </label>
      <p id="career-search-hint" className="text-ink-muted mt-1 text-sm">
        Scrivi il nome di una professione, in italiano o in inglese — per
        esempio <span className="font-medium">diplomatico</span> o{' '}
        <span className="font-medium">sviluppatore</span>. Se sbagli qualche
        lettera non è un problema.
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
          placeholder="es. diplomatico, medico, sviluppatore"
          className="border-border bg-surface text-ink focus:border-primary rounded-control min-w-0 flex-1 border px-3 py-2.5 text-base"
        />
        <button
          type="submit"
          className="bg-primary rounded-control px-5 py-2.5 font-medium text-white"
        >
          Cerca
        </button>
      </div>
    </form>
  );
}

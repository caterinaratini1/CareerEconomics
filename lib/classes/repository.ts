/**
 * The class repository.
 *
 * Mirrors the seam in `lib/content/repository.ts`: everything above this line
 * talks to `ClassRepository`, everything below it is swappable. This dev
 * implementation is in-memory and reseeds on every server restart — good
 * enough to build and click through the student join flow. Phase B replaces
 * it with a Supabase-backed implementation behind teacher auth (magic link),
 * with `createClass`/`listClasses` added to the interface once there is a
 * teacher-facing screen that calls them.
 */

export interface ClassRecord {
  code: string;
  name: string;
  school: string | null;
}

export interface ClassRepository {
  getByCode(code: string): Promise<ClassRecord | null>;
}

// ---------------------------------------------------------------------------
// In-memory implementation (dev / this phase)
// ---------------------------------------------------------------------------

const DEMO_CLASSES: ClassRecord[] = [
  { code: 'DEMO01', name: 'Classe demo', school: 'Scuola di prova' },
  { code: 'DEMO_CATE', name: 'Classe di Caterina', school: null },
];

class InMemoryClassRepository implements ClassRepository {
  async getByCode(code: string): Promise<ClassRecord | null> {
    const normalized = code.trim().toUpperCase();
    return DEMO_CLASSES.find((c) => c.code === normalized) ?? null;
  }
}

export const classRepository: ClassRepository = new InMemoryClassRepository();

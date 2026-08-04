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
  notes: string | null;
  createdAt: string;
}

export interface ClassRepository {
  getByCode(code: string): Promise<ClassRecord | null>;
  listClasses(): Promise<ClassRecord[]>;
  createClass(input: {
    name: string;
    school?: string | null;
    notes?: string | null;
  }): Promise<ClassRecord>;
}

// ---------------------------------------------------------------------------
// In-memory implementation (dev / this phase)
// ---------------------------------------------------------------------------

const DEMO_CLASSES: ClassRecord[] = [
  {
    code: 'DEMO01',
    name: 'Classe demo',
    school: 'Scuola di prova',
    notes: 'Classe pilota per provare il flusso studenti.',
    createdAt: '2026-08-04T00:00:00.000Z',
  },
  {
    code: 'DEMO_CATE',
    name: 'Classe di Caterina',
    school: null,
    notes: null,
    createdAt: '2026-08-04T00:00:00.000Z',
  },
];

class InMemoryClassRepository implements ClassRepository {
  private classes = [...DEMO_CLASSES];

  async getByCode(code: string): Promise<ClassRecord | null> {
    const normalized = code.trim().toUpperCase();
    return this.classes.find((c) => c.code === normalized) ?? null;
  }

  async listClasses(): Promise<ClassRecord[]> {
    return [...this.classes].sort((a, b) => a.name.localeCompare(b.name, 'it'));
  }

  async createClass(input: {
    name: string;
    school?: string | null;
    notes?: string | null;
  }): Promise<ClassRecord> {
    const base = input.name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 5);
    const prefix = base || 'CLASSE';
    let suffix = this.classes.length + 1;
    let code = `${prefix}${suffix.toString().padStart(2, '0')}`;
    while (this.classes.some((c) => c.code === code)) {
      suffix += 1;
      code = `${prefix}${suffix.toString().padStart(2, '0')}`;
    }

    const record: ClassRecord = {
      code,
      name: input.name.trim(),
      school: input.school?.trim() || null,
      notes: input.notes?.trim() || null,
      createdAt: new Date().toISOString(),
    };
    this.classes.push(record);
    return record;
  }
}

export const classRepository: ClassRepository = new InMemoryClassRepository();

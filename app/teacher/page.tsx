import type { Metadata } from 'next';
import Link from 'next/link';
import { BarChart3, CircleCheck, NotebookPen, Plus, Users } from 'lucide-react';
import { CopyClassCode } from '@/components/teacher/CopyClassCode';
import { Badge } from '@/components/ui/primitives';
import { createClass } from '@/lib/classes/actions';
import { classRepository, type ClassRecord } from '@/lib/classes/repository';
import { careerRepository } from '@/lib/content/repository';
import type { CareerProfile } from '@/lib/content/schema';
import { getSession } from '@/lib/session/session';
import {
  getStudentWork,
  hasSavedComparison,
  hasSubmittedReflection,
  type StudentWorkState,
} from '@/lib/student-work/state';

export const metadata: Metadata = {
  title: 'Dashboard insegnanti',
};

export default async function TeacherPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  const [{ created, error }, classes, session, work] = await Promise.all([
    searchParams,
    classRepository.listClasses(),
    getSession(),
    getStudentWork(),
  ]);

  const currentClass = session
    ? await classRepository.getByCode(session.classCode)
    : null;
  const selectedClass =
    classes.find((record) => record.code === created) ??
    currentClass ??
    classes[0];
  const comparedCareers = (
    await Promise.all(
      work.comparedSlugs.map((slug) => careerRepository.getBySlug(slug)),
    )
  ).filter((career): career is CareerProfile => Boolean(career));

  return (
    <div className="app-shell max-w-7xl py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside className="lg:border-border lg:border-r lg:pr-8">
          <p className="page-kicker">Insegnanti</p>
          <h1 className="editorial-title mt-2">Dashboard classe</h1>
          <nav
            aria-label="Sezioni insegnante"
            className="mt-6 flex flex-col space-y-1"
          >
            {['Classi', 'Progressi', 'Riflessioni', 'Insight'].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                className="text-ink-muted hover:text-primary hover:border-primary border-l-2 border-transparent px-3 py-2 text-sm font-medium"
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>

        <main>
          {created && (
            <p
              role="status"
              className="border-success bg-evidence-verified-soft rounded-card mb-6 border px-4 py-3 text-sm"
            >
              Classe creata. Codice: <strong>{created}</strong>
            </p>
          )}

          <section
            id="classi"
            aria-labelledby="classi-heading"
            className="scroll-mt-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 id="classi-heading" className="text-2xl font-semibold">
                  Classi
                </h2>
                <p className="text-ink-muted mt-1">
                  Codici pronti da proiettare o condividere in aula.
                </p>
              </div>
              <a
                href="#nuova-classe"
                className="button-primary rounded-control inline-flex min-h-10 items-center gap-2 px-4 py-2 text-sm font-medium"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                Crea classe
              </a>
            </div>

            <ul className="mt-5 grid gap-4 md:grid-cols-2">
              {classes.map((record) => (
                <li
                  key={record.code}
                  className="border-border bg-surface border-t-2 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{record.name}</h3>
                      {record.school && (
                        <p className="text-ink-muted text-sm">
                          {record.school}
                        </p>
                      )}
                    </div>
                    <Badge>{record.code}</Badge>
                  </div>
                  {record.notes && (
                    <p className="text-ink-muted mt-3 text-sm">
                      {record.notes}
                    </p>
                  )}
                  <div className="mt-4">
                    <CopyClassCode code={record.code} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {selectedClass && (
            <ClassDetail
              classRecord={selectedClass}
              activeStudent={
                session?.classCode === selectedClass.code
                  ? {
                      nickname: session.nickname,
                      work,
                      careerNames: comparedCareers.map(
                        (career) => career.canonicalName,
                      ),
                    }
                  : null
              }
            />
          )}

          <section
            id="nuova-classe"
            aria-labelledby="nuova-classe-heading"
            className="panel mt-10 p-5"
          >
            <h2 id="nuova-classe-heading" className="text-2xl font-semibold">
              Crea una classe
            </h2>
            {error === 'missing-class-name' && (
              <p
                role="alert"
                className="border-risk bg-risk/10 text-risk rounded-card mt-4 border px-4 py-3 text-sm"
              >
                Inserisci il nome della classe.
              </p>
            )}
            <form
              action={createClass}
              className="mt-5 grid gap-4 md:grid-cols-2"
            >
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  Nome classe
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  placeholder="es. 4B Scientifico"
                  className="border-border bg-surface text-ink focus:border-primary rounded-control mt-1 w-full border px-3 py-2.5 text-base"
                />
              </div>
              <div>
                <label htmlFor="school" className="block text-sm font-medium">
                  Scuola
                </label>
                <input
                  id="school"
                  name="school"
                  placeholder="facoltativo"
                  className="border-border bg-surface text-ink focus:border-primary rounded-control mt-1 w-full border px-3 py-2.5 text-base"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium">
                  Note
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  placeholder="facoltativo"
                  className="border-border bg-surface text-ink focus:border-primary rounded-control mt-1 w-full border px-3 py-2.5 text-base"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="button-primary rounded-control inline-flex min-h-11 items-center px-5 py-2.5 font-medium"
                >
                  Crea classe
                </button>
              </div>
            </form>
          </section>

          <p className="text-ink-muted mt-8 text-sm">
            Questa dashboard MVP usa dati demo e la sessione studente aperta in
            questo browser. La versione con Supabase renderà visibili più
            studenti e più dispositivi.
          </p>
        </main>
      </div>
    </div>
  );
}

function ClassDetail({
  classRecord,
  activeStudent,
}: {
  classRecord: ClassRecord;
  activeStudent: {
    nickname: string;
    work: StudentWorkState;
    careerNames: string[];
  } | null;
}) {
  const studentCount = activeStudent ? 1 : 0;
  const completedCount =
    activeStudent && hasSubmittedReflection(activeStudent.work) ? 1 : 0;
  const completionRate = studentCount
    ? Math.round((completedCount / studentCount) * 100)
    : 0;
  const topCareer = activeStudent?.careerNames[0] ?? 'Non ancora scelta';
  const confidence = activeStudent?.work.reflection.confidence ?? null;

  return (
    <section
      id="progressi"
      aria-labelledby="progressi-heading"
      className="mt-10 scroll-mt-8"
    >
      <div className="panel border-t-ink border-t-2 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="progressi-heading" className="text-2xl font-semibold">
              {classRecord.name}
            </h2>
            <p className="text-ink-muted mt-1">Codice classe</p>
            <p className="mt-1 text-2xl font-bold tracking-wide">
              {classRecord.code}
            </p>
          </div>
          <CopyClassCode code={classRecord.code} />
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-4">
          <Metric icon={Users} label="Studenti" value={String(studentCount)} />
          <Metric
            icon={CircleCheck}
            label="Completati"
            value={String(completedCount)}
          />
          <Metric icon={BarChart3} label="Top interesse" value={topCareer} />
          <Metric
            icon={NotebookPen}
            label="Chiarezza media"
            value={confidence ? `${confidence} / 5` : 'Non disponibile'}
          />
        </dl>

        <div className="rounded-pill bg-surface-muted mt-6 h-3 overflow-hidden">
          <div
            className="bg-success h-full"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-ink-muted mt-2 text-sm">
          Completamento: {completionRate}%
        </p>
      </div>

      <ProgressTable activeStudent={activeStudent} />
      <ReflectionReview activeStudent={activeStudent} />
      <Insights activeStudent={activeStudent} />
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="border-border rounded-card border p-3">
      <dt className="text-ink-muted flex items-center gap-2 text-sm">
        <Icon aria-hidden="true" className="h-4 w-4" />
        {label}
      </dt>
      <dd className="mt-1 text-base leading-snug font-semibold">{value}</dd>
    </div>
  );
}

function ProgressTable({
  activeStudent,
}: {
  activeStudent: {
    nickname: string;
    work: StudentWorkState;
    careerNames: string[];
  } | null;
}) {
  return (
    <section id="riflessioni" className="mt-8">
      <h3 className="text-xl font-semibold">Progressi studenti</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[680px] border-separate border-spacing-0 text-left text-sm">
          <thead className="text-ink-muted">
            <tr>
              {[
                'Studente',
                'Esplorazione',
                'Confronto',
                'Riflessione',
                'Ultima attività',
              ].map((heading) => (
                <th key={heading} className="border-border border-b py-2 pr-4">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeStudent ? (
              <tr className="hover:bg-surface-muted">
                <td className="border-border border-b py-3 pr-4 font-medium">
                  {activeStudent.nickname}
                </td>
                <td className="border-border border-b py-3 pr-4">
                  {activeStudent.work.comparedSlugs.length > 0
                    ? 'Iniziata'
                    : 'Da fare'}
                </td>
                <td className="border-border border-b py-3 pr-4">
                  {hasSavedComparison(activeStudent.work)
                    ? 'Salvato'
                    : 'Da fare'}
                </td>
                <td className="border-border border-b py-3 pr-4">
                  {hasSubmittedReflection(activeStudent.work)
                    ? 'Consegnata'
                    : 'Da fare'}
                </td>
                <td className="border-border border-b py-3 pr-4">
                  {activeStudent.work.reflection.savedAt
                    ? 'Riflessione salvata'
                    : 'Sessione aperta'}
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={5} className="text-ink-muted py-5">
                  Nessuno studente attivo in questa sessione demo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ReflectionReview({
  activeStudent,
}: {
  activeStudent: {
    nickname: string;
    work: StudentWorkState;
    careerNames: string[];
  } | null;
}) {
  const reflection = activeStudent?.work.reflection;
  const submitted = activeStudent && hasSubmittedReflection(activeStudent.work);

  return (
    <section className="mt-8">
      <h3 className="text-xl font-semibold">Riflessioni consegnate</h3>
      {submitted && reflection ? (
        <article className="border-border bg-surface rounded-card mt-3 border p-5">
          <p className="font-semibold">{activeStudent.nickname}</p>
          <dl className="mt-4 grid gap-4 md:grid-cols-2">
            <ReflectionItem label="Sorpresa" value={reflection.surprised} />
            <ReflectionItem
              label="Percorso realistico"
              value={reflection.realisticPath}
            />
            <ReflectionItem
              label="Compromesso difficile"
              value={reflection.hardestTradeoff}
            />
            <ReflectionItem
              label="Prossima verifica"
              value={reflection.nextResearch}
            />
          </dl>
        </article>
      ) : (
        <p className="text-ink-muted mt-3">
          Nessuna riflessione consegnata per ora.
        </p>
      )}
    </section>
  );
}

function ReflectionItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink-muted text-sm">{label}</dt>
      <dd className="mt-1">{value || 'Non compilato'}</dd>
    </div>
  );
}

function Insights({
  activeStudent,
}: {
  activeStudent: {
    nickname: string;
    work: StudentWorkState;
    careerNames: string[];
  } | null;
}) {
  const careerNames = activeStudent?.careerNames ?? [];
  return (
    <section id="insight" className="mt-8">
      <h3 className="text-xl font-semibold">Insight classe</h3>
      {careerNames.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {careerNames.map((name) => (
            <li key={name}>
              <div className="flex items-center gap-3">
                <span className="w-44 text-sm font-medium">{name}</span>
                <span className="rounded-pill bg-primary-soft h-3 flex-1">
                  <span className="rounded-pill bg-primary block h-full w-full" />
                </span>
                <span className="text-ink-muted text-sm">1</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink-muted mt-3">
          Gli interessi appariranno quando gli studenti aggiungono professioni
          al confronto.
        </p>
      )}
      <p className="mt-6">
        <Link href="/" className="text-primary underline underline-offset-4">
          Apri la pagina studenti
        </Link>
      </p>
    </section>
  );
}

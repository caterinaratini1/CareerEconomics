# School pilot guide

Materials and process for running a classroom pilot.

> **Not yet ready to run.** The pilot requires published content, and no career
> is published — every figure is still unsourced. See the README. It also now
> requires a real class-code/teacher-auth backend (see docs/DECISIONS.md,
> "classroom account model") — the current build only has an in-memory dev
> version of that. This document exists so the pilot design is settled before
> content pressure starts shaping it, which is the wrong order to do it in.

---

## Before the first session

| Prerequisite | Status |
| --- | --- |
| At least 25 published careers | ✗ — 3 drafts, 0 published |
| All figures sourced and human-reviewed | ✗ |
| Feedback capture (Phase 6) | ✗ |
| Privacy notice published | ✓ `/privacy` |
| Methodology page published | ✓ `/methodology` |
| Content language decision (ADR-0005) | ✓ — Italian, decided 2026-08-04 |
| Production deployment | ✗ |
| Class-code/teacher-auth backend (Phase B) | ✗ — dev-mode in-memory only, see docs/DECISIONS.md |

The language question is settled: interface and content are in Italian, so a
comprehension test now measures our writing rather than the students' English.
What still blocks a session is content — no career is publishable until its
figures are sourced.

---

## Pilot size

One to three schools, one to three classes each, roughly 30–100 students. Small
enough to talk to every teacher afterwards; large enough that the numbers mean
something.

---

## Teacher one-pager

Hand this to the teacher as-is. It is in Italian because they will read it to
the class; the rest of this document is internal.

> ### Career Economics Lab — guida per docenti
>
> **Che cos'è.** Un sito gratuito che spiega com'è davvero una professione: che
> cosa si fa, come ci si arriva, quanto si guadagna, quanto è competitiva e
> quali sono i lati negativi — con la fonte dietro ogni informazione
> importante.
>
> **Cosa serve agli studenti.** Un dispositivo con un browser e il codice
> della classe, che lei crea e condivide. Gli studenti scrivono il codice e
> un nome a scelta (non serve il vero nome) — nessuna email, nessuna
> password.
>
> **Cosa non fa.** Non dice agli studenti che cosa devono fare. Non ci sono test
> della personalità, classifiche o pubblicità.
>
> **Privacy.** Gli studenti non creano un account e non danno nome vero né
> email — solo un soprannome legato al codice della classe. Solo lei, come
> insegnante, ha un accesso personale, per vedere i progressi della classe.
> Informativa completa su `/privacy`.
>
> ⚠️ *In questa fase di sviluppo l'accesso insegnanti e la memorizzazione
> delle classi non sono ancora attivi: vedi la nota di stato in cima a questo
> documento.*
>
> **Se qualcosa non funziona.** [contatto di supporto — da inserire prima del
> pilota]

---

## 30-minute classroom activity

| Time | Activity | What the teacher says |
| --- | --- | --- |
| 0–3 min | Introduce | «Questo sito spiega com'è davvero un lavoro, e vi fa vedere da dove vengono le informazioni» |
| 3–5 min | Each student picks or searches for one career | «Cercate una professione che vi incuriosisce» |
| 5–15 min | Read the page | — |
| 15–22 min | Find and write down four things | «Scrivete: un requisito · un dato sullo stipendio · uno svantaggio · una cosa che potreste fare da subito» |
| 22–25 min | Open one source | «Aprite una fonte e guardate da dove viene quell'informazione» |
| 25–28 min | Submit clarity feedback | «Diteci se la pagina era chiara» |
| 28–30 min | Search for a career that is not listed | «Cercate un lavoro che secondo voi manca» |

The source-checking step is not filler. Whether students grasp that claims are
traceable is a core thing the pilot is testing — it is the product's whole
differentiator, and if it does not land, the differentiator does not exist.

---

## Student questions

Ask these in Italian:

- La pagina era facile da capire?
- Hai imparato qualcosa che non sapevi?
- Mancava qualcosa?
- C'è stato qualcosa che ti è sembrato fuorviante o troppo bello per essere vero?
- Quale professione ti aspettavi di trovare e non c'era?
- Useresti di nuovo questo sito?

Deliberately not asked: name, class, age, grades, or which school. §17 — the
product does not need them, so it does not collect them.

---

## Teacher questions

Ask these in Italian:

- Ha dovuto spiegare come si usa, o gli studenti hanno fatto da soli?
- Sono rimasti coinvolti per tutta l'attività?
- I percorsi descritti le sono sembrati abbastanza affidabili per l'uso in classe?
- Quali contenuti hanno generato domande a cui non sapeva rispondere?
- Lo userebbe di nuovo?
- Di che cosa avrebbe bisogno la scuola per adottarlo formalmente?

---

## Success thresholds

| Measure | Threshold |
| --- | --- |
| Rate content as clear | ≥ 60% |
| Learned something new | ≥ 40% |
| Would use again | ≥ 50% |
| Sessions hitting a technical failure | < 10% |
| Severe trust or safeguarding concerns from teachers | zero |

Missing-career searches should also be clear enough to drive the next content
batch. If they are scattered across fifty unrelated jobs, the career selection
was wrong.

---

## What to watch for during the session

Notes taken live are worth more than the forms afterwards.

- Where do students stop reading? That section is too long or too dull.
- Which words get asked about? Those are jargon we did not notice.
- Does anyone read the pay figure as a promise rather than a range?
- Does anyone treat an optional activity as a requirement? That is the §10.6
  failure and it is the one that does real harm.
- Does anyone click a source unprompted?

---

## After the pilot

1. Write up findings within a week, while the session is fresh.
2. Group missing-career requests and pick the next content batch from them.
3. List every point of confusion; each is a template change, not a one-off fix.
4. Decide, explicitly: continue, change direction, or stop.

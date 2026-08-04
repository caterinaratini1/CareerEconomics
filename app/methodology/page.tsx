import type { Metadata } from 'next';
import { Prose } from '@/components/ui/primitives';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Come lavoriamo',
  description:
    'Da dove vengono le nostre informazioni, come le verifichiamo e cosa ' +
    'facciamo quando una cosa non la sappiamo.',
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Come lavoriamo</h1>

      <Prose>
        <p className="text-ink-muted mt-4 text-lg">
          Non devi crederci sulla parola. Questa pagina spiega da dove vengono
          le nostre informazioni e come capire quanto fidarti di ciascuna.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">Che fonti usiamo</h2>
        <p>
          Per le informazioni che contano — stipendi, requisiti di accesso,
          regole di legge — usiamo fonti ufficiali, più o meno in quest’ordine
          di preferenza:
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Ministeri e portali ufficiali dello Stato</li>
          <li>Istituti nazionali di statistica</li>
          <li>Ordini e albi professionali</li>
          <li>Università ed enti che gestiscono gli esami</li>
          <li>Servizi pubblici per l’orientamento e il lavoro</li>
          <li>Ricerche serie sul mercato del lavoro</li>
          <li>
            Grandi banche dati sugli stipendi — per ultime, e solo dichiarando
            in pagina quali sono i loro limiti
          </li>
        </ol>
        <p>
          Non usiamo blog, post sui social o articoli promozionali per le
          informazioni principali. Per una professione le cui regole di accesso
          sono fissate per legge, citiamo la legge o il bando ufficiale, non il
          riassunto che ne ha fatto qualcuno.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">
          Come capire che cosa è stato verificato
        </h2>
        <p>
          Ogni informazione importante si trova in uno di tre stati, e la pagina
          ti dice sempre quale:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Verificata.</strong> C’è il collegamento alla fonte da cui
            viene e la data in cui l’abbiamo aperta l’ultima volta.
          </li>
          <li>
            <strong>Bozza non verificata.</strong> Abbiamo scritto qualcosa ma
            non l’abbiamo ancora confermato su una fonte. È segnalato lì dove
            compare, e la pagina dice quali prove mancano.
          </li>
          <li>
            <strong>Non verificata.</strong> Non ce ne siamo ancora occupati. La
            sezione resta comunque nella pagina e lo dichiara, invece di sparire
            — altrimenti non potresti distinguere una domanda senza risposta da
            una domanda che nessuno si è posto.
          </li>
        </ul>
        <p>
          Una professione viene pubblicata solo quando stipendi, requisiti di
          accesso, regole di legge, tempi e livello di competizione sono tutti
          nel primo stato, con almeno due fonti credibili dietro la pagina.
          Questo controllo è automatico prima della pubblicazione, non affidato
          alla memoria di qualcuno.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">
          Come parliamo di stipendi
        </h2>
        <p>
          Mostriamo intervalli, mai una media secca. Una media nasconde proprio
          quello che ti serve sapere, cioè quanto è ampia la forbice e che cosa
          ti sposta al suo interno. Diciamo anche sempre se una cifra è lorda o
          netta e su quale periodo, perché in {SITE.country.name} questi dati
          vengono riportati in modi diversi e la differenza è grossa.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">
          Come parliamo di competizione
        </h2>
        <p>
          Evitiamo le percentuali inventate. Dove un ente ufficiale pubblica il
          numero di posti e il numero di candidati, riportiamo quelli. Dove non
          lo fa, spieghiamo com’è la competizione nella pratica e diciamo che i
          numeri non sono disponibili.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">
          Dove usiamo l’intelligenza artificiale e dove no
        </h2>
        <p>
          L’intelligenza artificiale non è una fonte. Non viene usata per
          stabilire nessuna informazione di questo sito: nessuno stipendio,
          nessun requisito, nessuna probabilità viene da un modello linguistico.
          Le schede sono scritte e riviste da persone, a partire dalle fonti
          elencate in ogni pagina.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">
          Cosa non facciamo di proposito
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Non ti diciamo che lavoro scegliere. Descriviamo le professioni; la
            decisione è tua.
          </li>
          <li>
            Non facciamo test della personalità o attitudinali. Non ci sono
            prove solide che prevedano in cosa sarai bravo.
          </li>
          <li>Non garantiamo ammissioni, assunzioni o guadagni.</li>
          <li>
            Non presentiamo come obbligatorie attività che sono facoltative. Se
            una cosa è davvero facoltativa, la pagina lo dice.
          </li>
        </ul>

        <h2 className="pt-6 text-2xl font-semibold">
          Quando qualcosa è sbagliato
        </h2>
        <p>
          Le regole delle professioni cambiano e le pagine invecchiano. Ogni
          pagina riporta la data dell’ultimo aggiornamento e le rivediamo almeno
          una volta all’anno. Se trovi un errore, soprattutto se lavori nel
          settore, vogliamo saperlo.
        </p>
      </Prose>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { Prose } from '@/components/ui/primitives';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Chi siamo',
  description:
    'A cosa serve Career Economics Lab, per chi è pensato e che cosa ha scelto di non fare.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Chi siamo</h1>

      <Prose>
        <p className="text-ink-muted mt-4 text-lg">
          Le informazioni utili sul lavoro non sono distribuite in modo equo.
          Alcuni ragazzi possono chiedere a un genitore, a un amico di famiglia
          o a un ex studente com’è davvero un mestiere, quanto si guadagna e
          come ci si entra. La maggior parte non può. Questo sito esiste per
          mettere quelle informazioni nello stesso posto, per tutti.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">Cosa fa</h2>
        <p>
          Scrivi il nome di una professione. Ottieni una pagina che spiega, in
          parole semplici, che cosa si fa davvero in quel lavoro, com’è una
          giornata tipo, come ci si arriva, quanto si guadagna, quanto è
          competitivo, quali sono i lati negativi e che cosa puoi fare fin da
          ora — con la fonte dietro ogni informazione importante, così puoi
          controllare da te.
        </p>
        <p>
          Ogni pagina dovrebbe richiedere meno di dieci minuti di lettura. Se ce
          ne vogliono di più per capire una professione, vuol dire che l’abbiamo
          scritta male.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">Per chi è</h2>
        <p>
          Per studentesse e studenti dai 14 ai 19 anni, e per i docenti, gli
          orientatori e i genitori che li aiutano. È pensato per funzionare su
          un telefono economico, con una connessione lenta e sui computer della
          scuola, perché sono le condizioni in cui verrà usato davvero.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">
          Cosa abbiamo scelto di non fare
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Nessuna registrazione. Non devi mai iscriverti né dirci come ti
            chiami.
          </li>
          <li>Nessun test della personalità che ti dica cosa dovresti fare.</li>
          <li>Nessuna pubblicità e nessuna vendita di dati.</li>
          <li>
            Nessuna frase motivazionale. Ogni professione ha dei lati negativi e
            noi li scriviamo.
          </li>
          <li>
            Nessuna promessa sull’essere ammessi, assunti o pagati in un certo
            modo.
          </li>
        </ul>

        <h2 className="pt-6 text-2xl font-semibold">A che punto siamo</h2>
        <p>
          Questa è una versione iniziale. Al momento le informazioni riguardano
          solo l’{SITE.country.name}, perché i percorsi di accesso alle
          professioni regolamentate cambiano da paese a paese e fare bene un
          paese vale più che farne cinque male. Le professioni disponibili sono
          poche e crescono con calma: ognuna richiede ricerca vera.
        </p>

        <p>
          <Link
            href="/methodology"
            className="text-accent underline underline-offset-4"
          >
            Leggi come raccogliamo e verifichiamo le informazioni
          </Link>
        </p>
      </Prose>
    </div>
  );
}

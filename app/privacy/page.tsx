import type { Metadata } from 'next';
import { Prose } from '@/components/ui/primitives';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'Quali dati raccoglie questo sito — quasi nessuno — spiegato in parole semplici.',
};

/**
 * §17 requires a privacy notice in plain language. It describes the site as it
 * is *today* — no analytics, no forms, no cookies — and must be updated in the
 * same change that introduces any of them, not afterwards.
 */
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Privacy</h1>

      <Prose>
        <p className="text-ink-muted mt-4 text-lg">
          Questo sito è usato da ragazze e ragazzi, quindi raccoglie il meno
          possibile. In parole semplici: non sappiamo chi sei e non stiamo
          cercando di scoprirlo.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">Cosa non raccogliamo</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Nessun account, quindi né nome, né email, né password</li>
          <li>
            Nessuna data di nascita, nome della scuola, voti o informazioni
            sulla famiglia
          </li>
          <li>Nessun cookie pubblicitario o di tracciamento</li>
          <li>Nessuna posizione precisa</li>
          <li>Nessuna vendita o condivisione di dati con nessuno</li>
        </ul>

        <h2 className="pt-6 text-2xl font-semibold">
          Cosa succede quando usi il sito adesso
        </h2>
        <p>
          In questa fase il sito è un insieme di pagine statiche. La ricerca
          passa dalla barra degli indirizzi — quello che cerchi compare
          nell’indirizzo della pagina, ed è così che puoi condividere un
          risultato con qualcuno — e non viene conservato da noi.
        </p>
        <p>
          Il nostro fornitore di hosting conserva per un breve periodo i normali
          log del server, per sicurezza e affidabilità, come fa qualsiasi
          servizio di hosting. Non usiamo quei log per costruire il profilo di
          nessuno.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">Cosa cambierà, e quando</h2>
        <p>
          Abbiamo in programma due cose: un semplice conteggio di quali pagine
          vengono visitate e quali ricerche non trovano nulla, per capire cosa
          scrivere dopo; e un pulsante per dirci che una pagina non era chiara.
          Entrambe funzioneranno senza registrazione e senza identificarti.
          Questa pagina sarà aggiornata prima che vengano attivate, non dopo.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">
          Collegamenti ad altri siti
        </h2>
        <p>
          Le schede rimandano a fonti ufficiali — ministeri, istituti di
          statistica, ordini professionali. Quei siti hanno una propria politica
          sulla privacy e non dipendono da noi.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">Contatti</h2>
        <p>
          Se hai una domanda sulla privacy, o vuoi che qualcosa venga rimosso,
          scrivici. Poiché non raccogliamo dati personali, nell’uso normale del
          sito non c’è nulla di tuo che possiamo conservare o cancellare.
        </p>

        <p className="text-ink-muted pt-6 text-sm">
          {SITE.name} ha sede in {SITE.country.name}. Prima di una diffusione
          più ampia nelle scuole, questa informativa sarà rivista da una persona
          qualificata in materia di protezione dei dati, con particolare
          attenzione alla normativa italiana ed europea sui minori.
        </p>
      </Prose>
    </div>
  );
}

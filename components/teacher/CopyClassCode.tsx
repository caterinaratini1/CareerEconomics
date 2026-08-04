'use client';

import { useState } from 'react';
import { Clipboard, ClipboardCheck } from 'lucide-react';

export function CopyClassCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
      }}
      className="border-border text-ink hover:border-primary rounded-control inline-flex min-h-10 items-center gap-2 border px-3 py-2 text-sm font-medium"
    >
      {copied ? (
        <ClipboardCheck aria-hidden="true" className="h-4 w-4" />
      ) : (
        <Clipboard aria-hidden="true" className="h-4 w-4" />
      )}
      {copied ? 'Copiato' : 'Copia codice'}
    </button>
  );
}

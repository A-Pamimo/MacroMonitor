import React, { useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';

const ENTRIES = [
  {
    term: 'What is the "Yield Curve"?',
    body: 'Normally, borrowing money for 10 years costs more than for 2 years. When it’s cheaper to borrow for 10 years (an "inverted curve"), it means investors expect the economy to slow down soon.',
  },
  {
    term: 'Why does the Fed Rate matter?',
    body: 'It controls the price of money. High rates make loans (mortgages, credit cards) expensive to slow spending. Low rates make loans cheap to encourage spending.',
  },
  {
    term: 'What is "Real" GDP?',
    body: '"Real" means adjusted for inflation. If the economy grows 5% but prices rise 5%, you actually grew 0%. Real GDP strips out price increases to show true growth.',
  },
];

const MacroDictionary: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-line bg-card shadow-[0_1px_2px_rgba(11,31,59,.04)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="macro-dictionary-body"
        className="w-full flex items-center justify-between gap-2 p-5
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset rounded-2xl"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-ink">
          <BookOpen size={16} className="text-series-blue" />
          Macro Dictionary
        </span>
        <ChevronDown
          size={18}
          className={`text-muted transition-transform duration-300 ease-spring ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          id="macro-dictionary-body"
          className="px-5 pb-5 space-y-3 animate-fade-up"
        >
          {ENTRIES.map((e) => (
            <div key={e.term} className="text-xs">
              <span className="font-semibold text-ink-2 block">{e.term}</span>
              <span className="text-muted leading-relaxed">{e.body}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MacroDictionary;

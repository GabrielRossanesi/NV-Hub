'use client';

import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Card from './card';

/** Keeps the existing desktop panel open; collapses secondary context on mobile. */
export default function MobileDisclosure({ title, summary, className, contentClassName, children }: {
  title: string;
  summary?: string;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  return (
    <Card className={`nv-mobile-disclosure ${className || ''}`}>
      <h3 className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
        <span className="hidden lg:inline">{title}</span>
        <button
          type="button"
          className="nv-disclosure-trigger flex w-full items-center justify-between gap-3 text-left lg:hidden"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded(value => !value)}
        >
          <span className="min-w-0">
            <span className="block">{title}</span>
            {summary && <span className="mt-1 block truncate text-sm font-medium normal-case tracking-normal text-foreground-secondary">{summary}</span>}
          </span>
          <ChevronDown className="nv-disclosure-chevron h-4 w-4 shrink-0" aria-hidden="true" />
        </button>
      </h3>
      <div id={contentId} data-expanded={expanded} className={`nv-disclosure-content ${contentClassName || ''}`}>
        {children}
      </div>
    </Card>
  );
}

import React from 'react';

/**
 * Marginalia — tiny mono notes that belong in the page margin rather than in
 * the text: datelines, page numbers, reading times, contributor initials.
 */
export const Marginalia: React.FC<
  React.PropsWithChildren<{
    as?: 'span' | 'div' | 'p';
    className?: string;
    title?: string;
    align?: 'left' | 'right';
  }>
> = ({ children, as: Tag = 'span', className = '', title, align = 'left' }) => (
  <Tag className={`marginalia ${align === 'right' ? 'text-right' : ''} ${className}`} title={title}>
    {children}
  </Tag>
);

/**
 * Section divider: short, centred, with an ornament. Never a full-width rule —
 * a line that runs edge to edge is a table, not a page.
 */
export const Divider: React.FC<{
  ornament?: string;
  className?: string;
  label?: string;
}> = ({ ornament = '◆', className = '', label }) => (
  <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden={!label}>
    <span className="h-px w-16 bg-ink/20" />
    <span className="ornament">{ornament}</span>
    {label ? <span className="label-caps text-ink/62">{label}</span> : null}
    <span className="h-px w-16 bg-ink/20" />
  </div>
);

/**
 * A vertical rule used to hang a quote or a caption off the main text.
 * Purely decorative, so it never reaches the accessibility tree.
 */
export const VerticalRule: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span aria-hidden="true" className={`rule-vertical block ${className}`} />
);

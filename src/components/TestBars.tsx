import React from 'react';

/**
 * §7.5 Test bars — a 4px strip of five muted colours used as a break between
 * major chapters. They are print registration marks: they do not move (§10).
 */
const TestBars: React.FC = () => (
  <div className="testbars" aria-hidden="true">
    <span />
    <span />
    <span />
    <span />
    <span />
  </div>
);

export default TestBars;

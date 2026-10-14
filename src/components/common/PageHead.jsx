import React from 'react';

export function PageHead({ eyebrow, title, desc, action }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {desc && <p>{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function Pill({ children, tone = 'neutral' }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}

export function ProgressBar({ done = 0, total = 0 }) {
  const percent = total > 0 ? (done / total) * 100 : 0;
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label="התקדמות הלמידה"
      aria-valuenow={done}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}

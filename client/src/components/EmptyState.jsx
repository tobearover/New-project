import React from 'react';

export default function EmptyState({ icon = '🔍', title, desc, action }) {
  return (
    <div className="card flex flex-col items-center gap-2 px-6 py-12 text-center">
      <div className="text-4xl">{icon}</div>
      <div className="text-base font-semibold text-slate-800">{title}</div>
      {desc && <div className="max-w-sm text-sm text-slate-500">{desc}</div>}
      {action}
    </div>
  );
}

import React from 'react';
import { Search } from 'lucide-react';

/**
 * 通用空状态：icon 传 lucide 组件；action 可传 { label, onClick } 或任意 React 节点。
 */
export default function EmptyState({ icon: Icon = Search, title, desc, description, action }) {
  const text = desc || description;
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-7 w-7 text-slate-400" />
      </div>
      <div className="text-base font-semibold text-slate-800">{title}</div>
      {text && <div className="mt-1 max-w-sm text-sm text-slate-500">{text}</div>}
      {action && typeof action === 'object' && !React.isValidElement(action) && action.label ? (
        <button type="button" className="btn-primary mt-5" onClick={action.onClick}>
          {action.label}
        </button>
      ) : (
        action
      )}
    </div>
  );
}

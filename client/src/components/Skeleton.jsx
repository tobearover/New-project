import React from 'react';

/** 通用骨架块：浅灰呼吸动画占位 */
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/60 ${className}`} />;
}

/** 单词卡片骨架（网格场景，如未来词卡视图/首页统计卡使用） */
export function WordCardSkeleton() {
  return (
    <div className="card p-5">
      <Skeleton className="mb-3 h-5 w-24" />
      <Skeleton className="mb-2 h-4 w-32" />
      <Skeleton className="mb-2 h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

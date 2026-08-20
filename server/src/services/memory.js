// 基于艾宾浩斯遗忘曲线的间隔重复策略
// 复习间隔（天）：1 → 2 → 4 → 7 → 15 → 30
const INTERVALS_DAYS = [1, 2, 4, 7, 15, 30];

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function initialSchedule() {
  return {
    intervalIndex: 0,
    nextReview: addDays(todayStr(), INTERVALS_DAYS[0]),
    lastReviewed: null
  };
}

// result: again（忘记，重置）/ good（记得，推进）/ easy（轻松，跳级）
function applyResult(entry, result) {
  let idx = entry.intervalIndex ?? 0;
  if (result === 'again') idx = 0;
  else if (result === 'good') idx = Math.min(idx + 1, INTERVALS_DAYS.length - 1);
  else if (result === 'easy') idx = Math.min(idx + 2, INTERVALS_DAYS.length - 1);

  const interval = INTERVALS_DAYS[idx];
  return {
    ...entry,
    intervalIndex: idx,
    nextReview: addDays(todayStr(), interval),
    lastReviewed: todayStr(),
    reviewCount: (entry.reviewCount || 0) + 1,
    updatedAt: new Date().toISOString()
  };
}

function isDue(entry) {
  return (entry.nextReview || todayStr()) <= todayStr();
}

module.exports = { INTERVALS_DAYS, todayStr, addDays, initialSchedule, applyResult, isDue };

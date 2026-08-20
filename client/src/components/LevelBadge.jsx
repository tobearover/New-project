const STYLES = {
  high_frequency: 'bg-red-100 text-red-700 ring-red-200',
  frequent: 'bg-orange-100 text-orange-700 ring-orange-200',
  key: 'bg-blue-100 text-blue-700 ring-blue-200',
  cognition: 'bg-slate-100 text-slate-600 ring-slate-200'
};

export const LEVEL_LABELS = {
  high_frequency: '高频',
  frequent: '常考',
  key: '重点',
  cognition: '认知'
};

export default function LevelBadge({ level }) {
  return (
    <span className={`chip ring-1 ${STYLES[level] || STYLES.cognition}`}>
      {LEVEL_LABELS[level] || level}
    </span>
  );
}

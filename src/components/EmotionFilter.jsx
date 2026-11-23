import { EMOTIONS } from '../constants/emotions'

export default function EmotionFilter({ currentFilter, onSelectFilter }) {
  const filters = [
    { key: 'all', label: '전체 보기', emoji: '🌈' },
    ...EMOTIONS.map((e) => ({ key: e.key, label: e.label, emoji: e.emoji })),
  ]

  return (
    <div className="my-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filters.map((filter) => {
          const isSelected = currentFilter === filter.key
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => onSelectFilter(filter.key)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{filter.emoji}</span>
              <span>{filter.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

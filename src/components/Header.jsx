export default function Header() {
  return (
    <header className="text-center pt-8 pb-6 px-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs sm:text-sm font-medium mb-3 shadow-xs">
        <span>✨</span>
        <span>클라우드 동기화 감정 다이어리</span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
        감정 일기 <span className="inline-block hover:rotate-12 transition-transform duration-200">📖</span>
      </h1>
      <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto leading-relaxed">
        오늘 하루의 감정과 생각을 기록해보세요.<br className="hidden sm:inline" />
        어느 기기에서 열어도 동일한 기록을 확인할 수 있습니다.
      </p>
    </header>
  )
}

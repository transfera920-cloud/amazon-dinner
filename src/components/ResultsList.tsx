export default function ResultsList({
  results,
  selectedPlaceId,
  onSelectPlace,
  siteText,
}: {
  results: any[];
  selectedPlaceId: string | null;
  onSelectPlace: (id: string | null) => void;
  siteText: Record<string, string>;
}) {
  if (results.length === 0) {
    return (
      <div className="no-results bg-white border border-[#d6ded9] rounded-xl p-8 sm:p-12 text-center shadow-sm">
        <p className="text-base font-semibold text-[#192723] mb-1.5">
          {siteText.no_results || '找不到符合條件的地點'}
        </p>
        <p className="hint text-xs sm:text-sm text-[#52635c] leading-relaxed">
          {siteText.no_results_hint}
        </p>
      </div>
    );
  }

  return (
    <ul className="results-list space-y-3 list-none p-0 m-0">
      {results.map((r) => {
        const isSelected = r.placeId === selectedPlaceId;
        return (
          <li
            key={r.placeId}
            className={`results-item relative bg-white rounded-xl p-4 sm:p-4.5 border transition-all cursor-pointer shadow-xs ${
              isSelected
                ? 'selected border-[#1e3a2f] bg-[#f0f6f3] ring-1.5 ring-[#1e3a2f] shadow-sm'
                : 'border-[#d6ded9] hover:border-[#8aa398] hover:shadow-sm'
            }`}
            onClick={() => onSelectPlace(r.placeId)}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-1.5">
              <div className="result-name text-base sm:text-lg font-bold text-[#192723] leading-snug">
                {r.name}
              </div>
              {r.driveText && (
                <span className="self-start sm:self-auto shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-[#1e3a2f] text-white tracking-wide">
                  開車 {r.driveText}
                </span>
              )}
            </div>

            <div className="result-address text-xs sm:text-sm text-[#52635c] mb-3 leading-relaxed">
              {r.address}
            </div>

            <div className="result-meta flex flex-wrap items-center gap-2 mb-3">
              {r.rating != null && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#fef3c7] text-[#92400e]">
                  評分 {r.rating} ⭐
                </span>
              )}
              {r.openNow != null && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    r.openNow
                      ? 'bg-[#dcfce7] text-[#166534]'
                      : 'bg-[#fee2e2] text-[#991b1b]'
                  }`}
                >
                  {r.openNow ? '營業中' : '已打烊'}
                </span>
              )}
              {/* Fallback display for r.driveText if on small mobile or when layout wraps */}
              {r.driveText && (
                <span className="sm:hidden inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#e7eee9] text-[#1e3a2f]">
                  開車 {r.driveText}
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-[#edf1ee] flex justify-end">
              <a
                href={r.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#1e3a2f] hover:text-[#11241d] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                在 Google Maps 開啟
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

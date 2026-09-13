import { useState, type FormEvent } from 'react';

export default function SearchForm({
  categories,
  driveTimeOptions,
  siteText,
  onSearch,
  loading,
}: {
  categories: any[];
  driveTimeOptions: any[];
  siteText: Record<string, string>;
  onSearch: (payload: { trailhead: string; keyword: string; maxMinutes: number }) => void;
  loading: boolean;
}) {
  const [trailhead, setTrailhead] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [customKeyword, setCustomKeyword] = useState('');
  const [maxMinutes, setMaxMinutes] = useState(driveTimeOptions[0]?.minutes ?? 30);

  const selectedCategory = categories.find((c) => c.id === Number(categoryId));
  const isCustom = !!selectedCategory?.is_custom;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const keyword = isCustom ? customKeyword.trim() : selectedCategory?.search_keyword || '';
    onSearch({ trailhead: trailhead.trim(), keyword, maxMinutes: Number(maxMinutes) });
  }

  return (
    <form
      className="search-form bg-white border border-[#d6ded9] shadow-sm rounded-xl p-4 sm:p-6 mb-6 transition-all"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Trailhead field */}
        <div className={`field ${isCustom ? 'md:col-span-4' : 'md:col-span-5'}`}>
          <label className="block text-xs font-semibold tracking-wider text-[#3d5247] uppercase mb-1.5">
            登山口
          </label>
          <input
            className="w-full bg-[#fafbfb] border border-[#cbd5d0] focus:border-[#1e3a2f] focus:bg-white focus:ring-2 focus:ring-[#1e3a2f]/15 rounded-lg px-3.5 py-2.5 text-base text-[#192723] outline-none transition"
            value={trailhead}
            onChange={(e) => setTrailhead(e.target.value)}
          />
        </div>

        {/* Category select */}
        <div className={`field ${isCustom ? 'md:col-span-3' : 'md:col-span-3'}`}>
          <label className="block text-xs font-semibold tracking-wider text-[#3d5247] uppercase mb-1.5">
            搜尋類型
          </label>
          <div className="relative">
            <select
              className="w-full appearance-none bg-[#fafbfb] border border-[#cbd5d0] focus:border-[#1e3a2f] focus:bg-white focus:ring-2 focus:ring-[#1e3a2f]/15 rounded-lg px-3.5 py-2.5 text-base text-[#192723] outline-none cursor-pointer transition pr-9"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#52635c]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Custom keyword input if selected */}
        {isCustom && (
          <div className="field md:col-span-2">
            <label className="block text-xs font-semibold tracking-wider text-[#3d5247] uppercase mb-1.5">
              自訂搜尋
            </label>
            <input
              className="w-full bg-[#fafbfb] border border-[#cbd5d0] focus:border-[#1e3a2f] focus:bg-white focus:ring-2 focus:ring-[#1e3a2f]/15 rounded-lg px-3.5 py-2.5 text-base text-[#192723] outline-none transition"
              value={customKeyword}
              onChange={(e) => setCustomKeyword(e.target.value)}
            />
          </div>
        )}

        {/* Drive time selector */}
        <div className={`field ${isCustom ? 'md:col-span-3' : 'md:col-span-2'}`}>
          <label className="block text-xs font-semibold tracking-wider text-[#3d5247] uppercase mb-1.5">
            車程時間
          </label>
          <div className="relative">
            <select
              className="w-full appearance-none bg-[#fafbfb] border border-[#cbd5d0] focus:border-[#1e3a2f] focus:bg-white focus:ring-2 focus:ring-[#1e3a2f]/15 rounded-lg px-3.5 py-2.5 text-base text-[#192723] outline-none cursor-pointer transition pr-9"
              value={maxMinutes}
              onChange={(e) => setMaxMinutes(e.target.value)}
            >
              {driveTimeOptions.map((d) => (
                <option key={d.id} value={d.minutes}>
                  {d.minutes} 分鐘
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#52635c]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className={`field ${isCustom ? 'md:col-span-12 lg:col-span-12' : 'md:col-span-2'}`}>
          <button
            type="submit"
            disabled={loading || !trailhead || (isCustom && !customKeyword)}
            className="w-full min-h-[44px] bg-[#1e3a2f] hover:bg-[#162c23] active:bg-[#12231c] disabled:bg-[#a4b5ad] disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm flex items-center justify-center text-center cursor-pointer text-base"
          >
            {loading ? '搜尋中...' : siteText.search_button || '搜尋'}
          </button>
        </div>
      </div>
    </form>
  );
}

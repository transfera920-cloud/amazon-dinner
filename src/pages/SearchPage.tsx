import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.ts';
import SearchForm from '../components/SearchForm.tsx';
import MapView from '../components/MapView.tsx';
import ResultsList from '../components/ResultsList.tsx';

export default function SearchPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [driveTimeOptions, setDriveTimeOptions] = useState<any[]>([]);
  const [siteText, setSiteText] = useState<Record<string, string>>({});
  const [configError, setConfigError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [origin, setOrigin] = useState<any>(null);
  const [results, setResults] = useState<any[] | null>(null); // null = no search run yet
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getCategories(), api.getDriveTimeOptions(), api.getSiteText()])
      .then(([cats, driveTimes, text]) => {
        setCategories(cats);
        setDriveTimeOptions(driveTimes);
        setSiteText(text);
      })
      .catch((err) => setConfigError(err.message));
  }, []);

  async function handleSearch(payload: { trailhead: string; keyword: string; maxMinutes: number }) {
    setLoading(true);
    setSearchError(null);
    setSelectedPlaceId(null);
    try {
      const data = await api.search(payload);
      setOrigin(data.origin);
      setResults(data.results);
    } catch (err: any) {
      // Real API/geocoding failures are shown as real errors — never
      // silently repackaged as "no results found".
      setSearchError(err.message);
      setOrigin(null);
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  if (configError) {
    return (
      <div className="min-h-screen bg-[#f5f7f6] flex items-center justify-center p-4">
        <div className="page-error bg-white border border-[#f5c2c7] text-[#842029] p-6 rounded-xl max-w-md w-full shadow-sm text-center">
          <div className="font-semibold text-base mb-1">系統設定載入失敗：{configError}</div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f7f6] flex items-center justify-center p-4">
        <div className="page-loading flex flex-col items-center gap-3 text-[#52635c] text-sm font-medium">
          <div className="w-8 h-8 border-3 border-[#1e3a2f]/20 border-t-[#1e3a2f] rounded-full animate-spin"></div>
          <div>載入中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page min-h-screen bg-[#f4f6f5] text-[#192723]">
      {/* Top bar */}
      <header className="border-b border-[#e2e8e5] bg-white sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1e3a2f] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              ▲
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#192723] truncate">
              {siteText.title || '下山慶功宴搜尋'}
            </h1>
          </div>
          <Link
            to="/admin"
            className="text-xs font-semibold text-[#52635c] hover:text-[#1e3a2f] px-3 py-1.5 rounded-md hover:bg-[#edf2ef] transition"
          >
            後台管理
          </Link>
        </div>
      </header>

      {/* Main container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Search controls */}
        <SearchForm
          categories={categories}
          driveTimeOptions={driveTimeOptions}
          siteText={siteText}
          onSearch={handleSearch}
          loading={loading}
        />

        {searchError && (
          <div className="search-error bg-[#fdf2f2] border border-[#f5c2c7] text-[#842029] p-4 rounded-xl text-sm mb-6 shadow-sm flex items-start gap-2.5">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>發生錯誤：{searchError}</div>
          </div>
        )}

        {/* Results and Map side-by-side or stacked layout */}
        {origin && results !== null && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Results column */}
            <div className="lg:col-span-5 xl:col-span-5 order-2 lg:order-1">
              <ResultsList
                results={results}
                selectedPlaceId={selectedPlaceId}
                onSelectPlace={setSelectedPlaceId}
                siteText={siteText}
              />
            </div>

            {/* Map column */}
            <div className="lg:col-span-7 xl:col-span-7 order-1 lg:order-2 lg:sticky lg:top-20">
              <MapView
                origin={origin}
                results={results}
                selectedPlaceId={selectedPlaceId}
                onSelectPlace={setSelectedPlaceId}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

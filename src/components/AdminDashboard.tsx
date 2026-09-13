import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.ts';
import CategoryManager from './CategoryManager.tsx';
import DriveTimeManager from './DriveTimeManager.tsx';

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [text, setText] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getSiteText().then(setText);
  }, []);

  async function saveText(e: FormEvent) {
    e.preventDefault();
    await api.adminUpdateSiteText(text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="admin-dashboard min-h-screen bg-[#f4f6f5] text-[#192723]">
      {/* Header */}
      <header className="border-b border-[#e2e8e5] bg-white sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs font-semibold text-[#52635c] hover:text-[#1e3a2f] flex items-center gap-1 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#192723]">
              後台管理
            </h2>
          </div>
          <button
            onClick={onLogout}
            className="text-xs font-semibold text-[#842029] hover:text-[#58151c] hover:bg-[#fdf2f2] px-3 py-1.5 rounded-md transition cursor-pointer border border-[#f5c2c7]"
          >
            登出
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <CategoryManager />
        <DriveTimeManager />

        {/* Site Text Form */}
        <div className="manager bg-white border border-[#d6ded9] shadow-xs rounded-xl p-5 sm:p-6 mb-6">
          <h3 className="text-lg font-bold text-[#192723] mb-4 tracking-tight">前台文字</h3>
          <form onSubmit={saveText} className="space-y-4">
            {Object.entries(text).map(([key, value]) => (
              <div className="field" key={key}>
                <label className="block text-xs font-semibold tracking-wider text-[#3d5247] uppercase mb-1">
                  {key}
                </label>
                <input
                  className="w-full bg-[#fafbfb] border border-[#cbd5d0] focus:border-[#1e3a2f] focus:bg-white focus:ring-2 focus:ring-[#1e3a2f]/15 rounded-lg px-3.5 py-2 text-sm text-[#192723] outline-none transition"
                  value={value}
                  onChange={(e) => setText({ ...text, [key]: e.target.value })}
                />
              </div>
            ))}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="bg-[#1e3a2f] hover:bg-[#162c23] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                儲存文字
              </button>
              {saved && (
                <span className="saved-hint text-xs font-semibold text-[#15803d] bg-[#dcfce7] px-2.5 py-1 rounded-md">
                  已儲存
                </span>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api.ts';

export default function AdminLogin({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .authStatus()
      .then((s) => setSetupRequired(s.setupRequired))
      .catch((e) => setError(e.message));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const fn = setupRequired ? api.authSetup : api.authLogin;
      const { token } = await fn({ username, password });
      localStorage.setItem('admin_token', token);
      onLoggedIn();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (setupRequired === null) {
    return (
      <div className="min-h-screen bg-[#f4f6f5] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-[#52635c] text-sm">
          <div className="w-8 h-8 border-3 border-[#1e3a2f]/20 border-t-[#1e3a2f] rounded-full animate-spin"></div>
          <div>載入中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f5] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#d6ded9] shadow-sm rounded-2xl p-6 sm:p-8">
        <form className="admin-login" onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold text-[#192723] mb-2 tracking-tight">
            {setupRequired ? '建立管理員帳號' : '管理員登入'}
          </h2>
          {setupRequired && (
            <p className="hint text-xs sm:text-sm text-[#52635c] mb-6 leading-relaxed bg-[#f0f6f3] p-3 rounded-lg border border-[#d6ded9]">
              第一次使用，請自行設定帳號密碼（密碼至少 8 碼）。
            </p>
          )}

          <div className="field mb-4">
            <label className="block text-xs font-semibold tracking-wider text-[#3d5247] uppercase mb-1.5">
              帳號
            </label>
            <input
              className="w-full bg-[#fafbfb] border border-[#cbd5d0] focus:border-[#1e3a2f] focus:bg-white focus:ring-2 focus:ring-[#1e3a2f]/15 rounded-lg px-3.5 py-2.5 text-base text-[#192723] outline-none transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="field mb-5">
            <label className="block text-xs font-semibold tracking-wider text-[#3d5247] uppercase mb-1.5">
              密碼
            </label>
            <input
              type="password"
              className="w-full bg-[#fafbfb] border border-[#cbd5d0] focus:border-[#1e3a2f] focus:bg-white focus:ring-2 focus:ring-[#1e3a2f]/15 rounded-lg px-3.5 py-2.5 text-base text-[#192723] outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="error bg-[#fdf2f2] border border-[#f5c2c7] text-[#842029] p-3 rounded-lg text-xs sm:text-sm mb-5">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#1e3a2f] hover:bg-[#162c23] text-white font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer text-base"
          >
            {setupRequired ? '建立帳號並登入' : '登入'}
          </button>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api.ts';

export default function DriveTimeManager() {
  const [items, setItems] = useState<any[]>([]);
  const [newMinutes, setNewMinutes] = useState('');
  const [error, setError] = useState<string | null>(null);

  function reload() {
    api
      .adminGetDriveTimeOptions()
      .then(setItems)
      .catch((e) => setError(e.message));
  }
  useEffect(reload, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    try {
      await api.adminCreateDriveTimeOption({ minutes: Number(newMinutes), sort_order: items.length });
      setNewMinutes('');
      reload();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function toggleEnabled(item: any) {
    await api.adminUpdateDriveTimeOption(item.id, { enabled: item.enabled ? 0 : 1 });
    reload();
  }

  async function updateMinutes(item: any, minutes: string | number) {
    await api.adminUpdateDriveTimeOption(item.id, { minutes: Number(minutes) });
    reload();
  }

  async function remove(id: string | number) {
    if (!confirm('確定要刪除這個車程時間選項嗎？')) return;
    await api.adminDeleteDriveTimeOption(id);
    reload();
  }

  return (
    <div className="manager bg-white border border-[#d6ded9] shadow-xs rounded-xl p-5 sm:p-6 mb-6">
      <h3 className="text-lg font-bold text-[#192723] mb-4 tracking-tight">車程時間選項</h3>
      {error && (
        <div className="error bg-[#fdf2f2] border border-[#f5c2c7] text-[#842029] p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}
      <div className="overflow-x-auto mb-5 border border-[#e2e8e5] rounded-lg">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#f7faf8] border-b border-[#e2e8e5] text-[#3d5247]">
              <th className="py-3 px-3.5 font-semibold">分鐘數</th>
              <th className="py-3 px-3.5 font-semibold">啟用</th>
              <th className="py-3 px-3.5 font-semibold text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eef2ef]">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-[#fafbfb] transition-colors">
                <td className="p-3">
                  <input
                    type="number"
                    className="w-24 bg-white border border-[#cbd5d0] focus:border-[#1e3a2f] rounded px-2.5 py-1.5 text-sm text-[#192723] outline-none"
                    defaultValue={item.minutes}
                    onBlur={(e) => updateMinutes(item, e.target.value)}
                  />
                </td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-[#1e3a2f] focus:ring-[#1e3a2f] cursor-pointer"
                    checked={!!item.enabled}
                    onChange={() => toggleEnabled(item)}
                  />
                </td>
                <td className="p-3 text-right">
                  <button
                    className="text-xs font-medium text-[#991b1b] hover:text-[#7f1d1d] hover:bg-[#fee2e2] px-2.5 py-1 rounded transition cursor-pointer"
                    onClick={() => remove(item.id)}
                  >
                    刪除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleAdd} className="add-row flex flex-wrap gap-2.5 items-center bg-[#f7faf8] p-3 rounded-lg border border-[#e2e8e5]">
        <input
          type="number"
          className="bg-white border border-[#cbd5d0] focus:border-[#1e3a2f] rounded-lg px-3 py-2 text-sm text-[#192723] outline-none w-32"
          placeholder="分鐘數"
          value={newMinutes}
          onChange={(e) => setNewMinutes(e.target.value)}
        />
        <button
          type="submit"
          className="bg-[#1e3a2f] hover:bg-[#162c23] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          新增選項
        </button>
      </form>
    </div>
  );
}

import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api.ts';

export default function CategoryManager() {
  const [items, setItems] = useState<any[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newIsCustom, setNewIsCustom] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    api
      .adminGetCategories()
      .then(setItems)
      .catch((e) => setError(e.message));
  }
  useEffect(reload, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    try {
      await api.adminCreateCategory({
        label: newLabel,
        search_keyword: newIsCustom ? '' : newKeyword,
        is_custom: newIsCustom,
        sort_order: items.length,
      });
      setNewLabel('');
      setNewKeyword('');
      setNewIsCustom(false);
      reload();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function toggleEnabled(item: any) {
    await api.adminUpdateCategory(item.id, { enabled: item.enabled ? 0 : 1 });
    reload();
  }

  async function updateField(item: any, field: string, value: any) {
    await api.adminUpdateCategory(item.id, { [field]: value });
    reload();
  }

  async function remove(id: string | number) {
    if (!confirm('確定要刪除這個類別嗎？')) return;
    await api.adminDeleteCategory(id);
    reload();
  }

  return (
    <div className="manager bg-white border border-[#d6ded9] shadow-xs rounded-xl p-5 sm:p-6 mb-6">
      <h3 className="text-lg font-bold text-[#192723] mb-4 tracking-tight">搜尋類別</h3>
      {error && (
        <div className="error bg-[#fdf2f2] border border-[#f5c2c7] text-[#842029] p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}
      <div className="overflow-x-auto mb-5 border border-[#e2e8e5] rounded-lg">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#f7faf8] border-b border-[#e2e8e5] text-[#3d5247]">
              <th className="py-3 px-3.5 font-semibold">名稱</th>
              <th className="py-3 px-3.5 font-semibold">搜尋關鍵字</th>
              <th className="py-3 px-3.5 font-semibold">自訂欄位</th>
              <th className="py-3 px-3.5 font-semibold">啟用</th>
              <th className="py-3 px-3.5 font-semibold">順序</th>
              <th className="py-3 px-3.5 font-semibold text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eef2ef]">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-[#fafbfb] transition-colors">
                <td className="p-3">
                  <input
                    className="w-full max-w-[140px] bg-white border border-[#cbd5d0] focus:border-[#1e3a2f] rounded px-2.5 py-1.5 text-sm text-[#192723] outline-none"
                    defaultValue={item.label}
                    onBlur={(e) => updateField(item, 'label', e.target.value)}
                  />
                </td>
                <td className="p-3">
                  <input
                    className="w-full max-w-[180px] bg-white border border-[#cbd5d0] disabled:bg-[#edf2ef] disabled:text-[#8aa398] focus:border-[#1e3a2f] rounded px-2.5 py-1.5 text-sm text-[#192723] outline-none"
                    defaultValue={item.search_keyword}
                    disabled={!!item.is_custom}
                    onBlur={(e) => updateField(item, 'search_keyword', e.target.value)}
                  />
                </td>
                <td className="p-3 text-[#52635c] font-medium">{item.is_custom ? '是' : '否'}</td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-[#1e3a2f] focus:ring-[#1e3a2f] cursor-pointer"
                    checked={!!item.enabled}
                    onChange={() => toggleEnabled(item)}
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    className="w-16 bg-white border border-[#cbd5d0] focus:border-[#1e3a2f] rounded px-2 py-1.5 text-sm text-[#192723] outline-none"
                    defaultValue={item.sort_order}
                    onBlur={(e) => updateField(item, 'sort_order', Number(e.target.value))}
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
          className="bg-white border border-[#cbd5d0] focus:border-[#1e3a2f] rounded-lg px-3 py-2 text-sm text-[#192723] outline-none min-w-[130px]"
          placeholder="名稱"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
        />
        <input
          className="bg-white border border-[#cbd5d0] disabled:bg-[#edf2ef] disabled:text-[#8aa398] focus:border-[#1e3a2f] rounded-lg px-3 py-2 text-sm text-[#192723] outline-none min-w-[150px]"
          placeholder="搜尋關鍵字"
          value={newKeyword}
          disabled={newIsCustom}
          onChange={(e) => setNewKeyword(e.target.value)}
        />
        <label className="flex items-center gap-1.5 text-xs text-[#3d5247] cursor-pointer px-1">
          <input
            type="checkbox"
            className="w-4 h-4 rounded text-[#1e3a2f] focus:ring-[#1e3a2f]"
            checked={newIsCustom}
            onChange={(e) => setNewIsCustom(e.target.checked)}
          />
          設為「自訂」欄位
        </label>
        <button
          type="submit"
          className="bg-[#1e3a2f] hover:bg-[#162c23] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer ml-auto"
        >
          新增類別
        </button>
      </form>
    </div>
  );
}

// components/InventoryManager.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { StorageService } from '../services/storage';

type RawRoll = {
  id: string;
  widthMm: number;
  weightKg: number;
  createdAt: string;
};

const STORAGE_KEY = 'nbps.raw_rolls.v1';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toNumberSafe(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

const InventoryManager: React.FC = () => {
  const [widthMm, setWidthMm] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [items, setItems] = useState<RawRoll[]>(() =>
    StorageService.get<RawRoll[]>(STORAGE_KEY, [])
  );

  const [editId, setEditId] = useState<string | null>(null);
  const [editWidthMm, setEditWidthMm] = useState<string>('');
  const [editWeightKg, setEditWeightKg] = useState<string>('');

  useEffect(() => {
    StorageService.set(STORAGE_KEY, items);
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return items;
    return items.filter((x) =>
      `${x.widthMm}`.includes(q) || `${x.weightKg}`.includes(q)
    );
  }, [items, query]);

  function validate(w: number, kg: number): string | null {
    if (!Number.isFinite(w) || w <= 0) return 'أدخل عرض صحيح بالمليمتر (> 0).';
    if (!Number.isFinite(kg) || kg <= 0) return 'أدخل كمية صحيحة بالكيلو (> 0).';
    return null;
  }

  function addItem() {
    const w = toNumberSafe(widthMm);
    const kg = toNumberSafe(weightKg);
    const err = validate(w, kg);
    if (err) {
      alert(err);
      return;
    }

    const newItem: RawRoll = {
      id: generateId(),
      widthMm: w,
      weightKg: kg,
      createdAt: new Date().toISOString(),
    };

    setItems((prev) => [newItem, ...prev]);
    setWidthMm('');
    setWeightKg('');
  }

  function startEdit(item: RawRoll) {
    setEditId(item.id);
    setEditWidthMm(String(item.widthMm));
    setEditWeightKg(String(item.weightKg));
  }

  function cancelEdit() {
    setEditId(null);
    setEditWidthMm('');
    setEditWeightKg('');
  }

  function saveEdit() {
    if (!editId) return;

    const w = toNumberSafe(editWidthMm);
    const kg = toNumberSafe(editWeightKg);
    const err = validate(w, kg);
    if (err) {
      alert(err);
      return;
    }

    setItems((prev) =>
      prev.map((x) =>
        x.id === editId ? { ...x, widthMm: w, weightKg: kg } : x
      )
    );
    cancelEdit();
  }

  function deleteItem(id: string) {
    const ok = confirm('هل أنت متأكد من حذف هذا السجل؟');
    if (!ok) return;
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div style={{ padding: 24, direction: 'rtl' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700 }}>المخزون - الرولات الخام</h2>

      <div
        style={{
          marginTop: 16,
          padding: 16,
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          background: '#fff',
        }}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 220 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>عرض الرول (mm)</label>
            <input
              value={widthMm}
              onChange={(e) => setWidthMm(e.target.value)}
              placeholder="مثال: 1400"
              inputMode="numeric"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #d1d5db',
              }}
            />
          </div>

          <div style={{ minWidth: 220 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>الكمية (kg)</label>
            <input
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="مثال: 500"
              inputMode="numeric"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #d1d5db',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button
              onClick={addItem}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: '1px solid #111827',
                background: '#111827',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              إضافة
            </button>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>بحث</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالعرض أو الكمية..."
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid #d1d5db',
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={{ textAlign: 'right', padding: 12, borderBottom: '1px solid #e5e7eb' }}>العرض (mm)</th>
              <th style={{ textAlign: 'right', padding: 12, borderBottom: '1px solid #e5e7eb' }}>الكمية (kg)</th>
              <th style={{ textAlign: 'right', padding: 12, borderBottom: '1px solid #e5e7eb' }}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: 12, color: '#6b7280' }}>
                  لا توجد بيانات.
                </td>
              </tr>
            ) : (
              filtered.map((x) => (
                <tr key={x.id}>
                  <td style={{ padding: 12, borderBottom: '1px solid #f3f4f6' }}>{x.widthMm}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #f3f4f6' }}>{x.weightKg}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #f3f4f6' }}>
                    <button
                      onClick={() => startEdit(x)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 10,
                        border: '1px solid #d1d5db',
                        background: '#fff',
                        cursor: 'pointer',
                        marginLeft: 8,
                      }}
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => deleteItem(x.id)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 10,
                        border: '1px solid #ef4444',
                        background: '#fff',
                        color: '#ef4444',
                        cursor: 'pointer',
                      }}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editId && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            background: '#fff',
          }}
        >
          <h3 style={{ marginTop: 0 }}>تعديل سجل</h3>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ minWidth: 220 }}>
              <label style={{ display: 'block', marginBottom: 6 }}>عرض الرول (mm)</label>
              <input
                value={editWidthMm}
                onChange={(e) => setEditWidthMm(e.target.value)}
                inputMode="numeric"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #d1d5db',
                }}
              />
            </div>

            <div style={{ minWidth: 220 }}>
              <label style={{ display: 'block', marginBottom: 6 }}>الكمية (kg)</label>
              <input
                value={editWeightKg}
                onChange={(e) => setEditWeightKg(e.target.value)}
                inputMode="numeric"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #d1d5db',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'end', gap: 8 }}>
              <button
                onClick={saveEdit}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: '1px solid #111827',
                  background: '#111827',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                حفظ
              </button>
              <button
                onClick={cancelEdit}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;

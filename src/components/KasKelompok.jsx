import React, { useMemo, useState } from 'react'
import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { Plus, Trash2 } from 'lucide-react'
import { formatRupiah, formatDateShort } from '../utils'

export default function KasKelompok({ kas }) {
  const [form, setForm] = useState({ tanggal: new Date().toISOString().slice(0, 10), keterangan: '', masuk: '', keluar: '' })

  const sorted = useMemo(
    () => [...kas].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal)),
    [kas]
  )

  const withRunning = useMemo(() => {
    let saldo = 0
    return sorted.map((r) => {
      saldo += (Number(r.masuk) || 0) - (Number(r.keluar) || 0)
      return { ...r, saldoBerjalan: saldo }
    })
  }, [sorted])

  const totalMasuk = kas.reduce((s, r) => s + (Number(r.masuk) || 0), 0)
  const totalKeluar = kas.reduce((s, r) => s + (Number(r.keluar) || 0), 0)

  async function handleAdd() {
    if (!form.keterangan.trim()) return
    await addDoc(collection(db, 'kas'), {
      tanggal: new Date(form.tanggal).toISOString(),
      keterangan: form.keterangan.trim(),
      masuk: Number(form.masuk) || 0,
      keluar: Number(form.keluar) || 0,
    })
    setForm({ tanggal: new Date().toISOString().slice(0, 10), keterangan: '', masuk: '', keluar: '' })
  }

  async function handleDelete(id) {
    if (!confirm('Hapus catatan kas ini?')) return
    await deleteDoc(doc(db, 'kas', id))
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <p className="text-[10.5px] text-gray-400">Saldo Kas</p>
          <p className="font-mono-data text-base font-semibold text-prm-700">{formatRupiah(totalMasuk - totalKeluar)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <p className="text-[10.5px] text-gray-400">Masuk / Keluar</p>
          <p className="font-mono-data text-[13px]">
            <span className="text-good">{formatRupiah(totalMasuk)}</span> / <span className="text-warn">{formatRupiah(totalKeluar)}</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 space-y-2">
        <p className="text-xs font-medium text-prm-700">Catat Transaksi Kas</p>
        <input
          type="date"
          value={form.tanggal}
          onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm"
        />
        <input
          value={form.keterangan}
          onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
          placeholder="Keterangan (misal: beli vitamin ayam)"
          className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={form.masuk}
            onChange={(e) => setForm({ ...form, masuk: e.target.value })}
            placeholder="Uang masuk"
            className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm font-mono-data"
          />
          <input
            type="number"
            inputMode="numeric"
            value={form.keluar}
            onChange={(e) => setForm({ ...form, keluar: e.target.value })}
            placeholder="Uang keluar"
            className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm font-mono-data"
          />
        </div>
        <button onClick={handleAdd} className="w-full bg-prm-600 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-1.5">
          <Plus size={15} /> Tambah Catatan
        </button>
      </div>

      <div className="space-y-1.5">
        {[...withRunning].reverse().map((r) => (
          <div key={r.id} className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100 flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] text-ink truncate">{r.keterangan}</p>
              <p className="text-[10px] text-gray-400">{formatDateShort(r.tanggal)} · Saldo: {formatRupiah(r.saldoBerjalan)}</p>
            </div>
            <div className="text-right font-mono-data text-[12px]">
              {r.masuk > 0 && <p className="text-good">+{formatRupiah(r.masuk)}</p>}
              {r.keluar > 0 && <p className="text-warn">-{formatRupiah(r.keluar)}</p>}
            </div>
            <button onClick={() => handleDelete(r.id)} className="text-gray-300 p-1">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {withRunning.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-6">Belum ada transaksi kas.</p>
        )}
      </div>
    </div>
  )
}

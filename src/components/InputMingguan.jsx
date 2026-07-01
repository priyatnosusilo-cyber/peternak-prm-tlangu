import React, { useMemo, useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatRupiah, formatDateShort, getWeekInfo, startOfWeek } from '../utils'

export default function InputMingguan({ anggota, inputPakan, hargaPakan }) {
  const [weekOffset, setWeekOffset] = useState(0)

  const weekStart = useMemo(() => {
    const base = startOfWeek(new Date().toISOString())
    base.setDate(base.getDate() + weekOffset * 7)
    return base
  }, [weekOffset])

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 6)
    return d
  }, [weekStart])

  const { week, year } = getWeekInfo(weekStart.toISOString())
  const docIdFor = (anggotaId) => `${anggotaId}_${year}-W${String(week).padStart(2, '0')}`

  const rows = anggota.map((a) => {
    const id = docIdFor(a.id)
    const existing = inputPakan.find((r) => r.id === id)
    return {
      anggota: a,
      docId: id,
      kg: existing?.kg ?? '',
      bayar: existing?.bayar ?? '',
    }
  })

  const [localValues, setLocalValues] = useState({})

  function getVal(docId, field, fallback) {
    if (localValues[docId]?.[field] !== undefined) return localValues[docId][field]
    return fallback
  }

  async function handleSave(docId, anggotaId, field, value) {
    setLocalValues((prev) => ({ ...prev, [docId]: { ...prev[docId], [field]: value } }))
    const row = rows.find((r) => r.docId === docId)
    const kg = field === 'kg' ? value : getVal(docId, 'kg', row.kg)
    const bayar = field === 'bayar' ? value : getVal(docId, 'bayar', row.bayar)
    await setDoc(doc(db, 'inputPakan', docId), {
      anggotaId,
      tanggal: weekStart.toISOString(),
      minggu: week,
      tahun: year,
      hargaPerKg: hargaPakan,
      kg: Number(kg) || 0,
      bayar: Number(bayar) || 0,
    })
  }

  let totalKg = 0, totalHarga = 0, totalBayar = 0
  rows.forEach((r) => {
    const kg = Number(getVal(r.docId, 'kg', r.kg)) || 0
    const bayar = Number(getVal(r.docId, 'bayar', r.bayar)) || 0
    totalKg += kg
    totalHarga += kg * hargaPakan
    totalBayar += bayar
  })
  const totalSaldo = totalBayar - totalHarga

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between">
        <button onClick={() => setWeekOffset((w) => w - 1)} className="p-1.5 text-prm-600">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-xs font-medium text-prm-700">Minggu ke-{week}, {year}</p>
          <p className="text-[10.5px] text-gray-400">
            {formatDateShort(weekStart)} – {formatDateShort(weekEnd)}
          </p>
        </div>
        <button onClick={() => setWeekOffset((w) => w + 1)} className="p-1.5 text-prm-600">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="bg-prm-50 rounded-lg px-3 py-2 text-[11px] text-prm-700 flex justify-between">
        <span>Harga pakan berlaku:</span>
        <span className="font-mono-data font-medium">{formatRupiah(hargaPakan)}/kg</span>
      </div>

      <div className="space-y-2">
        {rows.map((r) => {
          const kg = getVal(r.docId, 'kg', r.kg)
          const bayar = getVal(r.docId, 'bayar', r.bayar)
          const harga = (Number(kg) || 0) * hargaPakan
          const saldo = (Number(bayar) || 0) - harga
          return (
            <div key={r.docId} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <p className="text-[13px] font-medium text-ink mb-2">{r.anggota.nama}</p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-[10px] text-gray-400">Pakan (kg)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={kg}
                    onChange={(e) => handleSave(r.docId, r.anggota.id, 'kg', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm font-mono-data focus:outline-none focus:ring-2 focus:ring-prm-300"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400">Bayar (Rp)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={bayar}
                    onChange={(e) => handleSave(r.docId, r.anggota.id, 'bayar', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm font-mono-data focus:outline-none focus:ring-2 focus:ring-prm-300"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-gray-500 border-t border-gray-100 pt-2">
                <span>Harga: <span className="font-mono-data">{formatRupiah(harga)}</span></span>
                <span className={saldo >= 0 ? 'text-good font-medium' : 'text-warn font-medium'}>
                  Saldo: {formatRupiah(saldo)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-prm-700 text-white rounded-xl p-3.5 shadow-sm">
        <p className="text-[11px] text-prm-200 mb-1.5">Total minggu ini</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] text-prm-200">Kg</p>
            <p className="font-mono-data text-sm font-semibold">{totalKg.toLocaleString('id-ID')}</p>
          </div>
          <div>
            <p className="text-[10px] text-prm-200">Harga</p>
            <p className="font-mono-data text-sm font-semibold">{formatRupiah(totalHarga)}</p>
          </div>
          <div>
            <p className="text-[10px] text-prm-200">Saldo</p>
            <p className={`font-mono-data text-sm font-semibold ${totalSaldo >= 0 ? 'text-green-300' : 'text-orange-300'}`}>
              {formatRupiah(totalSaldo)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Wheat, HandCoins, PiggyBank, TrendingUp } from 'lucide-react'
import { formatRupiah, formatKg } from '../utils'

export default function Dashboard({ inputPakan, kas, anggota }) {
  const totals = useMemo(() => {
    const totalKg = inputPakan.reduce((s, r) => s + (Number(r.kg) || 0), 0)
    const totalPembelian = inputPakan.reduce((s, r) => s + (Number(r.kg) || 0) * (Number(r.hargaPerKg) || 0), 0)
    const totalPembayaran = inputPakan.reduce((s, r) => s + (Number(r.bayar) || 0), 0)
    const saldoKelompok = totalPembayaran - totalPembelian
    const kasMasuk = kas.reduce((s, r) => s + (Number(r.masuk) || 0), 0)
    const kasKeluar = kas.reduce((s, r) => s + (Number(r.keluar) || 0), 0)
    return { totalKg, totalPembelian, totalPembayaran, saldoKelompok, saldoKas: kasMasuk - kasKeluar }
  }, [inputPakan, kas])

  const chartData = useMemo(() => {
    const byMonth = {}
    inputPakan.forEach((r) => {
      const d = new Date(r.tanggal)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!byMonth[key]) byMonth[key] = { key, pembelian: 0, pembayaran: 0 }
      byMonth[key].pembelian += (Number(r.kg) || 0) * (Number(r.hargaPerKg) || 0)
      byMonth[key].pembayaran += Number(r.bayar) || 0
    })
    return Object.values(byMonth)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6)
      .map((r) => ({ ...r, label: r.key.slice(5) + '/' + r.key.slice(2, 4) }))
  }, [inputPakan])

  const cards = [
    { label: 'Total Pembelian Pakan', value: formatKg(totals.totalKg), sub: formatRupiah(totals.totalPembelian), icon: Wheat, tone: 'prm' },
    { label: 'Total Pembayaran Anggota', value: formatRupiah(totals.totalPembayaran), sub: `${anggota.length} anggota aktif`, icon: HandCoins, tone: 'wheat' },
    { label: 'Saldo Kelompok (Pakan)', value: formatRupiah(totals.saldoKelompok), sub: totals.saldoKelompok >= 0 ? 'Lunas / surplus' : 'Kurang bayar', icon: TrendingUp, tone: totals.saldoKelompok >= 0 ? 'good' : 'warn' },
    { label: 'Saldo Kas Kelompok', value: formatRupiah(totals.saldoKas), sub: 'Kas di luar pakan', icon: PiggyBank, tone: 'prm' },
  ]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5">
        {cards.map((c) => {
          const Icon = c.icon
          const toneClass = {
            prm: 'bg-prm-50 text-prm-700',
            wheat: 'bg-wheat-50 text-wheat-400',
            good: 'bg-green-50 text-good',
            warn: 'bg-orange-50 text-warn',
          }[c.tone]
          return (
            <div key={c.label} className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${toneClass}`}>
                <Icon size={16} />
              </div>
              <p className="text-[11px] text-gray-500 leading-tight mb-1">{c.label}</p>
              <p className="font-mono-data text-[15px] font-semibold text-ink leading-tight">{c.value}</p>
              <p className="text-[10.5px] text-gray-400 mt-0.5">{c.sub}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100">
        <p className="text-xs font-medium text-prm-700 mb-2">Pembelian vs Pembayaran (6 bulan)</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#EEF4FA" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={40} />
            <Tooltip formatter={(v) => formatRupiah(v)} contentStyle={{ fontSize: 11 }} />
            <Bar dataKey="pembelian" name="Pembelian" fill="#245D95" radius={[3, 3, 0, 0]} />
            <Bar dataKey="pembayaran" name="Pembayaran" fill="#D6AF63" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

import React, { useMemo, useState } from 'react'
import { FileSpreadsheet, FileDown } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatRupiah, formatKg, BULAN } from '../utils'
import { logoBase64 } from '../assets/logoBase64'

export default function Laporan({ anggota, inputPakan, kas }) {
  const [mode, setMode] = useState('bulanan') // bulanan | tahunan
  const now = new Date()
  const [bulan, setBulan] = useState(now.getMonth())
  const [tahun, setTahun] = useState(now.getFullYear())

  const tahunList = useMemo(() => {
    const years = new Set(inputPakan.map((r) => new Date(r.tanggal).getFullYear()))
    years.add(now.getFullYear())
    return Array.from(years).sort()
  }, [inputPakan])

  const filtered = useMemo(() => {
    return inputPakan.filter((r) => {
      const d = new Date(r.tanggal)
      if (mode === 'bulanan') return d.getFullYear() === tahun && d.getMonth() === bulan
      return d.getFullYear() === tahun
    })
  }, [inputPakan, mode, bulan, tahun])

  const kasFiltered = useMemo(() => {
    return kas.filter((r) => {
      const d = new Date(r.tanggal)
      if (mode === 'bulanan') return d.getFullYear() === tahun && d.getMonth() === bulan
      return d.getFullYear() === tahun
    })
  }, [kas, mode, bulan, tahun])

  const perAnggota = useMemo(() => {
    return anggota.map((a) => {
      const rows = filtered.filter((r) => r.anggotaId === a.id)
      const totalKg = rows.reduce((s, r) => s + (Number(r.kg) || 0), 0)
      const totalPembelian = rows.reduce((s, r) => s + (Number(r.kg) || 0) * (Number(r.hargaPerKg) || 0), 0)
      const totalPembayaran = rows.reduce((s, r) => s + (Number(r.bayar) || 0), 0)
      return { nama: a.nama, totalKg, totalPembelian, totalPembayaran, saldo: totalPembayaran - totalPembelian }
    })
  }, [anggota, filtered])

  const grand = perAnggota.reduce(
    (acc, r) => ({
      kg: acc.kg + r.totalKg,
      pembelian: acc.pembelian + r.totalPembelian,
      pembayaran: acc.pembayaran + r.totalPembayaran,
      saldo: acc.saldo + r.saldo,
    }),
    { kg: 0, pembelian: 0, pembayaran: 0, saldo: 0 }
  )
  const kasMasuk = kasFiltered.reduce((s, r) => s + (Number(r.masuk) || 0), 0)
  const kasKeluar = kasFiltered.reduce((s, r) => s + (Number(r.keluar) || 0), 0)

  const periodLabel = mode === 'bulanan' ? `${BULAN[bulan]} ${tahun}` : `Tahun ${tahun}`

  function exportExcel() {
    const wb = XLSX.utils.book_new()
    const rows = [
      ['LAPORAN PETERNAKAN BINAAN PRM TLANGU SUKOREJO'],
      [`Periode: ${periodLabel}`],
      [],
      ['Nama', 'Total Kg', 'Total Pembelian', 'Total Pembayaran', 'Saldo', 'Status'],
      ...perAnggota.map((r) => [r.nama, r.totalKg, r.totalPembelian, r.totalPembayaran, r.saldo, r.saldo >= 0 ? 'Lunas' : 'Kurang Bayar']),
      [],
      ['TOTAL', grand.kg, grand.pembelian, grand.pembayaran, grand.saldo, ''],
      [],
      ['Kas Kelompok'],
      ['Uang Masuk', kasMasuk],
      ['Uang Keluar', kasKeluar],
      ['Saldo Kas', kasMasuk - kasKeluar],
    ]
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 14 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan')
    XLSX.writeFile(wb, `Laporan-Peternakan-${periodLabel.replace(/\s/g, '-')}.xlsx`)
  }

  function exportPDF() {
    const pdf = new jsPDF()
    pdf.addImage(logoBase64, 'PNG', 14, 10, 18, 18)
    pdf.setFontSize(13)
    pdf.text('Peternakan Binaan PRM Tlangu Sukorejo', 36, 17)
    pdf.setFontSize(10)
    pdf.setTextColor(90)
    pdf.text(`Laporan Periode: ${periodLabel}`, 36, 23)
    pdf.setTextColor(0)

    autoTable(pdf, {
      startY: 34,
      head: [['Nama', 'Total Kg', 'Pembelian', 'Pembayaran', 'Saldo', 'Status']],
      body: perAnggota.map((r) => [
        r.nama,
        formatKg(r.totalKg),
        formatRupiah(r.totalPembelian),
        formatRupiah(r.totalPembayaran),
        formatRupiah(r.saldo),
        r.saldo >= 0 ? 'Lunas' : 'Kurang Bayar',
      ]),
      foot: [['TOTAL', formatKg(grand.kg), formatRupiah(grand.pembelian), formatRupiah(grand.pembayaran), formatRupiah(grand.saldo), '']],
      headStyles: { fillColor: [36, 93, 149] },
      footStyles: { fillColor: [238, 244, 250], textColor: [20, 30, 40] },
      styles: { fontSize: 9 },
    })

    const y = pdf.lastAutoTable.finalY + 8
    pdf.setFontSize(10)
    pdf.text('Kas Kelompok', 14, y)
    autoTable(pdf, {
      startY: y + 3,
      head: [['Uang Masuk', 'Uang Keluar', 'Saldo Kas']],
      body: [[formatRupiah(kasMasuk), formatRupiah(kasKeluar), formatRupiah(kasMasuk - kasKeluar)]],
      headStyles: { fillColor: [214, 175, 99] },
      styles: { fontSize: 9 },
    })

    pdf.save(`Laporan-Peternakan-${periodLabel.replace(/\s/g, '-')}.pdf`)
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <div className="flex gap-2 mb-2.5">
          <button
            onClick={() => setMode('bulanan')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${mode === 'bulanan' ? 'bg-prm-600 text-white' : 'bg-prm-50 text-prm-700'}`}
          >
            Rekap Bulanan
          </button>
          <button
            onClick={() => setMode('tahunan')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${mode === 'tahunan' ? 'bg-prm-600 text-white' : 'bg-prm-50 text-prm-700'}`}
          >
            Rekap Tahunan
          </button>
        </div>
        <div className="flex gap-2">
          {mode === 'bulanan' && (
            <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
              {BULAN.map((b, i) => <option key={b} value={i}>{b}</option>)}
            </select>
          )}
          <select value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
            {tahunList.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100">
        <p className="text-xs font-medium text-prm-700 mb-2">{periodLabel}</p>
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="py-1.5 font-medium">Nama</th>
              <th className="py-1.5 font-medium text-right">Kg</th>
              <th className="py-1.5 font-medium text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {perAnggota.map((r) => (
              <tr key={r.nama} className="border-b border-gray-50">
                <td className="py-1.5">{r.nama}</td>
                <td className="py-1.5 text-right font-mono-data">{r.totalKg}</td>
                <td className={`py-1.5 text-right font-mono-data ${r.saldo >= 0 ? 'text-good' : 'text-warn'}`}>{formatRupiah(r.saldo)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td className="py-1.5">TOTAL</td>
              <td className="py-1.5 text-right font-mono-data">{grand.kg}</td>
              <td className="py-1.5 text-right font-mono-data">{formatRupiah(grand.saldo)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <button onClick={exportExcel} className="bg-white border border-prm-200 text-prm-700 rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 shadow-sm">
          <FileSpreadsheet size={16} /> Excel
        </button>
        <button onClick={exportPDF} className="bg-prm-600 text-white rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 shadow-sm">
          <FileDown size={16} /> PDF
        </button>
      </div>
    </div>
  )
}

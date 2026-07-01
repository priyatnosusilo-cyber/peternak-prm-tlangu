import React, { useMemo, useState } from 'react'
import { doc, addDoc, deleteDoc, updateDoc, collection } from 'firebase/firestore'
import { db } from '../firebase'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import { formatRupiah, formatKg } from '../utils'

export default function RekapAnggota({ anggota, inputPakan }) {
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  const recap = useMemo(() => {
    return anggota.map((a) => {
      const rows = inputPakan.filter((r) => r.anggotaId === a.id)
      const totalKg = rows.reduce((s, r) => s + (Number(r.kg) || 0), 0)
      const totalPembelian = rows.reduce((s, r) => s + (Number(r.kg) || 0) * (Number(r.hargaPerKg) || 0), 0)
      const totalPembayaran = rows.reduce((s, r) => s + (Number(r.bayar) || 0), 0)
      const saldoAkhir = totalPembayaran - totalPembelian
      return { ...a, totalKg, totalPembelian, totalPembayaran, saldoAkhir }
    })
  }, [anggota, inputPakan])

  async function handleAdd() {
    if (!newName.trim()) return
    await addDoc(collection(db, 'anggota'), { nama: newName.trim() })
    setNewName('')
  }

  async function handleDelete(id) {
    if (!confirm('Hapus anggota ini? Data input mingguan lama tetap tersimpan.')) return
    await deleteDoc(doc(db, 'anggota', id))
  }

  async function handleSaveEdit() {
    if (!editName.trim()) return
    await updateDoc(doc(db, 'anggota', editingId), { nama: editName.trim() })
    setEditingId(null)
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <p className="text-xs font-medium text-prm-700 mb-2">Tambah Anggota</p>
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nama anggota"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-prm-300"
          />
          <button onClick={handleAdd} className="bg-prm-600 text-white rounded-lg px-3">
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {recap.map((r) => (
          <div key={r.id} className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              {editingId === r.id ? (
                <div className="flex items-center gap-1.5 flex-1">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 border border-prm-300 rounded-lg px-2 py-1 text-sm"
                    autoFocus
                  />
                  <button onClick={handleSaveEdit} className="text-good p-1"><Check size={16} /></button>
                  <button onClick={() => setEditingId(null)} className="text-gray-400 p-1"><X size={16} /></button>
                </div>
              ) : (
                <p className="text-[14px] font-medium text-ink">{r.nama}</p>
              )}
              {editingId !== r.id && (
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditingId(r.id); setEditName(r.nama) }}
                    className="text-gray-400 p-1"
                  >
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="text-warn p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-y-1.5 text-[11.5px]">
              <span className="text-gray-500">Total kg</span>
              <span className="text-right font-mono-data">{formatKg(r.totalKg)}</span>
              <span className="text-gray-500">Total pembelian</span>
              <span className="text-right font-mono-data">{formatRupiah(r.totalPembelian)}</span>
              <span className="text-gray-500">Total pembayaran</span>
              <span className="text-right font-mono-data">{formatRupiah(r.totalPembayaran)}</span>
              <span className="text-gray-500 font-medium">Saldo akhir</span>
              <span className={`text-right font-mono-data font-semibold ${r.saldoAkhir >= 0 ? 'text-good' : 'text-warn'}`}>
                {formatRupiah(r.saldoAkhir)}
              </span>
            </div>
            <div className="mt-2 flex justify-end">
              <span className={
                'text-[10.5px] font-medium px-2 py-0.5 rounded-full ' +
                (r.saldoAkhir >= 0 ? 'bg-green-50 text-good' : 'bg-orange-50 text-warn')
              }>
                {r.saldoAkhir >= 0 ? 'Lunas' : 'Kurang Bayar'}
              </span>
            </div>
          </div>
        ))}
        {recap.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-6">Belum ada anggota.</p>
        )}
      </div>
    </div>
  )
}

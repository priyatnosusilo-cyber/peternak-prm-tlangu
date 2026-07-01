import React, { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import Login from './components/Login'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import InputMingguan from './components/InputMingguan'
import RekapAnggota from './components/RekapAnggota'
import KasKelompok from './components/KasKelompok'
import Laporan from './components/Laporan'
import { Settings } from 'lucide-react'

export default function App() {
  const [user, setUser] = useState(undefined) // undefined = loading
  const [tab, setTab] = useState('dashboard')
  const [anggota, setAnggota] = useState([])
  const [inputPakan, setInputPakan] = useState([])
  const [kas, setKas] = useState([])
  const [hargaPakan, setHargaPakan] = useState(7500)
  const [editingHarga, setEditingHarga] = useState(false)
  const [hargaInput, setHargaInput] = useState('7500')

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  useEffect(() => {
    if (!user) return
    const unsubs = [
      onSnapshot(collection(db, 'anggota'), (snap) =>
        setAnggota(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      ),
      onSnapshot(collection(db, 'inputPakan'), (snap) =>
        setInputPakan(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      ),
      onSnapshot(collection(db, 'kas'), (snap) =>
        setKas(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      ),
      onSnapshot(doc(db, 'settings', 'config'), (snap) => {
        if (snap.exists()) {
          const h = snap.data().hargaPakan ?? 7500
          setHargaPakan(h)
          setHargaInput(String(h))
        }
      }),
    ]
    return () => unsubs.forEach((u) => u())
  }, [user])

  async function saveHarga() {
    const val = Number(hargaInput) || 0
    await setDoc(doc(db, 'settings', 'config'), { hargaPakan: val }, { merge: true })
    setEditingHarga(false)
  }

  if (user === undefined) {
    return <div className="min-h-screen bg-prm-900 flex items-center justify-center text-white text-sm">Memuat...</div>
  }
  if (!user) return <Login />

  return (
    <Layout active={tab} onChange={setTab}>
      {tab === 'dashboard' && (
        <>
          <div className="bg-wheat-50 border border-wheat-200 rounded-xl p-3 mb-3 flex items-center justify-between">
            {editingHarga ? (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs text-wheat-400">Rp</span>
                <input
                  type="number"
                  value={hargaInput}
                  onChange={(e) => setHargaInput(e.target.value)}
                  className="flex-1 border border-wheat-300 rounded-lg px-2 py-1 text-sm font-mono-data"
                  autoFocus
                />
                <button onClick={saveHarga} className="text-good text-xs font-medium px-2">Simpan</button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Settings size={14} className="text-wheat-400" />
                  <span className="text-xs text-ink">Harga pakan: <b className="font-mono-data">Rp{hargaPakan.toLocaleString('id-ID')}/kg</b></span>
                </div>
                <button onClick={() => setEditingHarga(true)} className="text-prm-600 text-xs font-medium">Ubah</button>
              </>
            )}
          </div>
          <Dashboard inputPakan={inputPakan} kas={kas} anggota={anggota} />
        </>
      )}
      {tab === 'input' && <InputMingguan anggota={anggota} inputPakan={inputPakan} hargaPakan={hargaPakan} />}
      {tab === 'anggota' && <RekapAnggota anggota={anggota} inputPakan={inputPakan} />}
      {tab === 'kas' && <KasKelompok kas={kas} />}
      {tab === 'laporan' && <Laporan anggota={anggota} inputPakan={inputPakan} kas={kas} />}
    </Layout>
  )
}

import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const KONDISI_OPTIONS = ["Sehat", "Sakit", "Karantina"];

export default function Admin({ user }) {
  const [ternak, setTernak] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // form state
  const [editId, setEditId] = useState(null);
  const [jenis, setJenis] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [kondisi, setKondisi] = useState(KONDISI_OPTIONS[0]);
  const [catatan, setCatatan] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "ternak"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setTernak(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError(
          "Gagal memuat data. Cek Firestore Rules & pastikan database sudah dibuat."
        );
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setJenis("");
    setJumlah("");
    setKondisi(KONDISI_OPTIONS[0]);
    setCatatan("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jenis.trim() || !jumlah) return;
    setSaving(true);
    setError("");

    try {
      if (editId) {
        await updateDoc(doc(db, "ternak", editId), {
          jenis: jenis.trim(),
          jumlah: Number(jumlah),
          kondisi,
          catatan: catatan.trim(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "ternak"), {
          jenis: jenis.trim(),
          jumlah: Number(jumlah),
          kondisi,
          catatan: catatan.trim(),
          createdAt: serverTimestamp(),
          createdBy: user.email,
        });
      }
      resetForm();
    } catch (err) {
      console.error("Simpan error:", err);
      setError("Gagal menyimpan data. Cek Firestore Rules.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setJenis(item.jenis);
    setJumlah(String(item.jumlah));
    setKondisi(item.kondisi);
    setCatatan(item.catatan || "");
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus data ini?")) return;
    try {
      await deleteDoc(doc(db, "ternak", id));
    } catch (err) {
      console.error("Hapus error:", err);
      setError("Gagal menghapus data.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Ringkasan per jenis
  const ringkasan = ternak.reduce((acc, item) => {
    acc[item.jenis] = (acc[item.jenis] || 0) + Number(item.jumlah || 0);
    return acc;
  }, {});
  const totalTernak = ternak.reduce((sum, item) => sum + Number(item.jumlah || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Dashboard Peternakan Binaan
            </h1>
            <p className="text-slate-500 text-sm">Login sebagai: {user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
          >
            Keluar
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        {/* Ringkasan */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Ringkasan
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-600 font-medium">Total Ternak</p>
              <p className="text-2xl font-bold text-blue-900">{totalTernak}</p>
            </div>
            {Object.entries(ringkasan).map(([j, jml]) => (
              <div key={j} className="bg-amber-50 rounded-xl p-4">
                <p className="text-xs text-amber-700 font-medium">{j}</p>
                <p className="text-2xl font-bold text-amber-900">{jml}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form tambah/edit */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {editId ? "Edit Data Ternak" : "Tambah Data Ternak"}
          </h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Jenis Ternak
              </label>
              <input
                type="text"
                value={jenis}
                onChange={(e) => setJenis(e.target.value)}
                placeholder="Contoh: Ayam, Kambing, Sapi"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Jumlah
              </label>
              <input
                type="number"
                min="0"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Kondisi
              </label>
              <select
                value={kondisi}
                onChange={(e) => setKondisi(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {KONDISI_OPTIONS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Catatan (opsional)
              </label>
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Catatan tambahan"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg"
              >
                {saving ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Tambah Data"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-5 py-2.5 rounded-lg"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabel data */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Daftar Ternak
          </h2>
          {loading ? (
            <p className="text-slate-500 text-sm">Memuat data...</p>
          ) : ternak.length === 0 ? (
            <p className="text-slate-500 text-sm">Belum ada data ternak.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="py-2 pr-4">Jenis</th>
                    <th className="py-2 pr-4">Jumlah</th>
                    <th className="py-2 pr-4">Kondisi</th>
                    <th className="py-2 pr-4">Catatan</th>
                    <th className="py-2 pr-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {ternak.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium text-slate-800">
                        {item.jenis}
                      </td>
                      <td className="py-2 pr-4">{item.jumlah}</td>
                      <td className="py-2 pr-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            item.kondisi === "Sehat"
                              ? "bg-green-100 text-green-700"
                              : item.kondisi === "Sakit"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {item.kondisi}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-slate-500">
                        {item.catatan || "-"}
                      </td>
                      <td className="py-2 pr-4">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:underline mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:underline"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

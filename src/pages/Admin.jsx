import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Admin({ user }) {
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Dashboard Admin
        </h1>
        <p className="text-slate-500 mb-6">Login sebagai: {user.email}</p>

        <p className="text-slate-600 mb-6">
          Halaman ini siap dikembangkan lebih lanjut — tambahkan data ternak,
          laporan, dsb sesuai kebutuhan.
        </p>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Keluar
        </button>
      </div>
    </div>
  );
}

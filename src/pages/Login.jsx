import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        cleanPassword
      );
      console.log("Login berhasil:", cred.user.uid);
      // Navigasi ditangani otomatis oleh App.jsx via onAuthStateChanged
    } catch (err) {
      console.error("Login error code:", err.code);
      console.error("Login error message:", err.message);

      switch (err.code) {
        case "auth/invalid-email":
          setError("Format email tidak valid.");
          break;
        case "auth/user-not-found":
          setError("Email tidak terdaftar sebagai admin.");
          break;
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Email atau kata sandi salah.");
          break;
        case "auth/too-many-requests":
          setError("Terlalu banyak percobaan gagal. Coba lagi nanti.");
          break;
        case "auth/network-request-failed":
          setError("Koneksi bermasalah. Cek internet kamu.");
          break;
        default:
          setError(`Login gagal (${err.code || "unknown"}). Cek Console untuk detail.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center mb-4">
          <span className="text-3xl">🌱</span>
        </div>
        <h1 className="text-2xl font-serif text-white font-bold text-center">
          Peternakan Binaan
        </h1>
        <p className="text-blue-300 text-sm mt-1 text-center">
          PRM Tlangu Sukorejo, Kendal
        </p>
      </div>

      <form
        onSubmit={handleLogin}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email Admin
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@prmtlangu.id"
            required
            autoComplete="email"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Kata Sandi
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 mt-2 transition"
        >
          {loading ? "Memproses..." : "🔒 Masuk sebagai Admin"}
        </button>
      </form>

      <p className="text-blue-300 text-xs mt-6 text-center">
        Akses khusus admin kelompok ternak
      </p>
    </div>
  );
}

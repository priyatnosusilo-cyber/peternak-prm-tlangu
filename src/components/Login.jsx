import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { Sprout, Lock } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      setError('Email atau kata sandi salah.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-prm-900 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-wheat-100 flex items-center justify-center mb-4 border-4 border-wheat-300">
            <Sprout className="text-prm-700" size={28} />
          </div>
          <h1 className="font-display text-2xl text-white text-center leading-snug">
            Peternakan Binaan
          </h1>
          <p className="text-prm-200 text-sm text-center mt-1">
            PRM Tlangu Sukorejo, Kendal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-xl">
          <label className="block text-xs font-medium text-prm-700 mb-1">Email Admin</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-prm-100 rounded-lg px-3 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-prm-400"
            placeholder="admin@contoh.com"
          />
          <label className="block text-xs font-medium text-prm-700 mb-1">Kata Sandi</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-prm-100 rounded-lg px-3 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-prm-400"
            placeholder="••••••••"
          />
          {error && <p className="text-warn text-xs mb-3">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-prm-600 hover:bg-prm-700 text-white rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-60"
          >
            <Lock size={15} />
            {loading ? 'Memeriksa...' : 'Masuk sebagai Admin'}
          </button>
        </form>
        <p className="text-center text-prm-300 text-xs mt-6">
          Akses khusus admin kelompok ternak
        </p>
      </div>
    </div>
  )
}

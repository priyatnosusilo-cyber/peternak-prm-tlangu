import React from 'react'
import { LayoutDashboard, NotebookPen, Users, Wallet, FileBarChart, LogOut } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import logo from '../assets/logo-small.png'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'input', label: 'Input', icon: NotebookPen },
  { id: 'anggota', label: 'Anggota', icon: Users },
  { id: 'kas', label: 'Kas', icon: Wallet },
  { id: 'laporan', label: 'Laporan', icon: FileBarChart },
]

export default function Layout({ active, onChange, children }) {
  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col">
      <header className="bg-prm-700 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-sm no-print">
        <img src={logo} alt="Muhammadiyah" className="w-9 h-9 rounded-full bg-white p-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-display text-[15px] leading-tight truncate">Peternakan Binaan</p>
          <p className="text-prm-200 text-[11px] leading-tight truncate">PRM Tlangu Sukorejo</p>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="text-prm-200 hover:text-white p-2 -mr-2"
          title="Keluar"
        >
          <LogOut size={18} />
        </button>
      </header>

      <main className="flex-1 pb-20 max-w-lg w-full mx-auto px-3 pt-3">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-prm-100 flex justify-around py-1.5 no-print z-20">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 min-w-[56px]"
            >
              <Icon
                size={20}
                className={isActive ? 'text-prm-700' : 'text-gray-400'}
                strokeWidth={isActive ? 2.4 : 2}
              />
              <span
                className={
                  'text-[10.5px] font-medium ' +
                  (isActive ? 'text-prm-700' : 'text-gray-400')
                }
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

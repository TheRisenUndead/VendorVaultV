"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
    };
    getUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleOpenScanner = () => {
    const isAdmin = user?.email === 'kenulas@hotmail.com';
    const isPaidUser = false; 

    if (isAdmin || isPaidUser) {
      router.push('/scanner'); 
    } else {
      alert("Please upgrade to a Pro Plan to access the live scanner.");
    }
  };

  if (!user) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Top Navigation */}
      <nav className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-900/50">
        <h1 className="text-xl font-bold text-emerald-500">Vendor Vault</h1>
        <div className="flex gap-6 items-center">
          {/* Added Collections Link */}
          <Link href="/collections" className="text-sm font-semibold text-slate-200 hover:text-emerald-400 transition-colors">
            Collections
          </Link>
          <Link href="/profile" className="text-sm text-slate-400 hover:text-white transition-colors">
            Profile
          </Link>
          <button 
            onClick={handleSignOut}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-100">Inventory Overview</h2>
            <p className="text-slate-400">Welcome back, {user.email}</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 w-full md:w-auto">
            <Link 
              href="/collections"
              className="flex-1 md:flex-none text-center bg-slate-800 hover:bg-slate-700 border border-slate-700 px-6 py-3 rounded-xl font-bold transition-all"
            >
              My Binders
            </Link>
            <button 
              onClick={handleOpenScanner}
              className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl font-bold shadow-lg transition-all"
            >
              + Quick Scan
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-sm mb-1">Total Cards</p>
            <p className="text-4xl font-mono font-bold">0</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-sm mb-1">Vault Value</p>
            <p className="text-4xl font-mono font-bold text-emerald-400">$0.00</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-sm mb-1">Recent Scans (24h)</p>
            <p className="text-4xl font-mono font-bold">0</p>
          </div>
        </div>

        {/* Placeholder for Inventory Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold">Recent Additions</h3>
          </div>
          <div className="p-12 text-center text-slate-500">
            <p>Your vault is currently empty.</p>
            <p className="text-sm mt-2">Create a collection and scan your first card.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
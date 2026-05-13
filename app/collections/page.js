"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CollectionsPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  
  // Dummy data state so we can play with the UI
  const [collections, setCollections] = useState([
    { id: 1, name: "Charizard Display Case", cardCount: 14, value: 4500.00 },
    { id: 2, name: "Trade Binder A (Modern)", cardCount: 182, value: 340.50 }
  ]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/login');
      else setUser(user);
    };
    getUser();
  }, [router]);

  const handleAddDummyCollection = () => {
    const newName = prompt("Enter Collection Name (e.g., 'Binder 3'):");
    if (newName) {
      const newCollection = {
        id: Date.now(),
        name: newName,
        cardCount: 0,
        value: 0.00
      };
      setCollections([...collections, newCollection]);
    }
  };

  if (!user) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Top Navigation */}
      <nav className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-900/50">
        <Link href="/dashboard" className="text-xl font-bold text-emerald-500 hover:opacity-80 transition-opacity">
          Vendor Vault
        </Link>
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
          ← Back to Dashboard
        </Link>
      </nav>

      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-100">Your Collections</h2>
            <p className="text-slate-400 mt-1">Organize your inventory by binders, boxes, or cases.</p>
          </div>
          <button 
            onClick={handleAddDummyCollection}
            className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all"
          >
            + New Collection
          </button>
        </header>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => (
            <div key={col.id} className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-colors rounded-2xl p-6 group cursor-pointer flex flex-col justify-between h-48">
              
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-slate-200 group-hover:text-emerald-400 transition-colors">
                  {col.name}
                </h3>
                <span className="bg-slate-800 text-xs px-2 py-1 rounded text-slate-300 font-mono">
                  ID: {col.id.toString().slice(0, 4)}
                </span>
              </div>

              <div>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Cards</p>
                    <p className="font-mono text-xl">{col.cardCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Est. Value</p>
                    <p className="font-mono text-xl text-emerald-500">${col.value.toFixed(2)}</p>
                  </div>
                </div>
                
                {/* Dummy links for now - later these will link to /collections/[id] */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-slate-800 hover:bg-slate-700 py-2 rounded-lg text-sm font-semibold transition-all">
                    View Cards
                  </button>
                  <button className="flex-1 bg-emerald-900/30 text-emerald-400 hover:bg-emerald-600 hover:text-white py-2 rounded-lg text-sm font-semibold border border-emerald-800/50 transition-all">
                    Scan to Here
                  </button>
                </div>
              </div>

            </div>
          ))}

          {/* Empty State / Add Button */}
          {collections.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-2xl">
              <p className="text-slate-400 mb-4">No collections found.</p>
              <button 
                onClick={handleAddDummyCollection}
                className="text-emerald-500 font-semibold hover:underline"
              >
                Create your first binder
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
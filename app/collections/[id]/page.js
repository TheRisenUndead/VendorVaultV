"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function CollectionDetailsPage() {
  const params = useParams(); // Grabs the ID from the URL
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollectionData = async () => {
      // 1. Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // 2. Fetch this specific collection's details from Supabase
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('id', params.id)
        .single(); // .single() because we only want one matching row

      if (error) {
        console.error("Error fetching collection:", error);
        router.push('/collections'); // If it doesn't exist, send them back
      } else {
        setCollection(data);
      }
      setLoading(false);
    };

    if (params.id) {
      fetchCollectionData();
    }
  }, [params.id, router]);

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading Binder...</div>;
  }

  if (!collection) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Top Navigation */}
      <nav className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-900/50">
        <Link href="/dashboard" className="text-xl font-bold text-emerald-500 hover:opacity-80 transition-opacity">
          Vendor Vault
        </Link>
        <Link href="/collections" className="text-sm text-slate-400 hover:text-white transition-colors">
          ← Back to All Collections
        </Link>
      </nav>

      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-6">
          <div>
            <h2 className="text-4xl font-bold text-slate-100">{collection.name}</h2>
            <div className="flex gap-4 mt-2 text-sm text-slate-400">
              <p>Total Cards: <span className="font-mono text-slate-200">0</span></p>
              <p>Est. Value: <span className="font-mono text-emerald-500">$0.00</span></p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 border border-slate-700 px-6 py-3 rounded-xl font-bold transition-all">
              Edit Name
            </button>
            <button className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2">
              <span className="text-xl">📷</span> Scan to Binder
            </button>
          </div>
        </header>

        {/* Cards List / Empty State */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-center p-6">
          <div className="text-6xl mb-4 opacity-50">🎴</div>
          <h3 className="text-xl font-bold text-slate-200 mb-2">This binder is empty</h3>
          <p className="text-slate-400 max-w-md mx-auto mb-6">
            You haven't added any cards to <strong>{collection.name}</strong> yet. Open the scanner to start digitizing your inventory.
          </p>
          <button className="bg-emerald-900/30 text-emerald-400 hover:bg-emerald-600 hover:text-white px-8 py-3 rounded-xl font-bold border border-emerald-800/50 transition-all">
            Open Scanner
          </button>
        </div>
      </div>
    </main>
  );
}
"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function CollectionDetailsPage() {
  const { id } = useParams(); // Get the collection UUID from the URL
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [collection, setCollection] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollectionData = async () => {
      // 1. Authenticate user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');
      setUser(user);

      // 2. Fetch collection name and its cards in one go using a join
      const { data, error } = await supabase
        .from('collections')
        .select(`
          name,
          cards (*) 
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error("Error loading vault:", error);
        return router.push('/collections');
      }

      setCollection(data);
      setCards(data.cards || []);
      setLoading(false);
    };

    if (id) loadCollectionData();
  }, [id, router]);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Opening Vault...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navigation Bar */}
      <nav className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-900/50">
        <Link href="/dashboard" className="text-xl font-bold text-emerald-500 hover:opacity-80 transition-opacity">
          Vendor Vault
        </Link>
        <Link href="/collections" className="text-sm text-slate-400 hover:text-white transition-colors">
          ← Back to Collections
        </Link>
      </nav>

      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Collection Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-4xl font-bold text-slate-100">{collection.name}</h2>
            <div className="flex gap-4 mt-2 text-sm text-slate-400 font-mono">
              <p>Total: {cards.length} Cards</p>
              <p className="text-emerald-500">
                Value: ${cards.reduce((sum, card) => sum + Number(card.market_price || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>
          
          <Link 
            href={`/scanner?collectionId=${id}`}
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded-xl font-bold shadow-lg transition-all text-center flex items-center justify-center gap-2"
          >
            <span className="text-xl">📷</span> Add Cards via Scanner
          </Link>
        </header>

        {/* Card Inventory Grid */}
        {cards.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {cards.map((card) => (
              <div key={card.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group hover:border-emerald-500/50 transition-all shadow-lg">
                <div className="aspect-[2.5/3.5] relative overflow-hidden bg-slate-800">
                  <img 
                    src={card.image_url} 
                    alt={card.name} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                    {card.condition}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm truncate text-slate-100">{card.name}</h3>
                  <p className="text-[10px] text-slate-500 truncate mb-2">{card.set_name}</p>
                  <p className="text-sm font-mono text-emerald-500 font-bold">
                    ${Number(card.market_price).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl py-20 text-center flex flex-col items-center justify-center">
            <div className="text-6xl mb-4 opacity-20">🎴</div>
            <h3 className="text-xl font-bold text-slate-200">No cards in this binder</h3>
            <p className="text-slate-400 mt-2 mb-8 max-w-sm">
              Digitize your inventory instantly with the AI scanner.
            </p>
            <Link 
              href={`/scanner?collectionId=${id}`}
              className="bg-emerald-900/30 text-emerald-400 hover:bg-emerald-600 hover:text-white px-8 py-3 rounded-xl font-bold border border-emerald-800/50 transition-all"
            >
              Open Scanner
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
// app/card/[id]/page.js

"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function CardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = params.id;
  const collectionId = searchParams.get("collectionId");

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const response = await fetch(
          `https://api.pokemontcg.io/v2/cards/${id}`,
          {
            headers: {
              "X-Api-Key": process.env.NEXT_PUBLIC_POKEMONTCG_API_KEY || "",
            },
          }
        );

        const data = await response.json();

        if (data.data) {
          setCard(data.data);
        }
      } catch (error) {
        console.error("Error fetching card:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCard();
    }
  }, [id]);

  const handleAddToCollection = async () => {
    if (!collectionId || !card) return;

    try {
      setAdding(true);

      const response = await fetch("/api/collections/add-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collectionId,
          cardId: card.id,
          cardData: card,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Card added successfully!");

        setTimeout(() => {
          router.push(`/collections/${collectionId}`);
        }, 1500);
      } else {
        setMessage(data.error || "Failed to add card");
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading card...
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <p>Card not found.</p>

        <Link
          href="/scanner"
          className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-lg font-bold"
        >
          Back to Scanner
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href={collectionId ? `/collections/${collectionId}` : "/dashboard"}
            className="text-slate-400 hover:text-white"
          >
            ← Back
          </Link>

          {collectionId && (
            <button
              onClick={handleAddToCollection}
              disabled={adding}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-xl transition disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add to Collection"}
            </button>
          )}
        </div>

        {/* Card Layout */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Image */}
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <img
              src={card.images.large}
              alt={card.name}
              className="w-full rounded-xl"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-4xl font-bold">{card.name}</h1>

              <p className="text-emerald-400 mt-2 text-lg">
                {card.set.name}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              
              <div className="flex justify-between">
                <span className="text-slate-400">Card Number</span>
                <span>{card.number}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Rarity</span>
                <span>{card.rarity || "Unknown"}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Supertype</span>
                <span>{card.supertype}</span>
              </div>

              {card.hp && (
                <div className="flex justify-between">
                  <span className="text-slate-400">HP</span>
                  <span>{card.hp}</span>
                </div>
              )}

              {card.types && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Type</span>
                  <span>{card.types.join(", ")}</span>
                </div>
              )}
            </div>

            {/* Market Prices */}
            {card.tcgplayer?.prices && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-xl font-bold mb-4">Market Prices</h2>

                {Object.entries(card.tcgplayer.prices).map(([type, price]) => (
                  <div
                    key={type}
                    className="flex justify-between py-2 border-b border-slate-800 last:border-none"
                  >
                    <span className="capitalize text-slate-300">{type}</span>

                    <span className="font-semibold text-emerald-400">
                      $
                      {price.market
                        ? Number(price.market).toFixed(2)
                        : "N/A"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Success/Error Message */}
            {message && (
              <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 px-4 py-3 rounded-xl">
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
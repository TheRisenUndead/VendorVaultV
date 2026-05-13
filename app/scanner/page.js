"use client";
import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import Webcam from 'react-webcam';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ScannerComponent() {
  const webcamRef = useRef(null);
  const isProcessingRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const collectionId = searchParams.get('collectionId') || '';
  
  const [user, setUser] = useState(null);
  const [scanStatus, setScanStatus] = useState('searching'); 
  const [loadingMsg, setLoadingMsg] = useState('Reading set codes...');

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');
      setUser(user);
    };
    checkAccess();
  }, [router]);

  const runAutoScan = useCallback(async () => {
    if (isProcessingRef.current || scanStatus === 'found') return;
    if (!webcamRef.current || !webcamRef.current.getScreenshot) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc || imageSrc.length < 500) return;

    isProcessingRef.current = true;

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageSrc })
      });

      const data = await response.json();
      console.log("AI Output:", data); // Debugging log

      if (data.cardDetected && data.cardId) {
        setScanStatus('found');
        setLoadingMsg(`Found: ${data.metadata?.name}! Routing...`);
        
        setTimeout(() => {
          router.push(`/card/${data.cardId}?collectionId=${collectionId}`);
        }, 1500);
      } else {
        isProcessingRef.current = false;
      }
    } catch (error) {
      console.error("Scan API Error:", error);
      isProcessingRef.current = false; 
    }
  }, [scanStatus, router, collectionId]);

  useEffect(() => {
    if (scanStatus === 'found' || !user) return;
    const interval = setInterval(() => { runAutoScan(); }, 3000);
    return () => clearInterval(interval);
  }, [runAutoScan, scanStatus, user]);

  if (!user) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Verifying...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white">
      <div className="p-4 flex justify-between items-center z-10 bg-slate-950/80 backdrop-blur-md absolute top-0 w-full">
        <h2 className="font-bold text-emerald-500">Macro Scanner Active</h2>
        <Link href={collectionId ? `/collections/${collectionId}` : "/dashboard"} className="text-slate-400 hover:text-white">
          Cancel
        </Link>
      </div>

      <div className="relative flex-grow flex items-center justify-center overflow-hidden bg-black pt-16">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          screenshotQuality={1}
          forceScreenshotSourceSize={true}
          videoConstraints={{ 
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }}
          className={`absolute min-w-full min-h-full object-cover transition-opacity duration-500 ${scanStatus === 'found' ? 'opacity-40' : 'opacity-100'}`}
        />
        
        {/* REWORKED TARGETING OVERLAY - Now a small "Barcode" style box */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none mt-20">
          <div className={`w-[70vw] h-[20vh] max-w-md border-2 rounded-xl relative overflow-hidden transition-colors duration-300 ${scanStatus === 'found' ? 'border-emerald-500 bg-emerald-500/20' : 'border-white/40 bg-black/20'}`}>
            {scanStatus === 'searching' && (
              <div className="w-full h-0.5 bg-emerald-500 absolute top-0 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div>
            )}
            {/* Corner brackets */}
            <div className={`absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 rounded-tl-lg ${scanStatus === 'found' ? 'border-emerald-400' : 'border-white'}`}></div>
            <div className={`absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 rounded-tr-lg ${scanStatus === 'found' ? 'border-emerald-400' : 'border-white'}`}></div>
            <div className={`absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 rounded-bl-lg ${scanStatus === 'found' ? 'border-emerald-400' : 'border-white'}`}></div>
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 rounded-br-lg ${scanStatus === 'found' ? 'border-emerald-400' : 'border-white'}`}></div>
          </div>
          
          <div className="mt-6 flex flex-col items-center">
            {scanStatus === 'found' ? (
              <div className="bg-emerald-500 text-slate-950 font-bold px-6 py-3 rounded-full text-lg shadow-lg shadow-emerald-500/50 flex items-center gap-2">
                <span>✓</span> {loadingMsg}
              </div>
            ) : (
              <p className="text-white font-mono text-sm bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm">
                Align bottom corner (Set & Number) in box
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AutoScannerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading Camera...</div>}>
      <ScannerComponent />
    </Suspense>
  );
}
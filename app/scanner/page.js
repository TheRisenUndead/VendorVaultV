"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import Webcam from "react-webcam";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ScannerComponent() {
  const webcamRef = useRef(null);
  const isProcessingRef = useRef(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const collectionId = searchParams.get("collectionId") || "";

  const [user, setUser] = useState(null);
  const [scanStatus, setScanStatus] = useState("idle");
  const [loadingMsg, setLoadingMsg] = useState(
    "Press SCAN or SPACEBAR"
  );

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
    };

    checkAccess();
  }, [router]);

  const runScan = useCallback(async () => {
    if (isProcessingRef.current) return;

    if (!webcamRef.current || !webcamRef.current.getScreenshot) {
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc || imageSrc.length < 500) {
      setLoadingMsg("Camera not ready");
      return;
    }

    isProcessingRef.current = true;

    setScanStatus("scanning");
    setLoadingMsg("Scanning card...");

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageSrc,
        }),
      });

      const data = await response.json();

      console.log("AI Output:", data);

      if (!response.ok || data.error) {
        console.error("Scan API Error:", data.error);

        setScanStatus("error");
        setLoadingMsg("Scan failed");

        isProcessingRef.current = false;

        return;
      }

      if (data.cardDetected && data.cardId) {
        setScanStatus("found");

        setLoadingMsg(
          `Found: ${data.metadata?.name || "Card"}`
        );

        setTimeout(() => {
          router.push(
            `/card/${data.cardId}?collectionId=${collectionId}`
          );
        }, 1500);
      } else {
        setScanStatus("idle");
        setLoadingMsg("No card detected");

        setTimeout(() => {
          setLoadingMsg("Press SCAN or SPACEBAR");
        }, 2000);

        isProcessingRef.current = false;
      }
    } catch (error) {
      console.error("Scan Error:", error);

      setScanStatus("error");
      setLoadingMsg("Connection issue");

      isProcessingRef.current = false;
    }
  }, [router, collectionId]);

  // SPACEBAR shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();

        if (!isProcessingRef.current) {
          runScan();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [runScan]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Verifying...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white">
      {/* TOP BAR */}
      <div className="p-4 flex justify-between items-center z-20 bg-slate-950/80 backdrop-blur-md absolute top-0 w-full">
        <h2 className="font-bold text-emerald-500">
          Macro Scanner
        </h2>

        <div className="flex items-center gap-3">
          {/* SCAN BUTTON */}
          <button
            onClick={runScan}
            disabled={isProcessingRef.current}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-xl transition disabled:opacity-50"
          >
            {scanStatus === "scanning"
              ? "Scanning..."
              : "SCAN"}
          </button>

          {/* CANCEL */}
          <Link
            href={
              collectionId
                ? `/collections/${collectionId}`
                : "/dashboard"
            }
            className="text-slate-400 hover:text-white"
          >
            Cancel
          </Link>
        </div>
      </div>

      {/* CAMERA */}
      <div className="relative flex-grow flex items-center justify-center overflow-hidden bg-black pt-16">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.5}
          forceScreenshotSourceSize={true}
          videoConstraints={{
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }}
          className={`absolute min-w-full min-h-full object-cover transition-opacity duration-500 ${
            scanStatus === "found"
              ? "opacity-40"
              : "opacity-100"
          }`}
        />

        {/* TARGET BOX */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none mt-20">
          <div
            className={`w-[70vw] h-[20vh] max-w-md border-2 rounded-xl relative overflow-hidden transition-colors duration-300 ${
              scanStatus === "found"
                ? "border-emerald-500 bg-emerald-500/20"
                : scanStatus === "scanning"
                ? "border-yellow-400 bg-yellow-400/10"
                : "border-white/40 bg-black/20"
            }`}
          >
            {/* Animated Scan Line */}
            {scanStatus === "scanning" && (
              <div className="w-full h-0.5 bg-emerald-500 absolute top-0 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div>
            )}

            {/* CORNERS */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 rounded-tl-lg border-white"></div>

            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 rounded-tr-lg border-white"></div>

            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 rounded-bl-lg border-white"></div>

            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 rounded-br-lg border-white"></div>
          </div>

          {/* STATUS */}
          <div className="mt-6 flex flex-col items-center">
            <div
              className={`font-bold px-6 py-3 rounded-full text-lg backdrop-blur-md ${
                scanStatus === "found"
                  ? "bg-emerald-500 text-slate-950"
                  : scanStatus === "error"
                  ? "bg-red-500 text-white"
                  : scanStatus === "scanning"
                  ? "bg-yellow-400 text-black"
                  : "bg-black/60 text-white"
              }`}
            >
              {loadingMsg}
            </div>

            <p className="mt-3 text-white/70 text-sm">
              Press SPACEBAR to scan instantly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AutoScannerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          Loading Camera...
        </div>
      }
    >
      <ScannerComponent />
    </Suspense>
  );
}
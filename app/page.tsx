"use client";

import { useEffect, useState } from "react";
import TourDashboard from "@/components/TourDashboard";
import YandexMapWidget from "@/components/YandexMapWidget";
import TranslatorWidget from "@/components/TranslatorWidget";
import type { TourDetails } from "@/types/uon";
import type { MapPoint } from "@/components/YandexMapWidget";

type Tab = "tour" | "map" | "translate";

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "tour", icon: "🏖️", label: "Тур" },
  { id: "map", icon: "🗺️", label: "Карта" },
  { id: "translate", icon: "🌐", label: "Перевод" },
];

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-3">
      <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none" aria-label="Загрузка">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <p className="text-sm text-slate-400">Загружаем данные тура…</p>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="mx-4 mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
      <p className="text-sm text-red-400 font-medium mb-1">⚠️ Ошибка загрузки</p>
      <p className="text-xs text-red-300/70">{message}</p>
    </div>
  );
}

export default function TourPage() {
  const [tour, setTour] = useState<TourDetails | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("tour");

  useEffect(() => {
    async function loadTour() {
      try {
        let requestId: string | null = null;

        if (window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp;
          tg.ready();
          tg.expand();
          requestId = tg.initDataUnsafe?.start_param ?? null;
        }

        if (!requestId) {
          requestId = new URLSearchParams(window.location.search).get("id");
        }

        if (!requestId) {
          requestId = "mock";
        }

        const res = await fetch(`/api/tour?id=${encodeURIComponent(requestId)}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error ?? "Ошибка загрузки данных тура");

        if (data.isMock) setIsMock(true);
        const { isMock: _, ...tourData } = data;
        setTour(tourData as TourDetails);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка. Попробуйте позже.");
      } finally {
        setLoading(false);
      }
    }

    loadTour();
  }, []);

  const hotelPoint: MapPoint | null =
    tour?.hotel?.location.lat && tour.hotel.location.lng
      ? {
          lat: tour.hotel.location.lat,
          lng: tour.hotel.location.lng,
          label: tour.hotel.name,
          hint: tour.hotel.address ?? tour.hotel.name,
        }
      : null;

  return (
    <div className="min-h-dvh bg-[#0d1117] text-white flex flex-col">
      <header className="sticky top-0 z-20 bg-[#0d1117]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold">🌴 Lucky Tour</h1>
          {isMock && (
            <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
              DEMO
            </span>
          )}
        </div>
        {tour && <p className="text-xs text-slate-400 mt-0.5">Заявка #{tour.request_id}</p>}
      </header>

      <main className="flex-1 overflow-y-auto">
        {loading && <LoadingSpinner />}
        {!loading && error && <ErrorCard message={error} />}
        {!loading && !error && tour && (
          <>
            {activeTab === "tour" && (
              <div className="pt-4">
                <TourDashboard tour={tour} isMock={isMock} />
              </div>
            )}
            {activeTab === "map" && (
              <div className="p-4">
                <YandexMapWidget hotel={hotelPoint} height="65dvh" />
                {!hotelPoint && (
                  <p className="text-xs text-slate-500 mt-3 text-center">Координаты отеля недоступны в API</p>
                )}
              </div>
            )}
            {activeTab === "translate" && (
              <div className="pt-4">
                <TranslatorWidget />
              </div>
            )}
          </>
        )}
      </main>

      {!loading && !error && tour && (
        <nav className="sticky bottom-0 z-20 bg-[#0d1117]/95 backdrop-blur-xl border-t border-white/5">
          <div className="flex">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 flex flex-col items-center gap-1 pt-3 pb-4 text-xs transition-colors ${
                    isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <span className="text-lg leading-none">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-blue-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

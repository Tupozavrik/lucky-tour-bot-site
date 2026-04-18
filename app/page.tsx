"use client";

import { useEffect, useState } from "react";
import TourDashboard from "@/components/TourDashboard";
import YandexMapWidget from "@/components/YandexMapWidget";
import TranslatorWidget from "@/components/TranslatorWidget";
import type { TourDetails } from "@/types/uon";
import type { MapPoint } from "@/components/YandexMapWidget";

type Tab = "tour" | "map" | "translate";

const TABS: { id: Tab; label: string }[] = [
  { id: "tour", label: "Детали" },
  { id: "map", label: "Карта" },
  { id: "translate", label: "Переводчик" },
];

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-3">
      <div className="animate-spin h-6 w-6 border-2 border-tg-hint border-t-tg-link rounded-full" />
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="mx-4 mt-6 p-4 bg-red-500/10 rounded-xl">
      <p className="text-sm text-red-500 font-medium mb-1">Ошибка</p>
      <p className="text-xs text-red-400/80">{message}</p>
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
          // Сообщаем телеграму цвет фона для плавного скролла
          tg.setHeaderColor("bg_color");
          tg.setBackgroundColor("bg_color");
        }
        if (!requestId) requestId = new URLSearchParams(window.location.search).get("id") || "mock";

        const res = await fetch(`/api/tour?id=${encodeURIComponent(requestId)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Ошибка загрузки данных тура");

        if (data.isMock) setIsMock(true);
        const { isMock: _, ...tourData } = data;
        setTour(tourData as TourDetails);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
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
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-20 bg-tg-bg/80 backdrop-blur-xl border-b border-tg-border px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold">Lucky Tour</h1>
          {tour && <p className="text-xs text-tg-hint mt-0.5">Заявка #{tour.request_id}</p>}
        </div>
        {isMock && (
          <span className="text-[10px] bg-tg-secondary text-tg-text px-2 py-1 rounded-md font-medium uppercase tracking-wider">
            Demo
          </span>
        )}
      </header>

      <main className="flex-1 overflow-y-auto">
        {loading && <LoadingSpinner />}
        {!loading && error && <ErrorCard message={error} />}
        {!loading && !error && tour && (
          <div className="pb-6">
            {activeTab === "tour" && <TourDashboard tour={tour} />}
            {activeTab === "map" && (
              <div className="p-4">
                <YandexMapWidget hotel={hotelPoint} height="65dvh" />
                {!hotelPoint && <p className="text-sm text-tg-hint mt-4 text-center">Координаты недоступны</p>}
              </div>
            )}
            {activeTab === "translate" && <div className="pt-4"><TranslatorWidget /></div>}
          </div>
        )}
      </main>

      {!loading && !error && tour && (
        <nav className="sticky bottom-0 z-20 bg-tg-bg/90 backdrop-blur-xl border-t border-tg-border pb-safe">
          <div className="flex px-2 py-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 text-[13px] font-medium transition-colors ${isActive ? "text-tg-link" : "text-tg-hint"
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
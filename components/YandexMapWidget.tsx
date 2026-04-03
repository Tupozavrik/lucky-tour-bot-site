"use client";

import { Map, Placemark, YMaps } from "@pbe/react-yandex-maps";

export interface MapPoint {
  lat: number;
  lng: number;
  label?: string;
  hint?: string;
  color?: string;
}

interface YandexMapWidgetProps {
  hotel?: MapPoint | null;
  airport?: MapPoint | null;
  height?: string;
}

const YANDEX_API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY ?? "";

function getCenter(a?: MapPoint | null, b?: MapPoint | null): [number, number] {
  if (a && b) return [(a.lat + b.lat) / 2, (a.lng + b.lng) / 2];
  if (a) return [a.lat, a.lng];
  if (b) return [b.lat, b.lng];
  return [43.238949, 76.889709]; // Алматы
}

export default function YandexMapWidget({ hotel, airport, height = "300px" }: YandexMapWidgetProps) {
  const center = getCenter(hotel, airport);
  const zoom = hotel && airport ? 6 : 12;
  const hasPoints = hotel || airport;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/10" style={{ height }}>
      {!hasPoints ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/60 gap-2">
          <span className="text-3xl">🗺️</span>
          <p className="text-sm text-slate-400">Координаты недоступны</p>
        </div>
      ) : (
        <YMaps query={{ apikey: YANDEX_API_KEY, lang: "ru_RU", load: "package.full" }}>
          <Map defaultState={{ center, zoom }} width="100%" height={height} options={{ suppressMapOpenBlock: true }}>
            {hotel && (
              <Placemark
                geometry={[hotel.lat, hotel.lng]}
                properties={{
                  balloonContentHeader: "🏨 Отель",
                  balloonContentBody: hotel.label ?? "Ваш отель",
                  hintContent: hotel.hint ?? hotel.label ?? "Отель",
                }}
                options={{ preset: hotel.color ?? "islands#darkBlueHotelIcon" }}
              />
            )}
            {airport && (
              <Placemark
                geometry={[airport.lat, airport.lng]}
                properties={{
                  balloonContentHeader: "✈️ Аэропорт",
                  balloonContentBody: airport.label ?? "Аэропорт",
                  hintContent: airport.hint ?? airport.label ?? "Аэропорт",
                }}
                options={{ preset: airport.color ?? "islands#darkBlueAirportIcon" }}
              />
            )}
          </Map>
        </YMaps>
      )}
    </div>
  );
}

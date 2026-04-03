"use client";

import type { TourDetails, TourFlight } from "@/types/uon";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

function formatDate(iso: string | null, fmt = "d MMMM yyyy"): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso.replace(/Z$/, "").split("T")[0]), fmt, { locale: ru });
  } catch {
    return iso;
  }
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso.replace(/Z$/, "").replace(/\+\d{2}:\d{2}$/, "")), "d MMM, HH:mm", { locale: ru });
  } catch {
    return iso;
  }
}

function starsString(count: number | null): string {
  if (!count || count <= 0) return "";
  return "★".repeat(Math.min(count, 5));
}

function transferLabel(status: string | null): { label: string; color: string } {
  switch (status?.toLowerCase()) {
    case "included": return { label: "Включён", color: "text-emerald-400" };
    case "not_included": return { label: "Не включён", color: "text-red-400" };
    case "on_request": return { label: "По запросу", color: "text-amber-400" };
    default: return { label: status ?? "—", color: "text-slate-400" };
  }
}

function InfoCard({ icon, label, value, valueClass = "" }: {
  icon: string;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <span className="text-xl w-7 shrink-0" aria-hidden>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-sm font-medium leading-snug break-words ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2 mt-4 first:mt-0">
      {children}
    </h2>
  );
}

function FlightCard({ flight }: { flight: TourFlight }) {
  return (
    <div className="bg-white/5 rounded-2xl p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-400 uppercase tracking-wider">
          {flight.direction === "outbound" ? "✈️ Туда" : "✈️ Обратно"}
        </p>
        {flight.flight_number && (
          <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full text-[10px] font-mono">
            {flight.flight_number}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="text-center min-w-0 flex-1">
          <p className="text-lg font-bold tabular-nums">{formatDateTime(flight.departure_datetime)}</p>
          <p className="text-xs text-slate-400 truncate">{flight.departure_airport ?? "—"}</p>
        </div>
        <div className="flex flex-col items-center gap-0.5 shrink-0 w-12">
          <div className="w-full flex items-center gap-0.5">
            <div className="flex-1 h-px bg-slate-600" />
            <span className="text-slate-500 text-xs">✈</span>
            <div className="flex-1 h-px bg-slate-600" />
          </div>
          {flight.airline && (
            <p className="text-[9px] text-slate-600 text-center leading-tight">{flight.airline}</p>
          )}
        </div>
        <div className="text-center min-w-0 flex-1">
          <p className="text-lg font-bold tabular-nums">{formatDateTime(flight.arrival_datetime)}</p>
          <p className="text-xs text-slate-400 truncate">{flight.arrival_airport ?? "—"}</p>
        </div>
      </div>
    </div>
  );
}

interface TourDashboardProps {
  tour: TourDetails;
  isMock?: boolean;
}

export default function TourDashboard({ tour, isMock }: TourDashboardProps) {
  const { hotel, flights, transfer, check_in, check_out } = tour;
  const tf = transferLabel(transfer?.status ?? null);

  return (
    <div className="px-4 pb-8">
      {isMock && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2">
          <span className="text-amber-400 mt-0.5">ℹ️</span>
          <p className="text-xs text-amber-400 leading-relaxed">
            Демо-режим: отображаются тестовые данные. Для просмотра реального тура откройте через бот.
          </p>
        </div>
      )}

      <SectionTitle>🏨 Проживание</SectionTitle>
      {hotel ? (
        <div className="bg-white/5 rounded-2xl p-4 mb-3">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="text-base font-semibold leading-tight">{hotel.name}</h3>
            {hotel.stars && (
              <span className="text-amber-400 text-sm shrink-0">{starsString(hotel.stars)}</span>
            )}
          </div>
          <InfoCard
            icon="📍"
            label="Локация"
            value={[hotel.location.city, hotel.location.country].filter(Boolean).join(", ") || "—"}
          />
          {hotel.address && <InfoCard icon="🗺️" label="Адрес" value={hotel.address} />}
          <InfoCard
            icon="🗓️"
            label="Заезд / Выезд"
            value={`${formatDate(check_in)} — ${formatDate(check_out)}`}
          />
        </div>
      ) : (
        <div className="bg-white/5 rounded-2xl p-4 mb-3 text-center text-sm text-slate-500">
          Информация об отеле недоступна
        </div>
      )}

      <SectionTitle>✈️ Перелёт</SectionTitle>
      {flights.length > 0 ? (
        flights.map((f, i) => (
          <FlightCard key={`${f.flight_number ?? i}-${f.direction}`} flight={f} />
        ))
      ) : (
        <div className="bg-white/5 rounded-2xl p-4 mb-3 text-center text-sm text-slate-500">
          Информация о рейсах недоступна
        </div>
      )}

      {transfer && (
        <>
          <SectionTitle>🚌 Трансфер</SectionTitle>
          <div className="bg-white/5 rounded-2xl p-4">
            <InfoCard icon="🔖" label="Статус" value={tf.label} valueClass={tf.color} />
            {transfer.type && <InfoCard icon="🚐" label="Тип" value={transfer.type} />}
          </div>
        </>
      )}
    </div>
  );
}

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

function transferLabel(status: string | null): { label: string; colorVar: string } {
  switch (status?.toLowerCase()) {
    case "included": return { label: "Включён", colorVar: "#34d399" };
    case "not_included": return { label: "Не включён", colorVar: "var(--tg-destructive)" };
    case "on_request": return { label: "По запросу", colorVar: "#fbbf24" };
    default: return { label: status ?? "—", colorVar: "var(--tg-hint)" };
  }
}

function InfoCard({ icon, label, value, valueColor }: {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div
      className="flex items-start gap-3 py-3 last:border-0"
      style={{ borderBottom: "1px solid color-mix(in srgb, var(--tg-hint) 15%, transparent)" }}
    >
      <span className="text-xl w-7 shrink-0" aria-hidden>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "var(--tg-section-header)" }}>{label}</p>
        <p className="text-sm font-medium leading-snug break-words" style={{ color: valueColor ?? "var(--tg-text)" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xs font-semibold uppercase tracking-widest mb-2 mt-4 first:mt-0"
      style={{ color: "var(--tg-subtitle)" }}
    >
      {children}
    </h2>
  );
}

function FlightCard({ flight }: { flight: TourFlight }) {
  return (
    <div
      className="rounded-2xl p-4 mb-3"
      style={{ background: "color-mix(in srgb, var(--tg-hint) 10%, var(--tg-section-bg))" }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wider" style={{ color: "var(--tg-hint)" }}>
          {flight.direction === "outbound" ? "✈️ Туда" : "✈️ Обратно"}
        </p>
        {flight.flight_number && (
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-mono"
            style={{
              background: "color-mix(in srgb, var(--tg-button) 20%, transparent)",
              color: "var(--tg-link)",
            }}
          >
            {flight.flight_number}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="text-center min-w-0 flex-1">
          <p className="text-lg font-bold tabular-nums">{formatDateTime(flight.departure_datetime)}</p>
          <p className="text-xs truncate" style={{ color: "var(--tg-hint)" }}>{flight.departure_airport ?? "—"}</p>
        </div>
        <div className="flex flex-col items-center gap-0.5 shrink-0 w-12">
          <div className="w-full flex items-center gap-0.5">
            <div className="flex-1 h-px" style={{ background: "var(--tg-hint)", opacity: 0.4 }} />
            <span className="text-xs" style={{ color: "var(--tg-hint)" }}>✈</span>
            <div className="flex-1 h-px" style={{ background: "var(--tg-hint)", opacity: 0.4 }} />
          </div>
          {flight.airline && (
            <p className="text-[9px] text-center leading-tight" style={{ color: "var(--tg-hint)", opacity: 0.6 }}>
              {flight.airline}
            </p>
          )}
        </div>
        <div className="text-center min-w-0 flex-1">
          <p className="text-lg font-bold tabular-nums">{formatDateTime(flight.arrival_datetime)}</p>
          <p className="text-xs truncate" style={{ color: "var(--tg-hint)" }}>{flight.arrival_airport ?? "—"}</p>
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
        <div
          className="mb-4 p-3 rounded-xl flex items-start gap-2 border"
          style={{
            background: "color-mix(in srgb, #fbbf24 10%, transparent)",
            borderColor: "color-mix(in srgb, #fbbf24 20%, transparent)",
          }}
        >
          <span className="mt-0.5" style={{ color: "#fbbf24" }}>ℹ️</span>
          <p className="text-xs leading-relaxed" style={{ color: "#fbbf24" }}>
            Демо-режим: отображаются тестовые данные. Для просмотра реального тура откройте через бота.
          </p>
        </div>
      )}

      <SectionTitle>🏨 Проживание</SectionTitle>
      {hotel ? (
        <div
          className="rounded-2xl p-4 mb-3"
          style={{ background: "color-mix(in srgb, var(--tg-hint) 10%, var(--tg-section-bg))" }}
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="text-base font-semibold leading-tight">{hotel.name}</h3>
            {hotel.stars && (
              <span className="text-sm shrink-0" style={{ color: "#fbbf24" }}>
                {starsString(hotel.stars)}
              </span>
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
        <div
          className="rounded-2xl p-4 mb-3 text-center text-sm"
          style={{
            background: "color-mix(in srgb, var(--tg-hint) 10%, var(--tg-section-bg))",
            color: "var(--tg-hint)",
          }}
        >
          Информация об отеле недоступна
        </div>
      )}

      <SectionTitle>✈️ Перелёт</SectionTitle>
      {flights.length > 0 ? (
        flights.map((f, i) => (
          <FlightCard key={`${f.flight_number ?? i}-${f.direction}`} flight={f} />
        ))
      ) : (
        <div
          className="rounded-2xl p-4 mb-3 text-center text-sm"
          style={{
            background: "color-mix(in srgb, var(--tg-hint) 10%, var(--tg-section-bg))",
            color: "var(--tg-hint)",
          }}
        >
          Информация о рейсах недоступна
        </div>
      )}

      {transfer && (
        <>
          <SectionTitle>🚌 Трансфер</SectionTitle>
          <div
            className="rounded-2xl p-4"
            style={{ background: "color-mix(in srgb, var(--tg-hint) 10%, var(--tg-section-bg))" }}
          >
            <InfoCard icon="🔖" label="Статус" value={tf.label} valueColor={tf.colorVar} />
            {transfer.type && <InfoCard icon="🚐" label="Тип" value={transfer.type} />}
          </div>
        </>
      )}
    </div>
  );
}

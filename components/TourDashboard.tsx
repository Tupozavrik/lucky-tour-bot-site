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

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-tg-border last:border-0 gap-4">
      <span className="text-[15px] text-tg-hint shrink-0">{label}</span>
      <span className="text-[15px] text-right break-words">{value}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[13px] font-medium uppercase tracking-wide text-tg-hint mb-1.5 mt-6 px-4">
      {children}
    </h2>
  );
}

function FlightCard({ flight, index }: { flight: TourFlight; index: number }) {
  const isOutbound = flight.direction === "outbound";

  return (
    <div className="bg-tg-secondary rounded-xl mx-4 mb-3 overflow-hidden">
      <div className="px-4 py-2 bg-black/5 dark:bg-white/5 border-b border-tg-border flex justify-between items-center">
        <span className="text-[13px] font-medium text-tg-hint">
          {isOutbound ? "Туда" : "Обратно"}
        </span>
        {flight.flight_number && (
          <span className="text-[13px] font-mono text-tg-link">{flight.flight_number}</span>
        )}
      </div>
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="text-center flex-1">
          <p className="text-[19px] font-semibold tabular-nums">{formatDateTime(flight.departure_datetime)}</p>
          <p className="text-[13px] text-tg-hint truncate">{flight.departure_airport ?? "—"}</p>
        </div>
        <div className="flex flex-col items-center flex-1">
          <div className="h-[1px] w-full bg-tg-border relative mb-1">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-tg-secondary px-2 text-[10px] text-tg-hint uppercase tracking-wider">
              {flight.airline || "Рейс"}
            </span>
          </div>
        </div>
        <div className="text-center flex-1">
          <p className="text-[19px] font-semibold tabular-nums">{formatDateTime(flight.arrival_datetime)}</p>
          <p className="text-[13px] text-tg-hint truncate">{flight.arrival_airport ?? "—"}</p>
        </div>
      </div>
    </div>
  );
}

interface TourDashboardProps {
  tour: TourDetails;
}

export default function TourDashboard({ tour }: TourDashboardProps) {
  const { hotel, flights, transfer, check_in, check_out } = tour;

  const transferLabel = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "included": return "Включён";
      case "not_included": return "Не включён";
      case "on_request": return "По запросу";
      default: return status ?? "—";
    }
  };

  return (
    <div className="pb-8">
      <SectionTitle>Проживание</SectionTitle>
      <div className="bg-tg-secondary mx-4 rounded-xl px-4">
        {hotel ? (
          <>
            <div className="py-3 border-b border-tg-border">
              <h3 className="text-[17px] font-medium leading-tight">{hotel.name}</h3>
              {hotel.stars && (
                <p className="text-[13px] text-tg-hint mt-0.5">
                  {"★".repeat(Math.min(hotel.stars, 5))}
                </p>
              )}
            </div>
            <InfoRow
              label="Локация"
              value={[hotel.location.city, hotel.location.country].filter(Boolean).join(", ") || "—"}
            />
            {hotel.address && <InfoRow label="Адрес" value={hotel.address} />}
            <InfoRow label="Заезд" value={formatDate(check_in)} />
            <InfoRow label="Выезд" value={formatDate(check_out)} />
          </>
        ) : (
          <div className="py-4 text-center text-[15px] text-tg-hint">Нет данных об отеле</div>
        )}
      </div>

      <SectionTitle>Перелёт</SectionTitle>
      {flights.length > 0 ? (
        flights.map((f, i) => (
          <FlightCard key={`${f.flight_number ?? i}-${f.direction}`} flight={f} index={i} />
        ))
      ) : (
        <div className="bg-tg-secondary mx-4 rounded-xl p-4 text-center text-[15px] text-tg-hint">
          Нет данных о рейсах
        </div>
      )}

      {transfer && (
        <>
          <SectionTitle>Трансфер</SectionTitle>
          <div className="bg-tg-secondary mx-4 rounded-xl px-4">
            <InfoRow label="Статус" value={transferLabel(transfer.status ?? null)} />
            {transfer.type && <InfoRow label="Тип" value={transfer.type} />}
          </div>
        </>
      )}
    </div>
  );
}
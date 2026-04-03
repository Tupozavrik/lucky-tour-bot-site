import { NextRequest, NextResponse } from "next/server";
import type { UonRequestRaw, UonService, UonFlight, TourDetails, TourFlight } from "@/types/uon";
import { MOCK_TOUR } from "@/lib/mock-tour";

const API_BASE = "https://api.u-on.ru";
const API_TOKEN = process.env.UONTRAVEL_API_TOKEN;

function mapFlights(rawFlights: UonFlight[]): TourFlight[] {
  return rawFlights.map((f, idx) => ({
    direction: idx === 0 ? "outbound" : "return",
    departure_airport: f.departure_airport_name
      ? `${f.departure_airport_name} (${f.departure_airport_code ?? ""})`
      : (f.departure_airport_code ?? null),
    arrival_airport: f.arrival_airport_name
      ? `${f.arrival_airport_name} (${f.arrival_airport_code ?? ""})`
      : (f.arrival_airport_code ?? null),
    departure_datetime: f.departure_datetime,
    arrival_datetime: f.arrival_datetime,
    flight_number: f.flight_number,
    airline: f.airline,
  }));
}

function pickMainService(services: UonService[]): UonService | null {
  return (
    services.find((s) =>
      ["tour", "hotel", "accommodation", "package"].includes(s.type?.toLowerCase() ?? "")
    ) ?? services[0] ?? null
  );
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = new URL(request.url).searchParams.get("id");

  if (!requestId) {
    return NextResponse.json({ error: "Query parameter `id` is required" }, { status: 400 });
  }

  if (requestId === "mock" || !API_TOKEN) {
    if (!API_TOKEN && requestId !== "mock") {
      console.warn("[/api/tour] No API token — serving mock for id=%s", requestId);
    }
    return NextResponse.json({ ...MOCK_TOUR, isMock: true });
  }

  if (!/^\d+$/.test(requestId)) {
    return NextResponse.json({ error: "`id` must be numeric" }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_BASE}/${API_TOKEN}/request/${requestId}.json`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: "Tour request not found" }, { status: 404 });
      }
      throw new Error(`U-ON API error: ${res.status} ${res.statusText}`);
    }

    const raw: UonRequestRaw = await res.json();
    const service = pickMainService(raw.services ?? []);

    const result: TourDetails = {
      request_id: raw.id,
      check_in: service?.date_begin ?? null,
      check_out: service?.date_end ?? null,
      hotel: service?.hotel
        ? {
            name: service.hotel.name,
            stars: service.hotel.stars ?? null,
            address: service.hotel.address ?? null,
            location: {
              city: service.hotel.city ?? null,
              country: service.hotel.country ?? null,
              lat: service.hotel.lat ?? null,
              lng: service.hotel.lng ?? null,
            },
          }
        : null,
      flights: mapFlights(service?.flights ?? []),
      transfer: service?.transfer
        ? { status: service.transfer.status ?? null, type: service.transfer.type ?? null }
        : null,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/tour]", err);
    return NextResponse.json({ error: "Failed to fetch tour details" }, { status: 502 });
  }
}

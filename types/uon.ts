// ─── U-ON Travel API: базовые интерфейсы ─────────────────────────────────────

export interface UonHotel {
  id: number;
  name: string;
  stars: number | null;
  address: string | null;
  city: string | null;
  country: string | null;
  /** Координаты для карты, если API возвращает */
  lat: number | null;
  lng: number | null;
}

export interface UonFlight {
  /** Код аэропорта вылета (IATA), напр. "SVO" */
  departure_airport_code: string | null;
  departure_airport_name: string | null;
  departure_datetime: string | null; // ISO-8601

  /** Код аэропорта назначения (IATA), напр. "AYT" */
  arrival_airport_code: string | null;
  arrival_airport_name: string | null;
  arrival_datetime: string | null; // ISO-8601

  flight_number: string | null;
  airline: string | null;
}

export interface UonTransfer {
  /** "included" | "not_included" | "on_request" */
  status: string | null;
  type: string | null;
}

export interface UonService {
  id: number;
  type: string;
  /** Дата начала (заезда) */
  date_begin: string | null; // ISO-8601 date
  /** Дата окончания (выезда) */
  date_end: string | null;   // ISO-8601 date
  hotel: UonHotel | null;
  flights: UonFlight[];
  transfer: UonTransfer | null;
}

/** Полный ответ U-ON для одной заявки */
export interface UonRequestRaw {
  id: number;
  number: string | null;
  status: string | null;
  manager: string | null;
  tourist_name: string | null;
  price: number | null;
  currency: string | null;
  services: UonService[];
}

// ─── Отфильтрованный ответ нашего /api/tour ───────────────────────────────────

export interface TourLocation {
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
}

export interface TourHotel {
  name: string;
  stars: number | null;
  address: string | null;
  location: TourLocation;
}

export interface TourFlight {
  direction: "outbound" | "return";
  departure_airport: string | null;
  arrival_airport: string | null;
  departure_datetime: string | null;
  arrival_datetime: string | null;
  flight_number: string | null;
  airline: string | null;
}

export interface TourTransfer {
  status: string | null;
  type: string | null;
}

/** Ответ нашего /api/tour */
export interface TourDetails {
  request_id: number;
  check_in: string | null;
  check_out: string | null;
  hotel: TourHotel | null;
  flights: TourFlight[];
  transfer: TourTransfer | null;
}

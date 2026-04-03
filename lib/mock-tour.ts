import type { TourDetails } from "@/types/uon";

export const MOCK_TOUR: TourDetails = {
  request_id: 123456,
  check_in: "2026-05-10",
  check_out: "2026-05-20",
  hotel: {
    name: "Rixos Premium Antalya",
    stars: 5,
    address: "Ileribasi Mevkii, Çamyuva, Kemer, Antalya 07999",
    location: {
      city: "Анталья",
      country: "Турция",
      lat: 36.5184,
      lng: 30.5547,
    },
  },
  flights: [
    {
      direction: "outbound",
      departure_airport: "Шереметьево (SVO)",
      arrival_airport: "Анталья (AYT)",
      departure_datetime: "2026-05-10T08:30:00",
      arrival_datetime: "2026-05-10T12:45:00",
      flight_number: "SU 2134",
      airline: "Aeroflot",
    },
    {
      direction: "return",
      departure_airport: "Анталья (AYT)",
      arrival_airport: "Внуково (VKO)",
      departure_datetime: "2026-05-20T13:00:00",
      arrival_datetime: "2026-05-20T17:15:00",
      flight_number: "DP 840",
      airline: "Pobeda",
    },
  ],
  transfer: {
    status: "included",
    type: "Групповой трансфер",
  },
};

export type TourType = "PRIVATE" | "GROUP";

export interface Tour {
  id: string;
  name: string;
  description: string;
  price: number;
  max_capacity: number;
  departure_time: string;
  arrival_time: string;
  tour_type: TourType;
  created_at?: string;
}

export interface TourStop {
  id: string;
  tour_id: string;
  place_name: string;
  stop_order: number;
  is_rest_stop: boolean;
  estimated_duration_minutes?: number | null;
  created_at?: string;
}

export interface TourBooking {
  id: string;
  tour_id: string;
  reservation_id: string;
  booking_date: string;
  passenger_count: number;
  created_at?: string;
  tours?: { name: string };
  reservations?: { guest_name: string };
}

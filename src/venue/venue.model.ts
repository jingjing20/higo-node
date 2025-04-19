export interface Venue {
  id: number;
  name: string;
  address: string;
  category_id?: number;
  longitude: number;
  latitude: number;
  is_free: number;
  price_description?: string;
  crowd_level?: string;
  user_id: number;
  is_approved: number;
  created_at: Date;
  updated_at: Date;
}

export interface VenueImage {
  id: number;
  venue_id: number;
  image_url: string;
  sequence_number: number;
  created_at: Date;
}

export interface VenueOpeningHours {
  id: number;
  venue_id: number;
  day_of_week: number;
  open_time: string;
  close_time: string;
  created_at: Date;
  updated_at: Date;
}

export interface VenueEvent {
  id: string;
  venue_id: string;
  title: string;
  description?: string;
  event_type: 'party' | 'concert' | 'special_night' | 'theme_night' | 'happy_hour' | 'other';
  start_date: string;
  end_date: string;
  ticket_price?: number;
  max_attendees?: number;
  current_attendees: number;
  dress_code?: string;
  music_genre: string[];
  age_restriction?: number;
  image_url?: string;
  is_featured: boolean;
  status: 'upcoming' | 'live' | 'ended' | 'cancelled';
  created_at: string;
  updated_at: string;
  venue_name?: string;
  venue_address?: string;
  venue_city?: string;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  status: 'interested' | 'going' | 'maybe' | 'not_going';
  tickets_purchased: number;
  created_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  venue_id: string;
  created_at: string;
}

export interface FriendsActivity {
  id: string;
  user_id: string;
  activity_type: 'check_in' | 'favorite_venue' | 'attending_event' | 'new_friend' | 'profile_update';
  target_id?: string;
  target_type?: 'venue' | 'event' | 'user';
  metadata: Record<string, any>;
  is_public: boolean;
  created_at: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  target_name?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'venue_live' | 'friend_check_in' | 'event_reminder' | 'new_message' | 'favorite_update';
  title: string;
  message: string;
  data: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

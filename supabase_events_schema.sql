-- ========================================
-- EVENTS SYSTEM FOR NATA APP
-- ========================================

-- 1. Venue Events Table
CREATE TABLE IF NOT EXISTS venue_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('party', 'concert', 'special_night', 'theme_night', 'happy_hour', 'other')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  ticket_price DECIMAL(10, 2),
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  dress_code VARCHAR(100),
  music_genre VARCHAR(100)[],
  age_restriction INTEGER CHECK (age_restriction >= 18),
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'ended', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Event Attendees Table
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES venue_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'interested' CHECK (status IN ('interested', 'going', 'maybe', 'not_going')),
  tickets_purchased INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- 3. User Favorites Table
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, venue_id)
);

-- 4. Friends Activity Table
CREATE TABLE IF NOT EXISTS friends_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('check_in', 'favorite_venue', 'attending_event', 'new_friend', 'profile_update')),
  target_id UUID, -- Can be venue_id, event_id, or another user_id
  target_type VARCHAR(20), -- 'venue', 'event', 'user'
  metadata JSONB DEFAULT '{}', -- Additional activity data
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('venue_live', 'friend_check_in', 'event_reminder', 'new_message', 'favorite_update')),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}', -- Additional notification data
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_venue_events_venue_id ON venue_events(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_events_start_date ON venue_events(start_date);
CREATE INDEX IF NOT EXISTS idx_venue_events_status ON venue_events(status);
CREATE INDEX IF NOT EXISTS idx_venue_events_featured ON venue_events(is_featured);

-- Event attendees indexes
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_status ON event_attendees(status);

-- User favorites indexes
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_venue_id ON user_favorites(venue_id);

-- Friends activity indexes
CREATE INDEX IF NOT EXISTS idx_friends_activity_user_id ON friends_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_activity_created_at ON friends_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friends_activity_public ON friends_activity(is_public);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ========================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE venue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Venue Events policies
CREATE POLICY "Anyone can view venue events" ON venue_events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON venue_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Event creators can update their events" ON venue_events FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM venues WHERE id = venue_id));

-- Event Attendees policies
CREATE POLICY "Users can view event attendees" ON event_attendees FOR SELECT USING (true);
CREATE POLICY "Users can manage their attendance" ON event_attendees FOR ALL USING (auth.uid() = user_id);

-- User Favorites policies
CREATE POLICY "Users can manage their favorites" ON user_favorites FOR ALL USING (auth.uid() = user_id);

-- Friends Activity policies
CREATE POLICY "Users can view public activity" ON friends_activity FOR SELECT USING (is_public = true);
CREATE POLICY "Users can manage their activity" ON friends_activity FOR ALL USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can manage their notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- FUNCTIONS FOR AUTOMATIC UPDATES
-- ========================================

-- Function to update event attendee count
CREATE OR REPLACE FUNCTION update_event_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE venue_events 
    SET current_attendees = (
      SELECT COUNT(*) 
      FROM event_attendees 
      WHERE event_id = NEW.event_id AND status = 'going'
    )
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE venue_events 
    SET current_attendees = (
      SELECT COUNT(*) 
      FROM event_attendees 
      WHERE event_id = OLD.event_id AND status = 'going'
    )
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for attendee count updates
CREATE TRIGGER update_attendee_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON event_attendees
  FOR EACH ROW EXECUTE FUNCTION update_event_attendee_count();

-- Function to create activity log
CREATE OR REPLACE FUNCTION log_favorite_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO friends_activity (user_id, activity_type, target_id, target_type)
    VALUES (NEW.user_id, 'favorite_venue', NEW.venue_id, 'venue');
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO friends_activity (user_id, activity_type, target_id, target_type, metadata)
    VALUES (OLD.user_id, 'favorite_venue', OLD.venue_id, 'venue', jsonb_build_object('removed', true));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for favorite activity
CREATE TRIGGER log_favorite_activity_trigger
  AFTER INSERT OR DELETE ON user_favorites
  FOR EACH ROW EXECUTE FUNCTION log_favorite_activity();

-- ========================================
-- VIEWS FOR COMMON QUERIES
-- ========================================

-- Upcoming events view
CREATE VIEW upcoming_events AS
SELECT 
  ve.*,
  v.name as venue_name,
  v.address,
  v.city,
  v.latitude,
  v.longitude,
  ea.current_attendees
FROM venue_events ve
JOIN venues v ON ve.venue_id = v.id
LEFT JOIN (
  SELECT event_id, COUNT(*) as current_attendees
  FROM event_attendees 
  WHERE status = 'going'
  GROUP BY event_id
) ea ON ve.id = ea.event_id
WHERE ve.status = 'upcoming' 
  AND ve.start_date > NOW()
ORDER BY ve.start_date ASC;

-- Friends activity feed view
CREATE VIEW friends_activity_feed AS
SELECT 
  fa.*,
  p.first_name,
  p.last_name,
  p.avatar,
  CASE 
    WHEN fa.target_type = 'venue' THEN v.name
    WHEN fa.target_type = 'event' THEN ve.title
    ELSE NULL
  END as target_name
FROM friends_activity fa
LEFT JOIN profiles p ON fa.user_id = p.id
LEFT JOIN venues v ON fa.target_id = v.id AND fa.target_type = 'venue'
LEFT JOIN venue_events ve ON fa.target_id = ve.id AND fa.target_type = 'event'
WHERE fa.is_public = true
ORDER BY fa.created_at DESC;

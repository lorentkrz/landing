"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { VenueEvent, EventAttendee, UserFavorite, FriendsActivity, Notification } from "../types/events";
import type { User } from "../types";

interface EventsContextType {
  events: VenueEvent[];
  featuredEvents: VenueEvent[];
  userFavorites: UserFavorite[];
  friendsActivity: FriendsActivity[];
  notifications: Notification[];
  isLoading: boolean;
  refreshEvents: () => Promise<void>;
  attendEvent: (eventId: string, status: EventAttendee['status']) => Promise<void>;
  toggleFavorite: (venueId: string) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  getEventById: (id: string) => VenueEvent | undefined;
  isUserAttending: (eventId: string) => EventAttendee['status'] | null;
  isVenueFavorite: (venueId: string) => boolean;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEvents must be used within EventsProvider");
  }
  return context;
};

interface EventsProviderProps {
  children: ReactNode;
}

export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<VenueEvent[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<VenueEvent[]>([]);
  const [userFavorites, setUserFavorites] = useState<UserFavorite[]>([]);
  const [friendsActivity, setFriendsActivity] = useState<FriendsActivity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch events
  const refreshEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch upcoming events
      const { data: eventsData, error: eventsError } = await supabase
        .from('venue_events')
        .select('*')
        .order('start_date', { ascending: true });

      if (eventsError) throw eventsError;
      
      setEvents(eventsData || []);
      
      // Set featured events
      const featured = eventsData?.filter(event => event.is_featured) || [];
      setFeaturedEvents(featured);
      
      // Fetch user favorites if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await fetchUserData(user.id);
      }
      
    } catch (error) {
      console.error('Error refreshing events:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch user-specific data
  const fetchUserData = async (userId: string) => {
    try {
      // Fetch user favorites
      const { data: favorites } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', userId);

      setUserFavorites(favorites || []);

      // Fetch friends activity
      const { data: activity } = await supabase
        .from('friends_activity_feed')
        .select('*')
        .limit(20);

      setFriendsActivity(activity || []);

      // Fetch unread notifications
      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      setNotifications(notifs || []);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Attend an event
  const attendEvent = useCallback(async (eventId: string, status: EventAttendee['status']) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('event_attendees')
        .upsert({
          event_id: eventId,
          user_id: user.id,
          status,
        }, {
          onConflict: 'event_id,user_id'
        });

      if (error) throw error;

      // Refresh events to update attendee counts
      await refreshEvents();
      
      // Log activity
      await supabase
        .from('friends_activity')
        .insert({
          user_id: user.id,
          activity_type: 'attending_event',
          target_id: eventId,
          target_type: 'event',
        });
      
    } catch (error) {
      console.error('Error attending event:', error);
      throw error;
    }
  }, [refreshEvents]);

  // Toggle favorite venue
  const toggleFavorite = useCallback(async (venueId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const existingFavorite = userFavorites.find(f => f.venue_id === venueId);
      
      if (existingFavorite) {
        // Remove favorite
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('venue_id', venueId);
          
        setUserFavorites(prev => prev.filter(f => f.venue_id !== venueId));
      } else {
        // Add favorite
        await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            venue_id: venueId,
          });
          
        setUserFavorites(prev => [...prev, { 
          id: '', 
          user_id: user.id, 
          venue_id: venueId, 
          created_at: new Date().toISOString() 
        }]);
      }
      
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }, [userFavorites]);

  // Mark notification as read
  const markNotificationRead = useCallback(async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  }, []);

  // Get event by ID
  const getEventById = useCallback((id: string) => {
    return events.find(event => event.id === id);
  }, [events]);

  // Check if user is attending an event
  const isUserAttending = useCallback((eventId: string) => {
    // This would need to be implemented with actual attendee data
    // For now, return null (not attending)
    return null;
  }, []);

  // Check if venue is favorite
  const isVenueFavorite = useCallback((venueId: string) => {
    return userFavorites.some(favorite => favorite.venue_id === venueId);
  }, [userFavorites]);

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to events changes
    const eventsSubscription = supabase
      .channel('events_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'venue_events' },
        () => refreshEvents()
      )
      .subscribe();

    // Subscribe to notifications
    const notificationsSubscription = supabase
      .channel('notifications')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      eventsSubscription.unsubscribe();
      notificationsSubscription.unsubscribe();
    };
  }, [refreshEvents]);

  // Initial data fetch
  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  const value: EventsContextType = {
    events,
    featuredEvents,
    userFavorites,
    friendsActivity,
    notifications,
    isLoading,
    refreshEvents,
    attendEvent,
    toggleFavorite,
    markNotificationRead,
    getEventById,
    isUserAttending,
    isVenueFavorite,
  };

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
};

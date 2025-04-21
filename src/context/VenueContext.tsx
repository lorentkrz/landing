import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { VENUES } from '../data/venues'; // Assuming VENUES data is being imported from here

interface Venue {
  id: string;
  name: string;
  location: string;
  description: string; // Add description to the venue if necessary
}

interface VenueContextType {
  venues: Venue[];
  setVenues: React.Dispatch<React.SetStateAction<Venue[]>>;
  getVenueById: (id: string) => Venue | undefined;
}

const VenueContext = createContext<VenueContextType | undefined>(undefined);

export const useVenues = (): VenueContextType => {
  const context = useContext(VenueContext);
  if (!context) {
    throw new Error('useVenues must be used within a VenueProvider');
  }
  return context;
};

interface VenueProviderProps {
  children: ReactNode;
}

export const VenueProvider: React.FC<VenueProviderProps> = ({ children }) => {
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    // Load the predefined venues once the component is mounted
    setVenues(VENUES);
  }, []);

  const getVenueById = (id: string): Venue | undefined => {
    return venues.find(venue => venue.id === id);
  };

  return (
    <VenueContext.Provider value={{ venues, setVenues, getVenueById }}>
      {children}
    </VenueContext.Provider>
  );
};

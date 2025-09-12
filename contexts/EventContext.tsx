"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
}

interface EventContextType {
  selectedEvent: CalendarEvent | null;
  setSelectedEvent: (event: CalendarEvent | null) => void;
  handleEventSelection: (event: CalendarEvent) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

interface EventProviderProps {
  children: ReactNode;
}

export function EventProvider({ children }: EventProviderProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  const handleEventSelection = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  return (
    <EventContext.Provider
      value={{
        selectedEvent,
        setSelectedEvent,
        handleEventSelection,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEvent must be used within an EventProvider");
  }
  return context;
}

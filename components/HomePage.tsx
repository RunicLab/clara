"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import ChatBot from "@/components/ChatBot";
import CustomCalendar from "@/components/CustomCalendar";
import { EventProvider, useEvent } from "@/contexts/EventContext";
import { useEffect } from "react";
import { CalendarEvent } from "@/types/events";

// Sample events data
const initialEvents: CalendarEvent[] = [];

function HomePageContent() {
  const [events, setEvents] = useState(initialEvents);
  const { handleEventSelection } = useEvent();

  const fetchCalendarEvents = async () => {
    try {
      const response = await fetch("/api/calendar/events");
      const data = await response.json();
      if (response.ok && data.events) {
        const formattedEvents = data.events.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error("Error fetching calendar events:", error);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  const handleSendMessage = async (
    message: string,
    conversationHistory: any[]
  ) => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        conversationHistory,
      }),
    });

    const data = await response.json();
    return data;
  };

  const handleSelectEvent = (event: any) => {
    handleEventSelection(event);
  };

  return (
    <div className="bg-transparent h-full flex flex-col">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 min-h-0 h-full">
          {/* Calendar Section - Left Side (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col min-h-0 h-full">
            <div className="flex-1 p-4 min-h-0 h-full">
              <div className="h-full w-full">
                <CustomCalendar
                  events={events}
                  onSelectEvent={handleSelectEvent}
                  onCalendarRefresh={fetchCalendarEvents}
                />
              </div>
            </div>
          </div>

          {/* Chat Section - Right Side (1/3 width) */}
          <div className="lg:col-span-1 flex flex-col min-h-0 h-full p-4">
            <div className="h-full w-full">
              <ChatBot
                onSendMessage={handleSendMessage}
                onCalendarRefresh={fetchCalendarEvents}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <EventProvider>
      <HomePageContent />
    </EventProvider>
  );
}

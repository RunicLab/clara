"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  category?: string;
}

interface CustomCalendarProps {
  events?: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onCalendarRefresh?: () => void;
  onViewDateChange?: (date: Date) => void;
  isLoading?: boolean;
}

// Event category colors matching the design
const eventColors = [
  { bg: "rgba(41, 204, 57, 0.05)", border: "#29CC39", badge: "#29CC39" }, // Green
  { bg: "rgba(255, 102, 51, 0.05)", border: "#FF6633", badge: "#FF6633" }, // Orange
  { bg: "rgba(51, 191, 255, 0.05)", border: "#33BFFF", badge: "#33BFFF" }, // Teal Blue
  { bg: "rgba(136, 51, 255, 0.05)", border: "#8833FF", badge: "#8833FF" }, // Purple
  { bg: "rgba(255, 203, 51, 0.05)", border: "#FFCB33", badge: "#FFCB33" }, // Yellow
  { bg: "rgba(230, 46, 123, 0.05)", border: "#E62E7B", badge: "#E62E7B" }, // Pink
  { bg: "rgba(204, 116, 41, 0.05)", border: "#CC7429", badge: "#CC7429" }, // Bronze
  { bg: "rgba(46, 230, 202, 0.05)", border: "#2EE6CA", badge: "#2EE6CA" }, // Tiffany
];

// Week view time slots (1 AM to 11 PM) - Google Calendar style
const weekTimeSlots = [
  "1 AM",
  "2 AM",
  "3 AM",
  "4 AM",
  "5 AM",
  "6 AM",
  "7 AM",
  "8 AM",
  "9 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
  "5 PM",
  "6 PM",
  "7 PM",
  "8 PM",
  "9 PM",
  "10 PM",
  "11 PM",
];

// Day view time slots (12 AM to 11 PM) - 12-hour format
const dayTimeSlots = [
  "12 AM",
  "1 AM",
  "2 AM",
  "3 AM",
  "4 AM",
  "5 AM",
  "6 AM",
  "7 AM",
  "8 AM",
  "9 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
  "5 PM",
  "6 PM",
  "7 PM",
  "8 PM",
  "9 PM",
  "10 PM",
  "11 PM",
];

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function CustomCalendar({
  events = [],
  onSelectEvent,
  onCalendarRefresh,
  onViewDateChange,
  isLoading = false,
}: CustomCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"Week" | "Month" | "Day">("Month");
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get week dates
  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    start.setDate(diff);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  // Get month dates
  const getMonthDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get the Monday of the first week
    const startDate = new Date(firstDay);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate.setDate(diff);

    const dates = [];
    for (let i = 0; i < 42; i++) {
      // 6 weeks * 7 days
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentDate);
  const monthDates = getMonthDates(currentDate);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  // Format date range
  const formatDateRange = () => {
    if (view === "Month") {
      return currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } else if (view === "Day") {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } else {
      const startMonth = weekStart.toLocaleDateString("en-US", {
        month: "short",
      });
      const startDay = weekStart.getDate();
      const endMonth = weekEnd.toLocaleDateString("en-US", { month: "short" });
      const endDay = weekEnd.getDate();

      if (startMonth === endMonth) {
        return `${startMonth} ${startDay} – ${endDay}`;
      }
      return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
    }
  };

  // Navigate dates - like Google Calendar
  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);

    if (view === "Month") {
      // Navigate by month
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    } else if (view === "Week") {
      // Navigate by week
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else if (view === "Day") {
      // Navigate by day
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    }

    setCurrentDate(newDate);
    onViewDateChange?.(newDate);
  };

  // Handle view change - maintain current date context
  const handleViewChange = (newView: "Week" | "Month" | "Day") => {
    setView(newView);
    onViewDateChange?.(currentDate);
  };

  // Auto-switch to Day view on mobile for better UX
  useEffect(() => {
    if (isMobile && view === "Week") {
      setView("Day");
    }
  }, [isMobile, view]);

  // Go to today - like Google Calendar
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onViewDateChange?.(today);
  };

  // Get navigation labels based on current view
  const getNavigationLabel = () => {
    if (view === "Month") {
      return "month";
    } else if (view === "Week") {
      return "week";
    } else if (view === "Day") {
      return "day";
    }
    return "period";
  };

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      return (
        eventStart.getDate() === date.getDate() &&
        eventStart.getMonth() === date.getMonth() &&
        eventStart.getFullYear() === date.getFullYear()
      );
    });
  };

  // Get events for a specific day and time (for week/day view)
  const getEventsForDayAndTime = (dayIndex: number, timeSlot: string) => {
    const dayDate = weekDates[dayIndex];
    const hour = parseInt(timeSlot);

    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      return (
        eventStart.getDate() === dayDate.getDate() &&
        eventStart.getMonth() === dayDate.getMonth() &&
        eventStart.getFullYear() === dayDate.getFullYear() &&
        eventStart.getHours() <= hour &&
        eventEnd.getHours() > hour
      );
    });
  };

  // Get random color for event
  const getEventColor = (event: CalendarEvent) => {
    const index = event.id.charCodeAt(0) % eventColors.length;
    return eventColors[index];
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Get current time position for indicator
  const getCurrentTimePosition = (timeSlots: string[]) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentHourStr = currentHour.toString().padStart(2, "0");

    // Check if current hour is in the time slots
    const hourIndex = timeSlots.findIndex((slot) => slot === currentHourStr);
    if (hourIndex === -1) return null;

    const minuteOffset = (currentMinute / 60) * (100 / timeSlots.length);
    return hourIndex * (100 / timeSlots.length) + minuteOffset;
  };

  // Helper function to convert 12-hour format to 24-hour for calculations
  const parseTimeSlot = (timeSlot: string): number => {
    const [time, period] = timeSlot.split(" ");
    const hour = parseInt(time);
    if (period === "AM") {
      return hour === 12 ? 0 : hour;
    } else {
      return hour === 12 ? 12 : hour + 12;
    }
  };

  // Render Month View
  const renderMonthView = () => (
    <div className="flex-1 flex flex-col min-h-0 h-full">
      {/* Days header */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/30 flex-shrink-0">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="h-8 sm:h-12 border-r border-gray-100 last:border-r-0 flex items-center justify-center"
          >
            <span className="text-xs sm:text-sm font-bold text-gray-600">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 3)}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Month grid - takes all remaining space */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 min-h-0 h-full">
        {monthDates.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = date.toDateString() === new Date().toDateString();
          const dayEvents = getEventsForDay(date);

          return (
            <div
              key={index}
              className={`border-r border-b border-gray-100 last:border-r-0 p-1 sm:p-2 flex flex-col ${
                isCurrentMonth ? "bg-white" : "bg-gray-50/50"
              }`}
            >
              <span
                className={`text-xs sm:text-sm font-bold mb-1 flex-shrink-0 ${
                  isCurrentMonth ? "text-gray-900" : "text-gray-400"
                } ${isToday ? "text-white" : ""}`}
                style={{
                  ...(isToday && {
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    fontSize: "10px",
                  }),
                }}
              >
                {date.getDate()}
              </span>

              {/* Events - takes remaining space */}
              <div className="flex-1 space-y-0.5 sm:space-y-1 min-h-0 overflow-hidden">
                {dayEvents.slice(0, isMobile ? 2 : 4).map((event) => {
                  const colorScheme = getEventColor(event);
                  return (
                    <div
                      key={event.id}
                      onClick={() => onSelectEvent?.(event)}
                      className="cursor-pointer hover:opacity-80 transition-opacity rounded text-xs p-0.5 sm:p-1 truncate"
                      style={{
                        background: colorScheme.bg,
                        border: `1px solid ${colorScheme.border}`,
                        color: "#4D5E80",
                      }}
                    >
                      {event.title}
                    </div>
                  );
                })}
                {dayEvents.length > (isMobile ? 2 : 4) && (
                  <div className="text-xs text-gray-500">
                    +{dayEvents.length - (isMobile ? 2 : 4)} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render Week View - Google Calendar Style
  const renderWeekView = () => (
    <div className="flex-1 flex flex-col min-h-0 h-full">
      {/* Fixed Header - Days and Dates */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className="flex">
          {/* Empty space for time column */}
          <div className="w-12 sm:w-16 border-r border-gray-200 bg-gray-50"></div>

          {/* Days header */}
          <div className="flex-1 grid grid-cols-7">
            {weekDates.map((date, index) => (
              <div
                key={index}
                className="h-10 sm:h-12 border-r border-gray-200 last:border-r-0 flex flex-col items-center justify-center"
              >
                <span className="text-xs sm:text-sm font-medium text-gray-600">
                  <span className="hidden sm:inline">{daysOfWeek[index]}</span>
                  <span className="sm:hidden">
                    {daysOfWeek[index].slice(0, 3)}
                  </span>
                </span>
                <span className="text-xs text-gray-500">{date.getDate()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 flex min-h-0 overflow-y-auto scrollbar-hide">
        {/* Time column - Fixed */}
        <div className="w-12 sm:w-16 flex-shrink-0">
          {weekTimeSlots.map((time, index) => (
            <div
              key={time}
              className="h-10 sm:h-12 border-b border-r border-gray-100 bg-gray-50 flex items-center justify-center relative"
            >
              <span className="text-xs text-gray-500">{time}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid - Scrollable */}
        <div className="flex-1 relative">
          <div
            className="absolute inset-0"
            style={{
              height: `${weekTimeSlots.length * (isMobile ? 40 : 48)}px`,
            }}
          >
            {/* Horizontal lines */}
            {weekTimeSlots.slice(0, -1).map((_, index) => (
              <div
                key={index}
                className="absolute left-0 right-0 h-px bg-gray-100"
                style={{
                  top: `${(index + 1) * (isMobile ? 40 : 48)}px`, // 40px on mobile, 48px on desktop
                }}
              />
            ))}

            {/* Vertical lines */}
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="absolute top-0 bottom-0 w-px bg-gray-100"
                style={{ left: `${(index * 100) / 7}%` }}
              />
            ))}

            {/* Events */}
            {events.map((event) => {
              const eventStart = new Date(event.start);
              const eventEnd = new Date(event.end);
              const dayIndex = weekDates.findIndex(
                (date) =>
                  date.getDate() === eventStart.getDate() &&
                  date.getMonth() === eventStart.getMonth() &&
                  date.getFullYear() === eventStart.getFullYear()
              );

              if (dayIndex === -1) return null;

              const startHour = eventStart.getHours();
              const endHour = eventEnd.getHours();
              const startMinute = eventStart.getMinutes();
              const endMinute = eventEnd.getMinutes();

              // Calculate position based on responsive height per hour (starting from 1 AM)
              const hourHeight = isMobile ? 40 : 48;
              const topPosition =
                (startHour - 1) * hourHeight + (startMinute / 60) * hourHeight;
              const height =
                (endHour - startHour) * hourHeight +
                ((endMinute - startMinute) / 60) * hourHeight;

              const colorScheme = getEventColor(event);

              return (
                <div
                  key={event.id}
                  onClick={() => onSelectEvent?.(event)}
                  className="absolute cursor-pointer hover:shadow-md transition-all duration-200 rounded border-l-4"
                  style={{
                    left: `${dayIndex * (100 / 7) + 1}%`,
                    width: `${100 / 7 - 2}%`,
                    top: `${topPosition}px`,
                    height: `${height}px`,
                    background: colorScheme.bg,
                    borderLeftColor: colorScheme.border,
                    border: `1px solid ${colorScheme.border}20`,
                    boxSizing: "border-box",
                  }}
                >
                  <div className="p-1">
                    {/* Event Title */}
                    <div className="text-gray-800 font-semibold text-xs leading-tight truncate">
                      {event.title}
                    </div>

                    {/* Time */}
                    <div className="text-gray-600 text-xs mt-0.5">
                      {formatTime(eventStart)} - {formatTime(eventEnd)}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Current Time Indicator - Red line like Google Calendar */}
            {(() => {
              const now = new Date();
              const currentHour = now.getHours();
              const currentMinute = now.getMinutes();

              // Only show if current time is within our time range (1 AM - 11 PM)
              if (currentHour < 1 || currentHour > 23) return null;

              // Find current day index in the week
              const currentDayIndex = weekDates.findIndex(
                (date) =>
                  date.getDate() === now.getDate() &&
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear()
              );

              // Only show if current day is in this week
              if (currentDayIndex === -1) return null;

              const hourHeight = isMobile ? 40 : 48;
              const topPosition =
                (currentHour - 1) * hourHeight +
                (currentMinute / 60) * hourHeight;

              return (
                <div
                  className="absolute h-0.5 bg-red-500 z-10"
                  style={{
                    top: `${topPosition}px`,
                    left: `${currentDayIndex * (100 / 7)}%`,
                    right: `${(6 - currentDayIndex) * (100 / 7)}%`,
                  }}
                >
                  <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />
                  <div className="absolute -right-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Day View
  const renderDayView = () => (
    <div className="flex-1 flex flex-col min-h-0 h-full">
      {/* Fixed Header - Day and Date */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className="flex">
          {/* Empty space for time column */}
          <div className="w-12 sm:w-16 border-r border-gray-200 bg-gray-50"></div>

          {/* Day header */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm font-bold text-gray-600">
                <span className="hidden sm:inline">
                  {currentDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                  })}
                </span>
                <span className="sm:hidden">
                  {currentDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                  })}
                </span>
              </span>
              <span
                className={`text-xs sm:text-sm font-bold ${
                  currentDate.toDateString() === new Date().toDateString()
                    ? "text-white"
                    : "text-gray-600"
                }`}
                style={{
                  ...(currentDate.toDateString() ===
                    new Date().toDateString() && {
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                  }),
                }}
              >
                {currentDate.getDate()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 flex min-h-0 overflow-y-auto scrollbar-hide">
        {/* Time column - Scrollable */}
        <div className="w-12 sm:w-16 flex-shrink-0">
          {dayTimeSlots.map((time, index) => (
            <div
              key={time}
              className="h-10 sm:h-12 border-b border-r border-gray-100 bg-gray-50 flex items-center justify-center relative"
            >
              <span className="text-xs text-gray-500">{time}</span>
            </div>
          ))}
        </div>

        {/* Day column - Scrollable */}
        <div className="flex-1 relative">
          <div
            className="absolute inset-0"
            style={{
              height: `${dayTimeSlots.length * (isMobile ? 40 : 48)}px`,
            }}
          >
            {/* Horizontal lines */}
            {dayTimeSlots.slice(0, -1).map((_, index) => (
              <div
                key={index}
                className="absolute left-0 right-0 h-px bg-gray-100"
                style={{ top: `${(index + 1) * (isMobile ? 40 : 48)}px` }}
              />
            ))}

            {/* Events */}
            {events.map((event) => {
              const eventStart = new Date(event.start);
              const eventEnd = new Date(event.end);

              // Check if event is on current day
              if (
                eventStart.getDate() !== currentDate.getDate() ||
                eventStart.getMonth() !== currentDate.getMonth() ||
                eventStart.getFullYear() !== currentDate.getFullYear()
              ) {
                return null;
              }

              const startHour = eventStart.getHours();
              const endHour = eventEnd.getHours();
              const startMinute = eventStart.getMinutes();
              const endMinute = eventEnd.getMinutes();

              // Calculate position based on responsive height per hour (starting from 12 AM)
              const hourHeight = isMobile ? 40 : 48;
              const topPosition =
                startHour * hourHeight + (startMinute / 60) * hourHeight;
              const height =
                (endHour - startHour) * hourHeight +
                ((endMinute - startMinute) / 60) * hourHeight;

              const colorScheme = getEventColor(event);

              return (
                <div
                  key={event.id}
                  onClick={() => onSelectEvent?.(event)}
                  className="absolute cursor-pointer hover:shadow-md transition-all duration-200 rounded border-l-4"
                  style={{
                    left: "1%",
                    width: "98%",
                    top: `${topPosition}px`,
                    height: `${height}px`,
                    background: colorScheme.bg,
                    borderLeftColor: colorScheme.border,
                    border: `1px solid ${colorScheme.border}20`,
                    boxSizing: "border-box",
                  }}
                >
                  <div className="p-2">
                    {/* Event Title */}
                    <div className="text-gray-800 font-semibold text-sm leading-tight truncate">
                      {event.title}
                    </div>

                    {/* Time */}
                    <div className="text-gray-600 text-xs mt-1">
                      {formatTime(eventStart)} - {formatTime(eventEnd)}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Current Time Indicator - Red line like Google Calendar */}
            {(() => {
              const now = new Date();
              const currentHour = now.getHours();
              const currentMinute = now.getMinutes();

              // Only show if current time is within our time range (12 AM - 11 PM)
              if (currentHour < 0 || currentHour > 23) return null;

              // Only show if current day matches the displayed day
              if (currentDate.toDateString() !== now.toDateString())
                return null;

              const hourHeight = isMobile ? 40 : 48;
              const topPosition =
                currentHour * hourHeight + (currentMinute / 60) * hourHeight;

              return (
                <div
                  className="absolute left-0 right-0 h-0.5 bg-red-500 z-10"
                  style={{ top: `${topPosition}px` }}
                >
                  <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />
                  <div className="absolute -right-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-100 bg-gray-50/50 gap-3 sm:gap-4 flex-wrap">
        {/* Left side - Today button and navigation */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={goToToday}
            className="px-3 sm:px-4 py-1 text-xs sm:text-base font-medium text-gray-600 hover:text-black cursor-pointer bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl hover:bg-gray-50 transition-colors"
          >
            Today
          </button>

          <div className="flex items-center gap-1 sm:gap-3">
            <button
              onClick={() => navigateDate("prev")}
              className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
              title={`Previous ${getNavigationLabel()}`}
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>

            <span
              className="text-xs sm:text-sm font-bold text-gray-600 min-w-[80px] sm:min-w-[120px] text-center cursor-pointer hover:text-gray-800 transition-colors truncate"
              title="Click to go to today"
              onClick={goToToday}
            >
              {formatDateRange()}
            </span>

            <button
              onClick={() => navigateDate("next")}
              className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
              title={`Next ${getNavigationLabel()}`}
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin"></div>
              Loading...
            </div>
          )}
        </div>

        {/* Right side - View toggles (Google Calendar style) */}
        <div className="flex items-center self-center sm:self-start overflow-hidden rounded-xl sm:rounded-2xl shadow-sm w-fit">
          {(["Week", "Month", "Day"] as const).map((viewOption, index) => (
            <button
              key={viewOption}
              onClick={() => handleViewChange(viewOption)}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                index === 0 ? "rounded-l-xl sm:rounded-l-2xl" : ""
              } ${index === 2 ? "rounded-r-xl sm:rounded-r-2xl" : ""} ${
                view === viewOption
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-transparent"
              }`}
            >
              {viewOption}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 min-h-0">
        {view === "Month" && renderMonthView()}
        {view === "Week" && renderWeekView()}
        {view === "Day" && renderDayView()}
      </div>
    </div>
  );
}

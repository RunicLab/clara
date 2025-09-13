"use client";
import React, { useCallback, useState } from "react";
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
	const [currentViewDate, setCurrentViewDate] = useState(new Date());
	const [isLoading, setIsLoading] = useState(false);

	const getMonthRange = (date: Date) => {
		const start = new Date(date.getFullYear(), date.getMonth(), 1);
		const end = new Date(
			date.getFullYear(),
			date.getMonth() + 1,
			0,
			23,
			59,
			59,
		);
		return { start, end };
	};

	const fetchCalendarEvents = useCallback(
		async (viewDate?: Date) => {
			setIsLoading(true);
			try {
				const dateToUse = viewDate || currentViewDate;
				const { start, end } = getMonthRange(dateToUse);

				// Format dates for API
				const timeMin = start.toISOString();
				const timeMax = end.toISOString();

				const response = await fetch(
					`/api/calendar/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`,
				);
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
			} finally {
				setIsLoading(false);
			}
		},
		[currentViewDate],
	);

	const handleViewDateChange = useCallback(
		(newDate: Date) => {
			setCurrentViewDate(newDate);
			fetchCalendarEvents(newDate);
		},
		[fetchCalendarEvents],
	);

	useEffect(() => {
		fetchCalendarEvents();
	}, []);

	const handleSendMessage = async (
		message: string,
		conversationHistory: any[],
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
				<div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 lg:gap-2 xl:gap-6 min-h-0 h-full">
					{/* Calendar Section - Left Side (2/3 width on desktop, full width on mobile/tablet) */}
					<div className="md:col-span-2 lg:col-span-2 flex flex-col min-h-0 h-full">
						<div className="flex-1 p-2 md:p-4 min-h-0 h-full">
							<div className="h-full w-full">
								<CustomCalendar
									events={events}
									onSelectEvent={handleSelectEvent}
									onCalendarRefresh={fetchCalendarEvents}
									onViewDateChange={handleViewDateChange}
									isLoading={isLoading}
								/>
							</div>
						</div>
					</div>

					{/* Chat Section - Right Side (1/3 width on desktop, full width on mobile/tablet) */}
					<div className="md:col-span-2 lg:col-span-1 flex flex-col min-h-0 h-full p-2 md:p-4">
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

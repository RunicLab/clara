"use client";
import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, CalendarDays, MessageSquare } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { useRef, useEffect } from "react";
import { CalendarEvent } from "@/types/events";

const locales = {
	"en-US": enUS,
};

const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek,
	getDay,
	locales,
});

// Sample events data
const initialEvents: CalendarEvent[] = [];

export default function HomePage() {
	const [events, setEvents] = useState(initialEvents);
	const [messages, setMessages] = useState([
		{
			id: 1,
			text: "Hello! I'm your AI assistant. I can help you manage your calendar, schedule events, or answer any questions you have.",
			sender: "ai",
		},
	]);
	const [inputValue, setInputValue] = useState("");
	const [selectedEvent, setSelectedEvent] = useState(null);
	const scrollAreaRef = useRef<any>(null);

	// Auto-scroll to bottom when messages change
	useEffect(() => {
		if (scrollAreaRef.current) {
			const scrollContainer = scrollAreaRef?.current.querySelector(
				"[data-radix-scroll-area-viewport]",
			);
			if (scrollContainer) {
				scrollContainer.scrollTop = scrollContainer.scrollHeight;
			}
		}
	}, [messages]);

	useEffect(() => {
		const getCalendarEvents = async () => {
			try {
				const response = await fetch("/api/calendar/events");
				const data = await response.json();
				if (response.ok && data.events.length > 0) {
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

		getCalendarEvents();
	}, []);

	const handleSendMessage = () => {
		if (!inputValue.trim()) return;

		const newMessage = {
			id: messages.length + 1,
			text: inputValue,
			sender: "user",
		};

		setMessages((prev) => [...prev, newMessage]);

		// Simulate AI response
		setTimeout(() => {
			let aiResponse = "I understand you want to ";

			if (
				inputValue.toLowerCase().includes("schedule") ||
				inputValue.toLowerCase().includes("meeting")
			) {
				aiResponse =
					"I can help you schedule a meeting. What date and time would work best for you?";
			} else if (inputValue.toLowerCase().includes("calendar")) {
				aiResponse = `You currently have ${events.length} events in your calendar. Would you like me to show you more details about any of them?`;
			} else if (
				inputValue.toLowerCase().includes("delete") ||
				inputValue.toLowerCase().includes("remove")
			) {
				aiResponse =
					"I can help you remove events from your calendar. Which event would you like to delete?";
			} else {
				aiResponse = `I received your message: "${inputValue}". How can I help you with your calendar or scheduling needs?`;
			}

			const aiMessage = {
				id: messages.length + 2,
				text: aiResponse,
				sender: "ai",
			};

			setMessages((prev) => [...prev, aiMessage]);
		}, 1000);

		setInputValue("");
	};

	const handleSelectEvent = (event: any) => {
		setSelectedEvent(event);
		const eventMessage = {
			id: messages.length + 1,
			text: `Selected event: "${event.title}" on ${format(
				event.start,
				"PPpp",
			)}`,
			sender: "system",
		};
		setMessages((prev) => [...prev, eventMessage]);
	};

	const handleKeyPress = (e: any) => {
		if (e.key === "Enter") {
			handleSendMessage();
		}
	};

	return (
		<div className="bg-transparent">
			<div className="min-h-full   flex flex-col p-4 max-w-full">
				{/* Header */}
				<div className="flex-shrink-0 mb-4">
					<h1 className="text-2xl md:text-3xl font-semibold text-gray-800 flex items-center gap-1.5">
						<CalendarDays className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
						clara
					</h1>
				</div>

				{/* Main Layout */}
				<div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 min-h-0">
					{/* Calendar Section - Left Side (2/3 width) */}
					<div className="lg:col-span-2 min-h-0">
						<Card className="h-full shadow-sm flex flex-col">
							<CardHeader className="flex-shrink-0 pb-3">
								<CardTitle className="flex items-center gap-2 text-lg">
									<CalendarDays className="h-5 w-5" />
									Your Calendar
								</CardTitle>
							</CardHeader>
							<CardContent className="flex-1 min-h-0 p-4">
								<div className="h-full w-full overflow-hidden">
									<Calendar
										localizer={localizer}
										events={events}
										startAccessor="start"
										endAccessor="end"
										onSelectEvent={handleSelectEvent}
										style={{ height: "100%", width: "100%" }}
										views={["month", "week", "day"]}
										popup
										eventPropGetter={(event) => ({
											style: {
												backgroundColor: "#3b82f6",
												borderRadius: "6px",
												border: "none",
												color: "white",
												fontSize: "12px",
											},
										})}
									/>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Chat Section - Right Side (1/3 width) */}
					<div className="lg:col-span-1 min-h-0">
						<Card className="h-full shadow-sm flex flex-col">
							<CardHeader className="flex-shrink-0 pb-3">
								<CardTitle className="flex items-center gap-2 text-lg">
									<MessageSquare className="h-5 w-5" />
									talk to clara
								</CardTitle>
							</CardHeader>
							<CardContent className="flex-1 flex flex-col p-0 min-h-0">
								{/* Messages Area */}
								<ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0">
									<div className="p-4 space-y-3">
										{messages.map((message) => (
											<div
												key={message.id}
												className={`flex ${
													message.sender === "user"
														? "justify-end"
														: "justify-start"
												}`}
											>
												<div
													className={`max-w-[85%] p-2.5 rounded-lg text-sm break-words ${
														message.sender === "user"
															? "bg-blue-600 text-white"
															: message.sender === "system"
																? "bg-gray-200 text-gray-800"
																: "bg-gray-100 text-gray-800"
													}`}
												>
													{message.text}
												</div>
											</div>
										))}
									</div>
								</ScrollArea>

								{/* Input Area */}
								<div className="flex-shrink-0 p-3 border-t bg-white">
									<div className="flex space-x-2">
										<Input
											placeholder="Ask clara about your calendar..."
											value={inputValue}
											onChange={(e) => setInputValue(e.target.value)}
											onKeyPress={handleKeyPress}
											className="flex-1 text-sm"
										/>
										<Button
											onClick={handleSendMessage}
											size="icon"
											className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
										>
											<Send className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}

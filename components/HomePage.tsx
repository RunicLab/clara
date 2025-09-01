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
const initialEvents = [
	{
		id: 1,
		title: "Team Meeting",
		start: new Date(2025, 8, 3, 10, 0), // September 3, 2025, 10:00 AM
		end: new Date(2025, 8, 3, 11, 0), // September 3, 2025, 11:00 AM
	},
	{
		id: 2,
		title: "Project Review",
		start: new Date(2025, 8, 5, 14, 0), // September 5, 2025, 2:00 PM
		end: new Date(2025, 8, 5, 15, 30), // September 5, 2025, 3:30 PM
	},
	{
		id: 3,
		title: "Client Call",
		start: new Date(2025, 8, 8, 9, 0), // September 8, 2025, 9:00 AM
		end: new Date(2025, 8, 8, 10, 0), // September 8, 2025, 10:00 AM
	},
];

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

	const handleSelectEvent = (event) => {
		setSelectedEvent(event);
		const eventMessage = {
			id: messages.length + 1,
			text: `Selected event: "${event.title}" on ${format(event.start, "PPpp")}`,
			sender: "system",
		};
		setMessages((prev) => [...prev, eventMessage]);
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			handleSendMessage();
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			<div className="container mx-auto p-4">
				{/* Header */}
				<div className="mb-6">
					<h1 className="text-3xl font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
						<CalendarDays className="h-8 w-8 text-blue-600" />
						clara
					</h1>
				</div>

				{/* Main Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
					{/* Calendar Section - Left Side (2/3 width) */}
					<div className="lg:col-span-2">
						<Card className="h-full shadow-lg">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CalendarDays className="h-5 w-5" />
									Your Calendar
								</CardTitle>
							</CardHeader>
							<CardContent className="h-full pb-4">
								<div className="h-[calc(100%-2rem)]">
									<Calendar
										localizer={localizer}
										events={events}
										startAccessor="start"
										endAccessor="end"
										onSelectEvent={handleSelectEvent}
										style={{ height: "100%" }}
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
					<div className="lg:col-span-1">
						<Card className="h-full shadow-lg flex flex-col">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									talk to clara
								</CardTitle>
							</CardHeader>
							<CardContent className="flex-1 flex flex-col p-0">
								{/* Messages Area */}
								<ScrollArea className="flex-1 p-4">
									<div className="space-y-4">
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
													className={`max-w-[80%] p-3 rounded-lg ${
														message.sender === "user"
															? "bg-blue-600 text-white"
															: message.sender === "system"
																? "bg-gray-200 text-gray-800 text-sm"
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
								<div className="p-4 border-t bg-white">
									<div className="flex space-x-2">
										<Input
											placeholder="Ask clara about your calendar or schedule events..."
											value={inputValue}
											onChange={(e) => setInputValue(e.target.value)}
											onKeyPress={handleKeyPress}
											className="flex-1"
										/>
										<Button
											onClick={handleSendMessage}
											size="icon"
											className="bg-blue-600 hover:bg-blue-700"
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

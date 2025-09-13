import { NextRequest } from "next/server";
import { SchemaType, FunctionDeclaration } from "@google/generative-ai";

export const claraFunctions: FunctionDeclaration[] = [
	{
		name: "get_calendar_events",
		description: "Get calendar events for a specific date range",
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				timeMin: {
					type: SchemaType.STRING,
					description: "Start date in ISO format (optional, defaults to today)",
				},
				timeMax: {
					type: SchemaType.STRING,
					description:
						"End date in ISO format (optional, defaults to 30 days from now)",
				},
			},
		},
	},
	{
		name: "create_calendar_event",
		description: "Create a new calendar event",
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				title: {
					type: SchemaType.STRING,
					description: "Event title",
				},
				start: {
					type: SchemaType.STRING,
					description: "Event start date and time in ISO format",
				},
				end: {
					type: SchemaType.STRING,
					description: "Event end date and time in ISO format",
				},
				description: {
					type: SchemaType.STRING,
					description: "Event description (optional)",
				},
				location: {
					type: SchemaType.STRING,
					description: "Event location (optional)",
				},
			},
			required: ["title", "start", "end"],
		},
	},
	{
		name: "delete_calendar_event",
		description: "Delete a calendar event by ID",
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				eventId: {
					type: SchemaType.STRING,
					description: "The ID of the event to delete",
				},
			},
			required: ["eventId"],
		},
	},
	// NEW ENHANCED FUNCTIONS
	{
		name: "find_and_delete_events",
		description:
			"Find and delete events by title, date, or description. Safer than deleting by ID.",
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				searchQuery: {
					type: SchemaType.STRING,
					description: "Search term to match in event title or description",
				},
				dateFilter: {
					type: SchemaType.STRING,
					description: "Optional date to filter events (ISO format)",
				},
				confirmDelete: {
					type: SchemaType.BOOLEAN,
					description:
						"Set to true to actually delete, false to just preview what would be deleted",
				},
			},
			required: ["searchQuery"],
		},
	},
	{
		name: "update_calendar_event",
		description: "Update an existing calendar event by finding it first",
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				searchQuery: {
					type: SchemaType.STRING,
					description: "Search term to find the event to update",
				},
				updates: {
					type: SchemaType.OBJECT,
					properties: {
						title: { type: SchemaType.STRING },
						start: { type: SchemaType.STRING },
						end: { type: SchemaType.STRING },
						description: { type: SchemaType.STRING },
						location: { type: SchemaType.STRING },
					},
				},
			},
			required: ["searchQuery", "updates"],
		},
	},
	{
		name: "find_free_time",
		description: "Find available time slots between events for scheduling",
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				date: {
					type: SchemaType.STRING,
					description:
						"Date to check for free time (ISO format, optional - defaults to today)",
				},
				duration: {
					type: SchemaType.NUMBER,
					description: "Duration needed in minutes (optional - defaults to 60)",
				},
				workingHours: {
					type: SchemaType.OBJECT,
					properties: {
						start: {
							type: SchemaType.STRING,
							description: "Work day start time (HH:MM)",
						},
						end: {
							type: SchemaType.STRING,
							description: "Work day end time (HH:MM)",
						},
					},
				},
			},
		},
	},
	{
		name: "get_schedule_summary",
		description: "Get a smart summary of upcoming events and schedule",
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				period: {
					type: SchemaType.STRING,
					description: "Time period: 'today', 'tomorrow', 'week', 'month'",
				},
				includeStats: {
					type: SchemaType.BOOLEAN,
					description:
						"Include statistics like total meetings, free time, etc.",
				},
			},
		},
	},
	{
		name: "create_recurring_event",
		description: "Create a recurring event with multiple occurrences",
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				title: { type: SchemaType.STRING },
				start: { type: SchemaType.STRING },
				end: { type: SchemaType.STRING },
				description: { type: SchemaType.STRING },
				location: { type: SchemaType.STRING },
				recurrence: {
					type: SchemaType.OBJECT,
					properties: {
						frequency: {
							type: SchemaType.STRING,
							description: "daily, weekly, monthly",
						},
						interval: {
							type: SchemaType.NUMBER,
							description: "Every X days/weeks/months",
						},
						until: {
							type: SchemaType.STRING,
							description: "End date for recurrence (ISO format)",
						},
						count: {
							type: SchemaType.NUMBER,
							description: "Number of occurrences (alternative to until)",
						},
						daysOfWeek: {
							type: SchemaType.ARRAY,
							description: "For weekly: [0=Sun, 1=Mon, ..., 6=Sat]",
							items: { type: SchemaType.NUMBER },
						},
					},
					required: ["frequency"],
				},
			},
			required: ["title", "start", "end", "recurrence"],
		},
	},
	{
		name: "suggest_meeting_times",
		description: "Suggest optimal meeting times based on attendee availability",
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				attendees: {
					type: SchemaType.ARRAY,
					items: { type: SchemaType.STRING },
					description: "List of attendee email addresses",
				},
				duration: {
					type: SchemaType.NUMBER,
					description: "Meeting duration in minutes",
				},
				preferredDates: {
					type: SchemaType.ARRAY,
					items: { type: SchemaType.STRING },
					description: "Preferred dates (ISO format)",
				},
				timePreferences: {
					type: SchemaType.OBJECT,
					properties: {
						earliestTime: {
							type: SchemaType.STRING,
							description: "HH:MM format",
						},
						latestTime: {
							type: SchemaType.STRING,
							description: "HH:MM format",
						},
						avoidLunch: { type: SchemaType.BOOLEAN },
					},
				},
			},
			required: ["attendees", "duration"],
		},
	},
	{
		name: "analyze_schedule_conflicts",
		description: "Find potential scheduling conflicts and overlapping events",
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				timeRange: {
					type: SchemaType.STRING,
					description:
						"Period to analyze: 'week', 'month', or custom date range",
				},
				includeTravel: {
					type: SchemaType.BOOLEAN,
					description: "Consider travel time between locations",
				},
			},
		},
	},
	{
		name: "create_time_blocks",
		description: "Create focused work time blocks or buffer time",
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				blockType: {
					type: SchemaType.STRING,
					description: "Type: 'focus', 'break', 'travel', 'prep', 'lunch'",
				},
				duration: {
					type: SchemaType.NUMBER,
					description: "Duration in minutes",
				},
				date: {
					type: SchemaType.STRING,
					description: "Date for the block (ISO format)",
				},
				beforeEvent: {
					type: SchemaType.STRING,
					description: "Event title to create block before (optional)",
				},
				afterEvent: {
					type: SchemaType.STRING,
					description: "Event title to create block after (optional)",
				},
			},
			required: ["blockType", "duration"],
		},
	},
	{
		name: "get_location_insights",
		description:
			"Get insights about locations in calendar events (travel time, frequent locations)",
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				timeRange: {
					type: SchemaType.STRING,
					description: "Period to analyze: 'week', 'month'",
				},
				homeLocation: {
					type: SchemaType.STRING,
					description: "User's home/office location for travel calculations",
				},
			},
		},
	},
];

export async function executeClaraFunction(
	functionName: string,
	parameters: any,
	request: NextRequest,
) {
	switch (functionName) {
		case "get_calendar_events":
			const { GET } = await import("@/app/api/calendar/events/route");
			const getResult = await GET(request);
			return await getResult.json();

		case "create_calendar_event":
			// Import and call your POST function directly
			const { POST } = await import("@/app/api/calendar/events/route");
			const postRequest = new NextRequest(request.url, {
				method: "POST",
				headers: request.headers,
				body: JSON.stringify(parameters),
			});
			const postResult = await POST(postRequest);
			return await postResult.json();

		case "delete_calendar_event":
			// Import and call your DELETE function directly
			const { DELETE } = await import("@/app/api/calendar/events/route");
			const deleteRequest = new NextRequest(
				`${request.url}?eventId=${parameters.eventId}`,
				{
					method: "DELETE",
					headers: request.headers,
				},
			);
			const deleteResult = await DELETE(deleteRequest);
			return await deleteResult.json();

		case "find_and_delete_events":
			return await handleFindAndDelete(parameters, request);

		case "update_calendar_event":
			return await handleUpdateEvent(parameters, request);

		case "find_free_time":
			return await handleFindFreeTime(parameters, request);

		case "get_schedule_summary":
			return await handleScheduleSummary(parameters, request);

		case "create_recurring_event":
			return await handleRecurringEvent(parameters, request);

		case "suggest_meeting_times":
			return await handleMeetingSuggestions(parameters, request);

		case "analyze_schedule_conflicts":
			return await handleConflictAnalysis(parameters, request);

		case "create_time_blocks":
			return await handleTimeBlocks(parameters, request);

		case "get_location_insights":
			return await handleLocationInsights(parameters, request);

		default:
			throw new Error(`Unknown function: ${functionName}`);
	}
}

async function handleFindAndDelete(parameters: any, request: NextRequest) {
	const { searchQuery, dateFilter, confirmDelete = false } = parameters;

	// First get events
	const { GET } = await import("@/app/api/calendar/events/route");
	const eventsResult = await GET(request);
	const { events } = await eventsResult.json();

	// Filter events that match search query
	const matchingEvents = events.filter(
		(event: any) =>
			event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(event.description &&
				event.description.toLowerCase().includes(searchQuery.toLowerCase())),
	);

	// Further filter by date if provided
	const filteredEvents = dateFilter
		? matchingEvents.filter(
				(event: any) =>
					new Date(event.start).toDateString() ===
					new Date(dateFilter).toDateString(),
			)
		: matchingEvents;

	if (!confirmDelete) {
		return {
			message: `Found ${filteredEvents.length} events matching "${searchQuery}"`,
			events: filteredEvents.map((e: any) => ({
				id: e.id,
				title: e.title,
				start: e.start,
			})),
			preview: true,
		};
	}

	// Actually delete the events
	const { DELETE } = await import("@/app/api/calendar/events/route");
	const deletedEvents = [];

	for (const event of filteredEvents) {
		const deleteRequest = new NextRequest(
			`${request.url}?eventId=${event.id}`,
			{ method: "DELETE", headers: request.headers },
		);
		await DELETE(deleteRequest);
		deletedEvents.push(event.title);
	}

	return {
		message: `Deleted ${deletedEvents.length} events`,
		deletedEvents,
	};
}

async function handleFindFreeTime(parameters: any, request: NextRequest) {
	const {
		date = new Date().toISOString(),
		duration = 60,
		workingHours = { start: "09:00", end: "17:00" },
	} = parameters;

	// Get events for the specified date
	const startOfDay = new Date(date);
	startOfDay.setHours(0, 0, 0, 0);
	const endOfDay = new Date(date);
	endOfDay.setHours(23, 59, 59, 999);

	const eventsRequest = new NextRequest(
		`${request.url}?timeMin=${startOfDay.toISOString()}&timeMax=${endOfDay.toISOString()}`,
		{ headers: request.headers },
	);

	const { GET } = await import("@/app/api/calendar/events/route");
	const eventsResult = await GET(eventsRequest);
	const { events } = await eventsResult.json();

	// Find free slots
	const freeSlots = [];
	const workStart = new Date(date);
	const [startHour, startMin] = workingHours.start.split(":").map(Number);
	workStart.setHours(startHour, startMin, 0, 0);

	const workEnd = new Date(date);
	const [endHour, endMin] = workingHours.end.split(":").map(Number);
	workEnd.setHours(endHour, endMin, 0, 0);

	// Sort events by start time
	events.sort(
		(a: any, b: any) =>
			new Date(a.start).getTime() - new Date(b.start).getTime(),
	);

	let currentTime = workStart;

	for (const event of events) {
		const eventStart = new Date(event.start);
		const timeDiff = eventStart.getTime() - currentTime.getTime();

		if (timeDiff >= duration * 60 * 1000) {
			freeSlots.push({
				start: currentTime.toISOString(),
				end: eventStart.toISOString(),
				duration: Math.floor(timeDiff / (60 * 1000)),
			});
		}

		currentTime = new Date(
			Math.max(currentTime.getTime(), new Date(event.end).getTime()),
		);
	}

	// Check time after last event
	if (currentTime < workEnd) {
		const remainingTime = workEnd.getTime() - currentTime.getTime();
		if (remainingTime >= duration * 60 * 1000) {
			freeSlots.push({
				start: currentTime.toISOString(),
				end: workEnd.toISOString(),
				duration: Math.floor(remainingTime / (60 * 1000)),
			});
		}
	}

	return {
		date,
		requestedDuration: duration,
		freeSlots: freeSlots.filter((slot) => slot.duration >= duration),
		totalFreeTime: freeSlots.reduce((sum, slot) => sum + slot.duration, 0),
	};
}

async function handleScheduleSummary(parameters: any, request: NextRequest) {
	const { period = "today", includeStats = true } = parameters;

	let timeMin, timeMax;
	const now = new Date();

	switch (period) {
		case "today":
			timeMin = new Date(now);
			timeMin.setHours(0, 0, 0, 0);
			timeMax = new Date(now);
			timeMax.setHours(23, 59, 59, 999);
			break;
		case "tomorrow":
			timeMin = new Date(now);
			timeMin.setDate(now.getDate() + 1);
			timeMin.setHours(0, 0, 0, 0);
			timeMax = new Date(timeMin);
			timeMax.setHours(23, 59, 59, 999);
			break;
		case "week":
			timeMin = new Date(now);
			timeMax = new Date(now);
			timeMax.setDate(now.getDate() + 7);
			break;
		case "month":
			timeMin = new Date(now);
			timeMax = new Date(now);
			timeMax.setMonth(now.getMonth() + 1);
			break;
	}

	const eventsRequest = new NextRequest(
		`${request.url}?timeMin=${timeMin!.toISOString()}&timeMax=${timeMax!.toISOString()}`,
		{ headers: request.headers },
	);

	const { GET } = await import("@/app/api/calendar/events/route");
	const eventsResult = await GET(eventsRequest);
	const { events } = await eventsResult.json();

	const summary: any = {
		period,
		eventCount: events.length,
		events: events.slice(0, 5), // Show first 5 events
	};

	if (includeStats) {
		const totalDuration = events.reduce((sum: number, event: any) => {
			return (
				sum + (new Date(event.end).getTime() - new Date(event.start).getTime())
			);
		}, 0);

		summary.stats = {
			totalMeetingTime: Math.round(totalDuration / (1000 * 60)), // in minutes
			averageEventDuration:
				Math.round(totalDuration / (1000 * 60) / events.length) || 0,
			busiestDay: getBusiestDay(events),
			upcomingEvents: events
				.filter((e: any) => new Date(e.start) > now)
				.slice(0, 3),
		};
	}

	return summary;
}

function getBusiestDay(events: any[]) {
	const dayCount: { [key: string]: number } = {};

	events.forEach((event) => {
		const day = new Date(event.start).toDateString();
		dayCount[day] = (dayCount[day] || 0) + 1;
	});

	return Object.entries(dayCount).reduce(
		(max, [day, count]) => (count > max.count ? { day, count } : max),
		{ day: "", count: 0 },
	);
}

// Full implementations of advanced functions
async function handleUpdateEvent(parameters: any, request: NextRequest) {
	const { searchQuery, updates } = parameters;

	// Get all events to search through
	const { GET } = await import("@/app/api/calendar/events/route");
	const eventsResult = await GET(request);
	const { events } = await eventsResult.json();

	// Find matching event
	const matchingEvent = events.find(
		(event: any) =>
			event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(event.description &&
				event.description.toLowerCase().includes(searchQuery.toLowerCase())),
	);

	if (!matchingEvent) {
		return { error: `No event found matching "${searchQuery}"` };
	}

	// Get user's Google account for API access
	const session = await import("@/lib/auth").then((mod) =>
		mod.auth.api.getSession({
			headers: request.headers,
		}),
	);

	if (!session?.user) {
		return { error: "Unauthorized" };
	}

	const { db } = await import("@/lib/db");
	let account = await db.account.findFirst({
		where: { userId: session.user.id, providerId: "google" },
	});

	if (!account?.accessToken) {
		return { error: "No Google Calendar access token found" };
	}

	// Refresh token if needed
	if (
		account.accessTokenExpiresAt &&
		new Date() >= account.accessTokenExpiresAt &&
		account.refreshToken
	) {
		const { refreshGoogleToken } = await import("@/lib/google");
		try {
			const tokenData = await refreshGoogleToken(account.refreshToken);
			account = await db.account.update({
				where: { id: account.id },
				data: {
					accessToken: tokenData.access_token,
					accessTokenExpiresAt: new Date(
						Date.now() + tokenData.expires_in * 1000,
					),
					refreshToken: tokenData.refresh_token || account.refreshToken,
				},
			});
		} catch (error) {
			return { error: "Token refresh failed" };
		}
	}

	// Prepare update data
	const eventData: any = {};
	if (updates.title) eventData.summary = updates.title;
	if (updates.description) eventData.description = updates.description;
	if (updates.location) eventData.location = updates.location;
	if (updates.start)
		eventData.start = {
			dateTime: new Date(updates.start).toISOString(),
			timeZone: "UTC",
		};
	if (updates.end)
		eventData.end = {
			dateTime: new Date(updates.end).toISOString(),
			timeZone: "UTC",
		};

	// Update event via Google Calendar API
	const response = await fetch(
		`https://www.googleapis.com/calendar/v3/calendars/primary/events/${matchingEvent.id}`,
		{
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${account.accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(eventData),
		},
	);

	if (!response.ok) {
		return { error: "Failed to update event" };
	}

	const updatedEvent = await response.json();
	return {
		message: `Updated event: ${matchingEvent.title}`,
		originalEvent: { title: matchingEvent.title, start: matchingEvent.start },
		updatedEvent: {
			id: updatedEvent.id,
			title: updatedEvent.summary,
			start: updatedEvent.start.dateTime || updatedEvent.start.date,
			end: updatedEvent.end.dateTime || updatedEvent.end.date,
			description: updatedEvent.description,
			location: updatedEvent.location,
		},
	};
}

async function handleRecurringEvent(parameters: any, request: NextRequest) {
	const { title, start, end, description, location, recurrence } = parameters;

	// Get user's Google account
	const session = await import("@/lib/auth").then((mod) =>
		mod.auth.api.getSession({
			headers: request.headers,
		}),
	);

	if (!session?.user) {
		return { error: "Unauthorized" };
	}

	const { db } = await import("@/lib/db");
	let account = await db.account.findFirst({
		where: { userId: session.user.id, providerId: "google" },
	});

	if (!account?.accessToken) {
		return { error: "No Google Calendar access token found" };
	}

	// Token refresh logic
	if (
		account.accessTokenExpiresAt &&
		new Date() >= account.accessTokenExpiresAt &&
		account.refreshToken
	) {
		const { refreshGoogleToken } = await import("@/lib/google");
		try {
			const tokenData = await refreshGoogleToken(account.refreshToken);
			account = await db.account.update({
				where: { id: account.id },
				data: {
					accessToken: tokenData.access_token,
					accessTokenExpiresAt: new Date(
						Date.now() + tokenData.expires_in * 1000,
					),
					refreshToken: tokenData.refresh_token || account.refreshToken,
				},
			});
		} catch (error) {
			return { error: "Token refresh failed" };
		}
	}

	// Build recurrence rule (RFC 5545 format)
	let rrule = `FREQ=${recurrence.frequency.toUpperCase()}`;
	if (recurrence.interval && recurrence.interval > 1) {
		rrule += `;INTERVAL=${recurrence.interval}`;
	}
	if (recurrence.until) {
		const untilDate =
			new Date(recurrence.until)
				.toISOString()
				.replace(/[-:]/g, "")
				.split(".")[0] + "Z";
		rrule += `;UNTIL=${untilDate}`;
	}
	if (recurrence.count) {
		rrule += `;COUNT=${recurrence.count}`;
	}
	if (
		recurrence.daysOfWeek &&
		recurrence.frequency.toLowerCase() === "weekly"
	) {
		const days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
		const selectedDays = recurrence.daysOfWeek
			.map((day: number) => days[day])
			.join(",");
		rrule += `;BYDAY=${selectedDays}`;
	}

	const eventData = {
		summary: title,
		description,
		location,
		start: {
			dateTime: new Date(start).toISOString(),
			timeZone: "UTC",
		},
		end: {
			dateTime: new Date(end).toISOString(),
			timeZone: "UTC",
		},
		recurrence: [`RRULE:${rrule}`],
	};

	const response = await fetch(
		"https://www.googleapis.com/calendar/v3/calendars/primary/events",
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${account.accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(eventData),
		},
	);

	if (!response.ok) {
		const error = await response.text();
		return { error: `Failed to create recurring event: ${error}` };
	}

	const createdEvent = await response.json();
	return {
		message: `Created recurring event: ${title}`,
		event: {
			id: createdEvent.id,
			title: createdEvent.summary,
			recurrenceRule: rrule,
			nextOccurrence: createdEvent.start.dateTime,
		},
	};
}

async function handleMeetingSuggestions(parameters: any, request: NextRequest) {
	const {
		attendees,
		duration,
		preferredDates,
		timePreferences = {},
	} = parameters;
	const {
		earliestTime = "09:00",
		latestTime = "17:00",
		avoidLunch = true,
	} = timePreferences;

	// Get user's calendar events
	const suggestions = [];
	const datesToCheck = preferredDates || getNextBusinessDays(5);

	for (const dateStr of datesToCheck) {
		const freeTimeParams = {
			date: dateStr,
			duration,
			workingHours: { start: earliestTime, end: latestTime },
		};

		const freeTimeResult = await handleFindFreeTime(freeTimeParams, request);

		if (freeTimeResult.freeSlots && freeTimeResult.freeSlots.length > 0) {
			for (const slot of freeTimeResult.freeSlots) {
				const slotStart = new Date(slot.start);
				const slotHour = slotStart.getHours();

				// Skip lunch time if avoiding lunch
				if (avoidLunch && slotHour >= 12 && slotHour <= 13) {
					continue;
				}

				// Score the time slot (morning preferred, avoid very early/late)
				let score = 100;
				if (slotHour < 9 || slotHour > 16) score -= 20;
				if (slotHour >= 10 && slotHour <= 11) score += 10; // Morning preference
				if (slotHour >= 14 && slotHour <= 15) score += 5; // Early afternoon

				suggestions.push({
					start: slot.start,
					end: new Date(
						new Date(slot.start).getTime() + duration * 60 * 1000,
					).toISOString(),
					score,
					reason: getTimeSlotReason(slotHour),
					availableDuration: slot.duration,
				});
			}
		}
	}

	// Sort by score and return top suggestions
	suggestions.sort((a, b) => b.score - a.score);

	return {
		attendees,
		duration,
		suggestedTimes: suggestions.slice(0, 5),
		message: `Found ${suggestions.length} potential meeting times`,
		note: "Note: This doesn't check attendee availability. Integrate with Google Calendar freebusy API for full attendee checking.",
	};
}

async function handleConflictAnalysis(parameters: any, request: NextRequest) {
	const { timeRange = "week", includeTravel = false } = parameters;

	let timeMin, timeMax;
	const now = new Date();

	switch (timeRange) {
		case "week":
			timeMin = new Date(now);
			timeMax = new Date(now);
			timeMax.setDate(now.getDate() + 7);
			break;
		case "month":
			timeMin = new Date(now);
			timeMax = new Date(now);
			timeMax.setMonth(now.getMonth() + 1);
			break;
		default:
			// Assume custom range format
			timeMin = new Date(now);
			timeMax = new Date(now);
			timeMax.setDate(now.getDate() + 7);
	}

	const eventsRequest = new NextRequest(
		`${request.url}?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}`,
		{ headers: request.headers },
	);

	const { GET } = await import("@/app/api/calendar/events/route");
	const eventsResult = await GET(eventsRequest);
	const { events } = await eventsResult.json();

	// Sort events by start time
	events.sort(
		(a: any, b: any) =>
			new Date(a.start).getTime() - new Date(b.start).getTime(),
	);

	const conflicts = [];
	const warnings = [];

	for (let i = 0; i < events.length - 1; i++) {
		const currentEvent = events[i];
		const nextEvent = events[i + 1];

		const currentEnd = new Date(currentEvent.end);
		const nextStart = new Date(nextEvent.start);

		// Direct overlap
		if (currentEnd > nextStart) {
			conflicts.push({
				type: "overlap",
				event1: { title: currentEvent.title, end: currentEvent.end },
				event2: { title: nextEvent.title, start: nextEvent.start },
				overlapMinutes: Math.round(
					(currentEnd.getTime() - nextStart.getTime()) / (1000 * 60),
				),
			});
		}
		// Back-to-back meetings (potential issue)
		else if (currentEnd.getTime() === nextStart.getTime()) {
			warnings.push({
				type: "back-to-back",
				event1: currentEvent.title,
				event2: nextEvent.title,
				time: currentEvent.end,
				suggestion: "Consider adding buffer time",
			});
		}
		// Travel time consideration
		else if (includeTravel && currentEvent.location && nextEvent.location) {
			const timeBetween =
				(nextStart.getTime() - currentEnd.getTime()) / (1000 * 60);
			if (timeBetween < 30 && currentEvent.location !== nextEvent.location) {
				warnings.push({
					type: "travel-time",
					event1: currentEvent.title,
					event2: nextEvent.title,
					from: currentEvent.location,
					to: nextEvent.location,
					timeBetween: timeBetween,
					suggestion: "May not have enough travel time",
				});
			}
		}
	}

	// Find overpacked days
	const dailyLoad: { [key: string]: number } = {};
	events.forEach((event: any) => {
		const day = new Date(event.start).toDateString();
		const duration =
			(new Date(event.end).getTime() - new Date(event.start).getTime()) /
			(1000 * 60 * 60);
		dailyLoad[day] = (dailyLoad[day] || 0) + duration;
	});

	const overpackedDays = Object.entries(dailyLoad)
		.filter(([_, hours]) => hours > 8)
		.map(([day, hours]) => ({ day, hours: Math.round(hours * 10) / 10 }));

	return {
		timeRange,
		totalEvents: events.length,
		conflicts,
		warnings,
		overpackedDays,
		summary: {
			hasConflicts: conflicts.length > 0,
			hasWarnings: warnings.length > 0,
			busiestDay: Object.entries(dailyLoad).reduce(
				(max, [day, hours]) => (hours > max.hours ? { day, hours } : max),
				{ day: "", hours: 0 },
			),
		},
	};
}

async function handleTimeBlocks(parameters: any, request: NextRequest) {
	const { blockType, duration, date, beforeEvent, afterEvent } = parameters;

	let blockStart: Date;
	let title: string;

	// Define block types
	const blockTypes: { [key: string]: { title: string; description: string } } =
		{
			focus: {
				title: "Focus Time",
				description: "Deep work - no interruptions",
			},
			break: { title: "Break", description: "Rest and recharge" },
			travel: {
				title: "Travel Time",
				description: "Time to get to next location",
			},
			prep: { title: "Preparation Time", description: "Meeting preparation" },
			lunch: { title: "Lunch Break", description: "Meal time" },
		};

	const blockInfo = blockTypes[blockType] || {
		title: blockType,
		description: "",
	};
	title = blockInfo.title;

	if (beforeEvent || afterEvent) {
		// Get events to find the target event
		const { GET } = await import("@/app/api/calendar/events/route");
		const eventsResult = await GET(request);
		const { events } = await eventsResult.json();

		let targetEvent;
		if (beforeEvent) {
			targetEvent = events.find((e: any) =>
				e.title.toLowerCase().includes(beforeEvent.toLowerCase()),
			);
			if (targetEvent) {
				blockStart = new Date(
					new Date(targetEvent.start).getTime() - duration * 60 * 1000,
				);
				title = `${blockInfo.title} - Before ${targetEvent.title}`;
			}
		} else if (afterEvent) {
			targetEvent = events.find((e: any) =>
				e.title.toLowerCase().includes(afterEvent.toLowerCase()),
			);
			if (targetEvent) {
				blockStart = new Date(targetEvent.end);
				title = `${blockInfo.title} - After ${targetEvent.title}`;
			}
		}

		if (!targetEvent) {
			return { error: `Event not found: ${beforeEvent || afterEvent}` };
		}
	} else {
		// Use provided date or find next available slot
		if (date) {
			blockStart = new Date(date);
		} else {
			// Find next available slot today
			const freeTimeResult = await handleFindFreeTime({ duration }, request);
			if (freeTimeResult.freeSlots && freeTimeResult.freeSlots.length > 0) {
				blockStart = new Date(freeTimeResult.freeSlots[0].start);
			} else {
				return { error: "No available time slots found" };
			}
		}
	}

	const blockEnd = new Date(blockStart!.getTime() + duration * 60 * 1000);

	// Create the time block event
	const { POST } = await import("@/app/api/calendar/events/route");
	const blockRequest = new NextRequest(request.url, {
		method: "POST",
		headers: request.headers,
		body: JSON.stringify({
			title,
			start: blockStart!.toISOString(),
			end: blockEnd.toISOString(),
			description: `${blockInfo.description}\n\nCreated by Clara AI Assistant`,
			location: blockType === "travel" ? "In Transit" : undefined,
		}),
	});

	const result = await POST(blockRequest);
	const createdBlock = await result.json();

	if (createdBlock.error) {
		return createdBlock;
	}

	return {
		message: `Created ${duration}-minute ${blockType} block`,
		block: {
			type: blockType,
			title: createdBlock.title,
			start: createdBlock.start,
			end: createdBlock.end,
			duration,
		},
	};
}

async function handleLocationInsights(parameters: any, request: NextRequest) {
	const { timeRange = "week", homeLocation } = parameters;

	let timeMin, timeMax;
	const now = new Date();

	switch (timeRange) {
		case "week":
			timeMin = new Date(now);
			timeMax = new Date(now);
			timeMax.setDate(now.getDate() + 7);
			break;
		case "month":
			timeMin = new Date(now);
			timeMax = new Date(now);
			timeMax.setMonth(now.getMonth() + 1);
			break;
	}

	const eventsRequest = new NextRequest(
		`${request.url}?timeMin=${timeMin!.toISOString()}&timeMax=${timeMax!.toISOString()}`,
		{ headers: request.headers },
	);

	const { GET } = await import("@/app/api/calendar/events/route");
	const eventsResult = await GET(eventsRequest);
	const { events } = await eventsResult.json();

	// Analyze locations
	const locationCount: { [key: string]: number } = {};
	const locationEvents: { [key: string]: any[] } = {};
	const eventsWithLocation = events.filter((e: any) => e.location);

	eventsWithLocation.forEach((event: any) => {
		const location = event.location.toLowerCase();
		locationCount[location] = (locationCount[location] || 0) + 1;
		if (!locationEvents[location]) locationEvents[location] = [];
		locationEvents[location].push(event);
	});

	// Most frequent locations
	const frequentLocations = Object.entries(locationCount)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 5)
		.map(([location, count]) => ({
			location,
			count,
			percentage: Math.round((count / eventsWithLocation.length) * 100),
		}));

	// Travel analysis
	const travelPattern = [];
	const sortedEvents = eventsWithLocation.sort(
		(a: any, b: any) =>
			new Date(a.start).getTime() - new Date(b.start).getTime(),
	);

	for (let i = 0; i < sortedEvents.length - 1; i++) {
		const current = sortedEvents[i];
		const next = sortedEvents[i + 1];

		if (
			current.location &&
			next.location &&
			current.location !== next.location
		) {
			const timeBetween =
				(new Date(next.start).getTime() - new Date(current.end).getTime()) /
				(1000 * 60);
			travelPattern.push({
				from: current.location,
				to: next.location,
				timeBetween,
				currentEventEnd: current.end,
				nextEventStart: next.start,
				sufficientTime: timeBetween >= 30, // Assume 30 minutes minimum travel time
			});
		}
	}

	// Distance estimates (would need Maps API for real distances)
	const estimatedTravelTimes = travelPattern.map((trip) => ({
		...trip,
		estimatedTravelTime: estimateBasicTravelTime(trip.from, trip.to),
		warning:
			trip.timeBetween < 30 ? "Potentially insufficient travel time" : null,
	}));

	return {
		timeRange,
		totalEvents: events.length,
		eventsWithLocation: eventsWithLocation.length,
		locationInsights: {
			frequentLocations,
			totalUniqueLocations: Object.keys(locationCount).length,
			homeLocation: homeLocation || "Not specified",
			mostCommonLocation: frequentLocations[0]?.location || "None",
		},
		travelAnalysis: {
			totalTrips: travelPattern.length,
			trips: estimatedTravelTimes,
			warnings: estimatedTravelTimes.filter((trip) => trip.warning),
			averageTimeBetweenEvents:
				travelPattern.length > 0
					? Math.round(
							travelPattern.reduce((sum, trip) => sum + trip.timeBetween, 0) /
								travelPattern.length,
						)
					: 0,
		},
		recommendations: generateLocationRecommendations(
			frequentLocations,
			estimatedTravelTimes,
		),
	};
}

// Helper functions
function getNextBusinessDays(count: number): string[] {
	const dates = [];
	const current = new Date();
	let daysAdded = 0;

	while (daysAdded < count) {
		current.setDate(current.getDate() + 1);
		const dayOfWeek = current.getDay();
		if (dayOfWeek !== 0 && dayOfWeek !== 6) {
			// Skip weekends
			dates.push(current.toISOString().split("T")[0]);
			daysAdded++;
		}
	}

	return dates;
}

function getTimeSlotReason(hour: number): string {
	if (hour >= 9 && hour <= 11) return "Morning - High energy time";
	if (hour >= 14 && hour <= 16) return "Afternoon - Good for collaboration";
	if (hour < 9) return "Early morning - Fewer conflicts";
	if (hour > 16) return "Late afternoon - May conflict with end of day";
	return "Mid-day slot";
}

function estimateBasicTravelTime(from: string, to: string): number {
	// Very basic estimation - would need Maps API for real data
	if (from === to) return 0;

	const keywords = {
		office: ["office", "work", "building"],
		home: ["home", "house"],
		restaurant: ["restaurant", "cafe", "lunch"],
		meeting: ["meeting", "conference", "zoom"],
	};

	// Simple heuristic based on location types
	const fromType = Object.keys(keywords).find((type) =>
		keywords[type as keyof typeof keywords].some((keyword) =>
			from.toLowerCase().includes(keyword),
		),
	);
	const toType = Object.keys(keywords).find((type) =>
		keywords[type as keyof typeof keywords].some((keyword) =>
			to.toLowerCase().includes(keyword),
		),
	);

	if (fromType === "home" && toType === "office") return 45;
	if (fromType === "office" && toType === "home") return 45;
	if (fromType === "meeting" || toType === "meeting") return 0; // Virtual

	return 30; // Default estimate
}

function generateLocationRecommendations(
	frequentLocations: any[],
	travelData: any[],
): string[] {
	const recommendations = [];

	if (frequentLocations.length > 0) {
		recommendations.push(
			`You spend most time at: ${frequentLocations[0].location} (${frequentLocations[0].percentage}% of events)`,
		);
	}

	const insufficientTravelTime = travelData.filter(
		(trip) => trip.warning,
	).length;
	if (insufficientTravelTime > 0) {
		recommendations.push(
			`${insufficientTravelTime} trips may need more travel time - consider adding buffer time`,
		);
	}

	if (travelData.length > 5) {
		recommendations.push(
			"Consider clustering meetings by location to reduce travel time",
		);
	}

	return recommendations.length > 0
		? recommendations
		: ["Your schedule looks well organized!"];
}

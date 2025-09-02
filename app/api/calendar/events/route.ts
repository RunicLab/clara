import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { refreshGoogleToken } from "@/lib/google";
import { CalendarEvent, GoogleCalendarEvent } from "@/types/events";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get user's Google account
		let account = await db.account.findFirst({
			where: {
				userId: session.user.id,
				providerId: "google",
			},
		});

		if (!account?.accessToken) {
			return NextResponse.json(
				{ error: "No Google Calendar access token found" },
				{ status: 404 },
			);
		}

		// Check if token needs refresh
		if (
			account.accessTokenExpiresAt &&
			new Date() >= account.accessTokenExpiresAt &&
			account.refreshToken
		) {
			try {
				const tokenData = await refreshGoogleToken(account.refreshToken);

				// Update the token in database
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
				console.error("Failed to refresh token:", error);
				return NextResponse.json(
					{ error: "Token expired and refresh failed" },
					{ status: 401 },
				);
			}
		}

		// Get query parameters for date range
		const { searchParams } = new URL(request.url);
		const timeMin = searchParams.get("timeMin") || new Date().toISOString();
		const timeMax =
			searchParams.get("timeMax") ||
			new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now

		// Fetch events from Google Calendar
		const calendarResponse = await fetch(
			`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
				timeMin,
			)}&timeMax=${encodeURIComponent(
				timeMax,
			)}&singleEvents=true&orderBy=startTime`,
			{
				headers: {
					Authorization: `Bearer ${account.accessToken}`,
					"Content-Type": "application/json",
				},
			},
		);

		if (!calendarResponse.ok) {
			const error = await calendarResponse.text();
			console.error("Google Calendar API error:", error);
			return NextResponse.json(
				{ error: "Failed to fetch calendar events" },
				{ status: calendarResponse.status },
			);
		}

		const calendarData = await calendarResponse.json();
		//console.log(calendarData);

		// Transform Google Calendar events to our format
		const events =
			calendarData.items?.map(
				(event: GoogleCalendarEvent) =>
					({
						id: event.id,
						title: event.summary || "Untitled Event",
						start: new Date(event.start?.dateTime! || event.start?.date!),
						end: new Date(event.end?.dateTime! || event.end?.date!),
						description: event.description,
						location: event.location,
						isAllDay: !event.start?.dateTime, // If no time, it's an all-day event
						attendees: event.attendees,
					}) as CalendarEvent,
			) || [];

		return NextResponse.json({ events });
	} catch (error) {
		console.error("Error fetching calendar events:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { title, start, end, description, location } = await request.json();

		if (!title || !start || !end) {
			return NextResponse.json(
				{ error: "Missing required fields: title, start, end" },
				{ status: 400 },
			);
		}

		// Get user's Google account with valid token
		let account = await db.account.findFirst({
			where: {
				userId: session.user.id,
				providerId: "google",
			},
		});

		if (!account?.accessToken) {
			return NextResponse.json(
				{ error: "No Google Calendar access token found" },
				{ status: 404 },
			);
		}

		// Check if token needs refresh (same logic as GET)
		if (
			account.accessTokenExpiresAt &&
			new Date() >= account.accessTokenExpiresAt &&
			account.refreshToken
		) {
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
				return NextResponse.json(
					{ error: "Token expired and refresh failed" },
					{ status: 401 },
				);
			}
		}

		// Create event in Google Calendar
		const eventData = {
			summary: title,
			description,
			location,
			start: {
				dateTime: new Date(start).toISOString(),
				timeZone: "UTC", // You might want to make this dynamic
			},
			end: {
				dateTime: new Date(end).toISOString(),
				timeZone: "UTC",
			},
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
			console.error("Failed to create event:", error);
			return NextResponse.json(
				{ error: "Failed to create calendar event" },
				{ status: response.status },
			);
		}

		const createdEvent = await response.json();

		return NextResponse.json({
			id: createdEvent.id,
			title: createdEvent.summary,
			start: new Date(createdEvent.start.dateTime || createdEvent.start.date),
			end: new Date(createdEvent.end.dateTime || createdEvent.end.date),
			description: createdEvent.description,
			location: createdEvent.location,
		});
	} catch (error) {
		console.error("Error creating calendar event:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const searchParams = request.nextUrl.searchParams;
		const eventId = searchParams.get("eventId");

		// Get user's Google account
		let account = await db.account.findFirst({
			where: {
				userId: session.user.id,
				providerId: "google",
			},
		});

		if (!account?.accessToken) {
			return NextResponse.json(
				{ error: "No Google Calendar access token found" },
				{ status: 404 },
			);
		}

		// Token refresh logic (same as above)
		if (
			account.accessTokenExpiresAt &&
			new Date() >= account.accessTokenExpiresAt &&
			account.refreshToken
		) {
			try {
				const tokenData = await refreshGoogleToken(account.refreshToken);
				account = await db.account.update({
					where: { id: account.id },
					data: {
						accessToken: tokenData.access_token,
						accessTokenExpiresAt: new Date(
							Date.now() + tokenData.expires_in * 1000,
						),
					},
				});
			} catch (error) {
				return NextResponse.json(
					{ error: "Token expired and refresh failed" },
					{ status: 401 },
				);
			}
		}

		// Delete event from Google Calendar
		const response = await fetch(
			`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${account.accessToken}`,
				},
			},
		);

		if (!response.ok && response.status !== 410) {
			// 410 = already deleted
			return NextResponse.json(
				{ error: "Failed to delete event" },
				{ status: response.status },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting calendar event:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

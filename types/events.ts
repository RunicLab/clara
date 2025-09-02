export interface GoogleCalendarEvent {
	kind: string;
	etag: string;
	id: string;
	status: "confirmed" | "tentative" | "cancelled";
	htmlLink: string;
	created: string;
	updated: string;
	summary: string;
	description?: string;
	creator: {
		id?: string;
		email: string;
		displayName?: string;
		self?: boolean;
	};
	organizer: {
		id?: string;
		email: string;
		displayName?: string;
		self?: boolean;
	};
	start: {
		date?: string; // For all-day events
		dateTime?: string; // For timed events
		timeZone?: string;
	};
	end: {
		date?: string; // For all-day events
		dateTime?: string; // For timed events
		timeZone?: string;
	};
	recurringEventId?: string;
	originalStartTime?: {
		date?: string;
		dateTime?: string;
		timeZone?: string;
	};
	iCalUID: string;
	sequence: number;
	attendees?: Array<{
		id?: string;
		email: string;
		displayName?: string;
		organizer?: boolean;
		self?: boolean;
		resource?: boolean;
		optional?: boolean;
		responseStatus: "needsAction" | "declined" | "tentative" | "accepted";
		comment?: string;
		additionalGuests?: number;
	}>;
	hangoutLink?: string;
	conferenceData?: {
		createRequest?: object;
		entryPoints?: Array<{
			entryPointType: string;
			uri: string;
			label?: string;
			pin?: string;
			accessCode?: string;
			meetingCode?: string;
			passcode?: string;
			password?: string;
		}>;
		conferenceSolution?: {
			key: {
				type: string;
			};
			name: string;
			iconUri: string;
		};
		conferenceId?: string;
		signature?: string;
		notes?: string;
	};
	reminders: {
		useDefault: boolean;
		overrides?: Array<{
			method: "email" | "popup";
			minutes: number;
		}>;
	};
	eventType: "default" | "outOfOffice" | "focusTime" | "workingLocation";
	location?: string;
	colorId?: string;
	visibility?: "default" | "public" | "private" | "confidential";
	transparency?: "opaque" | "transparent";
}

// Simplified type for your app
export interface CalendarEvent {
	id: string;
	title: string;
	start: Date;
	end: Date;
	isAllDay?: boolean;
	description?: string;
	location?: string;
	attendees?: string[];
}

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
];

export async function executeClaraFunction(
	functionName: string,
	parameters: any,
	request: NextRequest,
) {
	const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

	switch (functionName) {
		case "get_calendar_events":
			const getParams = new URLSearchParams();
			if (parameters.timeMin) getParams.set("timeMin", parameters.timeMin);
			if (parameters.timeMax) getParams.set("timeMax", parameters.timeMax);

			const getResponse = await fetch(
				`${baseUrl}/api/calendar/events?${getParams}`,
				{
					headers: {
						Authorization: request.headers.get("Authorization") || "",
						Cookie: request.headers.get("Cookie") || "",
					},
				},
			);
			return await getResponse.json();

		case "create_calendar_event":
			const createResponse = await fetch(`${baseUrl}/api/calendar/events`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: request.headers.get("Authorization") || "",
					Cookie: request.headers.get("Cookie") || "",
				},
				body: JSON.stringify(parameters),
			});
			return await createResponse.json();

		case "delete_calendar_event":
			const deleteResponse = await fetch(
				`${baseUrl}/api/calendar/events?eventId=${parameters.eventId}`,
				{
					method: "DELETE",
					headers: request.headers,
				},
			);
			return await deleteResponse.json();

		default:
			throw new Error(`Unknown function: ${functionName}`);
	}
}

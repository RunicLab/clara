import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { claraFunctions, executeClaraFunction } from "@/lib/functions";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { message, conversationHistory = [] } = await request.json();

		const model = genAI.getGenerativeModel({
			model: "gemini-2.5-flash",
			tools: [{ functionDeclarations: Object.values(claraFunctions) }],
		});

		// Build conversation context
		const systemPrompt = `You are Clara, a helpful AI assistant that manages calendars. You can:
			    - View calendar events 
			    - Create new events
			    - Delete events
			    - Answer questions about scheduling
			    
			    Always be helpful and conversational. When users ask about scheduling, proactively suggest times and help them create events.
			    Current date: ${new Date().toISOString()}`;

		// Convert conversation history to Gemini format
		const history = conversationHistory.map((msg: any) => ({
			role: msg.sender === "user" ? "user" : "model",
			parts: [{ text: msg.text }],
		}));

		const chat = model.startChat({
			history: [
				{ role: "user", parts: [{ text: systemPrompt }] },
				{
					role: "model",
					parts: [
						{ text: "I understand. I'm Clara, your calendar assistant." },
					],
				},
				...history,
			],
		});

		let result = await chat.sendMessage(message);
		let response = result.response;

		const functionCalls = response.functionCalls();

		if (functionCalls && functionCalls.length > 0) {
			const functionCall = functionCalls[0]; // Fixed: Use functionCalls() method

			try {
				const functionResult = await executeClaraFunction(
					functionCall.name,
					functionCall.args,
					request,
				);

				// Send function result back to model
				result = await chat.sendMessage([
					{
						functionResponse: {
							name: functionCall.name,
							response: { result: functionResult },
						},
					},
				]);
				response = result.response;
			} catch (error) {
				console.error("Function execution error:", error);
				result = await chat.sendMessage([
					{
						functionResponse: {
							name: functionCall.name,
							response: { error: "Function execution failed" },
						},
					},
				]);
				response = result.response;
			}
		}
		return NextResponse.json({
			message: response.text(),
			conversationId: Date.now(), // Simple conversation tracking
		});
	} catch (error) {
		console.error("Chat API error:", error);
		return NextResponse.json(
			{ error: "Failed to process chat message" },
			{ status: 500 },
		);
	}
}

import { auth } from "@/lib/auth";
import { db } from "@/lib/db"; // Your Prisma client
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Check if user has Google Calendar access token
		const account = await db.account.findFirst({
			where: {
				userId: session.user.id,
				providerId: "google", // or however you identify Google accounts
			},
			select: {
				accessToken: true,
				accessTokenExpiresAt: true,
				refreshToken: true,
			},
		});

		console.log(account);

		const hasValidToken =
			account?.accessToken &&
			account.accessTokenExpiresAt &&
			new Date() < account.accessTokenExpiresAt;

		console.log("Has valid token:", hasValidToken);

		return NextResponse.json({
			hasToken: !!hasValidToken,
			needsRefresh:
				account?.accessToken && !hasValidToken && !!account.refreshToken,
		});
	} catch (error) {
		console.error("Error checking access token:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

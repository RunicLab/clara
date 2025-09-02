import { auth } from "@/lib/auth";
import { db } from "@/lib/db"; // Your Prisma client
import {
	hasValidScopes,
	REQUIRED_SCOPES,
	validateTokenScopes,
} from "@/lib/google";
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

		// Token is valid only if: exists, not expired, and has proper scopes
		let hasToken = false;

		if (
			account?.accessToken &&
			account.accessTokenExpiresAt &&
			new Date() < account.accessTokenExpiresAt
		) {
			hasToken = await hasValidScopes(account.accessToken);
		}

		return NextResponse.json({
			hasToken,
			needsRefresh: !hasToken && !!account?.refreshToken,
		});
	} catch (error) {
		console.error("Error checking access token:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

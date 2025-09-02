export const REQUIRED_SCOPES = ["https://www.googleapis.com/auth/calendar"];

export async function hasValidScopes(accessToken: string): Promise<boolean> {
	try {
		const response = await fetch(
			`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`,
		);

		if (!response.ok) return false;

		const tokenInfo = await response.json();
		if (tokenInfo.error) return false;

		const grantedScopes = tokenInfo.scope ? tokenInfo.scope.split(" ") : [];
		return REQUIRED_SCOPES.every((scope) => grantedScopes.includes(scope));
	} catch {
		return false;
	}
}

export async function validateTokenScopes(accessToken: string): Promise<{
	isValid: boolean;
	scopes: string[];
	hasRequiredScopes: boolean;
	missingScopes: string[];
}> {
	try {
		// Use Google's tokeninfo endpoint to get token details including scopes
		const response = await fetch(
			`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`,
		);

		if (!response.ok) {
			throw new Error(`Token validation failed: ${response.status}`);
		}

		const tokenInfo = await response.json();

		// Check if token is valid (not expired according to Google)
		if (tokenInfo.error) {
			return {
				isValid: false,
				scopes: [],
				hasRequiredScopes: false,
				missingScopes: REQUIRED_SCOPES,
			};
		}

		// Parse scopes (Google returns them as space-separated string)
		const grantedScopes = tokenInfo.scope ? tokenInfo.scope.split(" ") : [];

		// Check if all required scopes are present
		const missingScopes = REQUIRED_SCOPES.filter(
			(requiredScope) => !grantedScopes.includes(requiredScope),
		);

		return {
			isValid: true,
			scopes: grantedScopes,
			hasRequiredScopes: missingScopes.length === 0,
			missingScopes,
		};
	} catch (error) {
		console.error("Error validating token scopes:", error);
		return {
			isValid: false,
			scopes: [],
			hasRequiredScopes: false,
			missingScopes: REQUIRED_SCOPES,
		};
	}
}

export async function refreshGoogleToken(refreshToken: string) {
	const response = await fetch("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			client_id: process.env.GOOGLE_CLIENT_ID!,
			client_secret: process.env.GOOGLE_CLIENT_SECRET!,
			refresh_token: refreshToken,
			grant_type: "refresh_token",
		}),
	});

	if (!response.ok) {
		throw new Error("Failed to refresh token");
	}

	return response.json();
}

import { createAuthClient } from "better-auth/react";
import { CONFIG } from "./config";

export const authClient = createAuthClient({
	baseURL: CONFIG.URL,
});

export const requestGoogleCalendarAccess = async () => {
	await authClient.linkSocial({
		provider: "google",
		scopes: ["https://www.googleapis.com/auth/calendar"],
	});
};

export const { signIn, signOut, signUp, useSession } = authClient;

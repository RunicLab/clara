"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";

interface GoogleAuthModalProps {
	onAuthSuccess?: () => void;
}

export default function GoogleAuthModal({
	onAuthSuccess,
}: GoogleAuthModalProps) {
	const [showModal, setShowModal] = useState(false);
	const [hasAccessToken, setHasAccessToken] = useState(false);
	const [isAuthenticating, setIsAuthenticating] = useState(false);

	// Check for access token on component mount
	useEffect(() => {
		const checkAccessToken = async () => {
			try {
				const response = await fetch("/api/auth/check-token");

				if (response.ok) {
					const { hasToken, needsRefresh, needsReauth } = await response.json();
					setHasAccessToken(hasToken);

					// Show modal if no token, needs refresh, or needs reauth
					if (!hasToken || needsRefresh || needsReauth) {
						setShowModal(true);
					}
				} else {
					// If API call fails, assume no token and show modal
					setHasAccessToken(false);
					setShowModal(true);
				}
			} catch (error) {
				console.error("Error checking access token:", error);
				// On error, assume no token and show modal
				setHasAccessToken(false);
				setShowModal(true);
			}
		};

		checkAccessToken();
	}, []);

	const handleGoogleAuth = async () => {
		setIsAuthenticating(true);

		try {
			// Import the function dynamically to avoid SSR issues
			const { requestGoogleCalendarAccess } = await import("@/lib/auth-client");

			await requestGoogleCalendarAccess();

			// After successful auth, recheck token status
			const response = await fetch("/api/auth/check-token");
			if (response.ok) {
				const { hasToken } = await response.json();
				if (hasToken) {
					setHasAccessToken(true);
					setShowModal(false);
					onAuthSuccess?.(); // Call optional callback
				}
			}
		} catch (error) {
			console.error("Error during Google authentication:", error);
			// You might want to show an error message to the user here
		} finally {
			setIsAuthenticating(false);
		}
	};

	return (
		<Dialog open={showModal}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Settings className="h-5 w-5" />
						Connect Google Calendar
					</DialogTitle>
					<DialogDescription>
						To use clara's full calendar features, you need to connect your
						Google Calendar account.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col space-y-4">
					<div className="text-sm text-gray-600">
						Clara needs access to your Google Calendar to:
						<ul className="mt-2 ml-4 list-disc space-y-1">
							<li>View your existing events</li>
							<li>Create new events for you</li>
							<li>Update and manage your schedule</li>
						</ul>
					</div>
					<Button
						onClick={handleGoogleAuth}
						disabled={isAuthenticating}
						className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
					>
						{isAuthenticating ? "Connecting..." : "Connect Google Calendar"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

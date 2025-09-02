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
import { requestGoogleCalendarAccess } from "@/lib/auth-client";

// probably pass in the account object here for faster rendering
export default function GoogleAuthModal() {
	const [showModal, setShowModal] = useState(false);
	const [hasAccessToken, setHasAccessToken] = useState(false);

	useEffect(() => {
		const checkAccessToken = () => {
			// Replace this with your actual token check logic
			const hasToken = true; // Your token check logic here
			setHasAccessToken(hasToken);
			if (!hasToken) {
				setShowModal(true);
			}
		};

		checkAccessToken();
	}, []);

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
						onClick={requestGoogleCalendarAccess}
						className="w-full bg-blue-600 hover:bg-blue-700"
					>
						Connect Google Calendar
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

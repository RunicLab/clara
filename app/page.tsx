import AuthPage from "@/components/AuthPage";
import GoogleAuthModal from "@/components/common/RequestGoogleCalendarModal";
import HomePage from "@/components/HomePage";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Home() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return <AuthPage />;
	}

	return (
		<main className="flex min-h-screen max-h-screen p-10 ">
			<GoogleAuthModal />
			<HomePage />;
		</main>
	);
}

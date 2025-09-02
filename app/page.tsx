import AuthPage from "@/components/AuthPage";
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
		<>
			<HomePage />;
		</>
	);
}

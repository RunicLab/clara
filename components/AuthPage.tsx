"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthPage() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const handleGoogleSignIn = async () => {
		setLoading(true);
		setError("");
		try {
			const { error } = await authClient.signIn.social(
				{
					provider: "google",
					callbackURL: "/",
				},
				{
					onRequest: () => setLoading(true),
					onError: (ctx) => setError(ctx.error.message || "Sign in failed"),
				},
			);
			if (error) {
				setError(error.message || "Sign in failed");
			}
		} catch {
			setError("An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
			</div>

			{/* Main content */}
			<div className="relative z-10 max-w-md w-full">
				{/* Glass morphism card */}
				<div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8">
					{/* Logo and branding */}
					<div className="text-center mb-8">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mb-4 shadow-lg">
							<svg
								className="w-8 h-8 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
								/>
							</svg>
						</div>
						<h1 className="text-3xl font-bold text-white mb-2">
							Welcome to Clara
						</h1>
						<p className="text-blue-100/80 text-lg">
							Your AI-powered calendar assistant
						</p>
					</div>

					{/* Feature highlights */}
					<div className="mb-8 space-y-3">
						<div className="flex items-center text-white/90">
							<div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-3"></div>
							<span className="text-sm">
								Smart scheduling with natural language
							</span>
						</div>
						<div className="flex items-center text-white/90">
							<div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full mr-3"></div>
							<span className="text-sm">Intelligent conflict resolution</span>
						</div>
						<div className="flex items-center text-white/90">
							<div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mr-3"></div>
							<span className="text-sm">
								Seamless Google Calendar integration
							</span>
						</div>
					</div>

					{/* Error message */}
					{error && (
						<div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm">
							{error}
						</div>
					)}

					{/* Sign in button */}
					<button
						onClick={handleGoogleSignIn}
						disabled={loading}
						className="w-full relative overflow-hidden group bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
					>
						<div className="flex items-center justify-center">
							{loading ? (
								<div className="flex items-center">
									<div className="w-5 h-5 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin mr-3"></div>
									<span>Connecting...</span>
								</div>
							) : (
								<div className="flex items-center">
									<svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
										<path
											fill="#4285F4"
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
										/>
										<path
											fill="#34A853"
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										/>
										<path
											fill="#FBBC05"
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
										/>
										<path
											fill="#EA4335"
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										/>
									</svg>
									<span>Continue with Google</span>
								</div>
							)}
						</div>

						{/* Hover effect overlay */}
						<div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
					</button>

					{/* Footer text */}
					<p className="text-center text-blue-100/60 text-xs mt-6">
						By continuing, you agree to Clara's terms of service and privacy
						policy
					</p>
				</div>

				{/* Floating AI assistant preview */}
				<div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full shadow-lg animate-bounce hidden sm:block">
					<div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center">
						<div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
					</div>
				</div>
			</div>

			{/* Custom CSS for animations */}
			<style jsx>{`
				@keyframes pulse {
					0%, 100% { transform: scale(1); }
					50% { transform: scale(1.05); }
				}
				.animation-delay-2000 {
					animation-delay: 2s;
				}
				.animation-delay-4000 {
					animation-delay: 4s;
				}
			`}</style>
		</div>
	);
}

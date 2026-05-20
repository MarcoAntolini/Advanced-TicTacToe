import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/activity(.*)", "/history(.*)", "/profile(.*)"]);

/** Run Clerk only on auth-gated routes — public pages skip middleware overhead. */
export default clerkMiddleware(async (auth, req) => {
	if (isProtectedRoute(req)) {
		await auth.protect();
	}
});

export const config = {
	matcher: ["/activity/:path*", "/history/:path*", "/profile/:path*"],
};

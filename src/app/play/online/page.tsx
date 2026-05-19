"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { buildPlayHref } from "@/lib/play/steps";

function OnlineRedirect() {
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const mode = searchParams.get("mode");
		if (mode === "async") {
			router.replace(buildPlayHref("create", { mode: "async" }));
			return;
		}
		router.replace(buildPlayHref("multiplayer"));
	}, [router, searchParams]);

	return <p className="text-muted">Redirecting…</p>;
}

export default function OnlinePlayPage() {
	return (
		<Suspense fallback={<p className="text-muted">Loading…</p>}>
			<OnlineRedirect />
		</Suspense>
	);
}

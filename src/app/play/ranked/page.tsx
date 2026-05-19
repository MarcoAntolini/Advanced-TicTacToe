"use client";

import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { buildPlayHref } from "@/lib/play/steps";

function RankedRedirect() {
	const router = useRouter();

	useEffect(() => {
		router.replace(buildPlayHref("multiplayer"));
	}, [router]);

	return <p className="text-muted">Redirecting…</p>;
}

export default function RankedPlayPage() {
	return (
		<Suspense fallback={<p className="text-muted">Loading…</p>}>
			<RankedRedirect />
		</Suspense>
	);
}

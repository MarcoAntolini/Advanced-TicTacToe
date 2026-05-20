"use client";

import { useReportWebVitals } from "next/web-vitals";

/** Dev console + optional analytics hook for Core Web Vitals. */
export function WebVitalsReporter() {
	useReportWebVitals((metric) => {
		if (process.env.NODE_ENV === "development") {
			console.debug(
				`[web-vitals] ${metric.name}`,
				Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
				metric.rating,
			);
		}

		// Wire to your analytics endpoint when ready, e.g.:
		// void fetch("/api/vitals", { method: "POST", body: JSON.stringify(metric), keepalive: true });
	});

	return null;
}

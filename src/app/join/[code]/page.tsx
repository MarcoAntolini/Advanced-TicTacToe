"use client";

import { useParams } from "next/navigation";
import { JoinByCodeFlow } from "@/components/join/JoinByCodeFlow";
import { normalizeInviteCode } from "@/lib/invite";

export default function JoinWithCodePage() {
	const params = useParams();
	const code = normalizeInviteCode(String(params.code ?? ""));

	return <JoinByCodeFlow initialCode={code} autoJoin={code.length >= 4} />;
}

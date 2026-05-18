"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "@convex/_generated/api";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getGuestId } from "@/lib/guest";

export default function ProfilePage() {
	const { user } = useUser();
	const profile = useQuery(api.users.queries.getProfile);
	const ensureUser = useMutation(api.users.mutations.ensureUser);
	const updateProfile = useMutation(api.users.mutations.updateProfile);
	const mergeGuest = useMutation(api.users.mutations.mergeGuestGames);

	const [displayName, setDisplayName] = useState("");
	const [avatarUrl, setAvatarUrl] = useState("");
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		if (!user) return;
		const name = user.fullName ?? user.username ?? "Player";
		setDisplayName(profile?.displayName ?? name);
		setAvatarUrl(profile?.avatarUrl ?? user.imageUrl ?? "");
		void ensureUser({
			displayName: name,
			avatarUrl: user.imageUrl ?? undefined,
		}).then(() => mergeGuest({ guestId: getGuestId() }));
	}, [user, profile?.displayName, profile?.avatarUrl, ensureUser, mergeGuest]);

	const handleSave = async () => {
		setSaving(true);
		setMessage(null);
		try {
			await updateProfile({
				displayName,
				avatarUrl: avatarUrl || undefined,
			});
			setMessage("Profile saved.");
		} catch (e) {
			setMessage(e instanceof Error ? e.message : "Save failed");
		} finally {
			setSaving(false);
		}
	};

	if (!user) {
		return <p className="text-muted">Please sign in to view your profile.</p>;
	}

	return (
		<div className="mx-auto max-w-md space-y-6">
			<h1 className="text-3xl font-bold">Profile</h1>
			<Card className="flex flex-col items-center gap-4">
				<Avatar name={displayName} src={avatarUrl} size={80} />
				<div className="w-full space-y-3">
					<label className="block text-sm font-medium">
						Display name
						<input
							type="text"
							value={displayName}
							onChange={(e) => setDisplayName(e.target.value)}
							className="mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-3"
						/>
					</label>
					<label className="block text-sm font-medium">
						Avatar URL
						<input
							type="url"
							value={avatarUrl}
							onChange={(e) => setAvatarUrl(e.target.value)}
							className="mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-3"
						/>
					</label>
					<Button onClick={handleSave} loading={saving} className="w-full">
						Save
					</Button>
					{message ? <p className="text-sm text-muted">{message}</p> : null}
				</div>
			</Card>
			{profile ? (
				<Card>
					<h2 className="mb-3 font-medium">Statistics</h2>
					<ul className="grid grid-cols-2 gap-2 text-sm">
						<li>Wins: {profile.stats.wins}</li>
						<li>Losses: {profile.stats.losses}</li>
						<li>Draws: {profile.stats.draws}</li>
						<li>Streak: {profile.stats.streak}</li>
					</ul>
				</Card>
			) : null}
		</div>
	);
}

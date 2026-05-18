export function Avatar({
	name,
	src,
	size = 40,
}: {
	name: string;
	src?: string;
	size?: number;
}) {
	const initials = name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	if (src) {
		return (
			// eslint-disable-next-line @next/next/no-img-element
			<img
				src={src}
				alt={name}
				width={size}
				height={size}
				className="rounded-full object-cover"
			/>
		);
	}

	return (
		<div
			className="flex items-center justify-center rounded-full bg-accent/30 font-medium text-foreground"
			style={{ width: size, height: size, fontSize: size * 0.35 }}
			aria-hidden
		>
			{initials}
		</div>
	);
}

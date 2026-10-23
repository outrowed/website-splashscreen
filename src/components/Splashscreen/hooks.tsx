import { useEffect, useState } from "react";
import { FRAME_HOLD_MS, SCENE } from "./Splashscreen";

export function useFrameTimeline(active: boolean) {
	const [frame, setFrame] = useState<number>(SCENE.START);

	useEffect(() => {
		if (!active) return;

		const delay = FRAME_HOLD_MS[frame - SCENE.START];
		if (delay === undefined) return;

		const timer = window.setTimeout(() => {
			setFrame((previous) => previous + 1);
		}, delay);

		return () => window.clearTimeout(timer);
	}, [active, frame]);

	return frame;
}

export function useStageScale() {
	const [scale, setScale] = useState(1);

	useEffect(() => {
		const update = () => {
			setScale(Math.min(window.innerWidth / 1440, window.innerHeight / 1024));
		};

		update();
		window.addEventListener("resize", update);

		return () => window.removeEventListener("resize", update);
	}, []);

	return scale;
}

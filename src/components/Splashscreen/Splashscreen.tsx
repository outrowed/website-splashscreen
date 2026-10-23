import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

import surface from "@/components/Members/Surface.module.css";
import { useFrameTimeline, useStageScale } from "./hooks";
import styles from "./index.module.css";

const SEEN_KEY = "csui26_splash_seen";

export const SCENE = {
	START: 27,
	PANDA: 28,
	PANDA_EXIT: 29,
	WELCOME: 30,
	BRANDING: 31,
	GROUP: 32,
	EXIT: 33,
	PORTAL_ROTATE: 34,
	PORTAL_EXPAND: 35,
	TERMINAL: 36,
} as const;

// Time spent in frames 27–35, in milliseconds.
export const FRAME_HOLD_MS = [
	100, 880, 320, 760, 1100, 1200, 500, 350, 400,
] as const;

const LINES = [
	">> rebooting system...",
	">> initializing CSUI26.exe...",
	">> loading freshmen.exe...",
	">> importing student_profile...",
	">> scanning for viruses...",
	">> identity confirmed : CSUI26",
	">> primary mission : survive pacil",
	">> welcome aboard, ",
	">> your journey begins now.",
];

const SPRING = {
	type: "spring",
	stiffness: 256,
	damping: 24,
	mass: 1,
} as const;

const FADE = {
	duration: 0.65,
	ease: "easeInOut",
} as const;

const SURFACE_SUBTLE = `${surface.surface} ${surface.surface__subtle}`;

interface Props {
	outline: string;
	gradient: string;
}

// --- Main component ---

export default function Splashscreen({ outline, gradient }: Props) {
	const [ready, setReady] = useState(false);
	const [visible, setVisible] = useState(true);

	const frame = useFrameTimeline(ready && visible);
	const scale = useStageScale();

	useEffect(() => {
		if (sessionStorage.getItem(SEEN_KEY) === "true") {
			setVisible(false);
		} else {
			setReady(true);
		}
	}, []);

	const finish = useCallback(() => {
		sessionStorage.setItem(SEEN_KEY, "true");
		document.documentElement.classList.add("splash-seen");
		setVisible(false);
	}, []);

	if (!visible) return null;

	return (
		<div
			id="splashscreen"
			className={styles.splash_container}
			role="dialog"
			aria-modal="true"
			aria-label="Welcome intro"
		>
			<SplashBackground frame={frame} />

			<BrandStage
				frame={frame}
				scale={scale}
				outline={outline}
				gradient={gradient}
			/>

			{frame === SCENE.TERMINAL && <Terminal onComplete={finish} />}

			<button
				type="button"
				className={`${SURFACE_SUBTLE} ${styles.skip_button}`}
				onClick={finish}
			>
				Skip Intro →
			</button>
		</div>
	);
}

// --- Background ---

function SplashBackground({ frame }: { frame: number }) {
	return (
		<>
			<div className={styles.bg_gradient} />

			<motion.div
				className={styles.bg_blue}
				animate={{ opacity: frame >= SCENE.WELCOME ? 1 : 0 }}
				transition={{ duration: 0.08 }}
			/>

			<motion.div
				className={styles.bg_brand}
				animate={{
					opacity:
						frame >= SCENE.BRANDING && frame < SCENE.PORTAL_ROTATE ? 1 : 0,
				}}
				transition={FADE}
			/>

			<motion.div
				className={styles.bg_light}
				animate={{
					opacity: frame >= SCENE.PORTAL_EXPAND ? 1 : 0,
				}}
				transition={FADE}
			/>
		</>
	);
}

// --- Brand animation ---

interface BrandStageProps extends Props {
	frame: number;
	scale: number;
}

function BrandStage({ frame, scale, outline, gradient }: BrandStageProps) {
	const branding = frame >= SCENE.BRANDING;
	const grouped = frame >= SCENE.GROUP;
	const exiting = frame >= SCENE.EXIT;

	const welcomeX = exiting ? -610 : grouped ? -170 : branding ? -22 : 0;
	const welcomeY = grouped ? -88 : branding ? -72 : 0;

	return (
		<div className={styles.stage_welcome} style={{ scale }}>
			<motion.img
				className={styles.panda_logo}
				src={outline}
				alt="CSUI Panda"
				initial={{ opacity: 0, y: 315 }}
				animate={{
					opacity: frame === SCENE.PANDA ? 1 : 0,
					y: frame >= SCENE.PANDA_EXIT ? -243 : frame === SCENE.PANDA ? 0 : 315,
				}}
				transition={{
					...SPRING,
					opacity: { duration: 0.3 },
				}}
			/>

			<motion.div
				className={styles.welcome_text}
				initial={{ opacity: 0, y: 244 }}
				animate={{
					opacity: frame >= SCENE.WELCOME && !exiting ? 1 : 0,
					x: welcomeX,
					y: frame >= SCENE.WELCOME ? welcomeY : 244,
				}}
				transition={{ ...SPRING, opacity: FADE }}
			>
				<motion.span
					className={styles.welcome_white}
					animate={{ opacity: branding ? 0 : 1 }}
					transition={FADE}
				>
					WELCOME TO
				</motion.span>

				<motion.span
					className={styles.welcome_gradient}
					aria-hidden="true"
					animate={{ opacity: branding ? 1 : 0 }}
					transition={FADE}
				>
					WELCOME TO
				</motion.span>
			</motion.div>

			<motion.div
				className={styles.csui_title}
				initial={{ opacity: 0, x: -232 }}
				animate={{
					opacity: branding && !exiting ? 1 : 0,
					x: exiting ? -588 : grouped ? -148 : branding ? 0 : -232,
					y: grouped ? -16 : 0,
				}}
				transition={{ ...SPRING, opacity: FADE }}
			>
				CSUI26'
			</motion.div>

			<motion.img
				className={styles.gradient_panda}
				src={gradient}
				alt=""
				initial={{ opacity: 0, x: 322 }}
				animate={{
					opacity: grouped && !exiting ? 1 : 0,
					x: exiting ? -459 : grouped ? 0 : 322,
				}}
				transition={{ ...SPRING, opacity: FADE }}
			/>

			<motion.div
				className={styles.slogan_text}
				initial={{ opacity: 0, x: -308 }}
				animate={{
					opacity: grouped && !exiting ? 1 : 0,
					x: exiting ? -440 : grouped ? 0 : -308,
				}}
				transition={{ ...SPRING, opacity: FADE }}
			>
				#TOGETHER, WE ACHIEVE!
			</motion.div>

			{grouped && frame < SCENE.TERMINAL && (
				<motion.div
					className={`${SURFACE_SUBTLE} ${styles.shape_portal}`}
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{
						opacity: 1,
						x: exiting ? 252 : 0,
						y: exiting ? -17 : 0,
						rotate:
							frame >= SCENE.PORTAL_EXPAND
								? 90
								: frame >= SCENE.PORTAL_ROTATE
									? 45
									: 0,
						scale:
							frame >= SCENE.PORTAL_EXPAND
								? 3.66
								: frame >= SCENE.PORTAL_ROTATE
									? 1.116
									: 1,
					}}
					transition={SPRING}
					style={{ visibility: "visible" }}
				/>
			)}
		</div>
	);
}

// --- Terminal typing ---

function Terminal({ onComplete }: { onComplete: () => void }) {
	const [typed, setTyped] = useState<string[]>([]);

	useEffect(() => {
		let lineIndex = 0;
		let charIndex = 0;
		let timer: number;

		const type = () => {
			const line = LINES[lineIndex];

			if (line === undefined) {
				timer = window.setTimeout(onComplete, 1000);
				return;
			}

			const currentLine = lineIndex;
			const currentChar = ++charIndex;

			setTyped((previous) => [
				...previous.slice(0, currentLine),
				line.slice(0, currentChar),
			]);

			if (charIndex >= line.length) {
				lineIndex++;
				charIndex = 0;
			}

			timer = window.setTimeout(type, charIndex === 0 ? 80 : 22);
		};

		timer = window.setTimeout(type, 400);

		return () => window.clearTimeout(timer);
	}, [onComplete]);

	return (
		<motion.div
			className={`${surface.surface} ${surface.surface__card} ${styles.terminal_card}`}
			data-active="true"
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={SPRING}
		>
			<div className={styles.terminal_watermark}>CSUI26</div>

			<div className={styles.terminal_lines}>
				{typed.map((text, index) => (
					<div key={LINES[index]} className={styles.terminal_line}>
						{text}
						{index === typed.length - 1 && (
							<span className={styles.terminal_cursor} />
						)}
					</div>
				))}
			</div>
		</motion.div>
	);
}

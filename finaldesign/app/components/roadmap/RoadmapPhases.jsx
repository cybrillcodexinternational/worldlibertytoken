"use client";

import { Box, Globe, Layers, Pickaxe, Rocket, Settings } from "lucide-react";
import styles from "../../roadmap/roadmap.module.css";
import SectionReveal, { staggerContainer, fadeUpItem } from "../tokenomics/SectionReveal";
import { motion } from "framer-motion";

const PHASES = [
	{
		num: "01",
		title: "Foundation",
		copy: (
			<>
				Build the core.
				<br />
				Create the foundation.
			</>
		),
		Icon: Box,
	},
	{
		num: "02",
		title: "Pre Launch and Mining",
		copy: "Prepare the network. Start mining.",
		Icon: Pickaxe,
	},
	{
		num: "03",
		title: "Launch",
		copy: "Bring WLT to the world.",
		Icon: Rocket,
	},
	{
		num: "04",
		title: "Expansion",
		copy: "Grow the ecosystem.",
		Icon: Layers,
	},
	{
		num: "05",
		title: "Evolution",
		copy: "Unlock greater utility.",
		Icon: Settings,
	},
	{
		num: "06",
		title: "Global Scale",
		copy: "A truly borderless future.",
		Icon: Globe,
	},
];

export default function RoadmapPhases() {
	const midCount = PHASES.length - 1;

	return (
		<section className={`${styles.section} ${styles.journeySection}`}>
			<div className="tp-inner">
				<SectionReveal className={styles.intro}>
					<div>
						<p className={styles.kicker}>Our Journey</p>
						<h2 className={styles.heading}>Six Phases. A Global Impact.</h2>
					</div>
					<p className={styles.text}>
						From a bold idea to a global movement — a clear path
						towards a more open and inclusive financial future.
					</p>
				</SectionReveal>

				<motion.div
					className={styles.journeyTrack}
					variants={staggerContainer(0.08)}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, margin: "-60px" }}
				>
					<span className={styles.journeyLine} aria-hidden="true" />
					{Array.from({ length: midCount }, (_, i) => (
						<span
							key={`mid-${i}`}
							className={styles.journeyMid}
							style={{ left: `${((i + 1) / PHASES.length) * 100}%` }}
							aria-hidden="true"
						/>
					))}

					{PHASES.map((phase) => {
						const Icon = phase.Icon;
						return (
							<motion.article
								key={phase.num}
								variants={fadeUpItem}
								className={styles.journeyNode}
							>
								<div className={styles.journeyOrb}>
									<Icon size={30} strokeWidth={1.4} />
								</div>
								<div className={styles.journeyMeta}>
									<p className={styles.journeyNum}>{phase.num}</p>
									<h3 className={styles.journeyTitle}>{phase.title}</h3>
									<p className={styles.journeyCopy}>{phase.copy}</p>
								</div>
							</motion.article>
						);
					})}
				</motion.div>
			</div>
		</section>
	);
}

"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(4px)" },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

/** Aparece al entrar en pantalla: sube suavemente y se desenfoca a nítido. */
export function Reveal({ children, delay = 0, className = "", as = "div", amount = 0.25 }: { children: ReactNode; delay?: number; className?: string; as?: "div" | "section" | "li" | "span"; amount?: number }) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={variants} initial="hidden" whileInView="show" viewport={{ once: true, amount }} custom={delay}>
      {children}
    </Tag>
  );
}

/** Contenedor que revela a sus hijos en cascada. */
export function Stagger({ children, className = "", step = 0.07 }: { children: ReactNode; className?: string; step?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: step } } }}
    >
      {children}
    </motion.div>
  );
}

export const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}

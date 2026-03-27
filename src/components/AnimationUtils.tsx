import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StaggerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export const slideUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export const StaggerContainer = ({ children, className, delay = 0 }: StaggerProps) => (
  <motion.div
    variants={staggerContainer}
    initial="initial"
    whileInView="animate"
    viewport={{ once: true, margin: "-50px" }}
    className={className}
    transition={{ delayChildren: delay }}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div variants={staggerItem} className={className}>
    {children}
  </motion.div>
);

export const FadeInView = ({ children, className, delay = 0 }: StaggerProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-30px" }}
    transition={{ duration: 0.5, ease: "easeOut", delay }}
    className={className}
  >
    {children}
  </motion.div>
);

"use client";

import { motion } from "framer-motion";
import React from "react";

export default function MotionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

import React from "react";
import { TbGalaxy } from "react-icons/tb";

/**
 * Small spinning brand mark on running nodes (run detail canvas + panel).
 * Default: inside top-right of the node card (clear of border / ring).
 */
export default function FuseRunNodeGalaxySpinner({ className = "" }) {
  return (
    <span
      className={`pointer-events-none absolute top-1.5 right-2.5 z-[25] ${className}`}
      aria-label="Running"
    >
      <TbGalaxy
        className="w-4 h-4 text-[#1a73e8] dark:text-[#8ab4f8] spin-animation"
      />
    </span>
  );
}

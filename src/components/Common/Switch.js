import React from "react";
import * as RadixSwitch from "@radix-ui/react-switch";

const TRACK_H = "h-6"; // 24px
const TRACK_W = "w-11"; // 44px
const THUMB = "h-5 w-5"; // 20px
/**
 * Toggle switch (Radix). Thumb is positioned from top/left or top/right so
 * vertical center is identical in on and off states.
 */
const Switch = ({
  checked,
  onCheckedChange,
  disabled = false,
  id,
  "aria-label": ariaLabel,
  className = "",
}) => (
  <RadixSwitch.Root
    id={id}
    checked={checked}
    onCheckedChange={onCheckedChange}
    disabled={disabled}
    aria-label={ariaLabel}
    className={[
      "relative box-border shrink-0 cursor-pointer rounded-full",
      TRACK_H,
      TRACK_W,
      "transition-colors duration-150",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/35",
      "focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1a1a1a]",
      "disabled:cursor-not-allowed disabled:opacity-45",
      "data-[state=checked]:bg-[#2563eb] dark:data-[state=checked]:bg-[#3b82f6]",
      "data-[state=unchecked]:bg-[#d1d5db] dark:data-[state=unchecked]:bg-[#404040]",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
  >
    <RadixSwitch.Thumb
      className={[
        "pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full bg-white",
        THUMB,
        "shadow-[0_1px_3px_rgba(0,0,0,0.2)]",
        "transition-[left,right] duration-150 ease-out",
        "data-[state=unchecked]:left-[2px] data-[state=unchecked]:right-auto",
        "data-[state=checked]:right-[2px] data-[state=checked]:left-auto",
      ].join(" ")}
    />
  </RadixSwitch.Root>
);

export default Switch;

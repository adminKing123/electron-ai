import React, { useEffect, useRef } from "react";
import { TbBorderAll } from "react-icons/tb";

// ─── CanvasContextMenu ────────────────────────────────────────────────────────
/**
 * Right-click context menu for the workflow canvas pane.
 *
 * Positions itself at (x, y) in screen coordinates using `position: fixed`.
 * Automatically repositions when the menu would overflow the viewport edge.
 *
 * Closes on:
 *  - A click outside the menu (mousedown)
 *  - Pressing Escape
 *  - After any action is selected
 *
 * Props:
 *  @prop {number}   x           Screen X coordinate of the right-click
 *  @prop {number}   y           Screen Y coordinate of the right-click
 *  @prop {function} onDrawBlock Called when the user clicks "Draw Block"
 *  @prop {function} onClose     Called to close / dismiss the menu
 */
const MENU_WIDTH  = 180;
const MENU_HEIGHT = 48; // approximate single-item height

const CanvasContextMenu = ({ x, y, onDrawBlock, onClose }) => {
  const menuRef = useRef(null);

  // Clamp so the menu never overflows the viewport
  const safeX = Math.min(x, window.innerWidth  - MENU_WIDTH  - 8);
  const safeY = Math.min(y, window.innerHeight - MENU_HEIGHT - 8);

  // Close on outside click or Escape
  useEffect(() => {
    const onMouseDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown",   onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown",   onKeyDown);
    };
  }, [onClose]);

  const handleDrawBlock = () => {
    onDrawBlock();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{ top: safeY, left: safeX, position: "fixed" }}
      className="z-[9999] min-w-[160px]
        bg-white dark:bg-[#1e1e1e]
        border border-[#e5e5e5] dark:border-[#2a2a2a]
        rounded-xl shadow-xl overflow-hidden
        py-1"
    >
      <button
        type="button"
        onClick={handleDrawBlock}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5
          text-[13px] font-medium text-left select-none
          text-[#333] dark:text-[#ccc]
          hover:bg-[#f5f5f5] dark:hover:bg-[#252525]
          transition-colors"
      >
        <TbBorderAll className="w-4 h-4 text-[#4a6cf7] dark:text-[#6b8aff] flex-shrink-0" />
        Draw Block
      </button>
    </div>
  );
};

export default CanvasContextMenu;

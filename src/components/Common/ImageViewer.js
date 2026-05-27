import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { FiDownload } from "react-icons/fi";
import { BiZoomIn, BiZoomOut } from "react-icons/bi";
import { MdOutlineFitScreen } from "react-icons/md";

const MIN_SCALE = 0.5;
const MAX_SCALE = 5;
const SCALE_STEP = 0.25;

/**
 * Fullscreen image lightbox with zoom (scroll) and pan (drag) support.
 *
 * Props:
 *   src       – image URL
 *   alt       – alt / filename label shown in the top bar
 *   isOpen    – boolean controlling visibility
 *   onClose   – callback to close the viewer
 */
const ImageViewer = ({ src, alt, isOpen, onClose }) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOrigin = useRef(null);
  const containerRef = useRef(null);

  // Lock scroll and reset view state whenever viewer opens
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Non-passive wheel listener to prevent page scroll while zooming
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isOpen) return;
    const handleWheel = (e) => {
      e.preventDefault();
      const dir = e.deltaY < 0 ? 1 : -1;
      setScale((s) =>
        +(Math.min(MAX_SCALE, Math.max(MIN_SCALE, s + dir * SCALE_STEP)).toFixed(2))
      );
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [isOpen]);

  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    setDragging(true);
    dragOrigin.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e) => {
    if (!dragging || !dragOrigin.current) return;
    setOffset({
      x: e.clientX - dragOrigin.current.x,
      y: e.clientY - dragOrigin.current.y,
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
    dragOrigin.current = null;
  };

  const handleZoomIn = useCallback(() => {
    setScale((s) => +(Math.min(MAX_SCALE, s + SCALE_STEP).toFixed(2)));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((s) => +(Math.max(MIN_SCALE, s - SCALE_STEP).toFixed(2)));
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const btnCls =
    "w-8 h-8 flex items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors flex-shrink-0";

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="image-viewer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[9999] flex flex-col select-none"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.92)" }}
          onClick={onClose}
        >
          {/* ── Top control bar ─────────────────────────────────────── */}
          <div
            className="flex items-center justify-between px-4 py-4 flex-shrink-0 bg-gradient-to-b from-black/60 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-white/75 text-[12px] font-medium truncate max-w-[50%]">
              {alt}
            </span>

            <div className="flex items-center gap-0.5">
              <button onClick={handleZoomOut} title="Zoom out (scroll down)" className={btnCls}>
                <BiZoomOut className="w-[17px] h-[17px]" />
              </button>

              <span className="text-white/60 text-[11px] w-11 text-center tabular-nums">
                {Math.round(scale * 100)}%
              </span>

              <button onClick={handleZoomIn} title="Zoom in (scroll up)" className={btnCls}>
                <BiZoomIn className="w-[17px] h-[17px]" />
              </button>

              <button onClick={handleReset} title="Reset view" className={btnCls}>
                <MdOutlineFitScreen className="w-[16px] h-[16px]" />
              </button>

              <div className="w-px h-4 bg-white/20 mx-1.5" />

              <a
                href={src}
                download={alt || "image"}
                onClick={(e) => e.stopPropagation()}
                className={btnCls}
                title="Download"
              >
                <FiDownload className="w-[15px] h-[15px]" />
              </a>

              <button onClick={onClose} title="Close (Esc)" className={btnCls}>
                <IoClose className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>

          {/* Image area — fills all remaining height */}
          <div
            ref={containerRef}
            className="relative flex-1 flex items-center justify-center overflow-hidden"
            onClick={onClose}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              style={{
                // scale(s) translate(x/s, y/s) → visual offset of (x, y) screen px
                transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
                cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "default",
                transition: dragging ? "none" : "transform 0.1s ease-out",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={src}
                alt={alt}
                draggable={false}
                style={{
                  maxWidth: "92vw",
                  maxHeight: "calc(100vh - 72px)",
                  objectFit: "contain",
                  display: "block",
                  borderRadius: "8px",
                }}
              />
            </div>

            {/* Hint overlaid at the bottom — no layout space cost */}
            <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
              <span className="text-white/30 text-[11px]">
                Scroll to zoom · Drag to pan · Esc to close
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ImageViewer;

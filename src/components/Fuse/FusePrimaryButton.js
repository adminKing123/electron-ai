import React from "react";

/**
 * FusePrimaryButton — shared CTA button for the Fuse feature.
 *
 * Visual variant is controlled by the `layout` prop. To add a new layout,
 * add an entry to `LAYOUT_CONFIG` below — no changes needed elsewhere.
 *
 * Current layouts:
 *  - "normal"  (default) — pill button with icon + label
 *  - "square"            — icon-only fixed-size square, used in sidebars
 *
 * @param {object}        props
 * @param {React.ElementType} [props.icon]             — icon component (e.g. TbPlus)
 * @param {React.ReactNode}   [props.children]         — label text
 * @param {"normal"|"square"} [props.layout="normal"] — visual variant
 * @param {boolean}           [props.loading]          — shimmer sweep + disabled
 * @param {boolean}           [props.disabled]         — additional disabled control
 * @param {Function}          [props.onClick]
 * @param {string}            [props.className]        — extra classes to merge
 */

/** Per-layout configuration. Add new layouts here. */
const LAYOUT_CONFIG = {
  normal: {
    button: "gap-2 px-4 py-2 rounded-xl text-[13px]",
    icon:   "w-4 h-4 flex-shrink-0",
    showLabel: true,
  },
  square: {
    button: "w-9 h-9 rounded-xl",
    icon:   "w-[18px] h-[18px]",
    showLabel: false,
  },
};

const FusePrimaryButton = ({
  icon: Icon,
  children,
  layout = "normal",
  loading = false,
  disabled = false,
  onClick,
  className = "",
}) => {
  const config = LAYOUT_CONFIG[layout] ?? LAYOUT_CONFIG.normal;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        "relative flex items-center justify-center overflow-hidden",
        "bg-brand-600 dark:bg-brand-500 shadow-glow",
        "text-white dark:text-[var(--brand-on-solid)]",
        "font-semibold select-none",
        "hover:bg-brand-700 dark:hover:bg-brand-600 active:opacity-80",
        "transition-[background-color,opacity] duration-150",
        "disabled:cursor-not-allowed",
        config.button,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading && (
        <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 dark:via-black/10 to-transparent" />
      )}

      {Icon && <Icon className={config.icon} />}

      {config.showLabel && children}
    </button>
  );
};

export default FusePrimaryButton;


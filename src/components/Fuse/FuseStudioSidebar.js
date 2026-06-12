import React from "react";
import { TbPlus, TbCompass, TbBolt } from "react-icons/tb";
import FusePrimaryButton from "./FusePrimaryButton";

// ─── SidebarNavButton ─────────────────────────────────────────────────────────
/**
 * Vertical icon + label nav button used in the Fuse Studio sidebar.
 *
 * @param {object}            props
 * @param {React.ElementType} props.icon    — icon component
 * @param {string}            props.label   — text shown below the icon
 * @param {boolean}           [props.active] — highlights the button when true
 * @param {Function}          [props.onClick]
 */
const SidebarNavButton = ({ icon: Icon, label, active = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "flex flex-col items-center justify-center gap-1 w-14 py-2 rounded-xl",
      "text-[10px] font-semibold select-none transition-colors",
      active
        ? "bg-[#e8effe] dark:bg-[#1a1a40] text-[#4a6cf7] dark:text-[#6b8aff]"
        : "text-[#666] dark:text-[#999] hover:text-[#222] dark:hover:text-[#d0d0d0] hover:bg-[#f0f0f0] dark:hover:bg-[#1e1e1e]",
    ].join(" ")}
  >
    <Icon className="w-[20px] h-[20px]" />
    {label}
  </button>
);

// ─── FuseStudioSidebar ────────────────────────────────────────────────────────
const FuseStudioSidebar = ({ creating, onCreate }) => (
  <aside className="h-full flex flex-col items-center px-3 pt-10 gap-4 flex-shrink-0">
    {/* New workflow */}
    <FusePrimaryButton
      icon={TbPlus}
      layout="square"
      loading={creating}
      onClick={onCreate}
      aria-label="New workflow"
    />

    {/* Nav buttons */}
    <div className="flex flex-col items-center gap-1 mt-2">
      <SidebarNavButton icon={TbCompass}  label="Discover" />
      <SidebarNavButton icon={TbBolt}  label="Fuses" />
    </div>
  </aside>
);

export default FuseStudioSidebar;
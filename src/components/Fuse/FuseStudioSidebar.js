import React from "react";
import { TbPlus, TbCompass, TbBolt, TbPlug } from "react-icons/tb";
import FusePrimaryButton from "./FusePrimaryButton";
import { NavLink } from "react-router-dom";
import ROUTES from "../../router/routes";

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

const SidebarNavButton = ({ icon: Icon, label, to, end = false, onClick }) => {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "flex flex-col items-center justify-center gap-1 w-14 py-2 rounded-xl",
          "text-[10px] font-semibold select-none transition-colors",
          isActive
            ? "text-[#000000] dark:text-[#ffffff]"
            : "text-[#666] dark:text-[#999] hover:text-[#222] dark:hover:text-[#d0d0d0]",
        ].join(" ")
      }
    >
      <Icon className="w-[20px] h-[20px]" />
      <span>{label}</span>
    </NavLink>
  );
};

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
      <SidebarNavButton icon={TbCompass} label="Discover" to={ROUTES.FUSE} />
      <SidebarNavButton icon={TbBolt} label="Fuses" to={ROUTES.FUSES_LISTING} />
      <SidebarNavButton icon={TbPlug} label="Integrations" to={ROUTES.FUSE_INTEGRATIONS} />
    </div>
  </aside>
);

export default FuseStudioSidebar;

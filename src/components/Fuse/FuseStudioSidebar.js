import React from "react";
import { TbPlus, TbCompass, TbBolt, TbPlug } from "react-icons/tb";
import FusePrimaryButton from "./FusePrimaryButton";
import { NavLink } from "react-router-dom";
import ROUTES from "../../router/routes";

// --- SidebarNavButton ---------------------------------------------------------
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
          "flex flex-col items-center justify-center gap-1 w-[68px] py-2 rounded-xl",
          "text-[11px] font-semibold select-none transition-colors",
          isActive
            ? "text-brand-700 dark:text-brand-300"
            : "text-ink-550 dark:text-ink-450 hover:text-brand-600 dark:hover:text-brand-300",
        ].join(" ")
      }
    >
      <Icon className="w-[20px] h-[20px]" />
      <span>{label}</span>
    </NavLink>
  );
};

// --- FuseStudioSidebar --------------------------------------------------------
const FuseStudioSidebar = ({
  creating,
  onCreate,
  hideMobileNav = false,
  showCreate = true,
}) => (
  <>
    {/* Desktop — vertical sidebar */}
    <aside className="hidden md:flex h-full flex-col items-center px-2.5 pt-6 gap-4 flex-shrink-0">
      {showCreate && (
        <FusePrimaryButton
          icon={TbPlus}
          layout="square"
          loading={creating}
          onClick={onCreate}
          aria-label="New workflow"
          className="!w-10 !h-10"
        />
      )}
      <div className="flex flex-col items-center gap-1.5 mt-1">
        <SidebarNavButton icon={TbCompass} label="Discover" to={ROUTES.FUSE} end />
        <SidebarNavButton icon={TbBolt} label="Fuses" to={ROUTES.FUSES_LISTING} />
        <SidebarNavButton icon={TbPlug} label="Integrations" to={ROUTES.FUSE_INTEGRATIONS} />
      </div>
    </aside>

    {/* Mobile — fixed bottom navigation bar (hidden on pages with a custom action bar) */}
    {!hideMobileNav && (
      <nav
        className="flex md:hidden fixed bottom-0 left-0 right-0 z-50
          bg-white/95 dark:bg-void-850/95 backdrop-blur
          border-t border-ink-150 dark:border-void-800
          px-2 py-1.5 justify-around items-center"
      >
        <SidebarNavButton icon={TbCompass} label="Discover" to={ROUTES.FUSE} end />
        {showCreate && (
          <FusePrimaryButton
            icon={TbPlus}
            layout="square"
            loading={creating}
            onClick={onCreate}
            aria-label="New workflow"
          />
        )}
        <SidebarNavButton icon={TbBolt} label="Fuses" to={ROUTES.FUSES_LISTING} />
        <SidebarNavButton icon={TbPlug} label="Integrations" to={ROUTES.FUSE_INTEGRATIONS} />
      </nav>
    )}
  </>
);

export default FuseStudioSidebar;

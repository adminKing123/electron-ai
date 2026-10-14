import React from "react";
import FuseNodeIcon, { FUSE_NODE_ICON_SIZES } from "./FuseNodeIcon";
import { FUSE_NODE_ICON_WELL } from "./fuseNodeTheme";

/**
 * Brand-colored integration icon for cards, modals, and settings.
 * Uses the same registry + colors as workflow node picker / studio.
 *
 * @param {string} iconName — backend key (e.g. "SiGmail", "SiWebex")
 * @param {string} [tileClassName] — outer wrapper size/layout (default 48×48)
 */
const IntegrationIconTile = ({
  iconName,
  tileClassName = "w-12 h-12",
  className = "",
}) => (
  <div
    className={`${tileClassName} flex-shrink-0 flex items-center justify-center ${className}`}
  >
    <FuseNodeIcon
      iconName={iconName}
      sizeClass={FUSE_NODE_ICON_SIZES.integration}
      fallbackClassName="w-6 h-6 rounded-md bg-[#f1f3f4] dark:bg-[#2d2e30]"
    />
  </div>
);

export default IntegrationIconTile;

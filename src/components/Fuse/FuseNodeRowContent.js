import React from "react";
import FuseNodeIcon, { FUSE_NODE_ICON_SIZES } from "./FuseNodeIcon";
import { FUSE_NODE_LABEL } from "./fuseNodeTheme";

/** Icon + label row shared by picker tiles and studio canvas nodes. */
const FuseNodeRowContent = ({ iconName, label }) => (
  <>
    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
      <FuseNodeIcon
        iconName={iconName}
        sizeClass={FUSE_NODE_ICON_SIZES.pickerRow}
      />
    </span>
    <span
      className={`text-[15px] font-medium leading-tight truncate min-w-0 flex-1 ${FUSE_NODE_LABEL}`}
    >
      {label}
    </span>
  </>
);

export default FuseNodeRowContent;

import React from "react";
import FuseNodeIcon, { FUSE_NODE_ICON_SIZES } from "./FuseNodeIcon";
import {
  FUSE_NODE_LABEL,
  FUSE_NODE_ROW_ICON_SLOT,
  FUSE_NODE_ROW_LABEL,
} from "./fuseNodeTheme";

/** Icon + label row shared by picker tiles and studio canvas nodes. */
const FuseNodeRowContent = ({ iconName, label }) => (
  <>
    <span className={FUSE_NODE_ROW_ICON_SLOT}>
      <FuseNodeIcon
        iconName={iconName}
        sizeClass={FUSE_NODE_ICON_SIZES.pickerRow}
      />
    </span>
    <span className={`${FUSE_NODE_ROW_LABEL} ${FUSE_NODE_LABEL}`}>{label}</span>
  </>
);

export default FuseNodeRowContent;

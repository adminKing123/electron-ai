import React from "react";
import { FUSE_PICKER_ROW, FUSE_STUDIO_ROW } from "./fuseNodeTheme";
import FuseNodeRowContent from "./FuseNodeRowContent";

const ROW =
  `${FUSE_STUDIO_ROW} ${FUSE_PICKER_ROW} ` +
  "transition-colors duration-150 cursor-grab active:cursor-grabbing select-none w-full";

const NodePickerCard = ({
  node,
  onPick,
  isStarter = false,
  as: Component = "div",
  ...rest
}) => {
  const handleDragStart = (e) => {
    const payload = isStarter ? { ...node, isStarter: true } : node;
    e.dataTransfer.setData("application/fuse-node", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <Component
      type={Component === "button" ? "button" : undefined}
      draggable
      onDragStart={handleDragStart}
      onClick={() => onPick(node)}
      title={node.description ?? node.label}
      className={ROW}
      {...rest}
    >
      <FuseNodeRowContent iconName={node.icon} label={node.label} />
    </Component>
  );
};

export default NodePickerCard;

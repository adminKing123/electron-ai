import React from "react";
import { fusePickerCardClass } from "./fuseNodeTheme";
import FuseNodeRowContent from "./FuseNodeRowContent";

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
      className={fusePickerCardClass}
      {...rest}
    >
      <FuseNodeRowContent iconName={node.icon} label={node.label} />
    </Component>
  );
};

export default NodePickerCard;

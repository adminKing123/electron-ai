import React from "react";
import { TbPlus } from "react-icons/tb";
import FusePrimaryButton from "./FusePrimaryButton";

/**
 * FuseStudioSidebar — narrow left panel for the workflow builder canvas.
 *
 * @param {object}   props
 * @param {boolean}  [props.creating]    — shimmer on the create button while API is in flight
 * @param {Function} [props.onCreate]    — create a new workflow (same as FusePage CTA)
 * @param {Function} [props.onAddNode]   — add a node to the current canvas
 */
const FuseStudioSidebar = ({ creating, onCreate, onAddNode }) => (
  <aside className="h-full flex flex-col px-3 pt-10 gap-2 flex-shrink-0">
    {/* Create a brand-new workflow */}
    <FusePrimaryButton
      icon={TbPlus}
      layout="square"
      loading={creating}
      onClick={onCreate}
      aria-label="New workflow"
    />
  </aside>
);

export default FuseStudioSidebar;
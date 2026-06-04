import React from "react";
import { TbPlus } from "react-icons/tb";
import FusePrimaryButton from "./FusePrimaryButton";

const FuseStudioSidebar = ({ creating, onCreate }) => (
  <aside className="h-full flex flex-col px-3 pt-10 gap-2 flex-shrink-0">
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
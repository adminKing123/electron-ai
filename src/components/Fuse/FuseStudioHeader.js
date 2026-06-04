import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";
import { TbPlus, TbPower } from "react-icons/tb";
import HeaderUserProfile from "../HeaderUserProfile";
import ROUTES from "../../router/routes";

export const iconBtnCls =
  "w-8 h-8 flex items-center justify-center rounded-lg " +
  "text-[#888] dark:text-[#666] " +
  "hover:text-[#111] dark:hover:text-white " +
  "hover:bg-[#ebebeb] dark:hover:bg-[#222] " +
  "transition-colors";

  const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(ROUTES.FUSE)}
      className={iconBtnCls}
      aria-label="Go back"
    >
      <IoChevronBackOutline className="w-[18px] h-[18px]" />
    </button>
  );
};

const WorkflowNameInput = ({ value, onChange, onBlur, saving = false }) => {
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Escape") inputRef.current?.blur();
  };

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <input
        ref={inputRef}
        type="text"
        value={value}
        maxLength={60}
        onChange={(e) => onChange(e.target.value.slice(0, 60))}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        placeholder="Untitled Workflow"
        style={{ textOverflow: "ellipsis" }}
        className="w-full max-w-[320px] bg-transparent px-2 py-1
          text-[14px] font-semibold tracking-tight
          text-[#111] dark:text-white
          placeholder:text-[#aaa] dark:placeholder:text-[#555]
          border-none outline-none"
      />
    </div>
  );
};

const HeaderActions = ({ hasNodes = false, onAddNode, onTurnOn }) => (
  <div className="flex items-center gap-2 flex-shrink-0">
    {/* Add Node — disabled until a starter node is placed */}
    <button
      type="button"
      onClick={onAddNode}
      disabled={!hasNodes}
      className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12.5px] font-semibold
        transition-colors
        disabled:opacity-40 disabled:cursor-not-allowed
        text-[#444] dark:text-[#bbb]
        bg-[#f0f0f0] dark:bg-[#272727]
        hover:bg-[#e4e4e4] dark:hover:bg-[#303030]
        disabled:hover:bg-[#f0f0f0] dark:disabled:hover:bg-[#272727]"
    >
      <TbPlus className="w-[14px] h-[14px]" />
      Add Node
    </button>

    {/* Turn On — disabled until a starter node is placed */}
    <button
      type="button"
      onClick={onTurnOn}
      disabled={!hasNodes}
      className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12.5px] font-semibold
        transition-colors
        disabled:opacity-40 disabled:cursor-not-allowed
        text-[#2da44e] dark:text-[#3fb950]
        bg-[#eafaf0] dark:bg-[#1a2d1e]
        hover:bg-[#d6f5e3] dark:hover:bg-[#213828]
        disabled:hover:bg-[#eafaf0] dark:disabled:hover:bg-[#1a2d1e]"
    >
      <TbPower className="w-[14px] h-[14px]" />
      Turn On
    </button>

    {/* Separator */}
    <span className="w-px h-5 bg-[#e0e0e0] dark:bg-[#2e2e2e] rounded-full flex-shrink-0" />

    <HeaderUserProfile />
  </div>
);

const FuseStudioHeader = ({
  name,
  onNameChange,
  onNameBlur,
  saving = false,
  hasNodes = false,
  onAddNode,
  onTurnOn,
}) => (
  <header
    id="fuse-studio-header"
    className="h-[56px] w-full flex items-center justify-between gap-2 px-3 flex-shrink-0">
    <div className="flex items-center gap-1.5 min-w-0 flex-1">
      <BackButton />
      <WorkflowNameInput
        value={name}
        onChange={onNameChange}
        onBlur={onNameBlur}
        saving={saving}
      />
    </div>
    <HeaderActions hasNodes={hasNodes} onAddNode={onAddNode} onTurnOn={onTurnOn} />
  </header>
);

export default FuseStudioHeader;

import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";
import HeaderUserProfile from "../HeaderUserProfile";

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
      onClick={() => navigate(-1)}
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

const HeaderActions = () => (
  <div className="flex items-center gap-2 flex-shrink-0">
    <HeaderUserProfile />
  </div>
);

const FuseStudioHeader = ({ name, onNameChange, onNameBlur, saving = false }) => (
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
    <HeaderActions />
  </header>
);

export default FuseStudioHeader;

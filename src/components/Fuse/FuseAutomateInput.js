import React, { useState } from "react";
import { TbBolt } from "react-icons/tb";
import FusePrimaryButton from "./FusePrimaryButton";

/**
 * FuseAutomateInput — Horizontally-centered welcome banner rendered at the top
 * of the Fuse discovery panel. Intentionally compact so additional content
 * can be placed below it on the same page.
 *
 * @param {object}   props
 * @param {boolean}  props.creating — forwarded to FusePrimaryButton for loading state
 * @param {Function} props.onCreate — called when the user clicks "Create"
 */
const FuseAutomateInput = ({ creating, onCreate }) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate();
  };

  return (
    <div className="w-full flex flex-col items-center pt-8 pb-10 px-6 select-none">
      <h1 className="text-[2.4rem] font-semibold font-sans tracking-tight text-[#343434] dark:text-white text-center">
        Automate your work with{" "}
        <span className="italic text-[#ffad09] dark:text-[#ffbf3e] font-mono">Fuse</span>
        <span>
          <TbBolt className="inline-block text-[#ffad09] dark:text-[#ffbf3e] ml-1" />
        </span>
      </h1>

      <p className="text-[1.4rem] text-[#888] dark:text-[#666] text-center leading-relaxed">
        Streamline and manage tasks across Workspace
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 w-full max-w-xl flex items-center gap-2
          bg-white dark:bg-[#242424]
          border border-[#e0e0e0] dark:border-[#2e2e2e]
          rounded-full
          shadow-sm
          focus-within:border-[#c4b5fd] dark:focus-within:border-[#4a3a8a]
          transition-colors duration-150
          pl-4 pr-1 py-1"
      >
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe a task for Aura Fuse…"
          className="flex-1 min-w-0 bg-transparent text-[13px]
            text-[#333] dark:text-[#ccc]
            placeholder-[#bbb] dark:placeholder-[#555]
            outline-none"
        />
        <FusePrimaryButton
          icon={TbBolt}
          loading={creating}
          onClick={onCreate}
          className="!rounded-full"
        >
          Create
        </FusePrimaryButton>
      </form>
    </div>
  );
};

export default FuseAutomateInput;

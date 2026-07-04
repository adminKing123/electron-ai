import React from "react";
import Header from "../Header";
import FuseStudioSidebar from "./FuseStudioSidebar";

/**
 * FusePageShell — shared page chrome for non-studio Fuse pages.
 *
 * Renders: Header → optional dialog overlay → sidebar + scrollable content area.
 *
 * Props
 * ─────
 * backRoute   {string}       Route the header back-arrow navigates to
 * creating    {boolean}      Forwarded to the sidebar's "new workflow" button
 * onCreate    {Function}     Forwarded to the sidebar's "new workflow" button
 * dialog      {ReactNode}    Confirm/alert dialog rendered above the content area
 * footer      {ReactNode}    Anything rendered after the content area (e.g. MasterInfoModal)
 * children    {ReactNode}    Page body rendered inside the scrollable area
 */
const FusePageShell = ({
  backRoute,
  creating,
  onCreate,
  dialog,
  footer,
  children,
}) => (
  <main className="h-screen flex flex-col overflow-hidden bg-[#ffffff] dark:bg-[#212121]">
    <Header type="fuse" backRoute={backRoute} />

    {dialog}

    <div className="flex-1 flex overflow-hidden">
      <FuseStudioSidebar creating={creating} onCreate={onCreate} />

      <div
        className="flex-1 overflow-y-auto
          p-0 md:p-4
          mb-16 md:mb-3 mr-0 md:mr-3
          md:rounded-xl
          md:border md:border-[#e5e5e5] md:dark:border-[#252525]
          bg-[#f7f7f7] dark:bg-[#1a1a1a]
          md:shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] md:dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)]"
      >
        {children}
      </div>
    </div>

    {footer}
  </main>
);

export default FusePageShell;

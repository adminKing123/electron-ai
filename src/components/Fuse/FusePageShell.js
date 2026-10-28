import React from "react";
import Header from "../Header";
import FuseStudioSidebar from "./FuseStudioSidebar";

/**
 * FusePageShell — shared page chrome for non-studio Fuse pages.
 *
 * Renders: Header ? optional dialog overlay ? sidebar + scrollable content area.
 *
 * Props
 * -----
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
  <main className="h-screen flex flex-col overflow-hidden bg-white dark:bg-void-875 bg-aurora-glow dark:bg-aurora-glow-dark">
    <Header type="fuse" backRoute={backRoute} />

    {dialog}

    <div className="flex-1 flex overflow-hidden">
      <FuseStudioSidebar creating={creating} onCreate={onCreate} />

      <div
        className="flex-1 overflow-y-auto
          p-0 md:p-4
          mb-16 md:mb-3 mr-0 md:mr-3
          md:rounded-2xl
          md:border md:border-ink-150 md:dark:border-void-800
          bg-white/80 dark:bg-void-850/90 backdrop-blur-sm
          md:shadow-[0_1px_3px_rgba(20,16,40,0.04),0_8px_32px_-16px_rgba(20,16,40,0.10)]
          md:dark:shadow-[0_8px_32px_-16px_rgba(0,0,0,0.6)]"
      >
        {children}
      </div>
    </div>

    {footer}
  </main>
);

export default FusePageShell;

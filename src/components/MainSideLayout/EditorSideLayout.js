import { useState, useEffect } from "react";

const Editor = () => {
  return (
    <div>
      <div className="h-[56px] w-full flex items-center justify-between gap-2 px-3 mb-[1px] header-shadow">
        <h1 className="text-xl font-semibold text-black dark:text-white">
          Editor
        </h1>
      </div>
      <div className="overflow-auto h-[calc(100dvh-58px)] p-3"></div>
    </div>
  );
};

const ResizablePanel = ({ children }) => {
  const [width, setWidth] = useState(384);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const newWidth = window.innerWidth - clientX;
      setWidth(Math.min(Math.max(newWidth, 384), 800));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleMouseMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isResizing]);

  return (
    <>
      {isResizing && (
        <div className="fixed inset-0 z-50 cursor-col-resize select-none" />
      )}
      <div className="flex">
        <div
          className="hidden md:block h-screen w-[3px] hover:outline active:outline outline-[#f2f2f2] dark:outline-[#2c2c2c] bg-[#f2f2f2] dark:bg-[#2c2c2c] cursor-col-resize"
          onMouseDown={() => setIsResizing(true)}
        />
        <div
          className="h-screen overflow-auto fixed top-0 left-0 min-w-[100vw] md:static md:min-w-96 md:max-w-[50vw] bg-[#ffffff] dark:bg-[#212121]"
          style={{ width: `${width}px` }}
        >
          {children}
        </div>
      </div>
    </>
  );
};

const EditorSideLayout = () => {
  return (
    <ResizablePanel>
      <Editor />
    </ResizablePanel>
  );
};

export default EditorSideLayout;

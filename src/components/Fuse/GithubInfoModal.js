import React, { useEffect, useState } from "react";
import { getGithubIntegrationInfoAPI } from "../../apis/fuse/queryFunctions";
import { SiGithub } from "react-icons/si";
import { IoClose } from "react-icons/io5";

const GithubInfoModal = ({ isOpen, onClose }) => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getGithubIntegrationInfoAPI()
        .then((data) => setInfo(data))
        .catch((err) => console.error("Failed to load GitHub info", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#202020] rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-[#e5e5e5] dark:border-[#2a2a2a] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0] dark:border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <SiGithub className="text-xl text-[#333] dark:text-[#fff]" />
            <h2 className="text-[15px] font-semibold text-[#1a1a1a] dark:text-[#f0f0f0]">
              GitHub Connection
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#666] hover:text-[#111] dark:text-[#aaa] dark:hover:text-[#fff] transition-colors"
          >
            <IoClose className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4 bg-[#fafafa] dark:bg-[#1a1a1a]">
          {loading ? (
            <div className="flex flex-col gap-3 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ) : info ? (
            <div className="text-[13px] text-[#444] dark:text-[#ccc] flex flex-col gap-2">
              <p>
                <span className="font-semibold text-[#111] dark:text-[#fff]">Connected as:</span>{" "}
                {info.name || info.login || "Unknown User"}
              </p>
              {info.email && (
                <p>
                  <span className="font-semibold text-[#111] dark:text-[#fff]">Email:</span>{" "}
                  {info.email}
                </p>
              )}
              {info.login && (
                <p>
                  <span className="font-semibold text-[#111] dark:text-[#fff]">Username:</span>{" "}
                  {info.login}
                </p>
              )}
            </div>
          ) : (
            <p className="text-[13px] text-red-500">Failed to load connection info.</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#f0f0f0] dark:border-[#2a2a2a] bg-white dark:bg-[#202020] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-[12px] font-semibold bg-[#f0f0f0] hover:bg-[#e4e4e4] text-[#333] dark:bg-[#333] dark:hover:bg-[#444] dark:text-[#eee] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GithubInfoModal;

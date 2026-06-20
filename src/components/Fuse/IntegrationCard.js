import React, { useState } from "react";
import { SiGmail, SiWebex } from "react-icons/si";
import { startGmailAuthAPI } from "../../apis/fuse/queryFunctions";

const ICON_MAP = {
  SiGmail: SiGmail,
  SiWebex: SiWebex,
};

const ConfigureButton = ({ onClick, loading }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="px-3 py-1 rounded-full text-[11px] font-semibold select-none
      border border-[#d0d0d0] dark:border-[#3a3a3a]
      text-[#333] dark:text-[#ccc]
      hover:bg-[#f0f0f0] dark:hover:bg-[#2e2e2e]
      active:opacity-80 transition-colors duration-150
      disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {loading ? "Configuring..." : "Configure"}
  </button>
);

const IntegrationCard = ({ integration, onRevokeClick }) => {
  const Icon = ICON_MAP[integration.icon] || SiGmail;
  const [configuring, setConfiguring] = useState(false);

  const handleConfigure = async () => {
    if (integration.id === "gmail") {
      setConfiguring(true);
      try {
        const response = await startGmailAuthAPI();
        if (response?.auth_url) {
          window.location.href = response.auth_url;
        }
      } catch (error) {
        console.error("Failed to start Gmail auth", error);
      } finally {
        setConfiguring(false);
      }
    } else {
      console.log(`Configuring ${integration.name}`);
    }
  };

  return (
    <div className="bg-[#ffffff] dark:bg-[#202020] p-6 rounded-3xl shadow-sm border border-[#e5e5e5] dark:border-[#2a2a2a] flex flex-col justify-between min-w-0">
      <div className="flex flex-col items-start gap-4">
        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-[#f7f7f7] dark:bg-[#1a1a1a]">
          <Icon className="w-6 h-6 text-[#444444] dark:text-white" />
        </div>
        <div>
          <h3 className="text-[#1a1a1a] dark:text-white font-sans text-base font-semibold truncate leading-tight">
            {integration.name}
          </h3>
          <p className="text-[#666666] dark:text-[#d0d0d0] font-sans text-[13px] line-clamp-2 mt-1.5">
            {integration.description}
          </p>
        </div>
      </div>

      <div className="mt-4 flex-shrink-0 flex items-center gap-2">
        {integration.configured ? (
          <>
            <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[11px] font-semibold uppercase tracking-wider">
              Configured
            </span>
            <button
              onClick={onRevokeClick}
              className="text-[11px] font-medium text-red-500 hover:text-red-600 transition-colors ml-2"
            >
              Revoke
            </button>
          </>
        ) : (
          <ConfigureButton onClick={handleConfigure} loading={configuring} />
        )}
      </div>
    </div>
  );
};

export default IntegrationCard;
